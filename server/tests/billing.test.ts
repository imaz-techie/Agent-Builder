import request from "supertest";
import { createApp } from "../src/app";
import { generateAccessToken } from "../src/utils/jwt";
import { billingRepository } from "../src/repositories/billing.repository";
import { workspaceRepository } from "../src/repositories/workspace.repository";
import { BillingPlan, BillingStatus, InvoiceStatus, LlmModel, WorkspaceRole } from "@prisma/client";

jest.mock("../src/repositories/billing.repository");
jest.mock("../src/repositories/workspace.repository");

describe("Phase 14 Billing & Subscriptions Endpoints", () => {
  const app = createApp();
  const userId = "user-uuid-111";
  const workspaceId = "ws-uuid-222";
  const token = generateAccessToken({ userId, email: "dev@example.com", role: "DEVELOPER" });

  const mockAccount = {
    id: "bill-uuid-333",
    workspaceId,
    plan: BillingPlan.FREE,
    status: BillingStatus.TRIALING,
    trialEndsAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
    currentPeriodStart: new Date(),
    currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    stripeCustomerId: null,
    stripeSubscriptionId: null,
    seats: 1,
    monthlyTokenQuota: 1000000,
    totalTokensUsed: BigInt(0),
    totalSpendUsd: { toString: () => "0" },
    cancelAtPeriodEnd: false,
    createdById: userId,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("GET /api/v1/workspaces/:id/billing/account should return billing account", async () => {
    (workspaceRepository.findMember as jest.Mock).mockResolvedValue({
      id: "mem-1",
      workspaceId,
      userId,
      role: WorkspaceRole.VIEWER,
    });
    (billingRepository.getOrCreateAccount as jest.Mock).mockResolvedValue(mockAccount);
    (billingRepository.findAccountByWorkspace as jest.Mock).mockResolvedValue(mockAccount);

    const res = await request(app)
      .get(`/api/v1/workspaces/${workspaceId}/billing/account`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.account.plan).toBe("FREE");
  });

  it("PATCH /api/v1/workspaces/:id/billing/plan should upgrade plan", async () => {
    (workspaceRepository.findMember as jest.Mock).mockResolvedValue({
      id: "mem-1",
      workspaceId,
      userId,
      role: WorkspaceRole.ADMIN,
    });
    (billingRepository.getOrCreateAccount as jest.Mock).mockResolvedValue(mockAccount);
    (billingRepository.updateAccount as jest.Mock).mockResolvedValue({
      ...mockAccount,
      plan: BillingPlan.PRO,
      monthlyTokenQuota: 10000000,
      seats: 5,
    });
    (workspaceRepository.logAuditAction as jest.Mock).mockResolvedValue({});
    (billingRepository.countInvoices as jest.Mock).mockResolvedValue(3);
    (billingRepository.createInvoice as jest.Mock).mockResolvedValue({
      id: "inv-1",
      workspaceId,
      accountId: mockAccount.id,
      invoiceNumber: "INV-2026-0004",
      amountUsd: { toString: () => "20" },
      currency: "usd",
      description: "Pro plan subscription",
      status: InvoiceStatus.PAID,
      createdAt: new Date(),
    });

    const res = await request(app)
      .patch(`/api/v1/workspaces/${workspaceId}/billing/plan`)
      .set("Authorization", `Bearer ${token}`)
      .send({ plan: "PRO" });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.account.plan).toBe("PRO");
    expect(res.body.data.invoice.invoiceNumber).toBe("INV-2026-0004");
  });

  it("GET /api/v1/workspaces/:id/billing/invoices should return paginated invoices", async () => {
    (workspaceRepository.findMember as jest.Mock).mockResolvedValue({
      id: "mem-1",
      workspaceId,
      userId,
      role: WorkspaceRole.VIEWER,
    });
    (billingRepository.findInvoices as jest.Mock).mockResolvedValue({
      items: [
        {
          id: "inv-1",
          invoiceNumber: "INV-2026-0001",
          status: InvoiceStatus.PAID,
          amountUsd: { toString: () => "20" },
          currency: "usd",
          workspaceId,
        },
      ],
      totalItems: 1,
    });

    const res = await request(app)
      .get(`/api/v1/workspaces/${workspaceId}/billing/invoices`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.data.invoices).toHaveLength(1);
    expect(res.body.meta.totalItems).toBe(1);
  });

  it("GET /api/v1/workspaces/:id/billing/usage should return usage summary", async () => {
    (workspaceRepository.findMember as jest.Mock).mockResolvedValue({
      id: "mem-1",
      workspaceId,
      userId,
      role: WorkspaceRole.VIEWER,
    });
    (billingRepository.findAccountByWorkspace as jest.Mock).mockResolvedValue(mockAccount);
    (billingRepository.sumUsageForPeriod as jest.Mock).mockResolvedValue({
      tokensUsed: 250000,
      estCostUsd: 1.25,
    });

    const res = await request(app)
      .get(`/api/v1/workspaces/${workspaceId}/billing/usage`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.data.summary.plan).toBe("FREE");
    expect(res.body.data.summary.tokensUsed).toBe(250000);
    expect(res.body.data.summary.tokensRemaining).toBe(750000);
  });

  it("POST /api/v1/workspaces/:id/billing/usage/record should record usage", async () => {
    (workspaceRepository.findMember as jest.Mock).mockResolvedValue({
      id: "mem-1",
      workspaceId,
      userId,
      role: WorkspaceRole.MEMBER,
    });
    (billingRepository.getOrCreateAccount as jest.Mock).mockResolvedValue(mockAccount);
    (billingRepository.createUsageRecord as jest.Mock).mockResolvedValue({});
    (billingRepository.updateAccount as jest.Mock).mockResolvedValue({
      ...mockAccount,
      totalTokensUsed: BigInt(1000),
      totalSpendUsd: { toString: () => "0.005" },
    });

    const res = await request(app)
      .post(`/api/v1/workspaces/${workspaceId}/billing/usage/record`)
      .set("Authorization", `Bearer ${token}`)
      .send({ model: "GPT_4O", tokensUsed: 1000 });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.tokensUsed).toBe(1000);
    expect(res.body.data.totalTokensUsed).toBe(1000);
  });

  it("POST /api/v1/webhooks/stripe should process checkout.session.completed", async () => {
    (billingRepository.getOrCreateAccount as jest.Mock).mockResolvedValue(mockAccount);
    (billingRepository.updateAccount as jest.Mock).mockResolvedValue({
      ...mockAccount,
      status: BillingStatus.ACTIVE,
    });

    const res = await request(app)
      .post("/webhooks/stripe")
      .send({
        type: "checkout.session.completed",
        data: {
          object: {
            customer: "cus_123",
            subscription: "sub_456",
            metadata: { workspaceId, createdById: userId },
          },
        },
      });

    expect(res.status).toBe(200);
    expect(res.body.data.received).toBe(true);
    expect(billingRepository.updateAccount).toHaveBeenCalledWith(workspaceId, {
      stripeCustomerId: "cus_123",
      stripeSubscriptionId: "sub_456",
      status: BillingStatus.ACTIVE,
    });
  });
});

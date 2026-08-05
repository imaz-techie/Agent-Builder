import { prisma } from "../database";
import {
  BillingAccount,
  BillingPlan,
  BillingStatus,
  InvoiceStatus,
  LlmModel,
} from "@prisma/client";

export class BillingRepository {
  async findAccountByWorkspace(workspaceId: string) {
    return prisma.billingAccount.findUnique({
      where: { workspaceId },
    });
  }

  async getOrCreateAccount(workspaceId: string, createdById: string) {
    return prisma.billingAccount.upsert({
      where: { workspaceId },
      create: {
        workspaceId,
        createdById,
        plan: BillingPlan.FREE,
        status: BillingStatus.TRIALING,
        trialEndsAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      },
      update: {},
    });
  }

  async updateAccount(workspaceId: string, data: Partial<BillingAccount>) {
    return prisma.billingAccount.update({
      where: { workspaceId },
      data,
    });
  }

  async findAccountByStripeCustomerId(stripeCustomerId: string) {
    return prisma.billingAccount.findFirst({
      where: { stripeCustomerId },
    });
  }

  async createInvoice(data: {
    workspaceId: string;
    accountId?: string;
    invoiceNumber: string;
    amountUsd: number;
    currency?: string;
    description?: string;
    status?: InvoiceStatus;
    periodStart?: Date;
    periodEnd?: Date;
  }) {
    return prisma.invoice.create({
      data: {
        workspaceId: data.workspaceId,
        accountId: data.accountId || undefined,
        invoiceNumber: data.invoiceNumber,
        amountUsd: data.amountUsd,
        currency: data.currency || "usd",
        description: data.description,
        status: data.status || InvoiceStatus.OPEN,
        periodStart: data.periodStart,
        periodEnd: data.periodEnd,
      },
    });
  }

  async countInvoices(workspaceId: string) {
    return prisma.invoice.count({ where: { workspaceId } });
  }

  async findInvoices(workspaceId: string, skip: number, take: number) {
    const [items, totalItems] = await Promise.all([
      prisma.invoice.findMany({
        where: { workspaceId },
        orderBy: { issuedAt: "desc" },
        skip,
        take,
      }),
      prisma.invoice.count({ where: { workspaceId } }),
    ]);
    return { items, totalItems };
  }

  async createUsageRecord(data: {
    workspaceId: string;
    accountId?: string;
    model: LlmModel;
    tokensUsed: number;
    costUsd: number;
  }) {
    return prisma.usageRecord.create({
      data: {
        workspaceId: data.workspaceId,
        accountId: data.accountId || undefined,
        model: data.model,
        tokensUsed: data.tokensUsed,
        costUsd: data.costUsd,
      },
    });
  }

  async sumUsageForPeriod(workspaceId: string, periodStart: Date, periodEnd: Date) {
    const records = await prisma.usageRecord.findMany({
      where: {
        workspaceId,
        recordedAt: { gte: periodStart, lte: periodEnd },
      },
      select: { tokensUsed: true, costUsd: true },
    });

    const tokensUsed = records.reduce((sum, r) => sum + r.tokensUsed, 0);
    const estCostUsd = records.reduce((sum, r) => sum + Number(r.costUsd), 0);

    return { tokensUsed, estCostUsd };
  }
}

export const billingRepository = new BillingRepository();

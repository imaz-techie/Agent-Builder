import crypto from "crypto";
import { billingRepository } from "../repositories/billing.repository";
import { workspaceRepository } from "../repositories/workspace.repository";
import { realtimeService } from "../realtime";
import { ApiError } from "../utils/apiError";
import { parsePaginationParams, formatPaginatedResult } from "../utils/pagination";
import { calculateTokenCost } from "../utils/costCalculator";
import { getPlanMeta } from "../utils/planCatalog";
import {
  UpdatePlanDTO,
  RecordUsageDTO,
  BillingQueryParams,
  BillingUsageSummary,
} from "../interfaces/billing.interface";
import {
  BillingPlan,
  BillingStatus,
  InvoiceStatus,
  LlmModel,
  Prisma,
} from "@prisma/client";

const BILLING_PERIOD_MS = 30 * 24 * 60 * 60 * 1000; // 30 days

function sanitizeAccount(account: any) {
  if (!account) return account;
  return {
    ...account,
    totalTokensUsed: account.totalTokensUsed?.toString?.() ?? account.totalTokensUsed,
    totalSpendUsd: account.totalSpendUsd?.toString?.() ?? account.totalSpendUsd,
  };
}

function sanitizeInvoice(invoice: any) {
  if (!invoice) return invoice;
  return {
    ...invoice,
    amountUsd: invoice.amountUsd?.toString?.() ?? invoice.amountUsd,
  };
}

export class BillingService {
  private async ensureCurrentPeriod(account: any) {
    const now = new Date();
    let periodStart = account.currentPeriodStart;
    let periodEnd = account.currentPeriodEnd;

    // Advance expired billing period (and reset usage counters)
    if (!periodStart || !periodEnd || new Date(periodEnd) < now) {
      periodStart = new Date(now.getTime() - BILLING_PERIOD_MS);
      periodEnd = new Date(now.getTime());
      await billingRepository.updateAccount(account.workspaceId, {
        currentPeriodStart: periodStart,
        currentPeriodEnd: periodEnd,
      });
    }

    return { periodStart: new Date(periodStart), periodEnd: new Date(periodEnd) };
  }

  async getAccount(workspaceId: string, userId: string) {
    const account = await billingRepository.getOrCreateAccount(workspaceId, userId);
    await this.ensureCurrentPeriod(account);

    return sanitizeAccount(await billingRepository.findAccountByWorkspace(workspaceId));
  }

  async updatePlan(workspaceId: string, userId: string, dto: UpdatePlanDTO) {
    const account = await billingRepository.getOrCreateAccount(workspaceId, userId);
    const planMeta = getPlanMeta(dto.plan);
    const now = new Date();

    const updated = await billingRepository.updateAccount(workspaceId, {
      plan: dto.plan,
      status: dto.plan === BillingPlan.FREE ? BillingStatus.ACTIVE : BillingStatus.ACTIVE,
      seats: planMeta.seats,
      monthlyTokenQuota: BigInt(planMeta.monthlyTokenQuota),
      currentPeriodStart: account.currentPeriodStart || now,
      currentPeriodEnd: account.currentPeriodEnd || new Date(now.getTime() + BILLING_PERIOD_MS),
      cancelAtPeriodEnd: false,
    });

    await workspaceRepository.logAuditAction(userId, workspaceId, "PLAN_UPDATED", {
      plan: dto.plan,
      pricePerMonthUsd: planMeta.pricePerMonthUsd,
    });

    // Simulated billing invoice generated for paid plans
    if (dto.plan !== BillingPlan.FREE && planMeta.pricePerMonthUsd > 0) {
      const invoiceCount = await billingRepository.countInvoices(workspaceId);
      const invoice = await billingRepository.createInvoice({
        workspaceId,
        accountId: account.id,
        invoiceNumber: `INV-${new Date().getFullYear()}-${String(invoiceCount + 1).padStart(4, "0")}`,
        amountUsd: planMeta.pricePerMonthUsd,
        description: `${planMeta.name} plan subscription`,
        status: InvoiceStatus.PAID,
        periodStart: account.currentPeriodStart || now,
        periodEnd: new Date(now.getTime() + BILLING_PERIOD_MS),
      });

      realtimeService.emitToWorkspace(workspaceId, "billing:updated", {
        plan: dto.plan,
        invoiceId: invoice.id,
      });

      return { account: sanitizeAccount(updated), invoice: sanitizeInvoice(invoice) };
    }

    realtimeService.emitToWorkspace(workspaceId, "billing:updated", {
      plan: dto.plan,
    });

    return { account: sanitizeAccount(updated), invoice: null };
  }

  async getInvoices(workspaceId: string, queryParams: BillingQueryParams) {
    const { page, limit, skip } = parsePaginationParams({
      page: queryParams.page,
      limit: queryParams.limit,
    });

    const { items, totalItems } = await billingRepository.findInvoices(workspaceId, skip, limit);
    return formatPaginatedResult(items.map(sanitizeInvoice), totalItems, { page, limit, skip });
  }

  async getUsageSummary(workspaceId: string): Promise<BillingUsageSummary> {
    const account = await billingRepository.findAccountByWorkspace(workspaceId);
    if (!account) {
      throw ApiError.notFound("Billing account not found for this workspace");
    }

    const { periodStart, periodEnd } = await this.ensureCurrentPeriod(account);
    const { tokensUsed, estCostUsd } = await billingRepository.sumUsageForPeriod(
      workspaceId,
      periodStart,
      periodEnd
    );

    const planMeta = getPlanMeta(account.plan);
    const quota = Number(account.monthlyTokenQuota);
    const tokensRemaining = Math.max(0, quota - tokensUsed);
    const percentUsed = quota > 0 ? Math.min(100, (tokensUsed / quota) * 100) : 0;

    return {
      plan: account.plan,
      planName: planMeta.name,
      pricePerMonthUsd: planMeta.pricePerMonthUsd,
      monthlyTokenQuota: quota,
      tokensUsed,
      tokensRemaining,
      percentUsed: parseFloat(percentUsed.toFixed(2)),
      estCostUsd: parseFloat(estCostUsd.toFixed(4)),
      periodStart: periodStart.toISOString(),
      periodEnd: periodEnd.toISOString(),
    };
  }

  async recordUsage(workspaceId: string, userId: string, dto: RecordUsageDTO) {
    const account = await billingRepository.getOrCreateAccount(workspaceId, userId);
    await this.ensureCurrentPeriod(account);

    const costUsd = calculateTokenCost(dto.model, dto.tokensUsed);

    await billingRepository.createUsageRecord({
      workspaceId,
      accountId: account.id,
      model: dto.model,
      tokensUsed: dto.tokensUsed,
      costUsd,
    });

    const updated = await billingRepository.updateAccount(workspaceId, {
      totalTokensUsed: BigInt(Number(account.totalTokensUsed) + dto.tokensUsed),
      totalSpendUsd: new Prisma.Decimal(Number(account.totalSpendUsd) + costUsd),
    });

    return {
      tokensUsed: dto.tokensUsed,
      costUsd,
      model: dto.model,
      totalTokensUsed: Number(updated.totalTokensUsed),
      totalSpendUsd: Number(updated.totalSpendUsd),
    };
  }

  async createCheckoutSession(workspaceId: string, userId: string, plan: BillingPlan) {
    const account = await billingRepository.getOrCreateAccount(workspaceId, userId);
    const planMeta = getPlanMeta(plan);

    // Simulated Stripe checkout session (no real Stripe API key required in dev)
    const sessionId = crypto.randomBytes(16).toString("hex");

    return {
      sessionId,
      plan,
      amountUsd: planMeta.pricePerMonthUsd,
      currency: "usd",
      sessionUrl: `https://checkout.stripe.com/mock/${sessionId}?plan=${plan}`,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    };
  }

  /**
   * Handles simulated Stripe webhook events.
   * In production this would verify the `stripe-signature` header via Stripe SDK.
   */
  async handleWebhook(eventType: string, payload: Record<string, any>) {
    let account: any = null;

    switch (eventType) {
      case "checkout.session.completed":
        if (payload.customer && payload.metadata?.workspaceId) {
          account = await billingRepository.getOrCreateAccount(
            payload.metadata.workspaceId,
            payload.metadata.createdById || "system"
          );
          account = await billingRepository.updateAccount(account.workspaceId, {
            stripeCustomerId: payload.customer,
            stripeSubscriptionId: payload.subscription || null,
            status: BillingStatus.ACTIVE,
          });
          realtimeService.emitToWorkspace(account.workspaceId, "billing:updated", {
            status: BillingStatus.ACTIVE,
          });
        }
        break;

      case "invoice.payment_succeeded":
        if (payload.customer) {
          account = await billingRepository.findAccountByStripeCustomerId(payload.customer);
          if (account) {
            await billingRepository.updateAccount(account.workspaceId, {
              status: BillingStatus.ACTIVE,
            });
          }
        }
        break;

      case "customer.subscription.deleted":
        if (payload.customer) {
          account = await billingRepository.findAccountByStripeCustomerId(payload.customer);
          if (account) {
            await billingRepository.updateAccount(account.workspaceId, {
              status: BillingStatus.CANCELED,
              plan: BillingPlan.FREE,
              cancelAtPeriodEnd: false,
            });
            realtimeService.emitToWorkspace(account.workspaceId, "billing:updated", {
              status: BillingStatus.CANCELED,
            });
          }
        }
        break;

      default:
        break;
    }

    return { received: true, eventType };
  }
}

export const billingService = new BillingService();

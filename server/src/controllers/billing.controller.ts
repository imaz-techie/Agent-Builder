import { Request, Response } from "express";
import { billingService } from "../services/billing.service";
import { sendApiResponse } from "../utils/apiResponse";

function getWorkspaceId(req: Request): string {
  const param = req.params.workspaceId || req.params.id;
  return Array.isArray(param) ? param[0] : param;
}

export async function getAccount(req: Request, res: Response) {
  const account = await billingService.getAccount(getWorkspaceId(req), req.user!.id);

  return sendApiResponse({
    res,
    statusCode: 200,
    message: "Billing account retrieved",
    data: { account },
  });
}

export async function updatePlan(req: Request, res: Response) {
  const result = await billingService.updatePlan(getWorkspaceId(req), req.user!.id, req.body);

  return sendApiResponse({
    res,
    statusCode: 200,
    message: "Subscription plan updated successfully",
    data: result,
  });
}

export async function getInvoices(req: Request, res: Response) {
  const result = await billingService.getInvoices(getWorkspaceId(req), req.query);

  return sendApiResponse({
    res,
    statusCode: 200,
    message: "Invoices retrieved",
    data: { invoices: result.items },
    meta: result.meta,
  });
}

export async function getUsageSummary(req: Request, res: Response) {
  const summary = await billingService.getUsageSummary(getWorkspaceId(req));

  return sendApiResponse({
    res,
    statusCode: 200,
    message: "Billing usage summary retrieved",
    data: { summary },
  });
}

export async function recordUsage(req: Request, res: Response) {
  const result = await billingService.recordUsage(getWorkspaceId(req), req.user!.id, req.body);

  return sendApiResponse({
    res,
    statusCode: 200,
    message: "Usage recorded successfully",
    data: result,
  });
}

export async function createCheckoutSession(req: Request, res: Response) {
  const session = await billingService.createCheckoutSession(
    getWorkspaceId(req),
    req.user!.id,
    req.body.plan
  );

  return sendApiResponse({
    res,
    statusCode: 200,
    message: "Checkout session created",
    data: session,
  });
}

export async function handleStripeWebhook(req: Request, res: Response) {
  const payload = req.body;
  const eventType = payload?.type as string;

  if (!eventType) {
    return sendApiResponse({
      res,
      statusCode: 400,
      message: "Invalid webhook payload: missing event type",
    });
  }

  const result = await billingService.handleWebhook(eventType, payload?.data?.object || payload);

  return sendApiResponse({
    res,
    statusCode: 200,
    message: "Webhook processed",
    data: result,
  });
}

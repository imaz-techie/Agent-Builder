export type InvoiceStatus = "paid" | "unpaid" | "overdue";

export interface Invoice {
  id: string;
  date: string;
  amount: number;
  status: InvoiceStatus;
  description: string;
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  interval: "monthly" | "yearly";
  features: string[];
  current?: boolean;
}

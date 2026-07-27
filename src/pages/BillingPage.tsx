import { motion } from "framer-motion";
import {
  CreditCard,
  Download,
  ArrowUpRight,
  Zap,
  Users,
  MessageSquare,
  HardDrive,
  Plus,
  Receipt,
  Star,
  Building2,
  CheckCircle2,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { invoices } from "@/lib/mock-data";
import { formatCurrency, formatDate, getStatusColor } from "@/lib/utils";

const plans = [
  {
    name: "Starter",
    price: 9,
    description: "For individuals and small teams getting started.",
    features: [
      "5 agents",
      "10,000 conversations/mo",
      "Basic analytics",
      "Email support",
      "1 GB storage",
    ],
    icon: Zap,
    highlighted: false,
  },
  {
    name: "Professional",
    price: 49,
    description: "For growing teams that need more power and flexibility.",
    features: [
      "25 agents",
      "100,000 conversations/mo",
      "Advanced analytics",
      "Priority support",
      "10 GB storage",
      "Custom models",
      "API access",
    ],
    icon: Star,
    highlighted: true,
    current: true,
  },
  {
    name: "Enterprise",
    price: 99,
    description: "For organizations with advanced needs and compliance.",
    features: [
      "Unlimited agents",
      "Unlimited conversations",
      "Full analytics suite",
      "24/7 dedicated support",
      "100 GB storage",
      "Custom models",
      "Full API access",
      "SSO & SAML",
      "SLA guarantee",
    ],
    icon: Building2,
    highlighted: false,
  },
];

const usageStats = [
  {
    label: "Agents",
    used: 15,
    max: 25,
    icon: Users,
    color: "bg-primary",
  },
  {
    label: "Conversations",
    used: 67000,
    max: 100000,
    icon: MessageSquare,
    color: "bg-secondary",
    format: "compact" as const,
  },
  {
    label: "Storage",
    used: 4.2,
    max: 10,
    icon: HardDrive,
    color: "bg-accent",
    format: "gb" as const,
  },
];

export default function BillingPage() {
  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-2xl font-bold">Billing & Subscription</h1>
        <p className="text-sm text-muted-foreground">
          Manage your subscription plan, payment methods, and invoices.
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
      >
        <Card className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5 pointer-events-none" />
          <CardHeader className="relative">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <div className="flex items-center gap-3">
                  <CardTitle className="text-xl">Professional Plan</CardTitle>
                  <Badge className="bg-primary/10 text-primary border-primary/20">Current</Badge>
                </div>
                <CardDescription className="mt-1">
                  Billed monthly at {formatCurrency(149)}/mo
                </CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" className="gap-2">
                  <ArrowUpRight className="h-4 w-4" />
                  Upgrade Plan
                </Button>
                <Button variant="ghost" className="text-muted-foreground">
                  Cancel
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="relative">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {usageStats.map((stat) => {
                const percentage =
                  typeof stat.used === "number" && typeof stat.max === "number"
                    ? stat.format === "compact"
                      ? (stat.used / stat.max) * 100
                      : stat.format === "gb"
                        ? (stat.used / stat.max) * 100
                        : (stat.used / stat.max) * 100
                    : 0;

                const displayUsed =
                  stat.format === "compact"
                    ? `${(stat.used / 1000).toFixed(0)}K`
                    : stat.format === "gb"
                      ? `${stat.used}GB`
                      : stat.used;

                const displayMax =
                  stat.format === "compact"
                    ? `${(stat.max / 1000).toFixed(0)}K`
                    : stat.format === "gb"
                      ? `${stat.max}GB`
                      : stat.max;

                return (
                  <div key={stat.label} className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <stat.icon className="h-4 w-4" />
                        {stat.label}
                      </div>
                      <span className="text-sm font-medium">
                        {displayUsed}{" "}
                        <span className="text-muted-foreground">/ {displayMax}</span>
                      </span>
                    </div>
                    <Progress
                      value={percentage}
                      className="h-2"
                      indicatorClassName={stat.color}
                    />
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <div>
        <h2 className="text-lg font-semibold mb-4">Available Plans</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {plans.map((plan, i) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 + i * 0.05 }}
            >
              <Card
                className={`relative h-full ${
                  plan.current
                    ? "border-primary shadow-lg ring-1 ring-primary/20"
                    : ""
                }`}
              >
                {plan.current && (
                  <div className="absolute -top-2.5 left-4">
                    <Badge className="text-[10px] px-2">Current Plan</Badge>
                  </div>
                )}
                <CardContent className="p-6 flex flex-col h-full">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                      <plan.icon className="h-4 w-4 text-primary" />
                    </div>
                    <h3 className="font-semibold">{plan.name}</h3>
                  </div>
                  <p className="text-xs text-muted-foreground mb-4">{plan.description}</p>
                  <p className="text-3xl font-bold mb-1">
                    {formatCurrency(plan.price)}
                    <span className="text-sm font-normal text-muted-foreground">/mo</span>
                  </p>
                  <Separator className="my-4" />
                  <ul className="space-y-2.5 mb-6 flex-1">
                    {plan.features.map((f) => (
                      <li
                        key={f}
                        className="flex items-center gap-2 text-sm text-muted-foreground"
                      >
                        <CheckCircle2 className="h-3.5 w-3.5 text-success shrink-0" />
                        {f}
                      </li>
                    ))}
                  </ul>
                  <Button
                    variant={plan.current ? "outline" : "default"}
                    className="w-full"
                    disabled={plan.current}
                  >
                    {plan.current ? "Current Plan" : "Upgrade"}
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <CreditCard className="h-4 w-4 text-muted-foreground" />
              Payment Methods
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-4 rounded-xl border border-border bg-card">
                <div className="flex items-center gap-4">
                  <div className="h-10 w-16 rounded-lg bg-muted flex items-center justify-center">
                    <span className="text-xs font-bold text-info">VISA</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Visa ending in 4242</p>
                    <p className="text-xs text-muted-foreground">Expires 12/2028</p>
                  </div>
                </div>
                <Badge variant="secondary" className="text-[10px]">
                  Default
                </Badge>
              </div>
              <Button variant="outline" className="gap-2 w-full">
                <Plus className="h-4 w-4" />
                Add Payment Method
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base flex items-center gap-2">
                <Receipt className="h-4 w-4 text-muted-foreground" />
                Invoice History
              </CardTitle>
              <CardDescription>Download and view past invoices.</CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left text-xs font-medium text-muted-foreground pb-3 pr-4">
                      Date
                    </th>
                    <th className="text-left text-xs font-medium text-muted-foreground pb-3 pr-4">
                      Amount
                    </th>
                    <th className="text-left text-xs font-medium text-muted-foreground pb-3 pr-4">
                      Status
                    </th>
                    <th className="text-left text-xs font-medium text-muted-foreground pb-3 pr-4">
                      Description
                    </th>
                    <th className="text-right text-xs font-medium text-muted-foreground pb-3">
                      Invoice
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {invoices.map((inv, i) => (
                    <motion.tr
                      key={inv.id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.25, delay: 0.3 + i * 0.03 }}
                      className="border-b border-border last:border-0 group"
                    >
                      <td className="py-4 pr-4">
                        <span className="text-sm">{formatDate(inv.date)}</span>
                      </td>
                      <td className="py-4 pr-4">
                        <span className="text-sm font-semibold">
                          {formatCurrency(inv.amount)}
                        </span>
                      </td>
                      <td className="py-4 pr-4">
                        <Badge
                          variant="outline"
                          className={`text-[10px] capitalize ${getStatusColor(inv.status)}`}
                        >
                          {inv.status}
                        </Badge>
                      </td>
                      <td className="py-4 pr-4">
                        <span className="text-sm text-muted-foreground">
                          {inv.description}
                        </span>
                      </td>
                      <td className="py-4 text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="gap-1.5 text-muted-foreground hover:text-foreground"
                        >
                          <Download className="h-3.5 w-3.5" />
                          PDF
                        </Button>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}

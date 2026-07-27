import { useState, useEffect, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { motion, type Variants } from "framer-motion";
import {
  Sparkles,
  ArrowRight,
  Bot,
  Moon,
  Sun,
  Play,
  Brain,
  Rocket,
  Code2,
  BarChart3,
  Upload,
  MessageSquare,
  Database,
  Globe2,
  Globe,
  ExternalLink,
  FileText,
  Headphones,
  Puzzle,
  Users,
  Lock,
  Check,
  Star,
  Share2,
  Menu,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import { useTheme } from "@/components/layout/ThemeProvider";
import { cn } from "@/lib/utils";

// ─── Animation Variants ────────────────────────────────────────────────────────

const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] },
  }),
};

const staggerContainer: Variants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.08, delayChildren: 0.1 },
  },
};

const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: (i: number = 0) => ({
    opacity: 1,
    scale: 1,
    transition: { duration: 0.5, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] },
  }),
};

const slideInLeft: Variants = {
  hidden: { opacity: 0, x: -40 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
  },
};

const slideInRight: Variants = {
  hidden: { opacity: 0, x: 40 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
  },
};

// ─── Data ──────────────────────────────────────────────────────────────────────

const navLinks = [
  { label: "Features", href: "#features" },
  { label: "How It Works", href: "#how-it-works" },
  { label: "Pricing", href: "#pricing" },
  { label: "FAQ", href: "#faq" },
];

const featuresRow1 = [
  {
    icon: Bot,
    title: "AI Agent Builder",
    description:
      "Design and configure intelligent agents with our intuitive visual builder. Drag, drop, and customize without writing a single line of code.",
  },
  {
    icon: MessageSquare,
    title: "Prompt Engineering",
    description:
      "Fine-tune agent behavior with advanced prompt templates, chain-of-thought reasoning, and dynamic variable injection for precise outputs.",
  },
  {
    icon: Database,
    title: "Knowledge Base",
    description:
      "Connect PDFs, docs, websites, and databases to give your agents deep domain expertise across any subject matter.",
  },
  {
    icon: Brain,
    title: "Smart Training",
    description:
      "Continuously improve agent accuracy with feedback loops, A/B testing, and automated quality scoring on every conversation.",
  },
  {
    icon: Rocket,
    title: "One-Click Deploy",
    description:
      "Ship agents to production in seconds. Deploy to web, mobile, Slack, Teams, WhatsApp, or any custom channel instantly.",
  },
];

const featuresRow2 = [
  {
    icon: BarChart3,
    title: "Analytics Dashboard",
    description:
      "Track resolution rates, conversation quality, user satisfaction, and cost-per-interaction with real-time dashboards and custom reports.",
  },
  {
    icon: Headphones,
    title: "Live Conversations",
    description:
      "Seamless human handoff when agents need help. Agents escalate complex queries to your team with full conversation context.",
  },
  {
    icon: Puzzle,
    title: "API Integration",
    description:
      "Connect to any system with REST & GraphQL APIs, webhooks, Zapier, Make, and native integrations with 100+ platforms.",
  },
  {
    icon: Users,
    title: "Team Collaboration",
    description:
      "Role-based access, shared workspaces, version control, and approval workflows keep your entire team aligned and productive.",
  },
  {
    icon: Lock,
    title: "Enterprise Security",
    description:
      "SOC 2 Type II, GDPR compliant, end-to-end encryption, SSO/SAML, custom data retention, and dedicated VPC deployment options.",
  },
];

const steps = [
  { icon: Bot, label: "Create Agent", description: "Design your agent persona" },
  { icon: Upload, label: "Upload Knowledge", description: "Add docs, URLs, data" },
  { icon: Brain, label: "Train AI", description: "Fine-tune responses" },
  { icon: Rocket, label: "Deploy", description: "Go live in seconds" },
  { icon: Code2, label: "Embed Widget", description: "Add to any website" },
  { icon: BarChart3, label: "Monitor", description: "Track performance" },
];

const pricingTiers = [
  {
    name: "Starter",
    price: 49,
    description: "Perfect for individuals and small projects.",
    features: [
      "5 AI Agents",
      "10,000 conversations/mo",
      "1 GB storage",
      "Basic analytics",
      "Email support",
      "Community access",
    ],
    cta: "Start Free Trial",
    popular: false,
  },
  {
    name: "Professional",
    price: 149,
    description: "Best for growing teams and businesses.",
    features: [
      "25 AI Agents",
      "100,000 conversations/mo",
      "10 GB storage",
      "Advanced analytics",
      "Priority support",
      "Custom branding",
      "API access",
      "Team collaboration",
    ],
    cta: "Start Free Trial",
    popular: true,
  },
  {
    name: "Enterprise",
    price: 499,
    description: "For organizations with advanced needs.",
    features: [
      "Unlimited AI Agents",
      "Unlimited conversations",
      "100 GB storage",
      "Custom analytics",
      "Dedicated support",
      "SSO / SAML",
      "Custom integrations",
      "SLA guarantee",
      "On-premise option",
    ],
    cta: "Contact Sales",
    popular: false,
  },
];

const testimonials = [
  {
    quote:
      "AgentForge AI transformed our customer support. We reduced resolution time by 60% and our agents handle 80% of tickets autonomously now.",
    name: "Sarah Chen",
    title: "VP of Operations",
    company: "Meridian Health",
    rating: 5,
  },
  {
    quote:
      "The knowledge base integration is phenomenal. Our legal team trained an agent on 10,000+ documents and it answers compliance questions with incredible accuracy.",
    name: "Marcus Rodriguez",
    title: "CTO",
    company: "Atlas Legal Tech",
    rating: 5,
  },
  {
    quote:
      "We went from prototype to production in two days. The API is clean, the dashboard is beautiful, and our customers love the experience.",
    name: "Priya Sharma",
    title: "Head of Product",
    company: "Nexus Commerce",
    rating: 5,
  },
];

const faqs = [
  {
    question: "What is AgentForge AI?",
    answer:
      "AgentForge AI is an enterprise-grade platform that enables teams to build, train, and deploy intelligent AI agents. Our visual builder, knowledge base integration, and deployment tools let you create production-ready agents without writing code, or customize everything through our powerful API.",
  },
  {
    question: "How do I create an AI agent?",
    answer:
      "Creating an agent takes just a few minutes. Use our visual builder to define your agent's persona, capabilities, and behavior. Upload knowledge from documents, websites, or databases. Train with sample conversations, then deploy to any channel with one click.",
  },
  {
    question: "What AI models are supported?",
    answer:
      "We support GPT-4, GPT-4o, Claude 3.5 Sonnet, Claude 3 Opus, Gemini Pro, Llama 3, Mixtral, and many more. You can also bring your own fine-tuned models or use our optimized in-house models for specific use cases.",
  },
  {
    question: "Can I use my own data?",
    answer:
      "Absolutely. Upload PDFs, Word docs, spreadsheets, websites, databases, Notion pages, Google Docs, and more. Our RAG pipeline automatically chunks, indexes, and retrieves the most relevant information to answer questions accurately.",
  },
  {
    question: "Is my data secure?",
    answer:
      "Security is our top priority. We are SOC 2 Type II certified, GDPR compliant, and offer end-to-end encryption at rest and in transit. Enterprise plans include dedicated VPC deployment, custom data retention policies, and SSO/SAML integration.",
  },
  {
    question: "How does pricing work?",
    answer:
      "We offer transparent, usage-based pricing. Start with our Starter plan at $49/month, upgrade to Professional at $149/month for your growing team, or contact us for Enterprise pricing. All plans include a 14-day free trial with no credit card required.",
  },
];

const trustedCompanies = [
  "Meridian Health",
  "Atlas Legal",
  "Nexus Commerce",
  "Veridian Labs",
  "Pinnacle AI",
  "Orion Systems",
];

const footerLinks = {
  Product: ["Features", "Pricing", "API Docs", "Changelog"],
  Company: ["About", "Blog", "Careers", "Press"],
  Resources: ["Documentation", "Community", "Status", "Support"],
  Legal: ["Privacy", "Terms", "Security"],
};

// ─── Helper: Section Wrapper ───────────────────────────────────────────────────

function Section({
  id,
  className,
  children,
}: {
  id?: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <section id={id} className={cn("relative", className)}>
      {children}
    </section>
  );
}

function SectionHeader({
  badge,
  title,
  subtitle,
}: {
  badge?: string;
  title: ReactNode;
  subtitle?: string;
}) {
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-60px" }}
      variants={staggerContainer}
      className="text-center max-w-3xl mx-auto mb-16"
    >
      {badge && (
        <motion.div variants={fadeInUp} custom={0}>
          <Badge variant="secondary" className="mb-4 px-3 py-1 text-xs">
            {badge}
          </Badge>
        </motion.div>
      )}
      <motion.h2
        variants={fadeInUp}
        custom={1}
        className="text-3xl md:text-5xl font-bold tracking-tight mb-4"
      >
        {title}
      </motion.h2>
      {subtitle && (
        <motion.p
          variants={fadeInUp}
          custom={2}
          className="text-muted-foreground text-lg max-w-2xl mx-auto"
        >
          {subtitle}
        </motion.p>
      )}
    </motion.div>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────────

export default function LandingPage() {
  const { theme, toggleTheme } = useTheme();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const closeMobileMenu = () => setMobileMenuOpen(false);

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      {/* ──────────────────────── Sticky Header ──────────────────────── */}
      <header
        className={cn(
          "fixed top-0 inset-x-0 z-50 transition-all duration-300",
          scrolled
            ? "bg-background/70 backdrop-blur-2xl border-b border-border/50 shadow-sm"
            : "bg-transparent"
        )}
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between px-6 h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 shrink-0">
            <div className="h-8 w-8 rounded-lg bg-gradient-primary flex items-center justify-center shadow-md">
              <Sparkles className="h-4.5 w-4.5 text-white" />
            </div>
            <span className="text-lg font-bold gradient-text">AgentForge AI</span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors rounded-lg hover:bg-muted/50"
              >
                {link.label}
              </a>
            ))}
          </nav>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              className="text-muted-foreground hover:text-foreground"
            >
              {theme === "light" ? (
                <Moon className="h-4.5 w-4.5" />
              ) : (
                <Sun className="h-4.5 w-4.5" />
              )}
            </Button>
            <Link to="/login">
              <Button variant="ghost" size="sm">
                Log in
              </Button>
            </Link>
            <Link to="/register">
              <Button size="sm" className="gap-1.5">
                Get Started
                <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </Link>
          </div>

          {/* Mobile Toggle */}
          <div className="flex md:hidden items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              className="text-muted-foreground"
            >
              {theme === "light" ? (
                <Moon className="h-4.5 w-4.5" />
              ) : (
                <Sun className="h-4.5 w-4.5" />
              )}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="md:hidden border-t border-border bg-background/95 backdrop-blur-xl"
          >
            <div className="px-6 py-4 space-y-1">
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={closeMobileMenu}
                  className="block px-3 py-2.5 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-lg transition-colors"
                >
                  {link.label}
                </a>
              ))}
              <Separator className="my-3" />
              <Link to="/login" onClick={closeMobileMenu}>
                <Button variant="ghost" size="sm" className="w-full justify-start">
                  Log in
                </Button>
              </Link>
              <Link to="/register" onClick={closeMobileMenu}>
                <Button size="sm" className="w-full justify-center gap-1.5 mt-1">
                  Get Started
                  <ArrowRight className="h-3.5 w-3.5" />
                </Button>
              </Link>
            </div>
          </motion.div>
        )}
      </header>

      {/* ──────────────────────── Hero Section ──────────────────────── */}
      <Section className="pt-28 pb-20 md:pt-36 md:pb-32">
        {/* Background Glow */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full bg-primary/5 blur-3xl" />
          <div className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full bg-secondary/5 blur-3xl" />
        </div>

        <div className="max-w-7xl mx-auto px-6 relative">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* Left - Text */}
            <motion.div
              initial="hidden"
              animate="visible"
              variants={staggerContainer}
            >
              <motion.div variants={fadeInUp} custom={0}>
                <Badge
                  variant="secondary"
                  className="mb-6 px-3.5 py-1.5 text-xs font-semibold gap-2"
                >
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-success" />
                  </span>
                  Now in Public Beta
                </Badge>
              </motion.div>

              <motion.h1
                variants={fadeInUp}
                custom={1}
                className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight leading-[1.05] mb-6"
              >
                Build, Train &amp; Deploy{" "}
                <span className="gradient-text">AI Agents</span>{" "}
                in Minutes
              </motion.h1>

              <motion.p
                variants={fadeInUp}
                custom={2}
                className="text-lg md:text-xl text-muted-foreground max-w-xl leading-relaxed mb-8"
              >
                Create intelligent AI agents that learn from your data, understand
                your customers, and work 24/7 across every channel.
              </motion.p>

              <motion.div
                variants={fadeInUp}
                custom={3}
                className="flex flex-col sm:flex-row gap-3"
              >
                <Link to="/register">
                  <Button size="lg" className="gap-2 text-base px-7">
                    Get Started Free
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
                <Button
                  variant="outline"
                  size="lg"
                  className="gap-2 text-base px-7"
                >
                  <Play className="h-4 w-4 fill-current" />
                  Watch Demo
                </Button>
              </motion.div>

              <motion.p
                variants={fadeInUp}
                custom={4}
                className="mt-5 text-xs text-muted-foreground"
              >
                Free 14-day trial &middot; No credit card required &middot; Cancel anytime
              </motion.p>
            </motion.div>

            {/* Right - Hero Visual */}
            <motion.div
              initial="hidden"
              animate="visible"
              variants={slideInRight}
              className="relative hidden lg:flex justify-center items-center"
            >
              {/* AI Brain Node */}
              <div className="relative w-[420px] h-[380px]">
                {/* Central Brain */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
                  <div className="relative">
                    <div className="absolute inset-0 rounded-full bg-primary/30 blur-xl animate-pulse-glow" />
                    <div className="relative w-24 h-24 rounded-full bg-gradient-primary flex items-center justify-center shadow-2xl shadow-primary/30">
                      <Brain className="h-10 w-10 text-white" />
                    </div>
                  </div>
                  <p className="text-center mt-3 text-sm font-semibold text-primary">
                    AI Brain
                  </p>
                </div>

                {/* Satellite Nodes */}
                {[
                  {
                    icon: Database,
                    label: "Knowledge Base",
                    top: "8%",
                    left: "50%",
                    translate: "-50%, 0%",
                  },
                  {
                    icon: FileText,
                    label: "Documents",
                    top: "28%",
                    left: "2%",
                    translate: "0%, 0%",
                  },
                  {
                    icon: Globe2,
                    label: "Websites",
                    top: "28%",
                    right: "2%",
                    left: "auto",
                    translate: "0%, 0%",
                  },
                  {
                    icon: BarChart3,
                    label: "Data",
                    bottom: "10%",
                    left: "12%",
                    top: "auto",
                    translate: "0%, 0%",
                  },
                ].map((node, i) => (
                  <motion.div
                    key={node.label}
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{
                      delay: 0.8 + i * 0.15,
                      duration: 0.5,
                      ease: [0.22, 1, 0.36, 1],
                    }}
                    className="absolute"
                    style={{
                      top: node.top,
                      left: node.left,
                      right: (node as any).right,
                      bottom: (node as any).bottom,
                      transform: `translate(${node.translate})`,
                    }}
                  >
                    <div className="flex flex-col items-center gap-1.5">
                      <div className="w-12 h-12 rounded-xl bg-card border border-border shadow-lg flex items-center justify-center hover:scale-110 transition-transform duration-200">
                        <node.icon className="h-5 w-5 text-primary" />
                      </div>
                      <span className="text-[11px] font-medium text-muted-foreground whitespace-nowrap">
                        {node.label}
                      </span>
                    </div>
                  </motion.div>
                ))}

                {/* Connection Lines (decorative gradient) */}
                <svg
                  className="absolute inset-0 w-full h-full pointer-events-none"
                  viewBox="0 0 420 380"
                >
                  <defs>
                    <linearGradient id="lineGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="var(--color-primary)" stopOpacity="0.3" />
                      <stop offset="100%" stopColor="var(--color-secondary)" stopOpacity="0.1" />
                    </linearGradient>
                  </defs>
                  {/* Brain to top */}
                  <line x1="210" y1="160" x2="210" y2="65" stroke="url(#lineGrad)" strokeWidth="1.5" strokeDasharray="4 4" />
                  {/* Brain to top-left */}
                  <line x1="180" y1="180" x2="80" y2="135" stroke="url(#lineGrad)" strokeWidth="1.5" strokeDasharray="4 4" />
                  {/* Brain to top-right */}
                  <line x1="240" y1="180" x2="340" y2="135" stroke="url(#lineGrad)" strokeWidth="1.5" strokeDasharray="4 4" />
                  {/* Brain to bottom-left */}
                  <line x1="185" y1="220" x2="100" y2="320" stroke="url(#lineGrad)" strokeWidth="1.5" strokeDasharray="4 4" />
                </svg>

                {/* Mini Chat Widget Preview */}
                <motion.div
                  initial={{ opacity: 0, y: 20, scale: 0.9 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ delay: 1.4, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                  className="absolute -bottom-4 right-4 w-64 rounded-xl border border-border bg-card shadow-xl overflow-hidden"
                >
                  <div className="bg-gradient-primary px-3.5 py-2.5 flex items-center gap-2">
                    <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center">
                      <Bot className="h-3 w-3 text-white" />
                    </div>
                    <span className="text-xs font-semibold text-white">AgentForge Bot</span>
                    <span className="ml-auto flex h-2 w-2">
                      <span className="animate-ping absolute h-2 w-2 rounded-full bg-green-400 opacity-75" />
                      <span className="relative rounded-full h-2 w-2 bg-green-400" />
                    </span>
                  </div>
                  <div className="p-3 space-y-2.5">
                    <div className="bg-muted rounded-lg rounded-tl-none px-3 py-2 text-xs text-foreground max-w-[85%]">
                      Hi! How can I help you today?
                    </div>
                    <div className="bg-primary/10 rounded-lg rounded-tr-none px-3 py-2 text-xs text-foreground max-w-[85%] ml-auto">
                      What are your pricing plans?
                    </div>
                    <div className="bg-muted rounded-lg rounded-tl-none px-3 py-2 text-xs text-foreground max-w-[85%]">
                      We offer three plans starting at $49/mo. Would you like details?
                    </div>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
      </Section>

      {/* ──────────────────────── Trusted By ──────────────────────── */}
      <Section className="border-y border-border/50 bg-muted/20">
        <div className="max-w-7xl mx-auto px-6 py-14">
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center text-sm text-muted-foreground mb-8"
          >
            Trusted by 2,000+ teams worldwide
          </motion.p>
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="flex flex-wrap justify-center items-center gap-x-12 gap-y-4"
          >
            {trustedCompanies.map((company) => (
              <motion.span
                key={company}
                variants={fadeInUp}
                className="text-lg font-bold text-muted-foreground/40 hover:text-muted-foreground/60 transition-colors duration-300 select-none tracking-tight"
              >
                {company}
              </motion.span>
            ))}
          </motion.div>
        </div>
      </Section>

      {/* ──────────────────────── Features Section ──────────────────────── */}
      <Section id="features" className="py-24 md:py-32">
        <div className="max-w-7xl mx-auto px-6">
          <SectionHeader
            badge="Features"
            title={
              <>
                Everything you need to build{" "}
                <span className="gradient-text">production AI agents</span>
              </>
            }
            subtitle="A comprehensive platform designed for teams that want to ship intelligent agents fast, without compromising on quality or security."
          />

          {/* Row 1 */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
            variants={staggerContainer}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-4"
          >
            {featuresRow1.map((f, i) => (
              <motion.div key={f.title} variants={scaleIn} custom={i}>
                <Card className="h-full group hover:shadow-lg hover:border-primary/20 hover:-translate-y-1 transition-all duration-300">
                  <CardContent className="p-5">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-3.5 group-hover:bg-primary/20 transition-colors">
                      <f.icon className="h-5 w-5 text-primary" />
                    </div>
                    <h3 className="font-semibold text-sm mb-1.5">{f.title}</h3>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {f.description}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>

          {/* Row 2 */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
            variants={staggerContainer}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4"
          >
            {featuresRow2.map((f, i) => (
              <motion.div key={f.title} variants={scaleIn} custom={i}>
                <Card className="h-full group hover:shadow-lg hover:border-primary/20 hover:-translate-y-1 transition-all duration-300">
                  <CardContent className="p-5">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-3.5 group-hover:bg-primary/20 transition-colors">
                      <f.icon className="h-5 w-5 text-primary" />
                    </div>
                    <h3 className="font-semibold text-sm mb-1.5">{f.title}</h3>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {f.description}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </Section>

      {/* ──────────────────────── How It Works ──────────────────────── */}
      <Section id="how-it-works" className="py-24 md:py-32 bg-muted/20 border-y border-border/50">
        <div className="max-w-7xl mx-auto px-6">
          <SectionHeader
            badge="How It Works"
            title={
              <>
                Up and running in{" "}
                <span className="gradient-text">six simple steps</span>
              </>
            }
            subtitle="From idea to production in minutes, not months."
          />

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-60px" }}
            variants={staggerContainer}
            className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 relative"
          >
            {steps.map((step, i) => (
              <motion.div
                key={step.label}
                variants={fadeInUp}
                custom={i}
                className="relative flex flex-col items-center text-center"
              >
                {/* Step Number */}
                <div className="relative mb-4">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-primary flex items-center justify-center shadow-lg shadow-primary/20">
                    <step.icon className="h-7 w-7 text-white" />
                  </div>
                  <span className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-card border-2 border-primary text-[10px] font-bold flex items-center justify-center text-primary">
                    {i + 1}
                  </span>
                </div>

                <h3 className="font-semibold text-sm mb-1">{step.label}</h3>
                <p className="text-xs text-muted-foreground">{step.description}</p>

                {/* Connector Line (desktop) */}
                {i < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-8 left-[calc(50%+32px)] w-[calc(100%-64px)] h-[2px]">
                    <div className="w-full h-full bg-gradient-to-r from-primary/40 to-secondary/20" />
                  </div>
                )}
              </motion.div>
            ))}
          </motion.div>
        </div>
      </Section>

      {/* ──────────────────────── Stats Section ──────────────────────── */}
      <Section className="py-20 md:py-28">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-4"
          >
            {[
              { value: "10M+", label: "Conversations served" },
              { value: "2,000+", label: "Teams worldwide" },
              { value: "99.9%", label: "Uptime SLA" },
              { value: "150ms", label: "Avg response time" },
            ].map((stat, i) => (
              <motion.div
                key={stat.label}
                variants={fadeInUp}
                custom={i}
                className="text-center"
              >
                <p className="text-4xl md:text-5xl font-extrabold gradient-text mb-2 tracking-tight">
                  {stat.value}
                </p>
                <p className="text-sm text-muted-foreground font-medium">
                  {stat.label}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </Section>

      {/* ──────────────────────── Pricing Section ──────────────────────── */}
      <Section id="pricing" className="py-24 md:py-32 bg-muted/20 border-y border-border/50">
        <div className="max-w-7xl mx-auto px-6">
          <SectionHeader
            badge="Pricing"
            title={
              <>
                Simple, transparent{" "}
                <span className="gradient-text">pricing</span>
              </>
            }
            subtitle="Start free, scale as you grow. No hidden fees, no surprises."
          />

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
            variants={staggerContainer}
            className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 max-w-5xl mx-auto items-stretch"
          >
            {pricingTiers.map((tier, i) => (
              <motion.div
                key={tier.name}
                variants={scaleIn}
                custom={i}
                className="flex"
              >
                <Card
                  className={cn(
                    "relative flex flex-col h-full transition-all duration-300 hover:shadow-xl",
                    tier.popular &&
                      "border-primary shadow-lg shadow-primary/10 md:-my-4 md:py-4"
                  )}
                >
                  {tier.popular && (
                    <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                      <Badge className="px-3 py-1 text-xs font-semibold shadow-sm">
                        Most Popular
                      </Badge>
                    </div>
                  )}
                  <CardContent className={cn("p-6 flex flex-col flex-1", tier.popular && "pt-8")}>
                    <h3 className="text-lg font-semibold mb-1">{tier.name}</h3>
                    <p className="text-sm text-muted-foreground mb-5">
                      {tier.description}
                    </p>
                    <div className="mb-6">
                      <span className="text-4xl font-extrabold tracking-tight">
                        ${tier.price}
                      </span>
                      <span className="text-muted-foreground text-sm ml-1">/month</span>
                    </div>
                    <ul className="space-y-2.5 mb-8 flex-1">
                      {tier.features.map((feature) => (
                        <li
                          key={feature}
                          className="flex items-start gap-2.5 text-sm"
                        >
                          <Check className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                    <Link to="/register" className="mt-auto">
                      <Button
                        variant={tier.popular ? "default" : "outline"}
                        className="w-full"
                        size="lg"
                      >
                        {tier.cta}
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </Section>

      {/* ──────────────────────── Testimonials ──────────────────────── */}
      <Section className="py-24 md:py-32">
        <div className="max-w-7xl mx-auto px-6">
          <SectionHeader
            badge="Testimonials"
            title={
              <>
                Loved by teams{" "}
                <span className="gradient-text">around the world</span>
              </>
            }
          />

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
            variants={staggerContainer}
            className="grid grid-cols-1 md:grid-cols-3 gap-6"
          >
            {testimonials.map((t, i) => (
              <motion.div key={t.name} variants={fadeInUp} custom={i}>
                <Card className="h-full hover:shadow-lg transition-shadow duration-300">
                  <CardContent className="p-6 flex flex-col h-full">
                    {/* Stars */}
                    <div className="flex gap-0.5 mb-4">
                      {Array.from({ length: t.rating }).map((_, j) => (
                        <Star
                          key={j}
                          className="h-4 w-4 fill-yellow-400 text-yellow-400"
                        />
                      ))}
                    </div>
                    <blockquote className="text-sm leading-relaxed text-foreground mb-6 flex-1">
                      &ldquo;{t.quote}&rdquo;
                    </blockquote>
                    <div className="flex items-center gap-3 pt-4 border-t border-border">
                      <div className="w-9 h-9 rounded-full bg-gradient-primary flex items-center justify-center text-white text-xs font-bold shrink-0">
                        {t.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </div>
                      <div>
                        <p className="text-sm font-semibold leading-tight">
                          {t.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {t.title}, {t.company}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </Section>

      {/* ──────────────────────── FAQ Section ──────────────────────── */}
      <Section id="faq" className="py-24 md:py-32 bg-muted/20 border-y border-border/50">
        <div className="max-w-3xl mx-auto px-6">
          <SectionHeader
            badge="FAQ"
            title={
              <>
                Frequently asked{" "}
                <span className="gradient-text">questions</span>
              </>
            }
          />

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-40px" }}
            variants={staggerContainer}
          >
            <Accordion type="single" collapsible className="w-full">
              {faqs.map((faq, i) => (
                <motion.div key={faq.question} variants={fadeInUp} custom={i}>
                  <AccordionItem
                    value={`faq-${i}`}
                    className="border-border/60"
                  >
                    <AccordionTrigger className="text-left text-sm font-semibold py-4 hover:no-underline hover:text-primary transition-colors">
                      {faq.question}
                    </AccordionTrigger>
                    <AccordionContent className="text-sm text-muted-foreground leading-relaxed pb-5">
                      {faq.answer}
                    </AccordionContent>
                  </AccordionItem>
                </motion.div>
              ))}
            </Accordion>
          </motion.div>
        </div>
      </Section>

      {/* ──────────────────────── CTA Banner ──────────────────────── */}
      <Section className="py-24 md:py-32">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="relative rounded-3xl bg-gradient-primary overflow-hidden p-12 md:p-16 text-center"
          >
            {/* Decorative circles */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
              <div className="absolute -top-24 -right-24 w-64 h-64 rounded-full bg-white/10 blur-2xl" />
              <div className="absolute -bottom-24 -left-24 w-80 h-80 rounded-full bg-white/5 blur-3xl" />
            </div>

            <motion.h2
              variants={fadeInUp}
              custom={0}
              className="text-3xl md:text-5xl font-extrabold text-white tracking-tight mb-4 relative z-10"
            >
              Ready to build your AI agent?
            </motion.h2>
            <motion.p
              variants={fadeInUp}
              custom={1}
              className="text-lg text-white/80 mb-8 max-w-xl mx-auto relative z-10"
            >
              Start for free. No credit card required. Deploy your first agent in under 5 minutes.
            </motion.p>
            <motion.div variants={fadeInUp} custom={2} className="relative z-10">
              <Link to="/register">
                <Button
                  size="lg"
                  variant="secondary"
                  className="text-base px-8 bg-white text-primary hover:bg-white/90 shadow-xl"
                >
                  Get Started Free
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </Section>

      {/* ──────────────────────── Footer ──────────────────────── */}
      <footer className="border-t border-border bg-muted/30">
        <div className="max-w-7xl mx-auto px-6 py-16">
          <div className="grid grid-cols-2 md:grid-cols-6 gap-8 mb-12">
            {/* Brand Column */}
            <div className="col-span-2">
              <Link to="/" className="flex items-center gap-2.5 mb-4">
                <div className="h-8 w-8 rounded-lg bg-gradient-primary flex items-center justify-center">
                  <Sparkles className="h-4.5 w-4.5 text-white" />
                </div>
                <span className="text-lg font-bold gradient-text">AgentForge AI</span>
              </Link>
              <p className="text-sm text-muted-foreground leading-relaxed max-w-xs mb-5">
                The enterprise platform for building, training, and deploying intelligent AI agents at scale.
              </p>
              <div className="flex gap-3">
                {[Globe, Share2, ExternalLink].map((Icon, i) => (
                  <a
                    key={i}
                    href="#"
                    className="w-9 h-9 rounded-lg border border-border bg-card flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-primary/30 transition-all duration-200"
                  >
                    <Icon className="h-4 w-4" />
                  </a>
                ))}
              </div>
            </div>

            {/* Link Columns */}
            {Object.entries(footerLinks).map(([category, links]) => (
              <div key={category}>
                <h4 className="text-sm font-semibold mb-4">{category}</h4>
                <ul className="space-y-2.5">
                  {links.map((link) => (
                    <li key={link}>
                      <a
                        href="#"
                        className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {link}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <Separator className="mb-8" />

          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-xs text-muted-foreground">
              &copy; {new Date().getFullYear()} AgentForge Inc. All rights reserved.
            </p>
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <a href="#" className="hover:text-foreground transition-colors">
                Privacy Policy
              </a>
              <a href="#" className="hover:text-foreground transition-colors">
                Terms of Service
              </a>
              <a href="#" className="hover:text-foreground transition-colors">
                Cookie Settings
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

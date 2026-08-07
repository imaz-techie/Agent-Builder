import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Code2,
  Copy,
  Check,
  Download,
  RefreshCw,
  Monitor,
  Tablet,
  Smartphone,
  MessageSquare,
  Send,
  Bot,
  X,
  Settings2,
  Loader2,
  Save,
  Globe,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { useAgentsQuery } from "@/hooks/queries/useAgentQueries";
import { useWidgetConfigQuery } from "@/hooks/queries/useWidgetQueries";
import {
  useUpsertWidgetConfigMutation,
  usePublishWidgetMutation,
  useRegenerateWidgetTokenMutation,
} from "@/hooks/mutations/useWidgetMutations";
import type {
  ChatWidgetConfig,
  WidgetLauncherPosition,
  WidgetTheme,
} from "@/types/widget.types";

const colorSwatches = [
  "#6366f1",
  "#a855f7",
  "#22c55e",
  "#f59e0b",
  "#ef4444",
  "#06b6d4",
  "#ec4899",
  "#14b8a6",
];

type DeviceType = "desktop" | "tablet" | "mobile";

function buildIntegrationSnippets(agentId: string, token: string) {
  const widgetRef = token || "wgt_xxxxxxxx";
  const widgetAttr = token ? `data-widget="${token}"` : "data-widget=\"wgt_xxxxxxxx\"";
  return {
    HTML: {
      label: "HTML",
      code: `<script src="https://agentmax.ai/widget.js" ${widgetAttr}></script>`,
    },
    React: {
      label: "React",
      code: `import { AgentMaxWidget } from "@agentmax/react";

function App() {
  return (
    <AgentMaxWidget
      widgetToken="${widgetRef}"
      agentId="${agentId}"
    />
  );
}`,
    },
    Vue: {
      label: "Vue",
      code: `<template>
  <AgentMaxWidget
    widget-token="${widgetRef}"
    agent-id="${agentId}"
  />
</template>

<script setup>
import { AgentMaxWidget } from "@agentmax/vue";
</script>`,
    },
    Angular: {
      label: "Angular",
      code: `import { AgentMaxModule } from "@agentmax/angular";

@NgModule({
  imports: [AgentMaxModule.forRoot({
    widgetToken: "${widgetRef}",
    agentId: "${agentId}"
  })],
})
export class AppModule {}`,
    },
    "Next.js": {
      label: "Next.js",
      code: `// app/layout.tsx
import { AgentMaxWidget } from "@agentmax/next";

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <AgentMaxWidget widgetToken="${widgetRef}" agentId="${agentId}" />
      </body>
    </html>
  );
}`,
    },
    Nuxt: {
      label: "Nuxt",
      code: `// nuxt.config.ts
export default defineNuxtConfig({
  modules: ["@agentmax/nuxt"],
  agentmax: {
    widgetToken: "${widgetRef}",
    agentId: "${agentId}"
  }
})`,
    },
    WordPress: {
      label: "WordPress",
      code: `<!-- Add to your theme's footer.php or use a plugin -->
<script
  src="https://agentmax.ai/widget.js"
  ${widgetAttr}
  data-position="bottom-right">
</script>`,
    },
    Shopify: {
      label: "Shopify",
      code: `<!-- Paste in Online Store > Themes > Edit code > theme.liquid -->
<!-- Before the closing </body> tag -->
<script
  src="https://agentmax.ai/widget.js"
  ${widgetAttr}>
</script>`,
    },
  };
}

const DEFAULT_CONFIG: Partial<ChatWidgetConfig> = {
  title: "Chat with our assistant",
  welcomeMessage: "Hi there! How can I help you today?",
  theme: "LIGHT",
  primaryColor: "#6366f1",
  launcherPosition: "BOTTOM_RIGHT",
  launcherSize: 56,
  showAvatar: true,
  allowFileUpload: false,
  enableRag: true,
};

export default function EmbedWidgetPage() {
  const [copied, setCopied] = useState(false);
  const [selectedAgentId, setSelectedAgentId] = useState<string | null>(null);
  const [activeIntegration, setActiveIntegration] = useState("HTML");
  const [widgetOpen, setWidgetOpen] = useState(true);
  const [device, setDevice] = useState<DeviceType>("desktop");
  const [cornerRadius, setCornerRadius] = useState(16);
  const [placeholder, setPlaceholder] = useState("Type your message...");
  const [showOnline, setShowOnline] = useState(true);
  const [typingIndicator, setTypingIndicator] = useState(true);
  const [dirty, setDirty] = useState(false);

  const [title, setTitle] = useState(DEFAULT_CONFIG.title!);
  const [welcomeMessage, setWelcomeMessage] = useState(DEFAULT_CONFIG.welcomeMessage!);
  const [theme, setTheme] = useState<WidgetTheme>(DEFAULT_CONFIG.theme!);
  const [primaryColor, setPrimaryColor] = useState(DEFAULT_CONFIG.primaryColor!);
  const [launcherPosition, setLauncherPosition] = useState<WidgetLauncherPosition>(
    DEFAULT_CONFIG.launcherPosition!
  );
  const [launcherSize, setLauncherSize] = useState(DEFAULT_CONFIG.launcherSize!);
  const [showAvatar, setShowAvatar] = useState(DEFAULT_CONFIG.showAvatar!);
  const [allowFileUpload, setAllowFileUpload] = useState(DEFAULT_CONFIG.allowFileUpload!);
  const [enableRag, setEnableRag] = useState(DEFAULT_CONFIG.enableRag!);
  const [prePrompt, setPrePrompt] = useState("");
  const [widgetId, setWidgetId] = useState<string | null>(null);
  const [isPublished, setIsPublished] = useState(false);
  const [widgetToken, setWidgetToken] = useState("");

  const { data: allAgents = [], isLoading: agentsLoading } = useAgentsQuery();
  const activeAgents = allAgents.filter((a) => a.status === "ACTIVE");
  const { data: config, isFetching: configLoading } = useWidgetConfigQuery(selectedAgentId);

  const upsertConfig = useUpsertWidgetConfigMutation(selectedAgentId);
  const publishWidget = usePublishWidgetMutation(selectedAgentId);
  const regenerateToken = useRegenerateWidgetTokenMutation(selectedAgentId);

  useEffect(() => {
    if (!selectedAgentId && activeAgents.length > 0) {
      setSelectedAgentId(activeAgents[0].id);
    }
  }, [activeAgents, selectedAgentId]);

  useEffect(() => {
    if (config) {
      setTitle(config.title);
      setWelcomeMessage(config.welcomeMessage);
      setTheme(config.theme);
      setPrimaryColor(config.primaryColor);
      setLauncherPosition(config.launcherPosition);
      setLauncherSize(config.launcherSize);
      setShowAvatar(config.showAvatar);
      setAllowFileUpload(config.allowFileUpload);
      setEnableRag(config.enableRag);
      setPrePrompt(config.prePrompt ?? "");
      setWidgetId(config.id);
      setIsPublished(config.isPublished);
      setWidgetToken(config.widgetToken);
      setDirty(false);
    }
  }, [config]);

  useEffect(() => {
    if (selectedAgentId) {
      setWidgetId(null);
      setIsPublished(false);
      setWidgetToken("");
      setTitle(DEFAULT_CONFIG.title!);
      setWelcomeMessage(DEFAULT_CONFIG.welcomeMessage!);
      setTheme(DEFAULT_CONFIG.theme!);
      setPrimaryColor(DEFAULT_CONFIG.primaryColor!);
      setLauncherPosition(DEFAULT_CONFIG.launcherPosition!);
      setLauncherSize(DEFAULT_CONFIG.launcherSize!);
      setShowAvatar(DEFAULT_CONFIG.showAvatar!);
      setAllowFileUpload(DEFAULT_CONFIG.allowFileUpload!);
      setEnableRag(DEFAULT_CONFIG.enableRag!);
      setPrePrompt("");
      setDirty(false);
    }
  }, [selectedAgentId]);

  const activeAgent = activeAgents.find((a) => a.id === selectedAgentId) ?? activeAgents[0];

  const embedCode = `<script src="https://agentmax.ai/widget.js" data-widget="${
    widgetToken || "wgt_xxxxxxxx"
  }"></script>`;

  const integrationSnippets = buildIntegrationSnippets(selectedAgentId ?? "", widgetToken);
  const activeSnippet =
    integrationSnippets[activeIntegration as keyof typeof integrationSnippets];

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSave = () => {
    if (!selectedAgentId) return;
    upsertConfig.mutate(
      {
        title,
        welcomeMessage,
        theme,
        primaryColor,
        launcherPosition,
        launcherSize,
        showAvatar,
        allowFileUpload,
        enableRag,
        prePrompt: prePrompt || null,
      },
      {
        onSuccess: (savedConfig) => {
          setWidgetId(savedConfig.id);
          setWidgetToken(savedConfig.widgetToken);
          setIsPublished(savedConfig.isPublished);
          setDirty(false);
        },
      }
    );
  };

  const handlePublish = () => {
    if (!widgetId) return;
    publishWidget.mutate(widgetId);
  };

  const handleRegenerateToken = () => {
    if (!widgetId) return;
    regenerateToken.mutate(widgetId, {
      onSuccess: (config) => setWidgetToken(config.widgetToken),
    });
  };

  const deviceWidths: Record<DeviceType, string> = {
    desktop: "100%",
    tablet: "768px",
    mobile: "375px",
  };

  const suggestedQuestions = [
    "What products do you offer?",
    "How do I get started?",
    "Pricing information",
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Embed Widget</h1>
        <p className="text-sm text-muted-foreground">
          Add an AI chat widget to your website in minutes.
        </p>
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-4 flex-wrap">
            <div className="space-y-1 flex-1 min-w-[200px]">
              <Label className="text-xs">Select Agent</Label>
              <Select
                value={selectedAgentId ?? ""}
                onValueChange={setSelectedAgentId}
              >
                <SelectTrigger className="max-w-sm">
                  <SelectValue placeholder="Select an agent" />
                </SelectTrigger>
                <SelectContent>
                  {agentsLoading && (
                    <div className="flex items-center gap-2 px-2 py-1.5 text-xs text-muted-foreground">
                      <Loader2 className="h-3 w-3 animate-spin" />
                      Loading agents...
                    </div>
                  )}
                  {activeAgents.map((a) => (
                    <SelectItem key={a.id} value={a.id}>
                      {a.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Agent ID</Label>
              <div className="flex items-center gap-2">
                <code className="px-3 py-2 rounded-lg bg-muted text-sm font-mono">
                  {selectedAgentId ?? "-"}
                </code>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9"
                  onClick={() => handleCopy(selectedAgentId ?? "")}
                >
                  {copied ? (
                    <Check className="h-4 w-4 text-success" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Status</Label>
              <div className="pt-1">
                {isPublished ? (
                  <Badge
                    variant="outline"
                    className="text-[10px] gap-1 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 bg-emerald-500/10"
                  >
                    <Globe className="h-3 w-3" /> Published
                  </Badge>
                ) : (
                  <Badge variant="outline" className="text-[10px] gap-1">
                    Not published
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Code2 className="h-4 w-4" />
                Embed Code
              </CardTitle>
              <CardDescription>
                {widgetToken
                  ? "Copy this snippet into your website to embed the widget."
                  : "Save the widget configuration to generate an embed token."}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="relative">
                <pre className="rounded-xl bg-muted p-4 text-xs font-mono overflow-x-auto whitespace-pre-wrap border border-border">
                  <code>{embedCode}</code>
                </pre>
                <div className="absolute top-2 right-2 flex gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => handleCopy(embedCode)}
                  >
                    {copied ? (
                      <Check className="h-3.5 w-3.5 text-success" />
                    ) : (
                      <Copy className="h-3.5 w-3.5" />
                    )}
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={handleRegenerateToken}
                    disabled={!widgetId || regenerateToken.isPending}
                  >
                    <RefreshCw
                      className={cn(
                        "h-3.5 w-3.5",
                        regenerateToken.isPending && "animate-spin"
                      )}
                    />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => handleCopy(activeSnippet.code)}
                  >
                    <Download className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>

              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span className="shrink-0">Frameworks:</span>
                <div className="flex gap-1 flex-wrap">
                  {Object.keys(integrationSnippets).map((key) => (
                    <button
                      key={key}
                      onClick={() => setActiveIntegration(key)}
                      className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
                        activeIntegration === key
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted hover:bg-muted/80 text-muted-foreground"
                      }`}
                    >
                      {key}
                    </button>
                  ))}
                </div>
              </div>

              <pre className="rounded-xl bg-muted p-4 text-xs font-mono overflow-x-auto whitespace-pre-wrap border border-border">
                {activeSnippet.code}
              </pre>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Live Widget Preview</CardTitle>
              <CardDescription>
                See how the widget will look on your site.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-1 bg-muted rounded-lg p-1 w-fit">
                {[
                  {
                    key: "desktop" as DeviceType,
                    icon: Monitor,
                    label: "Desktop",
                  },
                  {
                    key: "tablet" as DeviceType,
                    icon: Tablet,
                    label: "Tablet",
                  },
                  {
                    key: "mobile" as DeviceType,
                    icon: Smartphone,
                    label: "Mobile",
                  },
                ].map((d) => (
                  <button
                    key={d.key}
                    onClick={() => setDevice(d.key)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                      device === d.key
                        ? "bg-background text-foreground shadow-sm"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <d.icon className="h-3.5 w-3.5" />
                    {d.label}
                  </button>
                ))}
              </div>

              <div className="flex justify-center">
                <motion.div
                  layout
                  transition={{ duration: 0.3 }}
                  style={{ width: deviceWidths[device], maxWidth: "100%" }}
                  className="rounded-2xl border border-border bg-card overflow-hidden shadow-lg"
                >
                  <div className="flex items-center gap-2 px-4 py-2.5 border-b border-border bg-muted/50">
                    <div className="flex gap-1.5">
                      <div className="h-3 w-3 rounded-full bg-destructive/70" />
                      <div className="h-3 w-3 rounded-full bg-warning/70" />
                      <div className="h-3 w-3 rounded-full bg-success/70" />
                    </div>
                    <div className="flex-1 text-center">
                      <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-md bg-background text-xs text-muted-foreground">
                        yoursite.com
                      </div>
                    </div>
                    <div className="w-[52px]" />
                  </div>

                  <div className="relative h-[340px] bg-gradient-to-br from-muted/30 to-muted/10 p-6">
                    <div className="text-center text-muted-foreground space-y-2 pt-8">
                      <div className="h-8 w-32 mx-auto rounded bg-muted/60" />
                      <div className="h-4 w-48 mx-auto rounded bg-muted/40" />
                      <div className="h-4 w-40 mx-auto rounded bg-muted/40" />
                      <div className="h-4 w-56 mx-auto rounded bg-muted/30" />
                    </div>

                    {widgetOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        className={`absolute bottom-20 ${
                          launcherPosition === "BOTTOM_LEFT" ? "left-4" : "right-4"
                        } w-[300px] rounded-2xl border border-border bg-card shadow-2xl overflow-hidden`}
                        style={{ borderRadius: `${cornerRadius}px` }}
                      >
                        <div
                          className="px-4 py-3 flex items-center gap-3"
                          style={{ background: primaryColor }}
                        >
                          <div className="h-8 w-8 rounded-full bg-white/20 flex items-center justify-center">
                            <Bot className="h-4 w-4 text-white" />
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-medium text-white">
                              {activeAgent?.name ?? title}
                            </p>
                            {showOnline && (
                              <div className="flex items-center gap-1">
                                <div className="h-1.5 w-1.5 rounded-full bg-green-300" />
                                <span className="text-[10px] text-white/80">
                                  Online
                                </span>
                              </div>
                            )}
                          </div>
                          <button
                            onClick={() => setWidgetOpen(false)}
                            className="text-white/70 hover:text-white"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>

                        <ScrollArea className="h-[180px]">
                          <div className="p-4 space-y-3">
                            <div className="flex items-start gap-2">
                              {showAvatar && (
                                <div
                                  className="h-6 w-6 rounded-full flex items-center justify-center shrink-0 mt-0.5"
                                  style={{ background: `${primaryColor}20` }}
                                >
                                  <Bot
                                    className="h-3 w-3"
                                    style={{ color: primaryColor }}
                                  />
                                </div>
                              )}
                              <div className="bg-muted rounded-xl rounded-tl-sm px-3 py-2">
                                <p className="text-xs">{welcomeMessage}</p>
                              </div>
                            </div>

                            <div className="flex flex-wrap gap-1.5 pl-8">
                              {suggestedQuestions.map((q, i) => (
                                <button
                                  key={i}
                                  className="px-2.5 py-1 rounded-full text-[10px] font-medium border border-border hover:bg-muted transition-colors"
                                >
                                  {q}
                                </button>
                              ))}
                            </div>

                            {typingIndicator && (
                              <div className="flex items-start gap-2">
                                <div
                                  className="h-6 w-6 rounded-full flex items-center justify-center shrink-0"
                                  style={{ background: `${primaryColor}20` }}
                                >
                                  <Bot
                                    className="h-3 w-3"
                                    style={{ color: primaryColor }}
                                  />
                                </div>
                                <div className="bg-muted rounded-xl rounded-tl-sm px-3 py-2.5 flex items-center gap-1">
                                  <motion.div
                                    animate={{ opacity: [0.4, 1, 0.4] }}
                                    transition={{
                                      duration: 1.2,
                                      repeat: Infinity,
                                      delay: 0,
                                    }}
                                    className="h-1.5 w-1.5 rounded-full bg-muted-foreground"
                                  />
                                  <motion.div
                                    animate={{ opacity: [0.4, 1, 0.4] }}
                                    transition={{
                                      duration: 1.2,
                                      repeat: Infinity,
                                      delay: 0.2,
                                    }}
                                    className="h-1.5 w-1.5 rounded-full bg-muted-foreground"
                                  />
                                  <motion.div
                                    animate={{ opacity: [0.4, 1, 0.4] }}
                                    transition={{
                                      duration: 1.2,
                                      repeat: Infinity,
                                      delay: 0.4,
                                    }}
                                    className="h-1.5 w-1.5 rounded-full bg-muted-foreground"
                                  />
                                </div>
                              </div>
                            )}
                          </div>
                        </ScrollArea>

                        <div className="px-3 py-2.5 border-t border-border">
                          <div className="flex items-center gap-2">
                            <Input
                              placeholder={placeholder}
                              className="h-9 text-xs flex-1"
                              readOnly
                            />
                            <Button
                              size="icon"
                              className="h-9 w-9 shrink-0"
                              style={{ background: primaryColor }}
                            >
                              <Send className="h-3.5 w-3.5 text-white" />
                            </Button>
                          </div>
                        </div>
                      </motion.div>
                    )}

                    {!widgetOpen && (
                      <motion.button
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        whileHover={{ scale: 1.1 }}
                        onClick={() => setWidgetOpen(true)}
                        className={`absolute bottom-4 ${
                          launcherPosition === "BOTTOM_LEFT" ? "left-4" : "right-4"
                        } h-14 w-14 rounded-full shadow-xl flex items-center justify-center text-white`}
                        style={{ background: primaryColor }}
                      >
                        <MessageSquare className="h-6 w-6" />
                      </motion.button>
                    )}
                  </div>
                </motion.div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="xl:col-span-1">
          <Card className="sticky top-6">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Settings2 className="h-4 w-4" />
                Widget Customization
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="space-y-2">
                <Label className="text-xs">Widget Title</Label>
                <Input
                  value={title}
                  onChange={(e) => {
                    setTitle(e.target.value);
                    setDirty(true);
                  }}
                  className="text-xs h-9"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-xs">Primary Color</Label>
                <div className="flex items-center gap-2">
                  <div
                    className="h-8 w-8 rounded-lg border border-border shrink-0 cursor-pointer"
                    style={{ background: primaryColor }}
                  />
                  <Input
                    value={primaryColor}
                    onChange={(e) => {
                      setPrimaryColor(e.target.value);
                      setDirty(true);
                    }}
                    className="font-mono text-xs h-8"
                  />
                </div>
                <div className="flex gap-1.5 mt-1">
                  {colorSwatches.map((c) => (
                    <button
                      key={c}
                      onClick={() => {
                        setPrimaryColor(c);
                        setDirty(true);
                      }}
                      className={`h-6 w-6 rounded-md border-2 transition-all ${
                        primaryColor === c
                          ? "border-foreground scale-110"
                          : "border-transparent"
                      }`}
                      style={{ background: c }}
                    />
                  ))}
                </div>
              </div>

              <Separator />

              <div className="space-y-2">
                <Label className="text-xs">Theme</Label>
                <Select
                  value={theme}
                  onValueChange={(value) => {
                    setTheme(value as WidgetTheme);
                    setDirty(true);
                  }}
                >
                  <SelectTrigger className="h-9 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="LIGHT">Light</SelectItem>
                    <SelectItem value="DARK">Dark</SelectItem>
                    <SelectItem value="SYSTEM">System</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-xs">Show Avatar</Label>
                  <p className="text-[11px] text-muted-foreground">
                    Display agent avatar in chat
                  </p>
                </div>
                <Switch
                  checked={showAvatar}
                  onCheckedChange={(v) => {
                    setShowAvatar(v);
                    setDirty(true);
                  }}
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-xs">Rounded Corners</Label>
                  <span className="text-xs text-muted-foreground font-mono">
                    {cornerRadius}px
                  </span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={24}
                  value={cornerRadius}
                  onChange={(e) => setCornerRadius(Number(e.target.value))}
                  className="w-full h-1.5 rounded-full bg-muted appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-xs">Position</Label>
                <Select
                  value={launcherPosition}
                  onValueChange={(value) => {
                    setLauncherPosition(value as WidgetLauncherPosition);
                    setDirty(true);
                  }}
                >
                  <SelectTrigger className="h-9 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="BOTTOM_RIGHT">Bottom Right</SelectItem>
                    <SelectItem value="BOTTOM_LEFT">Bottom Left</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-xs">Launcher Size</Label>
                  <span className="text-xs text-muted-foreground font-mono">
                    {launcherSize}px
                  </span>
                </div>
                <input
                  type="range"
                  min={32}
                  max={96}
                  value={launcherSize}
                  onChange={(e) => {
                    setLauncherSize(Number(e.target.value));
                    setDirty(true);
                  }}
                  className="w-full h-1.5 rounded-full bg-muted appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary"
                />
              </div>

              <Separator />

              <div className="space-y-2">
                <Label className="text-xs">Welcome Message</Label>
                <Input
                  value={welcomeMessage}
                  onChange={(e) => {
                    setWelcomeMessage(e.target.value);
                    setDirty(true);
                  }}
                  className="text-xs h-9"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-xs">Placeholder</Label>
                <Input
                  value={placeholder}
                  onChange={(e) => setPlaceholder(e.target.value)}
                  className="text-xs h-9"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-xs">Pre-Prompt</Label>
                <Input
                  value={prePrompt}
                  onChange={(e) => {
                    setPrePrompt(e.target.value);
                    setDirty(true);
                  }}
                  placeholder="System instructions prepended to every message..."
                  className="text-xs h-9"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-xs">Suggested Questions</Label>
                {suggestedQuestions.map((q, i) => (
                  <Input key={i} defaultValue={q} className="text-xs h-8" />
                ))}
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-xs">File Upload</Label>
                  <p className="text-[11px] text-muted-foreground">
                    Allow users to attach files
                  </p>
                </div>
                <Switch
                  checked={allowFileUpload}
                  onCheckedChange={(v) => {
                    setAllowFileUpload(v);
                    setDirty(true);
                  }}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-xs">RAG Retrieval</Label>
                  <p className="text-[11px] text-muted-foreground">
                    Answer from the knowledge base
                  </p>
                </div>
                <Switch
                  checked={enableRag}
                  onCheckedChange={(v) => {
                    setEnableRag(v);
                    setDirty(true);
                  }}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-xs">Show Online Status</Label>
                  <p className="text-[11px] text-muted-foreground">
                    Display availability indicator
                  </p>
                </div>
                <Switch checked={showOnline} onCheckedChange={setShowOnline} />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-xs">Typing Indicator</Label>
                  <p className="text-[11px] text-muted-foreground">
                    Show agent typing animation
                  </p>
                </div>
                <Switch
                  checked={typingIndicator}
                  onCheckedChange={setTypingIndicator}
                />
              </div>

              <Separator />

              <div className="space-y-2">
                <Button
                  className="w-full gap-2"
                  onClick={handleSave}
                  disabled={!selectedAgentId || upsertConfig.isPending}
                >
                  {upsertConfig.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4" />
                  )}
                  {dirty ? "Save Changes" : widgetId ? "Save Changes" : "Save Configuration"}
                </Button>
                <Button
                  variant="outline"
                  className="w-full gap-2"
                  onClick={handlePublish}
                  disabled={!widgetId || publishWidget.isPending || isPublished}
                >
                  {publishWidget.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Globe className="h-4 w-4" />
                  )}
                  {isPublished ? "Published" : "Publish Widget"}
                </Button>
              </div>

              {configLoading && (
                <p className="text-[11px] text-muted-foreground flex items-center gap-1">
                  <Loader2 className="h-3 w-3 animate-spin" />
                  Loading saved configuration...
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

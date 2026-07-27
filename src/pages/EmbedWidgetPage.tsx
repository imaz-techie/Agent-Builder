import { useState } from "react";
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
  Palette,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { agents } from "@/lib/mock-data";

const colorSwatches = ["#6366f1", "#a855f7", "#22c55e", "#f59e0b", "#ef4444", "#06b6d4", "#ec4899", "#14b8a6"];

const integrationSnippets: Record<string, { label: string; code: string }> = {
  HTML: {
    label: "HTML",
    code: `<script src="https://agentforge.ai/widget.js" data-agent="ag_9H2KD83L"></script>`,
  },
  React: {
    label: "React",
    code: `import { AgentForgeWidget } from "@agentforge/react";

function App() {
  return (
    <AgentForgeWidget
      agentId="ag_9H2KD83L"
      theme="light"
      position="bottom-right"
    />
  );
}`,
  },
  Vue: {
    label: "Vue",
    code: `<template>
  <AgentForgeWidget
    agent-id="ag_9H2KD83L"
    theme="light"
    position="bottom-right"
  />
</template>

<script setup>
import { AgentForgeWidget } from "@agentforge/vue";
</script>`,
  },
  Angular: {
    label: "Angular",
    code: `import { AgentForgeModule } from "@agentforge/angular";

@NgModule({
  imports: [AgentForgeModule.forRoot({
    agentId: "ag_9H2KD83L"
  })],
})
export class AppModule {}`,
  },
  "Next.js": {
    label: "Next.js",
    code: `// app/layout.tsx
import { AgentForgeWidget } from "@agentforge/next";

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <AgentForgeWidget agentId="ag_9H2KD83L" />
      </body>
    </html>
  );
}`,
  },
  Nuxt: {
    label: "Nuxt",
    code: `// nuxt.config.ts
export default defineNuxtConfig({
  modules: ["@agentforge/nuxt"],
  agentforge: {
    agentId: "ag_9H2KD83L"
  }
})`,
  },
  WordPress: {
    label: "WordPress",
    code: `<!-- Add to your theme's footer.php or use a plugin -->
<script
  src="https://agentforge.ai/widget.js"
  data-agent="ag_9H2KD83L"
  data-position="bottom-right">
</script>`,
  },
  Shopify: {
    label: "Shopify",
    code: `<!-- Paste in Online Store > Themes > Edit code > theme.liquid -->
<!-- Before the closing </body> tag -->
<script
  src="https://agentforge.ai/widget.js"
  data-agent="ag_9H2KD83L">
</script>`,
  },
};

type DeviceType = "desktop" | "tablet" | "mobile";

export default function EmbedWidgetPage() {
  const [copied, setCopied] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState("ag_001");
  const [activeIntegration, setActiveIntegration] = useState("HTML");
  const [widgetOpen, setWidgetOpen] = useState(true);
  const [device, setDevice] = useState<DeviceType>("desktop");
  const [primaryColor, setPrimaryColor] = useState("#6366f1");
  const [darkMode, setDarkMode] = useState(false);
  const [cornerRadius, setCornerRadius] = useState(16);
  const [position, setPosition] = useState("bottom-right");
  const [welcomeMsg, setWelcomeMsg] = useState("Hi! How can I help you today?");
  const [placeholder, setPlaceholder] = useState("Type your message...");
  const [showOnline, setShowOnline] = useState(true);
  const [typingIndicator, setTypingIndicator] = useState(true);

  const activeAgent = agents.find((a) => a.id === selectedAgent) ?? agents[0];

  const embedCode = `<script src="https://agentforge.ai/widget.js" data-agent="ag_9H2KD83L"></script>`;

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
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
              <Select value={selectedAgent} onValueChange={setSelectedAgent}>
                <SelectTrigger className="max-w-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {agents.filter((a) => a.status === "active").map((a) => (
                    <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Agent ID</Label>
              <div className="flex items-center gap-2">
                <code className="px-3 py-2 rounded-lg bg-muted text-sm font-mono">ag_9H2KD83L</code>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9"
                  onClick={() => handleCopy("ag_9H2KD83L")}
                >
                  {copied ? <Check className="h-4 w-4 text-success" /> : <Copy className="h-4 w-4" />}
                </Button>
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
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="relative">
                <pre className="rounded-xl bg-muted p-4 text-xs font-mono overflow-x-auto whitespace-pre-wrap border border-border">
                  <code>{embedCode}</code>
                </pre>
                <div className="absolute top-2 right-2 flex gap-1">
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleCopy(embedCode)}>
                    {copied ? <Check className="h-3.5 w-3.5 text-success" /> : <Copy className="h-3.5 w-3.5" />}
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <RefreshCw className="h-3.5 w-3.5" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
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
                {integrationSnippets[activeIntegration].code}
              </pre>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Live Widget Preview</CardTitle>
              <CardDescription>See how the widget will look on your site.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-1 bg-muted rounded-lg p-1 w-fit">
                {[
                  { key: "desktop" as DeviceType, icon: Monitor, label: "Desktop" },
                  { key: "tablet" as DeviceType, icon: Tablet, label: "Tablet" },
                  { key: "mobile" as DeviceType, icon: Smartphone, label: "Mobile" },
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
                          position === "bottom-left" ? "left-4" : "right-4"
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
                            <p className="text-sm font-medium text-white">{activeAgent.name}</p>
                            {showOnline && (
                              <div className="flex items-center gap-1">
                                <div className="h-1.5 w-1.5 rounded-full bg-green-300" />
                                <span className="text-[10px] text-white/80">Online</span>
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
                              <div className="h-6 w-6 rounded-full flex items-center justify-center shrink-0 mt-0.5" style={{ background: `${primaryColor}20` }}>
                                <Bot className="h-3 w-3" style={{ color: primaryColor }} />
                              </div>
                              <div className="bg-muted rounded-xl rounded-tl-sm px-3 py-2">
                                <p className="text-xs">{welcomeMsg}</p>
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
                                <div className="h-6 w-6 rounded-full flex items-center justify-center shrink-0" style={{ background: `${primaryColor}20` }}>
                                  <Bot className="h-3 w-3" style={{ color: primaryColor }} />
                                </div>
                                <div className="bg-muted rounded-xl rounded-tl-sm px-3 py-2.5 flex items-center gap-1">
                                  <motion.div
                                    animate={{ opacity: [0.4, 1, 0.4] }}
                                    transition={{ duration: 1.2, repeat: Infinity, delay: 0 }}
                                    className="h-1.5 w-1.5 rounded-full bg-muted-foreground"
                                  />
                                  <motion.div
                                    animate={{ opacity: [0.4, 1, 0.4] }}
                                    transition={{ duration: 1.2, repeat: Infinity, delay: 0.2 }}
                                    className="h-1.5 w-1.5 rounded-full bg-muted-foreground"
                                  />
                                  <motion.div
                                    animate={{ opacity: [0.4, 1, 0.4] }}
                                    transition={{ duration: 1.2, repeat: Infinity, delay: 0.4 }}
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
                          position === "bottom-left" ? "left-4" : "right-4"
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
                <Label className="text-xs">Primary Color</Label>
                <div className="flex items-center gap-2">
                  <div
                    className="h-8 w-8 rounded-lg border border-border shrink-0 cursor-pointer"
                    style={{ background: primaryColor }}
                  />
                  <Input
                    value={primaryColor}
                    onChange={(e) => setPrimaryColor(e.target.value)}
                    className="font-mono text-xs h-8"
                  />
                </div>
                <div className="flex gap-1.5 mt-1">
                  {colorSwatches.map((c) => (
                    <button
                      key={c}
                      onClick={() => setPrimaryColor(c)}
                      className={`h-6 w-6 rounded-md border-2 transition-all ${
                        primaryColor === c ? "border-foreground scale-110" : "border-transparent"
                      }`}
                      style={{ background: c }}
                    />
                  ))}
                </div>
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-xs">Dark Mode</Label>
                  <p className="text-[11px] text-muted-foreground">Toggle dark theme</p>
                </div>
                <Switch checked={darkMode} onCheckedChange={setDarkMode} />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-xs">Rounded Corners</Label>
                  <span className="text-xs text-muted-foreground font-mono">{cornerRadius}px</span>
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
                <Select value={position} onValueChange={setPosition}>
                  <SelectTrigger className="h-9 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="bottom-right">Bottom Right</SelectItem>
                    <SelectItem value="bottom-left">Bottom Left</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Separator />

              <div className="space-y-2">
                <Label className="text-xs">Welcome Message</Label>
                <Input
                  value={welcomeMsg}
                  onChange={(e) => setWelcomeMsg(e.target.value)}
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
                <Label className="text-xs">Suggested Questions</Label>
                {suggestedQuestions.map((q, i) => (
                  <Input key={i} defaultValue={q} className="text-xs h-8" />
                ))}
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-xs">Show Online Status</Label>
                  <p className="text-[11px] text-muted-foreground">Display availability indicator</p>
                </div>
                <Switch checked={showOnline} onCheckedChange={setShowOnline} />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-xs">Typing Indicator</Label>
                  <p className="text-[11px] text-muted-foreground">Show agent typing animation</p>
                </div>
                <Switch checked={typingIndicator} onCheckedChange={setTypingIndicator} />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

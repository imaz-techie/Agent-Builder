import { useState } from "react";
import { motion } from "framer-motion";
import {
  Plus,
  Copy,
  Variable,
  Save,
  Play,
  RotateCcw,
  Terminal,
  Hash,
  Clock,
  Cpu,
  ChevronDown,
  Zap,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

const versionHistory = [
  {
    version: "v3",
    label: "Current",
    time: "2 min ago",
    changes: "Added company variable",
  },
  {
    version: "v2",
    label: null,
    time: "1 hour ago",
    changes: "Refined tone instructions",
  },
  {
    version: "v1",
    label: null,
    time: "Yesterday",
    changes: "Initial prompt draft",
  },
  { version: "v0", label: null, time: "2 days ago", changes: "Blank template" },
];

const variables = [
  "{{user_name}}",
  "{{agent_name}}",
  "{{date}}",
  "{{context}}",
  "{{company}}",
];

const defaultPrompt = `You are a helpful customer support agent for AgentMax AI. Your role is to assist users with their questions about our platform, troubleshoot issues, and guide them through features.

## Core Guidelines

1. Always greet the user by name: {{user_name}}
2. Be professional, empathetic, and solution-oriented
3. If you don't know the answer, acknowledge it honestly and escalate to a human agent
4. Reference the company knowledge base when answering product questions

## Response Format

- Keep responses concise and actionable
- Use bullet points for multi-step instructions
- Include relevant documentation links when available

## Context

Today's date: {{date}}
Company: {{company}}
Conversation context: {{context}}

Always ensure the customer feels heard and valued. Your goal is to resolve issues on the first contact whenever possible.`;

const mockOutput = `Hello {{user_name}}! Welcome to AgentMax AI support. I'm {{agent_name}}, and I'm here to help you today.

I can see you have a question about our platform. Let me look into that for you right away.

Based on your account details, I can help you with:
- Agent configuration and deployment
- Knowledge base management
- API integration setup
- Billing and subscription inquiries

Could you tell me more about what specific issue you're experiencing? The more details you can provide, the better I can assist you.

In the meantime, you might find our quick-start guide helpful: https://docs.agentmax.ai/getting-started`;

export default function PromptStudioPage() {
  const [promptName, setPromptName] = useState(
    "Customer Support System Prompt",
  );
  const [promptText, setPromptText] = useState(defaultPrompt);
  const [template, setTemplate] = useState("system");
  const [selectedVersion, setSelectedVersion] = useState("v3");
  const [output, setOutput] = useState(mockOutput);

  const tokenCount = promptText.split(/\s+/).filter(Boolean).length;
  const charCount = promptText.length;

  const insertVariable = (variable: string) => {
    setPromptText((prev) => prev + " " + variable);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Prompt Studio</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Design, test, and version your agent prompts
          </p>
        </div>
        <Button className="gap-2 shadow-sm">
          <Plus className="h-4 w-4" />
          New Prompt
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 min-h-[640px]">
        <div className="lg:col-span-3 space-y-4">
          <Card className="h-full flex flex-col">
            <CardHeader className="pb-3 border-b border-border">
              <div className="flex items-center justify-between">
                <div className="space-y-2 flex-1 mr-4">
                  <Label
                    htmlFor="prompt-name"
                    className="text-xs text-muted-foreground"
                  >
                    Prompt Name
                  </Label>
                  <Input
                    id="prompt-name"
                    value={promptName}
                    onChange={(e) => setPromptName(e.target.value)}
                    className="h-9 text-sm font-medium"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">
                    Template
                  </Label>
                  <Select value={template} onValueChange={setTemplate}>
                    <SelectTrigger className="w-48 h-9">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="system">System Prompt</SelectItem>
                      <SelectItem value="support">Customer Support</SelectItem>
                      <SelectItem value="sales">Sales Assistant</SelectItem>
                      <SelectItem value="technical">Technical Guide</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col p-4 gap-4">
              <div className="flex-1">
                <Textarea
                  value={promptText}
                  onChange={(e) => setPromptText(e.target.value)}
                  className="font-mono text-xs leading-relaxed min-h-[400px] resize-none"
                  placeholder="Write your prompt here..."
                />
              </div>

              <div className="space-y-2.5">
                <Label className="text-xs text-muted-foreground">
                  Insert Variable
                </Label>
                <div className="flex flex-wrap gap-2">
                  {variables.map((v) => (
                    <Button
                      key={v}
                      variant="outline"
                      size="sm"
                      className="h-7 font-mono text-[11px] gap-1.5 hover:bg-primary/5"
                      onClick={() => insertVariable(v)}
                    >
                      <Variable className="h-3 w-3" />
                      {v}
                    </Button>
                  ))}
                </div>
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Button className="gap-2 shadow-sm">
                    <Play className="h-4 w-4" />
                    Run Prompt
                  </Button>
                  <Button variant="outline" className="gap-2">
                    <Save className="h-4 w-4" />
                    Save
                  </Button>
                </div>
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1.5 tabular-nums">
                    <Hash className="h-3.5 w-3.5" />
                    {tokenCount} tokens
                  </span>
                  <span className="tabular-nums">|</span>
                  <span className="tabular-nums">{charCount} chars</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2 space-y-4">
          <Card className="h-full flex flex-col">
            <CardHeader className="pb-3 border-b border-border">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-7 w-7 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                    <Zap className="h-4 w-4 text-emerald-500" />
                  </div>
                  <CardTitle className="text-sm">AI Output</CardTitle>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-1.5 h-7 text-xs"
                >
                  <Copy className="h-3.5 w-3.5" /> Copy
                </Button>
              </div>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col p-4 gap-4">
              <div className="bg-zinc-950 dark:bg-zinc-900 rounded-xl flex-1 flex flex-col overflow-hidden">
                <div className="flex items-center gap-2 px-4 py-2.5 border-b border-zinc-800">
                  <div className="flex gap-1.5">
                    <div className="h-2.5 w-2.5 rounded-full bg-red-500/80" />
                    <div className="h-2.5 w-2.5 rounded-full bg-yellow-500/80" />
                    <div className="h-2.5 w-2.5 rounded-full bg-green-500/80" />
                  </div>
                  <span className="text-[10px] text-zinc-500 font-mono ml-1">
                    output
                  </span>
                </div>
                <div className="p-4 overflow-y-auto max-h-[320px]">
                  <pre className="text-[11px] font-mono text-zinc-300 dark:text-zinc-400 whitespace-pre-wrap leading-relaxed">
                    {output}
                  </pre>
                </div>
              </div>

              <div className="flex items-center gap-3 text-[11px] text-muted-foreground font-mono">
                <span className="flex items-center gap-1">
                  <Hash className="h-3 w-3" /> Tokens: 342
                </span>
                <span className="text-border">|</span>
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" /> Time: 1.2s
                </span>
                <span className="text-border">|</span>
                <span className="flex items-center gap-1">
                  <Cpu className="h-3 w-3" /> Model: GPT-4o
                </span>
              </div>

              <Separator />

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold">Version History</h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 text-xs text-muted-foreground"
                  >
                    <RotateCcw className="h-3 w-3 mr-1" /> View All
                  </Button>
                </div>

                <div className="space-y-1.5">
                  {versionHistory.map((v, i) => (
                    <motion.button
                      key={v.version}
                      initial={{ opacity: 0, x: 8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.2, delay: i * 0.05 }}
                      onClick={() => setSelectedVersion(v.version)}
                      className={cn(
                        "w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-left transition-all text-xs",
                        selectedVersion === v.version
                          ? "bg-primary/10 border border-primary/20"
                          : "hover:bg-muted border border-transparent",
                      )}
                    >
                      <div className="flex items-center gap-2.5">
                        <span
                          className={cn(
                            "font-mono font-semibold text-[11px]",
                            selectedVersion === v.version
                              ? "text-primary"
                              : "text-foreground",
                          )}
                        >
                          {v.version}
                        </span>
                        {v.label && (
                          <Badge
                            variant="outline"
                            className="text-[9px] px-1.5 py-0 h-4 border-primary/30 text-primary"
                          >
                            {v.label}
                          </Badge>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] text-muted-foreground">
                          {v.time}
                        </p>
                        <p className="text-[10px] text-muted-foreground/70">
                          {v.changes}
                        </p>
                      </div>
                    </motion.button>
                  ))}
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  className="w-full gap-2 text-xs"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  Restore Selected Version
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

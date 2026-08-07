import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  Plus,
  Copy,
  Variable,
  Save,
  Play,
  Trash2,
  Hash,
  Clock,
  Cpu,
  Zap,
  Loader2,
  History,
  Bot,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import { formatRelativeTime } from "@/lib/utils";
import { MODEL_OPTIONS, formatModelLabel } from "@/types/agent.types";
import type { LlmModel } from "@/types/agent.types";
import type { PromptExecution, PromptTemplate } from "@/types/prompt.types";
import {
  usePromptTemplatesQuery,
  usePromptExecutionsQuery,
} from "@/hooks/queries/usePromptQueries";
import {
  useCreatePromptTemplateMutation,
  useUpdatePromptTemplateMutation,
  useDeletePromptTemplateMutation,
  useExecutePromptMutation,
} from "@/hooks/mutations/usePromptMutations";
import { useAgentsQuery } from "@/hooks/queries/useAgentQueries";

const NEW_TEMPLATE_VALUE = "__new__";

function extractTemplateVariables(templateText: string): string[] {
  if (!templateText) return [];
  const matches = templateText.match(/\{\{([a-zA-Z0-9_]+)\}\}/g);
  if (!matches) return [];
  return Array.from(new Set(matches.map((m) => m.replace(/[{}]/g, "").trim())));
}

export default function PromptStudioPage() {
  const { data: templates = [], isLoading: templatesLoading } = usePromptTemplatesQuery();
  const { data: executions = [], isLoading: executionsLoading } = usePromptExecutionsQuery();
  const { data: agents = [] } = useAgentsQuery();

  const createTemplate = useCreatePromptTemplateMutation();
  const updateTemplate = useUpdatePromptTemplateMutation();
  const deleteTemplate = useDeletePromptTemplateMutation();
  const executePrompt = useExecutePromptMutation();

  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("General");
  const [description, setDescription] = useState("");
  const [systemPrompt, setSystemPrompt] = useState(
    "You are a helpful AI assistant."
  );
  const [userPromptTemplate, setUserPromptTemplate] = useState("");
  const [model, setModel] = useState<LlmModel>("GPT_4O");
  const [temperature, setTemperature] = useState(0.7);
  const [maxTokens, setMaxTokens] = useState(4096);
  const [isPublic, setIsPublic] = useState(false);
  const [selectedAgentId, setSelectedAgentId] = useState<string>("");
  const [output, setOutput] = useState("");
  const [activeExecution, setActiveExecution] = useState<PromptExecution | null>(null);

  const loadTemplate = (template: PromptTemplate | null) => {
    if (template) {
      setSelectedTemplateId(template.id);
      setTitle(template.title);
      setCategory(template.category);
      setDescription(template.description ?? "");
      setSystemPrompt(template.systemPrompt);
      setUserPromptTemplate(template.userPromptTemplate);
      setModel(template.model);
      setTemperature(template.temperature);
      setMaxTokens(template.maxTokens);
      setIsPublic(template.isPublic);
    } else {
      setSelectedTemplateId(null);
      setTitle("");
      setCategory("General");
      setDescription("");
      setSystemPrompt("You are a helpful AI assistant.");
      setUserPromptTemplate("");
      setModel("GPT_4O");
      setTemperature(0.7);
      setMaxTokens(4096);
      setIsPublic(false);
    }
    setOutput("");
    setActiveExecution(null);
  };

  const variables = useMemo(() => extractTemplateVariables(userPromptTemplate), [userPromptTemplate]);

  const tokenCount = userPromptTemplate.split(/\s+/).filter(Boolean).length;
  const charCount = userPromptTemplate.length;

  const insertVariable = (name: string) => {
    setUserPromptTemplate((prev) => `${prev} {{${name}}}`);
  };

  const handleRun = () => {
    if (!userPromptTemplate.trim()) return;
    executePrompt.mutate(
      {
        templateId: selectedTemplateId ?? undefined,
        agentId: selectedAgentId || undefined,
        systemPrompt,
        userPrompt: userPromptTemplate,
        model,
        temperature,
        maxTokens,
      },
      {
        onSuccess: (execution) => {
          setOutput(execution.outputContent);
          setActiveExecution(execution);
        },
      }
    );
  };

  const handleSave = () => {
    if (title.trim().length < 2) return;
    const dto = {
      title,
      description: description || undefined,
      category,
      systemPrompt,
      userPromptTemplate,
      model,
      temperature,
      maxTokens,
      isPublic,
    };
    if (selectedTemplateId) {
      updateTemplate.mutate({ templateId: selectedTemplateId, dto });
    } else {
      createTemplate.mutate(dto, {
        onSuccess: (template) => {
          loadTemplate(template);
        },
      });
    }
  };

  const handleDelete = () => {
    if (!selectedTemplateId) return;
    if (!window.confirm(`Delete template "${title}"? This cannot be undone.`)) return;
    deleteTemplate.mutate(selectedTemplateId, {
      onSuccess: () => loadTemplate(null),
    });
  };

  const handleCopy = () => {
    if (output) navigator.clipboard.writeText(output);
  };

  const viewExecution = (execution: PromptExecution) => {
    setOutput(execution.outputContent);
    setActiveExecution(execution);
  };

  const isRunning = executePrompt.isPending;
  const isSaving = createTemplate.isPending || updateTemplate.isPending;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Prompt Studio</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Design, test, and version your agent prompts
          </p>
        </div>
        <Button className="gap-2 shadow-sm" onClick={() => loadTemplate(null)}>
          <Plus className="h-4 w-4" />
          New Prompt
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 min-h-[640px]">
        <div className="lg:col-span-3 space-y-4">
          <Card className="h-full flex flex-col">
            <CardHeader className="pb-3 border-b border-border">
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-4">
                  <div className="space-y-2 flex-1">
                    <Label className="text-xs text-muted-foreground">
                      Template
                    </Label>
                    <Select
                      value={selectedTemplateId ?? NEW_TEMPLATE_VALUE}
                      onValueChange={(value) => {
                        if (value === NEW_TEMPLATE_VALUE) {
                          loadTemplate(null);
                        } else {
                          const template = templates.find((t) => t.id === value);
                          if (template) loadTemplate(template);
                        }
                      }}
                    >
                      <SelectTrigger className="w-full h-9">
                        <SelectValue placeholder="Select a template..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value={NEW_TEMPLATE_VALUE}>
                          New Template
                        </SelectItem>
                        {templates.map((t) => (
                          <SelectItem key={t.id} value={t.id}>
                            {t.title}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {templatesLoading && (
                      <p className="text-[11px] text-muted-foreground flex items-center gap-1">
                        <Loader2 className="h-3 w-3 animate-spin" />
                        Loading templates...
                      </p>
                    )}
                  </div>
                  <div className="space-y-2 w-48">
                    <Label
                      htmlFor="prompt-name"
                      className="text-xs text-muted-foreground"
                    >
                      Prompt Name
                    </Label>
                    <Input
                      id="prompt-name"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="h-9 text-sm font-medium"
                      placeholder="e.g. Customer Support Prompt"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label className="text-xs text-muted-foreground">
                      Category
                    </Label>
                    <Input
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="h-9 text-sm"
                      placeholder="General"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs text-muted-foreground">
                      Model
                    </Label>
                    <Select
                      value={model}
                      onValueChange={(value) => setModel(value as LlmModel)}
                    >
                      <SelectTrigger className="h-9">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {MODEL_OPTIONS.map((m) => (
                          <SelectItem key={m.value} value={m.value}>
                            {m.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">
                    Description
                  </Label>
                  <Input
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="h-9 text-sm"
                    placeholder="What is this prompt for?"
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col p-4 gap-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-xs text-muted-foreground">
                    System Prompt
                  </Label>
                  <span className="text-[10px] text-muted-foreground/70">
                    Optional - defaults to a generic assistant
                  </span>
                </div>
                <Textarea
                  value={systemPrompt}
                  onChange={(e) => setSystemPrompt(e.target.value)}
                  className="font-mono text-xs leading-relaxed min-h-[90px] resize-none"
                  placeholder="Define the assistant's role and behavior..."
                />
              </div>

              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">
                  User Prompt Template
                </Label>
                <Textarea
                  value={userPromptTemplate}
                  onChange={(e) => setUserPromptTemplate(e.target.value)}
                  className="font-mono text-xs leading-relaxed min-h-[220px] resize-none"
                  placeholder="Write your prompt template here. Use {{variable_name}} to insert variables..."
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">
                    Temperature ({temperature.toFixed(1)})
                  </Label>
                  <Input
                    type="number"
                    min={0}
                    max={2}
                    step={0.1}
                    value={temperature}
                    onChange={(e) => setTemperature(parseFloat(e.target.value) || 0)}
                    className="h-9 text-sm"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">
                    Max Tokens
                  </Label>
                  <Input
                    type="number"
                    min={128}
                    max={128000}
                    step={128}
                    value={maxTokens}
                    onChange={(e) => setMaxTokens(parseInt(e.target.value, 10) || 0)}
                    className="h-9 text-sm"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Switch
                    id="is-public"
                    checked={isPublic}
                    onCheckedChange={setIsPublic}
                  />
                  <Label htmlFor="is-public" className="text-xs text-muted-foreground cursor-pointer">
                    Make template public
                  </Label>
                </div>
                <div className="space-y-2 w-52">
                  <Label className="text-xs text-muted-foreground">
                    Test with Agent (optional)
                  </Label>
                  <Select value={selectedAgentId} onValueChange={setSelectedAgentId}>
                    <SelectTrigger className="h-9">
                      <SelectValue placeholder="No agent" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">No agent</SelectItem>
                      {agents.map((a) => (
                        <SelectItem key={a.id} value={a.id}>
                          {a.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2.5">
                <Label className="text-xs text-muted-foreground">
                  Insert Variable
                </Label>
                <div className="flex flex-wrap gap-2">
                  {variables.length === 0 ? (
                    <span className="text-[11px] text-muted-foreground/70">
                      Use {"{{variable_name}}"} syntax in the template to add variables.
                    </span>
                  ) : (
                    variables.map((v) => (
                      <Button
                        key={v}
                        variant="outline"
                        size="sm"
                        className="h-7 font-mono text-[11px] gap-1.5 hover:bg-primary/5"
                        onClick={() => insertVariable(v)}
                      >
                        <Variable className="h-3 w-3" />
                        {"{{" + v + "}}"}
                      </Button>
                    ))
                  )}
                </div>
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Button
                    className="gap-2 shadow-sm"
                    onClick={handleRun}
                    disabled={isRunning || !userPromptTemplate.trim()}
                  >
                    {isRunning ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Play className="h-4 w-4" />
                    )}
                    {isRunning ? "Running..." : "Run Prompt"}
                  </Button>
                  <Button
                    variant="outline"
                    className="gap-2"
                    onClick={handleSave}
                    disabled={isSaving || title.trim().length < 2}
                  >
                    {isSaving ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Save className="h-4 w-4" />
                    )}
                    {selectedTemplateId ? "Update" : "Save"}
                  </Button>
                  {selectedTemplateId && (
                    <Button
                      variant="outline"
                      className="gap-2 text-destructive hover:text-destructive"
                      onClick={handleDelete}
                      disabled={deleteTemplate.isPending}
                    >
                      <Trash2 className="h-4 w-4" />
                      Delete
                    </Button>
                  )}
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
                  onClick={handleCopy}
                  disabled={!output}
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
                <div className="p-4 overflow-y-auto max-h-[280px]">
                  {output ? (
                    <pre className="text-[11px] font-mono text-zinc-300 dark:text-zinc-400 whitespace-pre-wrap leading-relaxed">
                      {output}
                    </pre>
                  ) : (
                    <div className="flex items-center gap-2 text-[11px] text-zinc-500 font-mono">
                      <Loader2 className="h-3 w-3 animate-spin" />
                      Waiting for prompt execution...
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-3 text-[11px] text-muted-foreground font-mono">
                <span className="flex items-center gap-1">
                  <Hash className="h-3 w-3" /> Tokens: {activeExecution?.tokensUsed ?? "-"}
                </span>
                <span className="text-border">|</span>
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" /> Time:{" "}
                  {activeExecution ? `${activeExecution.latencyMs}ms` : "-"}
                </span>
                <span className="text-border">|</span>
                <span className="flex items-center gap-1">
                  <Cpu className="h-3 w-3" /> Model:{" "}
                  {activeExecution ? formatModelLabel(activeExecution.model) : formatModelLabel(model)}
                </span>
              </div>

              <Separator />

              <div className="space-y-3 flex-1">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold flex items-center gap-1.5">
                    <History className="h-3.5 w-3.5 text-muted-foreground" />
                    Execution History
                  </h3>
                </div>

                <div className="space-y-1.5 max-h-[240px] overflow-y-auto pr-1">
                  {executionsLoading ? (
                    <div className="flex items-center justify-center py-6 text-xs text-muted-foreground">
                      <Loader2 className="h-3.5 w-3.5 animate-spin mr-2" />
                      Loading executions...
                    </div>
                  ) : executions.length === 0 ? (
                    <p className="text-xs text-muted-foreground/70 py-4 text-center">
                      No executions yet. Run a prompt to see results here.
                    </p>
                  ) : (
                    executions.map((execution, i) => (
                      <motion.button
                        key={execution.id}
                        initial={{ opacity: 0, x: 8 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.2, delay: Math.min(i, 10) * 0.03 }}
                        onClick={() => viewExecution(execution)}
                        className={cn(
                          "w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-left transition-all text-xs",
                          activeExecution?.id === execution.id
                            ? "bg-primary/10 border border-primary/20"
                            : "hover:bg-muted border border-transparent",
                        )}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <Bot
                            className={cn(
                              "h-3.5 w-3.5 shrink-0",
                              activeExecution?.id === execution.id
                                ? "text-primary"
                                : "text-muted-foreground",
                            )}
                          />
                          <span className="truncate max-w-[110px]">
                            {execution.userPrompt}
                          </span>
                        </div>
                        <div className="text-right shrink-0 ml-2">
                          <p className="text-[10px] text-muted-foreground">
                            {formatModelLabel(execution.model)}
                          </p>
                          <p className="text-[10px] text-muted-foreground/70">
                            {formatRelativeTime(execution.createdAt)}
                          </p>
                        </div>
                      </motion.button>
                    ))
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

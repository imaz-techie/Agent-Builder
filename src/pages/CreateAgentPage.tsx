import { useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Bot,
  Sparkles,
  Shield,
  Rocket,
  Globe,
  FileText,
  Search,
  Eye,
  Mic,
  Database,
  Code,
  Image,
  FileSpreadsheet,
  BrainCircuit,
  MessageSquare,
  Lock,
  Zap,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

const formSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  category: z.string().min(1, "Category is required"),
  model: z.string().min(1, "Model is required"),
  temperature: z.number().min(0).max(2),
  maxTokens: z.number().min(256).max(128000),
  tags: z.string(),
  tone: z.string().min(1, "Tone is required"),
  writingStyle: z.string().min(1, "Writing style is required"),
  formality: z.number().min(0).max(100),
  creativity: z.number().min(0).max(100),
  responseLength: z.string().min(1, "Response length is required"),
  languages: z.array(z.string()).min(1, "Select at least one language"),
  capabilities: z.array(z.string()).min(1, "Select at least one capability"),
  allowedDomains: z.string(),
  rateLimit: z.string(),
  authEnabled: z.boolean(),
  workspaceAccess: z.enum(["public", "private"]),
  encryption: z.boolean(),
});

type FormData = z.infer<typeof formSchema>;

const steps = [
  { id: 1, label: "Basic Info", icon: Bot },
  { id: 2, label: "Personality", icon: Sparkles },
  { id: 3, label: "Capabilities", icon: Zap },
  { id: 4, label: "Deploy", icon: Rocket },
];

const categories = ["Support", "Sales", "Marketing", "Technical", "General"];
const models = [
  "GPT-4o",
  "GPT-4o Mini",
  "Claude 3.5 Sonnet",
  "Claude 3 Haiku",
  "Gemini 1.5 Pro",
  "Llama 3.1 70B",
];
const tones = ["Professional", "Friendly", "Casual", "Formal", "Empathetic"];
const writingStyles = ["Concise", "Detailed", "Technical", "Simple"];
const responseLengths = ["Short", "Medium", "Long"];
const languageOptions = [
  "English",
  "Spanish",
  "French",
  "German",
  "Japanese",
  "Chinese",
  "Portuguese",
  "Arabic",
  "Hindi",
  "Korean",
];
const rateLimits = [
  "10 requests/min",
  "30 requests/min",
  "60 requests/min",
  "120 requests/min",
  "Unlimited",
];

const capabilities = [
  {
    id: "answer_questions",
    title: "Answer Questions",
    description: "Respond to user queries with accurate information",
    icon: MessageSquare,
  },
  {
    id: "rag_search",
    title: "RAG Search",
    description: "Retrieve and generate from knowledge base",
    icon: Search,
  },
  {
    id: "web_search",
    title: "Web Search",
    description: "Search the internet for up-to-date information",
    icon: Globe,
  },
  {
    id: "file_search",
    title: "File Search",
    description: "Search through uploaded documents and files",
    icon: FileText,
  },
  {
    id: "ocr",
    title: "OCR",
    description: "Extract text from images and scanned documents",
    icon: Eye,
  },
  {
    id: "pdf_reading",
    title: "PDF Reading",
    description: "Parse and understand PDF document content",
    icon: FileText,
  },
  {
    id: "excel_reading",
    title: "Excel Reading",
    description: "Read and analyze spreadsheet data",
    icon: FileSpreadsheet,
  },
  {
    id: "image_understanding",
    title: "Image Understanding",
    description: "Analyze and describe image content",
    icon: Image,
  },
  {
    id: "api_calling",
    title: "API Calling",
    description: "Make external API calls to third-party services",
    icon: Code,
  },
  {
    id: "function_calling",
    title: "Function Calling",
    description: "Execute predefined functions and tools",
    icon: Code,
  },
  {
    id: "database_queries",
    title: "Database Queries",
    description: "Query databases for structured data retrieval",
    icon: Database,
  },
  {
    id: "memory",
    title: "Memory",
    description: "Retain context across conversations",
    icon: BrainCircuit,
  },
  {
    id: "voice_support",
    title: "Voice Support",
    description: "Process and respond to voice inputs",
    icon: Mic,
  },
  {
    id: "multi_turn",
    title: "Multi-turn Conversation",
    description: "Maintain context through multi-turn dialogues",
    icon: MessageSquare,
  },
];

const slideVariants = {
  enter: (dir: number) => ({ x: dir > 0 ? 80 : -80, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (dir: number) => ({ x: dir > 0 ? -80 : 80, opacity: 0 }),
};

export default function CreateAgentPage() {
  const [step, setStep] = useState(1);
  const [direction, setDirection] = useState(1);
  const [creating, setCreating] = useState(false);
  const [created, setCreated] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    trigger,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
      category: "",
      model: "",
      temperature: 0.7,
      maxTokens: 4096,
      tags: "",
      tone: "",
      writingStyle: "",
      formality: 50,
      creativity: 60,
      responseLength: "",
      languages: ["English"],
      capabilities: ["answer_questions"],
      allowedDomains: "",
      rateLimit: "60 requests/min",
      authEnabled: true,
      workspaceAccess: "private",
      encryption: true,
    },
  });

  const formValues = watch();

  const stepFields: Record<number, (keyof FormData)[]> = {
    1: ["name", "description", "category", "model"],
    2: ["tone", "writingStyle", "responseLength", "languages"],
    3: ["capabilities"],
    4: [],
  };

  async function goNext() {
    const valid = await trigger(stepFields[step]);
    if (valid && step < 4) {
      setDirection(1);
      setStep((s) => s + 1);
    }
  }

  function goBack() {
    if (step > 1) {
      setDirection(-1);
      setStep((s) => s - 1);
    }
  }

  function onSubmit(_data: FormData) {
    setCreating(true);
    setTimeout(() => {
      setCreating(false);
      setCreated(true);
    }, 2000);
  }

  function toggleLanguage(lang: string) {
    const current = formValues.languages;
    if (current.includes(lang)) {
      setValue(
        "languages",
        current.filter((l) => l !== lang),
        { shouldValidate: true }
      );
    } else {
      setValue("languages", [...current, lang], { shouldValidate: true });
    }
  }

  function toggleCapability(capId: string) {
    const current = formValues.capabilities;
    if (current.includes(capId)) {
      setValue(
        "capabilities",
        current.filter((c) => c !== capId),
        { shouldValidate: true }
      );
    } else {
      setValue("capabilities", [...current, capId], { shouldValidate: true });
    }
  }

  if (created) {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center justify-center py-20 text-center"
        >
          <div className="h-16 w-16 rounded-2xl bg-success/10 flex items-center justify-center mb-6">
            <CheckCircle2 className="h-8 w-8 text-success" />
          </div>
          <h2 className="text-2xl font-bold mb-2">Agent Created Successfully</h2>
          <p className="text-muted-foreground mb-8 max-w-sm">
            Your agent <span className="font-medium text-foreground">{formValues.name || "New Agent"}</span> has
            been created and is ready for configuration.
          </p>
          <div className="flex gap-3">
            <Link to="/agents">
              <Button variant="outline">View All Agents</Button>
            </Link>
            <Button onClick={() => { setCreated(false); setStep(1); }}>
              Create Another
            </Button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <Link
          to="/agents"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to agents
        </Link>
        <h1 className="text-2xl font-bold">Create New Agent</h1>
        <p className="text-sm text-muted-foreground">
          Configure your AI agent step by step.
        </p>
      </div>

      {/* Step Indicator */}
      <div className="flex items-center justify-center gap-0 py-4">
        {steps.map((s, i) => {
          const isActive = s.id === step;
          const isCompleted = s.id < step;
          const StepIcon = s.icon;
          return (
            <div key={s.id} className="flex items-center">
              <div className="flex flex-col items-center">
                <div
                  className={`h-10 w-10 rounded-full flex items-center justify-center transition-all duration-300 ${
                    isCompleted
                      ? "bg-primary text-primary-foreground"
                      : isActive
                        ? "bg-primary text-primary-foreground ring-4 ring-primary/20"
                        : "bg-muted text-muted-foreground"
                  }`}
                >
                  {isCompleted ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <StepIcon className="h-4 w-4" />
                  )}
                </div>
                <span
                  className={`text-xs mt-2 font-medium transition-colors ${
                    isActive || isCompleted
                      ? "text-foreground"
                      : "text-muted-foreground"
                  }`}
                >
                  {s.label}
                </span>
              </div>
              {i < steps.length - 1 && (
                <div
                  className={`h-0.5 w-16 sm:w-24 mx-2 rounded-full transition-colors duration-300 mb-5 ${
                    s.id < step ? "bg-primary" : "bg-muted"
                  }`}
                />
              )}
            </div>
          );
        })}
      </div>

      {/* Form Content */}
      <form onSubmit={handleSubmit(onSubmit)}>
        <Card>
          <CardContent className="p-6">
            <AnimatePresence mode="wait" custom={direction}>
              <motion.div
                key={step}
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.25, ease: "easeInOut" }}
              >
                {/* Step 1: Basic Info */}
                {step === 1 && (
                  <div className="space-y-5">
                    <div>
                      <h2 className="text-lg font-semibold">Basic Information</h2>
                      <p className="text-sm text-muted-foreground mt-1">
                        Define the core identity of your agent.
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="name">Agent Name</Label>
                      <Input
                        id="name"
                        placeholder="e.g., SupportBot Pro"
                        {...register("name")}
                      />
                      {errors.name && (
                        <p className="text-xs text-destructive">
                          {errors.name.message}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        placeholder="Describe what this agent does and its primary purpose..."
                        rows={3}
                        {...register("description")}
                      />
                      {errors.description && (
                        <p className="text-xs text-destructive">
                          {errors.description.message}
                        </p>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Category</Label>
                        <Select
                          value={formValues.category}
                          onValueChange={(v) =>
                            setValue("category", v, { shouldValidate: true })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                          <SelectContent>
                            {categories.map((c) => (
                              <SelectItem key={c} value={c}>
                                {c}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {errors.category && (
                          <p className="text-xs text-destructive">
                            {errors.category.message}
                          </p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label>AI Model</Label>
                        <Select
                          value={formValues.model}
                          onValueChange={(v) =>
                            setValue("model", v, { shouldValidate: true })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select model" />
                          </SelectTrigger>
                          <SelectContent>
                            {models.map((m) => (
                              <SelectItem key={m} value={m}>
                                {m}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {errors.model && (
                          <p className="text-xs text-destructive">
                            {errors.model.message}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Label>Temperature</Label>
                          <span className="text-sm font-mono text-muted-foreground">
                            {formValues.temperature.toFixed(1)}
                          </span>
                        </div>
                        <input
                          type="range"
                          min={0}
                          max={2}
                          step={0.1}
                          value={formValues.temperature}
                          onChange={(e) =>
                            setValue("temperature", parseFloat(e.target.value))
                          }
                          className="w-full h-2 rounded-full appearance-none bg-muted cursor-pointer accent-primary"
                        />
                        <div className="flex justify-between text-[10px] text-muted-foreground">
                          <span>Precise (0)</span>
                          <span>Creative (2)</span>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="maxTokens">Max Tokens</Label>
                        <Input
                          id="maxTokens"
                          type="number"
                          min={256}
                          max={128000}
                          {...register("maxTokens", { valueAsNumber: true })}
                        />
                        {errors.maxTokens && (
                          <p className="text-xs text-destructive">
                            {errors.maxTokens.message}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="tags">Tags</Label>
                      <Input
                        id="tags"
                        placeholder="Comma-separated tags, e.g., support, billing, onboarding"
                        {...register("tags")}
                      />
                    </div>
                  </div>
                )}

                {/* Step 2: Personality */}
                {step === 2 && (
                  <div className="space-y-5">
                    <div>
                      <h2 className="text-lg font-semibold">Personality</h2>
                      <p className="text-sm text-muted-foreground mt-1">
                        Shape how your agent communicates with users.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <div className="space-y-5">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>Tone</Label>
                            <Select
                              value={formValues.tone}
                              onValueChange={(v) =>
                                setValue("tone", v, { shouldValidate: true })
                              }
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select tone" />
                              </SelectTrigger>
                              <SelectContent>
                                {tones.map((t) => (
                                  <SelectItem key={t} value={t}>
                                    {t}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            {errors.tone && (
                              <p className="text-xs text-destructive">
                                {errors.tone.message}
                              </p>
                            )}
                          </div>

                          <div className="space-y-2">
                            <Label>Writing Style</Label>
                            <Select
                              value={formValues.writingStyle}
                              onValueChange={(v) =>
                                setValue("writingStyle", v, {
                                  shouldValidate: true,
                                })
                              }
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select style" />
                              </SelectTrigger>
                              <SelectContent>
                                {writingStyles.map((ws) => (
                                  <SelectItem key={ws} value={ws}>
                                    {ws}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            {errors.writingStyle && (
                              <p className="text-xs text-destructive">
                                {errors.writingStyle.message}
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <Label>Formality</Label>
                            <span className="text-sm font-mono text-muted-foreground">
                              {formValues.formality}%
                            </span>
                          </div>
                          <input
                            type="range"
                            min={0}
                            max={100}
                            value={formValues.formality}
                            onChange={(e) =>
                              setValue("formality", parseInt(e.target.value))
                            }
                            className="w-full h-2 rounded-full appearance-none bg-muted cursor-pointer accent-primary"
                          />
                          <div className="flex justify-between text-[10px] text-muted-foreground">
                            <span>Casual</span>
                            <span>Very Formal</span>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <Label>Creativity</Label>
                            <span className="text-sm font-mono text-muted-foreground">
                              {formValues.creativity}%
                            </span>
                          </div>
                          <input
                            type="range"
                            min={0}
                            max={100}
                            value={formValues.creativity}
                            onChange={(e) =>
                              setValue("creativity", parseInt(e.target.value))
                            }
                            className="w-full h-2 rounded-full appearance-none bg-muted cursor-pointer accent-primary"
                          />
                          <div className="flex justify-between text-[10px] text-muted-foreground">
                            <span>Factual</span>
                            <span>Highly Creative</span>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label>Response Length</Label>
                          <Select
                            value={formValues.responseLength}
                            onValueChange={(v) =>
                              setValue("responseLength", v, {
                                shouldValidate: true,
                              })
                            }
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select length" />
                            </SelectTrigger>
                            <SelectContent>
                              {responseLengths.map((rl) => (
                                <SelectItem key={rl} value={rl}>
                                  {rl}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          {errors.responseLength && (
                            <p className="text-xs text-destructive">
                              {errors.responseLength.message}
                            </p>
                          )}
                        </div>

                        <div className="space-y-2">
                          <Label>Supported Languages</Label>
                          <div className="flex flex-wrap gap-2">
                            {languageOptions.map((lang) => (
                              <button
                                key={lang}
                                type="button"
                                onClick={() => toggleLanguage(lang)}
                                className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                                  formValues.languages.includes(lang)
                                    ? "bg-primary text-primary-foreground border-primary"
                                    : "bg-background text-muted-foreground border-border hover:bg-muted"
                                }`}
                              >
                                {lang}
                              </button>
                            ))}
                          </div>
                          {errors.languages && (
                            <p className="text-xs text-destructive">
                              {errors.languages.message}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Live Preview */}
                      <div className="space-y-2">
                        <Label>Live Preview</Label>
                        <div className="border border-border rounded-xl p-4 bg-muted/30 min-h-[360px] flex flex-col">
                          <div className="flex items-center gap-2 mb-4 pb-3 border-b border-border">
                            <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                              <Bot className="h-4 w-4 text-primary" />
                            </div>
                            <div>
                              <p className="text-sm font-medium">
                                {formValues.name || "Your Agent"}
                              </p>
                              <p className="text-[10px] text-muted-foreground">
                                {formValues.model || "Model"} &middot;{" "}
                                {formValues.tone || "Tone"} tone
                              </p>
                            </div>
                          </div>

                          <div className="space-y-3 flex-1">
                            <div className="flex justify-end">
                              <div className="bg-primary/10 rounded-2xl rounded-br-md px-4 py-2.5 max-w-[85%]">
                                <p className="text-sm">
                                  Hi, can you help me with my recent order?
                                </p>
                              </div>
                            </div>
                            <div className="flex justify-start">
                              <div className="bg-background border border-border rounded-2xl rounded-bl-md px-4 py-2.5 max-w-[85%]">
                                <p className="text-sm">
                                  {formValues.tone === "Friendly"
                                    ? "Hey there! Of course I'd love to help you with your order. Could you share the order number with me? 😊"
                                    : formValues.tone === "Casual"
                                      ? "Sure thing! What's the order number and I'll look into it."
                                      : formValues.tone === "Empathetic"
                                        ? "I completely understand how important this is to you. I'm here to help — could you please share your order number so I can assist you right away?"
                                        : formValues.tone === "Formal"
                                          ? "Thank you for reaching out. I would be happy to assist you with your order. May I please have your order number?"
                                          : "I'd be happy to help you with your order. Could you please provide your order number so I can look into this for you?"}
                                </p>
                              </div>
                            </div>
                          </div>

                          <div className="mt-auto pt-3 border-t border-border">
                            <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                              <span>
                                Style:{" "}
                                {formValues.writingStyle || "Concise"}
                              </span>
                              <span>&middot;</span>
                              <span>
                                Length:{" "}
                                {formValues.responseLength || "Medium"}
                              </span>
                              <span>&middot;</span>
                              <span>
                                Creativity: {formValues.creativity}%
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Step 3: Capabilities */}
                {step === 3 && (
                  <div className="space-y-5">
                    <div>
                      <h2 className="text-lg font-semibold">Capabilities</h2>
                      <p className="text-sm text-muted-foreground mt-1">
                        Select what your agent can do. Choose the features that
                        match your use case.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      {capabilities.map((cap) => {
                        const selected = formValues.capabilities.includes(
                          cap.id
                        );
                        const CapIcon = cap.icon;
                        return (
                          <button
                            key={cap.id}
                            type="button"
                            onClick={() => toggleCapability(cap.id)}
                            className={`text-left p-4 rounded-xl border transition-all duration-200 ${
                              selected
                                ? "bg-primary/5 border-primary ring-1 ring-primary/20"
                                : "bg-background border-border hover:bg-muted/50 hover:border-border"
                            }`}
                          >
                            <div className="flex items-start gap-3">
                              <div
                                className={`h-9 w-9 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
                                  selected
                                    ? "bg-primary/10 text-primary"
                                    : "bg-muted text-muted-foreground"
                                }`}
                              >
                                <CapIcon className="h-4 w-4" />
                              </div>
                              <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-2">
                                  <p className="text-sm font-medium">
                                    {cap.title}
                                  </p>
                                  {selected && (
                                    <Check className="h-3.5 w-3.5 text-primary shrink-0" />
                                  )}
                                </div>
                                <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                                  {cap.description}
                                </p>
                              </div>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                    {errors.capabilities && (
                      <p className="text-xs text-destructive">
                        {errors.capabilities.message}
                      </p>
                    )}
                  </div>
                )}

                {/* Step 4: Security & Deploy */}
                {step === 4 && (
                  <div className="space-y-5">
                    <div>
                      <h2 className="text-lg font-semibold">
                        Security & Deploy
                      </h2>
                      <p className="text-sm text-muted-foreground mt-1">
                        Configure security settings and deployment options.
                      </p>
                    </div>

                    <div className="space-y-5">
                      <div className="space-y-2">
                        <Label htmlFor="domains">Allowed Domains</Label>
                        <Input
                          id="domains"
                          placeholder="Comma-separated domains, e.g., example.com, app.example.com"
                          {...register("allowedDomains")}
                        />
                        <p className="text-[10px] text-muted-foreground">
                          Restrict where this agent can be embedded. Leave empty
                          to allow all domains.
                        </p>
                      </div>

                      <div className="space-y-2">
                        <Label>Rate Limit</Label>
                        <Select
                          value={formValues.rateLimit}
                          onValueChange={(v) =>
                            setValue("rateLimit", v)
                          }
                        >
                          <SelectTrigger className="w-full sm:w-[220px]">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {rateLimits.map((rl) => (
                              <SelectItem key={rl} value={rl}>
                                {rl}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="flex items-center justify-between p-4 border border-border rounded-xl">
                        <div className="flex items-center gap-3">
                          <div className="h-9 w-9 rounded-lg bg-muted flex items-center justify-center">
                            <Lock className="h-4 w-4 text-muted-foreground" />
                          </div>
                          <div>
                            <p className="text-sm font-medium">
                              Authentication Required
                            </p>
                            <p className="text-xs text-muted-foreground">
                              Require users to authenticate before chatting
                            </p>
                          </div>
                        </div>
                        <Switch
                          checked={formValues.authEnabled}
                          onCheckedChange={(v) =>
                            setValue("authEnabled", v)
                          }
                        />
                      </div>

                      <div className="space-y-3">
                        <Label>Workspace Access</Label>
                        <div className="flex gap-3">
                          <button
                            type="button"
                            onClick={() =>
                              setValue("workspaceAccess", "public")
                            }
                            className={`flex-1 p-4 rounded-xl border text-left transition-all ${
                              formValues.workspaceAccess === "public"
                                ? "bg-primary/5 border-primary ring-1 ring-primary/20"
                                : "border-border hover:bg-muted/50"
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <div
                                className={`h-9 w-9 rounded-lg flex items-center justify-center ${
                                  formValues.workspaceAccess === "public"
                                    ? "bg-primary/10 text-primary"
                                    : "bg-muted text-muted-foreground"
                                }`}
                              >
                                <Globe className="h-4 w-4" />
                              </div>
                              <div>
                                <p className="text-sm font-medium">Public</p>
                                <p className="text-xs text-muted-foreground">
                                  Visible to all workspace members
                                </p>
                              </div>
                            </div>
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              setValue("workspaceAccess", "private")
                            }
                            className={`flex-1 p-4 rounded-xl border text-left transition-all ${
                              formValues.workspaceAccess === "private"
                                ? "bg-primary/5 border-primary ring-1 ring-primary/20"
                                : "border-border hover:bg-muted/50"
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <div
                                className={`h-9 w-9 rounded-lg flex items-center justify-center ${
                                  formValues.workspaceAccess === "private"
                                    ? "bg-primary/10 text-primary"
                                    : "bg-muted text-muted-foreground"
                                }`}
                              >
                                <Shield className="h-4 w-4" />
                              </div>
                              <div>
                                <p className="text-sm font-medium">Private</p>
                                <p className="text-xs text-muted-foreground">
                                  Only visible to you and admins
                                </p>
                              </div>
                            </div>
                          </button>
                        </div>
                      </div>

                      <div className="flex items-center justify-between p-4 border border-border rounded-xl">
                        <div className="flex items-center gap-3">
                          <div className="h-9 w-9 rounded-lg bg-muted flex items-center justify-center">
                            <Lock className="h-4 w-4 text-muted-foreground" />
                          </div>
                          <div>
                            <p className="text-sm font-medium">
                              End-to-End Encryption
                            </p>
                            <p className="text-xs text-muted-foreground">
                              Encrypt all conversation data in transit and at
                              rest
                            </p>
                          </div>
                        </div>
                        <Switch
                          checked={formValues.encryption}
                          onCheckedChange={(v) =>
                            setValue("encryption", v)
                          }
                        />
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex items-center justify-between pt-2">
          <div>
            {step > 1 && (
              <Button type="button" variant="outline" onClick={goBack}>
                <ArrowLeft className="h-4 w-4" />
                Back
              </Button>
            )}
          </div>
          <div className="flex items-center gap-3">
            <Link to="/agents">
              <Button type="button" variant="ghost">
                Cancel
              </Button>
            </Link>
            {step < 4 ? (
              <Button type="button" onClick={goNext}>
                Next
                <ArrowRight className="h-4 w-4" />
              </Button>
            ) : (
              <Button type="submit" disabled={creating}>
                {creating ? (
                  <>
                    <span className="h-4 w-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin mr-2" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Rocket className="h-4 w-4" />
                    Create Agent
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </form>
    </div>
  );
}

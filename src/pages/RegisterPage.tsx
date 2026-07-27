import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Sparkles,
  Eye,
  EyeOff,
  Loader2,
  Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";

const registerSchema = z
  .object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Please enter a valid email address"),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
      .regex(/[0-9]/, "Password must contain at least one number"),
    confirmPassword: z.string(),
    terms: z.boolean().refine((val) => val === true, {
      message: "You must agree to the terms and conditions",
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type RegisterFormData = z.infer<typeof registerSchema>;

const features = [
  "Build and deploy AI agents in minutes",
  "Multi-language support out of the box",
  "Enterprise-grade security and compliance",
  "Real-time analytics and monitoring",
];

const socialProviders = [
  { name: "Google", color: "bg-[#ea4335]", letter: "G" },
  { name: "GitHub", color: "bg-[#333]", letter: "GH" },
  { name: "Microsoft", color: "bg-[#00a4ef]", letter: "MS" },
];

function getPasswordStrength(password: string) {
  let score = 0;
  if (password.length >= 8) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  const levels = [
    { label: "Weak", color: "bg-destructive", width: "25%" },
    { label: "Fair", color: "bg-warning", width: "50%" },
    { label: "Good", color: "bg-info", width: "75%" },
    { label: "Strong", color: "bg-success", width: "100%" },
  ];

  const level = levels[Math.max(0, Math.min(score - 1, 3))];
  return { score, ...level };
}

export default function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      terms: false,
    },
  });

  const passwordValue = watch("password", "");
  const strength = getPasswordStrength(passwordValue);

  const passwordChecks = [
    { label: "At least 8 characters", met: passwordValue.length >= 8 },
    { label: "Contains uppercase letter", met: /[A-Z]/.test(passwordValue) },
    { label: "Contains a number", met: /[0-9]/.test(passwordValue) },
  ];

  const onSubmit = (data: RegisterFormData) => {
    setLoading(true);
    console.log("Register:", data);
    setTimeout(() => {
      setLoading(false);
      navigate("/dashboard");
    }, 1500);
  };

  return (
    <div className="min-h-screen flex bg-background">
      <div className="hidden lg:flex lg:w-[40%] bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 relative overflow-hidden items-center justify-center">
        <div className="absolute inset-0">
          <div className="absolute top-20 left-20 h-64 w-64 rounded-full bg-primary/20 blur-[100px]" />
          <div className="absolute bottom-20 right-20 h-48 w-48 rounded-full bg-secondary/20 blur-[80px]" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-32 w-32 rounded-full bg-accent/15 blur-[60px]" />
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
          className="relative text-center px-12 z-10"
        >
          <div className="h-16 w-16 rounded-2xl bg-gradient-primary flex items-center justify-center mx-auto mb-8 shadow-lg shadow-primary/30">
            <Sparkles className="h-8 w-8 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-white mb-3">
            Start building agents today
          </h2>
          <p className="text-gray-400 text-lg max-w-md mx-auto mb-10">
            Create your free account and start building intelligent AI agents
            in minutes.
          </p>

          <div className="space-y-4 max-w-sm mx-auto">
            {features.map((feature, i) => (
              <motion.div
                key={feature}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + i * 0.1, duration: 0.4 }}
                className="flex items-center gap-3 text-left"
              >
                <div className="h-6 w-6 rounded-full bg-success/20 flex items-center justify-center shrink-0">
                  <Check className="h-3.5 w-3.5 text-success" />
                </div>
                <span className="text-sm text-gray-300">{feature}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          <Link to="/" className="flex items-center gap-2 mb-10">
            <div className="h-8 w-8 rounded-lg bg-gradient-primary flex items-center justify-center">
              <Sparkles className="h-4 w-4 text-white" />
            </div>
            <span className="text-lg font-bold gradient-text">AgentForge AI</span>
          </Link>

          <div className="mb-8">
            <h1 className="text-2xl font-bold mb-1">Create your account</h1>
            <p className="text-muted-foreground">
              Get started with AgentForge AI for free.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-3 mb-6">
            {socialProviders.map((provider) => (
              <Button
                key={provider.name}
                variant="outline"
                className="gap-2 h-11"
                onClick={() => setLoading(true)}
              >
                <div className={`h-5 w-5 rounded-full ${provider.color} flex items-center justify-center`}>
                  <span className="text-[10px] font-bold text-white">{provider.letter}</span>
                </div>
                <span className="text-sm">{provider.name}</span>
              </Button>
            ))}
          </div>

          <div className="relative mb-6">
            <Separator />
            <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-background px-3 text-xs text-muted-foreground">
              or continue with email
            </span>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                placeholder="Your full name"
                {...register("name")}
                className={errors.name ? "border-destructive focus-visible:ring-destructive" : ""}
              />
              {errors.name && (
                <p className="text-xs text-destructive">{errors.name.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@company.com"
                {...register("email")}
                className={errors.email ? "border-destructive focus-visible:ring-destructive" : ""}
              />
              {errors.email && (
                <p className="text-xs text-destructive">{errors.email.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Create a strong password"
                  {...register("password")}
                  className={
                    errors.password
                      ? "border-destructive focus-visible:ring-destructive pr-10"
                      : "pr-10"
                  }
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <Eye className="h-4 w-4 text-muted-foreground" />
                  )}
                </Button>
              </div>
              {errors.password && (
                <p className="text-xs text-destructive">{errors.password.message}</p>
              )}

              {passwordValue.length > 0 && (
                <div className="space-y-2 mt-3">
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
                      <motion.div
                        className={`h-full rounded-full ${strength.color}`}
                        initial={{ width: 0 }}
                        animate={{ width: strength.width }}
                        transition={{ duration: 0.3 }}
                      />
                    </div>
                    <span className="text-[10px] font-medium text-muted-foreground shrink-0">
                      {strength.label}
                    </span>
                  </div>
                  <div className="space-y-1">
                    {passwordChecks.map((check) => (
                      <div
                        key={check.label}
                        className="flex items-center gap-1.5 text-xs"
                      >
                        <div
                          className={`h-3.5 w-3.5 rounded-full flex items-center justify-center transition-colors ${
                            check.met
                              ? "bg-success text-white"
                              : "bg-muted"
                          }`}
                        >
                          {check.met && <Check className="h-2.5 w-2.5" />}
                        </div>
                        <span
                          className={
                            check.met
                              ? "text-foreground"
                              : "text-muted-foreground"
                          }
                        >
                          {check.label}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="Confirm your password"
                {...register("confirmPassword")}
                className={
                  errors.confirmPassword
                    ? "border-destructive focus-visible:ring-destructive"
                    : ""
                }
              />
              {errors.confirmPassword && (
                <p className="text-xs text-destructive">
                  {errors.confirmPassword.message}
                </p>
              )}
            </div>

            <div className="space-y-1">
              <label htmlFor="terms" className="flex items-start gap-2 cursor-pointer">
                <input
                  id="terms"
                  type="checkbox"
                  {...register("terms")}
                  className="h-4 w-4 rounded border mt-0.5 accent-primary cursor-pointer"
                />
                <span className="text-sm text-muted-foreground">
                  I agree to the{" "}
                  <Link to="#" className="text-primary hover:underline">
                    Terms of Service
                  </Link>{" "}
                  and{" "}
                  <Link to="#" className="text-primary hover:underline">
                    Privacy Policy
                  </Link>
                </span>
              </label>
              {errors.terms && (
                <p className="text-xs text-destructive ml-6">
                  {errors.terms.message}
                </p>
              )}
            </div>

            <Button type="submit" className="w-full h-11" disabled={loading}>
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Create Account"
              )}
            </Button>
          </form>

          <p className="text-center text-sm text-muted-foreground mt-8">
            Already have an account?{" "}
            <Link
              to="/login"
              className="text-primary font-medium hover:underline"
            >
              Sign in
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}

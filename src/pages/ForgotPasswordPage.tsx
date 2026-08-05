import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Sparkles, ArrowLeft, Loader2, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useTheme } from "@/components/layout/ThemeProvider";
import { Moon, Sun } from "lucide-react";

import { useForgotPasswordMutation } from "@/hooks/mutations/useAuthMutations";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const forgotMutation = useForgotPasswordMutation();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    forgotMutation.mutate(
      { email },
      {
        onSuccess: () => setSent(true),
      }
    );
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-sm"
      >
        <div className="flex items-center justify-between mb-8">
          <Link to="/" className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-gradient-primary flex items-center justify-center">
              <Sparkles className="h-4.5 w-4.5 text-white" />
            </div>
            <span className="text-lg font-bold gradient-text">AgentMax</span>
          </Link>
          <Button variant="ghost" size="icon" onClick={toggleTheme}>
            {theme === "light" ? (
              <Moon className="h-5 w-5" />
            ) : (
              <Sun className="h-5 w-5" />
            )}
          </Button>
        </div>

        <h1 className="text-2xl font-bold mb-1">Reset your password</h1>
        <p className="text-muted-foreground text-sm mb-6">
          Enter your email and we&apos;ll send you a link to reset your
          password.
        </p>

        {sent ? (
          <div className="text-center space-y-4">
            <div className="h-12 w-12 rounded-full bg-success/10 flex items-center justify-center mx-auto">
              <Check className="h-6 w-6 text-success" />
            </div>
            <div>
              <h2 className="font-semibold mb-1">Check your email</h2>
              <p className="text-sm text-muted-foreground">
                We&apos;ve sent a password reset link to{" "}
                <span className="font-medium text-foreground">{email}</span>
              </p>
            </div>
            <Button variant="outline" className="w-full" asChild>
              <Link to="/login">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to sign in
              </Link>
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email address</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={forgotMutation.isPending}>
              {forgotMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Send reset link"
              )}
            </Button>
            <Link
              to="/login"
              className="block text-center text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="h-3.5 w-3.5 inline mr-1" />
              Back to sign in
            </Link>
          </form>
        )}
      </motion.div>
    </div>
  );
}

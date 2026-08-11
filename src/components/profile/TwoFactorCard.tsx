import { useState } from "react";
import {
  Shield,
  Loader2,
  KeyRound,
  Copy,
  Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  useEnableTwoFactorMutation,
  useConfirmTwoFactorMutation,
  useDisableTwoFactorMutation,
} from "@/hooks/mutations/useAuthMutations";

type TwoFactorStep = "idle" | "setup" | "confirm" | "disable";

export function TwoFactorCard({ enabled }: { enabled: boolean }) {
  const [step, setStep] = useState<TwoFactorStep>("idle");
  const [setupData, setSetupData] = useState<{
    secret: string;
    otpauthUrl: string;
  } | null>(null);
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [copied, setCopied] = useState(false);

  const enableTwoFactor = useEnableTwoFactorMutation();
  const confirmTwoFactor = useConfirmTwoFactorMutation();
  const disableTwoFactor = useDisableTwoFactorMutation();

  const startEnable = () => {
    enableTwoFactor.mutate(password, {
      onSuccess: (data) => {
        setSetupData(data);
        setStep("confirm");
        setPassword("");
        setCode("");
      },
    });
  };

  const copySecret = async () => {
    if (setupData) {
      await navigator.clipboard.writeText(setupData.secret);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    }
  };

  return (
    <div className="space-y-4">
      {step === "idle" && (
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className={`h-10 w-10 rounded-lg flex items-center justify-center ${
                enabled ? "bg-success/10" : "bg-muted"
              }`}
            >
              <Shield
                className={`h-5 w-5 ${
                  enabled ? "text-success" : "text-muted-foreground"
                }`}
              />
            </div>
            <div>
              <p className="text-sm font-medium">
                {enabled
                  ? "Two-factor authentication is enabled"
                  : "Two-factor authentication is disabled"}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {enabled
                  ? "Your account is protected with 2FA."
                  : "Enable 2FA for enhanced account security."}
              </p>
            </div>
          </div>
          <Button
            variant={enabled ? "outline" : "default"}
            onClick={() => (enabled ? setStep("disable") : setStep("setup"))}
          >
            {enabled ? "Disable 2FA" : "Enable 2FA"}
          </Button>
        </div>
      )}

      {step === "setup" && (
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <KeyRound className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-sm font-medium">Confirm your password</p>
              <p className="text-xs text-muted-foreground">
                Enter your password to begin setup.
              </p>
            </div>
          </div>
          <div className="flex gap-3 max-w-md">
            <Input
              type="password"
              placeholder="Current password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <Button
              onClick={startEnable}
              disabled={!password || enableTwoFactor.isPending}
            >
              {enableTwoFactor.isPending && (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              )}
              Continue
            </Button>
            <Button variant="ghost" onClick={() => setStep("idle")}>
              Cancel
            </Button>
          </div>
        </div>
      )}

      {step === "confirm" && setupData && (
        <div className="space-y-4">
          <p className="text-sm font-medium">
            Scan or add the secret to your authenticator app
          </p>
          <div className="rounded-lg border border-border p-4 bg-muted/40">
            <div className="flex items-center justify-between gap-3">
              <code className="text-xs font-mono break-all">
                {setupData.secret}
              </code>
              <Button variant="outline" size="sm" onClick={copySecret}>
                {copied ? (
                  <Check className="h-4 w-4 text-success" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
                {copied ? "Copied" : "Copy"}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-2 break-all">
              {setupData.otpauthUrl}
            </p>
          </div>
          <div className="flex gap-3 max-w-md">
            <Input
              placeholder="6-digit code"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              maxLength={6}
            />
            <Button
              onClick={() => confirmTwoFactor.mutate(code)}
              disabled={code.length !== 6 || confirmTwoFactor.isPending}
            >
              {confirmTwoFactor.isPending && (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              )}
              Verify & Enable
            </Button>
            <Button
              variant="ghost"
              onClick={() => {
                setStep("idle");
                setSetupData(null);
              }}
            >
              Cancel
            </Button>
          </div>
        </div>
      )}

      {step === "disable" && (
        <div className="space-y-4">
          <p className="text-sm font-medium">
            Enter your authenticator code to disable 2FA
          </p>
          <div className="flex gap-3 max-w-md">
            <Input
              placeholder="6-digit code"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              maxLength={6}
            />
            <Button
              variant="destructive"
              onClick={() => disableTwoFactor.mutate(code)}
              disabled={code.length !== 6 || disableTwoFactor.isPending}
            >
              {disableTwoFactor.isPending && (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              )}
              Disable
            </Button>
            <Button variant="ghost" onClick={() => setStep("idle")}>
              Cancel
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

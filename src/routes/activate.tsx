import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import {
  BadgeCheck,
  CheckCircle2,
  Loader2,
  Lock,
  ShieldCheck,
  Sparkles,
  TriangleAlert,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  verifyActivationCode,
  beginActivation,
  activationProgress,
} from "@/lib/activation.functions";

export const Route = createFileRoute("/activate")({
  head: () => ({
    meta: [
      { title: "Activate your subscription — Atlas Activation" },
      {
        name: "description",
        content:
          "Enter your activation code, sign in to your account, and we handle the rest of the subscription activation for you.",
      },
      { property: "og:title", content: "Activate your subscription — Atlas Activation" },
      {
        property: "og:description",
        content:
          "Enter your activation code, sign in to your account, and we handle the rest of the subscription activation for you.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ActivatePage,
});

type Step = "code" | "verified" | "credentials" | "progress";

function ActivatePage() {
  const [step, setStep] = useState<Step>("code");
  const [code, setCode] = useState("");
  const [plan, setPlan] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const [state, setState] = useState<"working" | "waiting" | "done" | "failed">("working");
  const [stage, setStage] = useState("Connecting…");
  const [progress, setProgress] = useState(4);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (step !== "progress") return;
    let cancelled = false;

    async function poll() {
      try {
        const result = await activationProgress({ data: { code } });
        if (cancelled) return;
        setState(result.state);
        setStage(result.stage);
        setProgress(Math.max(4, result.progress));
      } catch {
        /* keep the last friendly message on screen */
      }
    }

    void poll();
    timer.current = setInterval(poll, 4000);
    return () => {
      cancelled = true;
      if (timer.current) clearInterval(timer.current);
    };
  }, [step, code]);

  async function submitCode(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      const result = await verifyActivationCode({ data: { code } });
      if (!result.valid) {
        setError(result.reason);
        return;
      }
      setPlan(result.plan);
      setStep("verified");
    } catch {
      setError("Something went wrong. Please try again in a moment.");
    } finally {
      setBusy(false);
    }
  }

  async function submitCredentials(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      await beginActivation({ data: { code, email, password } });
      setPassword("");
      setStep("progress");
    } catch (err) {
      setError(err instanceof Error ? err.message : "We could not start the activation.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center px-4 py-12">
      <div className="hero-glow pointer-events-none absolute inset-0" />

      <div className="relative w-full max-w-md">
        <div className="mb-8 flex flex-col items-center text-center">
          <div className="glow-ring grid size-12 place-items-center rounded-2xl bg-primary/15 text-primary">
            <Sparkles className="size-5" />
          </div>
          <h1 className="mt-4 text-2xl font-semibold tracking-tight">Activate your subscription</h1>
          <p className="mt-2 max-w-sm text-sm text-muted-foreground">
            Three quick steps. We take care of the payment and the renewal for you.
          </p>
        </div>

        <StepDots step={step} />

        <section className="panel sheen animate-rise mt-6 p-7">
          {step === "code" ? (
            <form onSubmit={submitCode} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="code">Activation code</Label>
                <Input
                  id="code"
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  placeholder="AMZ-8K4P-XQ19-HF72"
                  autoComplete="off"
                  required
                  className="h-12 text-center font-mono text-base tracking-[0.2em]"
                />
              </div>
              <FormError message={error} />
              <Button type="submit" className="h-11 w-full" disabled={busy || code.length < 6}>
                {busy ? <Loader2 className="size-4 animate-spin" /> : null}
                Verify
              </Button>
            </form>
          ) : null}

          {step === "verified" ? (
            <div className="space-y-6 text-center">
              <div className="flex flex-col items-center gap-3">
                <CheckCircle2 className="size-9 text-success" />
                <p className="text-sm font-medium text-success">Valid activation code</p>
              </div>
              <div className="rounded-xl border border-border bg-surface-raised px-5 py-4">
                <p className="text-base font-semibold">{plan}</p>
                <p className="mt-1 text-xs text-muted-foreground">Ready for activation.</p>
              </div>
              <Button className="h-11 w-full" onClick={() => setStep("credentials")}>
                Continue
              </Button>
            </div>
          ) : null}

          {step === "credentials" ? (
            <form onSubmit={submitCredentials} className="space-y-5">
              <div>
                <h2 className="text-base font-semibold">Sign in to your account</h2>
                <p className="mt-1 text-xs text-muted-foreground">
                  We use these details only to complete this one activation.
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="customer-email">Email</Label>
                <Input
                  id="customer-email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="customer-password">Password</Label>
                <Input
                  id="customer-password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              <FormError message={error} />
              <Button type="submit" className="h-11 w-full" disabled={busy}>
                {busy ? <Loader2 className="size-4 animate-spin" /> : <Lock className="size-4" />}
                Login
              </Button>
            </form>
          ) : null}

          {step === "progress" ? (
            <div className="space-y-6 py-2 text-center">
              {state === "done" ? (
                <BadgeCheck className="mx-auto size-10 text-success" />
              ) : state === "failed" ? (
                <TriangleAlert className="mx-auto size-10 text-destructive" />
              ) : (
                <Loader2 className="mx-auto size-10 animate-spin text-primary" />
              )}

              <div>
                <p className="text-base font-medium">{stage}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {state === "done"
                    ? "Your subscription is active."
                    : state === "failed"
                      ? "Nothing was charged to you."
                      : "Please keep this page open."}
                </p>
              </div>

              <div className="h-1.5 overflow-hidden rounded-full bg-surface-raised">
                <div
                  className="h-full rounded-full bg-primary transition-[width] duration-700 ease-out"
                  style={{ width: `${state === "done" ? 100 : progress}%` }}
                />
              </div>

              <p className="text-[11px] text-muted-foreground">{plan}</p>
            </div>
          ) : null}
        </section>

        <p className="mt-6 flex items-center justify-center gap-2 text-[11px] text-muted-foreground">
          <ShieldCheck className="size-3.5" />
          Payment is handled entirely on our side — you never enter card details.
        </p>
      </div>
    </main>
  );
}

function StepDots({ step }: { step: Step }) {
  const index = step === "code" ? 0 : step === "progress" ? 2 : 1;
  const labels = ["Code", "Account", "Activation"];
  return (
    <ol className="flex items-center justify-center gap-3">
      {labels.map((label, i) => (
        <li key={label} className="flex items-center gap-3">
          <span
            className={`flex items-center gap-2 text-xs ${
              i <= index ? "text-foreground" : "text-muted-foreground/60"
            }`}
          >
            <span
              className={`size-1.5 rounded-full ${i <= index ? "bg-primary" : "bg-border"}`}
              aria-hidden
            />
            {label}
          </span>
          {i < labels.length - 1 ? <span className="h-px w-6 bg-border" aria-hidden /> : null}
        </li>
      ))}
    </ol>
  );
}

function FormError({ message }: { message: string }) {
  if (!message) return null;
  return (
    <p className="flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-xs text-destructive">
      <TriangleAlert className="size-3.5 shrink-0" />
      {message}
    </p>
  );
}

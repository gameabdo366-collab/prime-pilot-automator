import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, KeyRound, ShieldCheck, Sparkles, Zap } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Atlas Activation — Redeem your subscription code" },
      {
        name: "description",
        content:
          "Have an activation code? Redeem it here and your subscription is set up for you — no card details needed.",
      },
      { property: "og:title", content: "Atlas Activation — Redeem your subscription code" },
      {
        property: "og:description",
        content:
          "Have an activation code? Redeem it here and your subscription is set up for you — no card details needed.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: LandingPage,
});

function LandingPage() {
  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center px-5 py-16">
      <div className="hero-glow pointer-events-none absolute inset-0" />

      <div className="relative w-full max-w-2xl text-center">
        <div className="glow-ring mx-auto grid size-12 place-items-center rounded-2xl bg-primary/15 text-primary">
          <Sparkles className="size-5" />
        </div>
        <h1 className="mt-6 text-3xl font-semibold tracking-tight sm:text-4xl">
          Redeem your activation code
        </h1>
        <p className="mx-auto mt-4 max-w-md text-sm leading-relaxed text-muted-foreground">
          Enter the code you received, sign in to your own account, and we complete the subscription
          for you. You never enter any payment details.
        </p>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link
            to="/activate"
            className="inline-flex h-11 items-center gap-2 rounded-xl bg-primary px-6 text-sm font-medium text-primary-foreground transition-transform hover:scale-[1.02]"
          >
            <KeyRound className="size-4" />
            Start activation
            <ArrowRight className="size-4" />
          </Link>
        </div>

        <div className="animate-rise mt-14 grid gap-4 text-left sm:grid-cols-3">
          {[
            {
              icon: KeyRound,
              title: "One code",
              body: "Every code works exactly once, for one subscription.",
            },
            {
              icon: ShieldCheck,
              title: "No card details",
              body: "Payment is handled on our side and never shown to you.",
            },
            {
              icon: Zap,
              title: "Minutes, not days",
              body: "Watch the progress live and get a confirmation at the end.",
            },
          ].map(({ icon: Icon, title, body }) => (
            <div key={title} className="panel p-5">
              <Icon className="size-4 text-primary" />
              <p className="mt-3 text-sm font-medium">{title}</p>
              <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{body}</p>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}

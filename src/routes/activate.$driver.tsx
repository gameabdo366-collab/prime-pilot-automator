import { createFileRoute } from "@tanstack/react-router";
import { ActivationPortal } from "@/components/activation/ActivationPortal";
import { driverByPrefix } from "@/lib/workflows";

/**
 * Branded activation links: /activate/AMZ, /activate/CHATGPT, /activate/CLAUDE …
 * The segment is a driver prefix, never an activation code, so nothing can be
 * enumerated from the URL.
 */
export const Route = createFileRoute("/activate/$driver")({
  head: ({ params }) => {
    const workflow = driverByPrefix(params.driver);
    const label = workflow?.planLabel ?? "your subscription";
    return {
      meta: [
        { title: `Activate ${label} — Atlas Activation` },
        {
          name: "description",
          content: `Enter your activation code to activate ${label}. No payment details needed.`,
        },
        { property: "og:title", content: `Activate ${label} — Atlas Activation` },
        {
          property: "og:description",
          content: `Enter your activation code to activate ${label}. No payment details needed.`,
        },
        { property: "og:type", content: "website" },
        { name: "twitter:card", content: "summary_large_image" },
      ],
    };
  },
  component: BrandedActivate,
});

function BrandedActivate() {
  const { driver } = Route.useParams();
  const workflow = driverByPrefix(driver);
  return (
    <ActivationPortal
      prefix={workflow?.codePrefix}
      brandLabel={workflow?.planLabel}
    />
  );
}

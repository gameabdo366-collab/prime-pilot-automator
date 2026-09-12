import { createFileRoute } from "@tanstack/react-router";
import { ActivationPortal } from "@/components/activation/ActivationPortal";

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
  component: () => <ActivationPortal />,
});

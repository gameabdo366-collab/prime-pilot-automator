import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/PageHeader";
import { CardsPanel } from "@/components/vault/CardsPanel";

export const Route = createFileRoute("/_authenticated/admin/cards")({
  head: () => ({
    meta: [
      { title: "Cards — Atlas Runner Admin" },
      {
        name: "description",
        content: "Private prepaid cards used by the automation engine only.",
      },
      { property: "og:title", content: "Cards — Atlas Runner Admin" },
      {
        property: "og:description",
        content: "Private prepaid cards used by the automation engine only.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: CardsPage,
});

function CardsPage() {
  return (
    <>
      <PageHeader
        title="Cards"
        description="Card numbers and security codes are encrypted and never leave this dashboard. Customers only receive activation codes."
      />
      <CardsPanel />
    </>
  );
}

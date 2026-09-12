import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/PageHeader";
import { AccountsPanel } from "@/components/vault/AccountsPanel";

export const Route = createFileRoute("/_authenticated/admin/accounts")({
  head: () => ({
    meta: [
      { title: "Accounts — Atlas Runner Admin" },
      {
        name: "description",
        content: "Encrypted store of the accounts your automations sign into.",
      },
      { property: "og:title", content: "Accounts — Atlas Runner Admin" },
      {
        property: "og:description",
        content: "Encrypted store of the accounts your automations sign into.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: AccountsPage,
});

function AccountsPage() {
  return (
    <>
      <PageHeader
        title="Accounts"
        description="Passwords are encrypted before they are stored and are never shown to customers."
      />
      <AccountsPanel />
    </>
  );
}

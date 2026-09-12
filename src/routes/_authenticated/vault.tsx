import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { CreditCard, Pencil, Plus, Search, Trash2, Users } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { StatusPill } from "@/components/StatusPill";
import { EmptyState } from "@/components/EmptyState";
import { AccountDialog } from "@/components/vault/AccountDialog";
import { CardDialog } from "@/components/vault/CardDialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { accountsService } from "@/services/accounts";
import { cardsService, maskCard } from "@/services/cards";
import type { Account, Card } from "@/lib/types";
import { formatDate, formatDateTime } from "@/lib/format";

export const Route = createFileRoute("/_authenticated/vault")({
  head: () => ({
    meta: [
      { title: "Vault — Atlas Runner" },
      {
        name: "description",
        content: "Encrypted store of your Amazon accounts and temporary payment cards.",
      },
      { property: "og:title", content: "Vault — Atlas Runner" },
      {
        property: "og:description",
        content: "Encrypted store of your Amazon accounts and temporary payment cards.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: VaultPage,
});

function VaultPage() {
  return (
    <>
      <PageHeader
        title="Vault"
        description="Accounts and temporary cards. Passwords, card numbers and security codes are encrypted before they are stored."
      />
      <Tabs defaultValue="accounts">
        <TabsList>
          <TabsTrigger value="accounts">
            <Users className="size-4" /> Accounts
          </TabsTrigger>
          <TabsTrigger value="cards">
            <CreditCard className="size-4" /> Cards
          </TabsTrigger>
        </TabsList>
        <TabsContent value="accounts" className="mt-6">
          <AccountsPanel />
        </TabsContent>
        <TabsContent value="cards" className="mt-6">
          <CardsPanel />
        </TabsContent>
      </Tabs>
    </>
  );
}

function SearchBar({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  return (
    <div className="relative w-full sm:max-w-xs">
      <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Search…"
        className="pl-9"
      />
    </div>
  );
}

function AccountsPanel() {
  const queryClient = useQueryClient();
  const { data } = useQuery({ queryKey: ["accounts"], queryFn: () => accountsService.list() });
  const [query, setQuery] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Account | null>(null);

  const rows = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return (data ?? []).filter(
      (account) =>
        !needle ||
        account.email.toLowerCase().includes(needle) ||
        account.notes.toLowerCase().includes(needle) ||
        account.status.toLowerCase().includes(needle),
    );
  }, [data, query]);

  async function remove(account: Account) {
    if (!window.confirm(`Delete ${account.email}?`)) return;
    try {
      await accountsService.remove(account.id);
      toast.success("Account deleted.");
      queryClient.invalidateQueries({ queryKey: ["accounts"] });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not delete the account.");
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <SearchBar value={query} onChange={setQuery} />
        <Button
          onClick={() => {
            setEditing(null);
            setDialogOpen(true);
          }}
        >
          <Plus className="size-4" /> Add account
        </Button>
      </div>

      {rows.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No accounts stored"
          description="Add the account you want automated. Its password is encrypted before it reaches the database."
        />
      ) : (
        <div className="panel overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Email</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Prime expiry</TableHead>
                <TableHead>Last execution</TableHead>
                <TableHead>Notes</TableHead>
                <TableHead className="w-24" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((account) => (
                <TableRow key={account.id} className="transition-colors hover:bg-accent/40">
                  <TableCell className="font-medium">{account.email}</TableCell>
                  <TableCell>
                    <StatusPill status={account.status} />
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {formatDate(account.prime_expiration)}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {formatDateTime(account.last_execution)}
                  </TableCell>
                  <TableCell className="max-w-[16rem] truncate text-muted-foreground">
                    {account.notes || "—"}
                  </TableCell>
                  <TableCell>
                    <div className="flex justify-end gap-1">
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => {
                          setEditing(account);
                          setDialogOpen(true);
                        }}
                      >
                        <Pencil className="size-4" />
                      </Button>
                      <Button size="icon" variant="ghost" onClick={() => remove(account)}>
                        <Trash2 className="size-4 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <AccountDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        account={editing}
        onSaved={() => queryClient.invalidateQueries({ queryKey: ["accounts"] })}
      />
    </div>
  );
}

function CardsPanel() {
  const queryClient = useQueryClient();
  const { data } = useQuery({ queryKey: ["cards"], queryFn: () => cardsService.list() });
  const [query, setQuery] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Card | null>(null);

  const rows = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return (data ?? []).filter(
      (card) =>
        !needle ||
        card.alias.toLowerCase().includes(needle) ||
        card.card_last4.includes(needle) ||
        card.status.toLowerCase().includes(needle),
    );
  }, [data, query]);

  async function remove(card: Card) {
    if (!window.confirm(`Delete ${card.alias}?`)) return;
    try {
      await cardsService.remove(card.id);
      toast.success("Card deleted.");
      queryClient.invalidateQueries({ queryKey: ["cards"] });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not delete the card.");
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <SearchBar value={query} onChange={setQuery} />
        <Button
          onClick={() => {
            setEditing(null);
            setDialogOpen(true);
          }}
        >
          <Plus className="size-4" /> Add card
        </Button>
      </div>

      {rows.length === 0 ? (
        <EmptyState
          icon={CreditCard}
          title="No cards stored"
          description="Add a temporary virtual card. Once a payment succeeds it is marked Consumed and never selected again."
        />
      ) : (
        <div className="panel overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Alias</TableHead>
                <TableHead>Number</TableHead>
                <TableHead>Expiry</TableHead>
                <TableHead>Usable until</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-24" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((card) => (
                <TableRow key={card.id} className="transition-colors hover:bg-accent/40">
                  <TableCell className="font-medium">{card.alias}</TableCell>
                  <TableCell className="font-mono text-muted-foreground">
                    {maskCard(card)}
                  </TableCell>
                  <TableCell className="font-mono text-muted-foreground">
                    {card.expiry || "—"}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {formatDateTime(card.expires_at)}
                  </TableCell>
                  <TableCell>
                    <StatusPill status={card.status} />
                  </TableCell>
                  <TableCell>
                    <div className="flex justify-end gap-1">
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => {
                          setEditing(card);
                          setDialogOpen(true);
                        }}
                      >
                        <Pencil className="size-4" />
                      </Button>
                      <Button size="icon" variant="ghost" onClick={() => remove(card)}>
                        <Trash2 className="size-4 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <CardDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        card={editing}
        onSaved={() => queryClient.invalidateQueries({ queryKey: ["cards"] })}
      />
    </div>
  );
}

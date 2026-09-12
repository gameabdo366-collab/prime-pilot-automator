import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { CreditCard, Pencil, Plus, Trash2 } from "lucide-react";
import { StatusPill } from "@/components/StatusPill";
import { EmptyState } from "@/components/EmptyState";
import { CardDialog } from "@/components/vault/CardDialog";
import { VaultSearch } from "@/components/vault/AccountsPanel";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cardsService, maskCard } from "@/services/cards";
import type { Card } from "@/lib/types";
import { formatDateTime } from "@/lib/format";

export function CardsPanel() {
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
        <VaultSearch value={query} onChange={setQuery} />
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

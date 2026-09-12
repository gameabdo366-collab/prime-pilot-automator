import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Eye, Loader2 } from "lucide-react";
import type { Card, CardStatus } from "@/lib/types";
import { cardsService } from "@/services/cards";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const STATUSES: CardStatus[] = ["Available", "Running", "Consumed", "Expired", "Failed"];

function toLocalInput(value: string | null): string {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export function CardDialog({
  open,
  onOpenChange,
  card,
  onSaved,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  card: Card | null;
  onSaved: () => void;
}) {
  const [alias, setAlias] = useState("");
  const [number, setNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");
  const [expiresAt, setExpiresAt] = useState("");
  const [status, setStatus] = useState<CardStatus>("Available");
  const [notes, setNotes] = useState("");
  const [busy, setBusy] = useState(false);
  const [revealing, setRevealing] = useState(false);

  useEffect(() => {
    if (!open) return;
    setAlias(card?.alias ?? "");
    setNumber("");
    setExpiry(card?.expiry ?? "");
    setCvv("");
    setExpiresAt(toLocalInput(card?.expires_at ?? null));
    setStatus(card?.status ?? "Available");
    setNotes(card?.notes ?? "");
  }, [open, card]);

  async function reveal() {
    if (!card) return;
    setRevealing(true);
    try {
      const secrets = await cardsService.revealSecrets(card.id);
      setNumber(secrets.card_number);
      setCvv(secrets.cvv);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not read the card.");
    } finally {
      setRevealing(false);
    }
  }

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    try {
      await cardsService.save({
        id: card?.id ?? null,
        alias,
        card_number: number,
        expiry,
        cvv,
        expires_at: expiresAt ? new Date(expiresAt).toISOString() : null,
        status,
        notes,
      });
      toast.success(card ? "Card updated." : "Card added.");
      onSaved();
      onOpenChange(false);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not save the card.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{card ? "Edit card" : "Add card"}</DialogTitle>
          <DialogDescription>
            Card number and security code are encrypted before storage. Only the last four digits
            are kept readable.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={submit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="card-alias">Alias</Label>
            <Input
              id="card-alias"
              required
              placeholder="Prepaid — 24h"
              value={alias}
              onChange={(e) => setAlias(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="card-number">Card number</Label>
            <div className="flex gap-2">
              <Input
                id="card-number"
                inputMode="numeric"
                required={!card}
                placeholder={card ? `Keeps •••• ${card.card_last4}` : "4111 1111 1111 1111"}
                value={number}
                onChange={(e) => setNumber(e.target.value)}
                className="font-mono"
              />
              {card ? (
                <Button type="button" variant="secondary" onClick={reveal} disabled={revealing}>
                  {revealing ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <Eye className="size-4" />
                  )}
                </Button>
              ) : null}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="card-expiry">Expiry</Label>
              <Input
                id="card-expiry"
                required
                placeholder="MM/YY"
                value={expiry}
                onChange={(e) => setExpiry(e.target.value)}
                className="font-mono"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="card-cvv">CVV</Label>
              <Input
                id="card-cvv"
                inputMode="numeric"
                required={!card}
                placeholder={card ? "•••" : "123"}
                value={cvv}
                onChange={(e) => setCvv(e.target.value)}
                className="font-mono"
              />
            </div>
            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={status} onValueChange={(value) => setStatus(value as CardStatus)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {STATUSES.map((option) => (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="card-expires">Usable until</Label>
            <Input
              id="card-expires"
              type="datetime-local"
              value={expiresAt}
              onChange={(e) => setExpiresAt(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Temporary cards drop out of selection once this moment passes.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="card-notes">Notes</Label>
            <Textarea
              id="card-notes"
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={busy}>
              {busy ? <Loader2 className="size-4 animate-spin" /> : null}
              {card ? "Save changes" : "Add card"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

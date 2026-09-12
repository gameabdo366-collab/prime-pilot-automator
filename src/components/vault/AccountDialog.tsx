import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Eye, Loader2 } from "lucide-react";
import type { Account, AccountStatus } from "@/lib/types";
import { accountsService } from "@/services/accounts";
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

const STATUSES: AccountStatus[] = ["Active", "Inactive", "Expired", "Unknown"];

export function AccountDialog({
  open,
  onOpenChange,
  account,
  onSaved,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  account: Account | null;
  onSaved: () => void;
}) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState<AccountStatus>("Unknown");
  const [primeExpiration, setPrimeExpiration] = useState("");
  const [notes, setNotes] = useState("");
  const [busy, setBusy] = useState(false);
  const [revealing, setRevealing] = useState(false);

  useEffect(() => {
    if (!open) return;
    setEmail(account?.email ?? "");
    setPassword("");
    setStatus(account?.status ?? "Unknown");
    setPrimeExpiration(account?.prime_expiration ?? "");
    setNotes(account?.notes ?? "");
  }, [open, account]);

  async function reveal() {
    if (!account) return;
    setRevealing(true);
    try {
      setPassword(await accountsService.revealPassword(account.id));
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not read the password.");
    } finally {
      setRevealing(false);
    }
  }

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    try {
      await accountsService.save({
        id: account?.id ?? null,
        email,
        password,
        status,
        prime_expiration: primeExpiration || null,
        notes,
      });
      toast.success(account ? "Account updated." : "Account added.");
      onSaved();
      onOpenChange(false);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not save the account.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{account ? "Edit account" : "Add account"}</DialogTitle>
          <DialogDescription>
            The password is encrypted before it is stored and only decrypted when you ask for it.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={submit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="account-email">Email</Label>
            <Input
              id="account-email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="account-password">Password</Label>
            <div className="flex gap-2">
              <Input
                id="account-password"
                type="text"
                placeholder={account ? "Leave blank to keep the current password" : ""}
                required={!account}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="font-mono"
              />
              {account ? (
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

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={status} onValueChange={(value) => setStatus(value as AccountStatus)}>
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
            <div className="space-y-2">
              <Label htmlFor="account-prime">Prime expiry</Label>
              <Input
                id="account-prime"
                type="date"
                value={primeExpiration}
                onChange={(e) => setPrimeExpiration(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="account-notes">Notes</Label>
            <Textarea
              id="account-notes"
              rows={3}
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
              {account ? "Save changes" : "Add account"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

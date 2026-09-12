import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Loader2, LogOut, Save } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { StatusPill } from "@/components/StatusPill";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { supabase } from "@/integrations/supabase/client";
import { settingsService, DEFAULT_SETTINGS } from "@/services/settings";
import type { AppSettings } from "@/lib/types";

export const Route = createFileRoute("/_authenticated/settings")({
  head: () => ({
    meta: [
      { title: "Settings — Atlas Runner" },
      { name: "description", content: "Browser mode, timeouts, retries and runner connection." },
      { property: "og:title", content: "Settings — Atlas Runner" },
      {
        property: "og:description",
        content: "Browser mode, timeouts, retries and runner connection.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: SettingsPage,
});

function SettingsPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data } = useQuery({ queryKey: ["settings"], queryFn: () => settingsService.get() });
  const [form, setForm] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (data) setForm(data);
  }, [data]);

  function update<K extends keyof AppSettings>(key: K, value: AppSettings[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function save() {
    setBusy(true);
    try {
      await settingsService.save(form);
      toast.success("Settings saved.");
      queryClient.invalidateQueries({ queryKey: ["settings"] });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not save settings.");
    } finally {
      setBusy(false);
    }
  }

  async function signOut() {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  }

  return (
    <>
      <PageHeader
        title="Settings"
        description="Saved now, used by the automation engine once it is installed."
        actions={
          <Button variant="ghost" onClick={signOut}>
            <LogOut className="size-4" /> Sign out
          </Button>
        }
      />

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="panel animate-rise space-y-6 p-6">
          <h2 className="text-sm font-semibold">Browser</h2>

          <div className="flex items-center justify-between gap-4">
            <div>
              <Label htmlFor="headless">Headless mode</Label>
              <p className="mt-1 text-xs text-muted-foreground">Run without showing a window.</p>
            </div>
            <Switch
              id="headless"
              checked={form.headless_mode}
              onCheckedChange={(value) => update("headless_mode", value)}
            />
          </div>

          <div className="flex items-center justify-between gap-4">
            <div>
              <Label htmlFor="visible">Visible browser</Label>
              <p className="mt-1 text-xs text-muted-foreground">
                Watch the automation as it happens.
              </p>
            </div>
            <Switch
              id="visible"
              checked={form.visible_browser}
              onCheckedChange={(value) => update("visible_browser", value)}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="timeout">Timeout (seconds)</Label>
              <Input
                id="timeout"
                type="number"
                min={10}
                max={600}
                value={form.timeout_seconds}
                onChange={(e) => update("timeout_seconds", Number(e.target.value))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="retries">Retries</Label>
              <Input
                id="retries"
                type="number"
                min={0}
                max={10}
                value={form.retries}
                onChange={(e) => update("retries", Number(e.target.value))}
              />
            </div>
          </div>
        </div>

        <div className="panel sheen animate-rise space-y-6 p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold">Runner connection</h2>
            <StatusPill status="Pending" />
          </div>
          <p className="text-xs text-muted-foreground">
            Placeholder for the machine that will run the browser. Nothing connects yet.
          </p>

          <div className="space-y-2">
            <Label htmlFor="runner-url">Runner address</Label>
            <Input
              id="runner-url"
              placeholder="http://localhost:7070"
              value={form.runner_url}
              onChange={(e) => update("runner_url", e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="runner-token">Runner token</Label>
            <Input
              id="runner-token"
              type="password"
              placeholder="Not set"
              value={form.runner_token}
              onChange={(e) => update("runner_token", e.target.value)}
              className="font-mono"
            />
          </div>
        </div>
      </div>

      <div className="mt-6">
        <Button onClick={save} disabled={busy}>
          {busy ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
          Save settings
        </Button>
      </div>
    </>
  );
}

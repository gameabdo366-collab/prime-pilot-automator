import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Images } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { EmptyState } from "@/components/EmptyState";
import { screenshotsService } from "@/services/screenshots";
import { formatDateTime } from "@/lib/format";

export const Route = createFileRoute("/_authenticated/screenshots")({
  head: () => ({
    meta: [
      { title: "Screenshots — Atlas Runner" },
      { name: "description", content: "Captures taken at every important automation step." },
      { property: "og:title", content: "Screenshots — Atlas Runner" },
      {
        property: "og:description",
        content: "Captures taken at every important automation step.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ScreenshotsPage,
});

function ScreenshotsPage() {
  const { data } = useQuery({
    queryKey: ["screenshots"],
    queryFn: () => screenshotsService.list(),
  });

  return (
    <>
      <PageHeader
        title="Screenshots"
        description="Every capture the automation takes will appear here, grouped by step."
      />

      {(data ?? []).length === 0 ? (
        <EmptyState
          icon={Images}
          title="No screenshots yet"
          description="Captures appear here after a task runs. The automation engine is not installed yet, so the gallery is empty."
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {(data ?? []).map((shot) => (
            <figure key={shot.id} className="panel animate-rise overflow-hidden">
              <div className="aspect-video overflow-hidden bg-surface-raised">
                <img
                  src={shot.image}
                  alt={shot.step || "Automation step capture"}
                  loading="lazy"
                  className="size-full object-cover transition-transform duration-500 hover:scale-105"
                />
              </div>
              <figcaption className="flex items-center justify-between px-4 py-3">
                <span className="text-sm font-medium">{shot.step || "Step"}</span>
                <span className="text-xs text-muted-foreground">
                  {formatDateTime(shot.created_at)}
                </span>
              </figcaption>
            </figure>
          ))}
        </div>
      )}
    </>
  );
}

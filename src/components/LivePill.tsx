import { getStreamStatus } from "@/lib/twitch";

export async function LivePill() {
  const status = await getStreamStatus();
  if (status.live) {
    return (
      <span className="inline-flex items-center gap-2 font-mono text-[11px] stencil text-sand-100">
        <span className="h-2 w-2 rounded-full bg-live" />
        Live{status.viewerCount != null ? ` · ${status.viewerCount}` : ""}
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-2 font-mono text-[11px] stencil text-sand-500">
      <span className="h-2 w-2 rounded-full bg-sand-500/50" />
      Offline
    </span>
  );
}

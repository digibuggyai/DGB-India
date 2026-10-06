import { Eyebrow } from "@/components/ui/Eyebrow";
import { ActivityLog } from "../../_components/ActivityLog";
import { getActivity } from "../../_lib/activity";

export const dynamic = "force-dynamic";

export default async function LogsPage() {
  const entries = await getActivity();
  const deletions = entries.filter((e) => e.action === "deleted").length;

  return (
    <div className="container-page py-10">
      <Eyebrow>Logs</Eyebrow>
      <div className="mt-4 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">Activity log</h1>
          <p className="mt-3 max-w-xl text-muted">
            Every add, edit and deletion across the price list, posts, enquiries, images, accounts and discount codes — who did it, when,
            and exactly what changed.
          </p>
        </div>
        <span className="text-sm text-muted">
          {entries.length} entries · {deletions} deletion{deletions === 1 ? "" : "s"}
        </span>
      </div>

      <div className="mt-8">
        <ActivityLog initial={entries} />
      </div>
    </div>
  );
}

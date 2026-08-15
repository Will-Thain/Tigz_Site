import { loadProgress, fetchCatalogTasks, fetchTrackerProgress, joinQuestBoard } from "@/lib/tarkov";

export const dynamic = "force-dynamic";
export const metadata = { title: "Progress" };

export default async function ProgressPage() {
  const stats = await loadProgress();
  const tokenSet = Boolean(process.env.TARKOVTRACKER_TOKEN);
  const [tracker, catalog] = await Promise.all([fetchTrackerProgress(), tokenSet ? fetchCatalogTasks() : Promise.resolve(null)]);
  const board = tracker ? joinQuestBoard(catalog, tracker) : null;

  return (
    <div className="space-y-8">
      <header>
        <p className="font-mono text-[11px] stencil text-olive-400">PMC</p>
        <h1 className="font-display text-4xl">Character progress</h1>
        <p className="mt-2 max-w-2xl text-sand-300">
          Numbers on this page are typed in by Tigz or a mod, or read from TarkovTracker.org if a read-only token is
          configured. They are not pulled from the game.
        </p>
        <p className="mt-3 font-mono text-[11px] text-sand-500">
          Stats updated {new Date(stats.updatedAt).toUTCString()}
        </p>
      </header>

      <dl className="grid gap-3 sm:grid-cols-4">
        {[
          ["PMC level", stats.pmcLevel],
          ["PMC K/D", stats.pmcKd],
          ["Scav K/D", stats.scavKd],
          ["Survival", stats.survival],
        ].map(([label, value]) => (
          <div key={label} className="frame p-4">
            <dt className="font-mono text-[10px] stencil text-sand-500">{label}</dt>
            <dd className="mt-2 font-display text-3xl">{value}</dd>
          </div>
        ))}
      </dl>

      <section className="frame p-5">
        <h2 className="font-display text-2xl">Hideout</h2>
        <p className="mt-2 text-sand-300">{stats.hideoutNotes}</p>
      </section>

      <section className="frame p-5">
        <h2 className="font-display text-2xl">Quests</h2>
        {board ? (
          <div className="mt-4 space-y-5">
            <dl className="grid gap-3 sm:grid-cols-2">
              <div className="border border-sand-500/20 p-4">
                <dt className="font-mono text-[10px] stencil text-sand-500">Completed</dt>
                <dd className="mt-2 font-display text-3xl">{board.completed}</dd>
              </div>
              <div className="border border-sand-500/20 p-4">
                <dt className="font-mono text-[10px] stencil text-sand-500">Remaining</dt>
                <dd className="mt-2 font-display text-3xl">{board.remaining}</dd>
              </div>
            </dl>
            <div className="grid gap-6 lg:grid-cols-2">
              <QuestList title="In progress" empty="Nothing unlocked and unfinished." items={board.inProgress} />
              <QuestList title="Complete" empty="No completed tasks in the catalog join." items={board.complete} />
            </div>
            <p className="font-mono text-[11px] text-sand-500">
              Quest flags from a TarkovTracker.org read token, joined to the json.tarkov.dev catalog. Not live from the
              game.
              {tracker?.fetchedAt ? ` Tracker cached ${new Date(tracker.fetchedAt).toUTCString()}.` : ""}
            </p>
          </div>
        ) : (
          <>
            <p className="mt-2 text-sand-300">{stats.questNotes}</p>
            <p className="mt-4 font-mono text-[11px] text-sand-500">
              Tracker token: {tokenSet ? "set, read failed" : "not configured"}
            </p>
          </>
        )}
      </section>
    </div>
  );
}

function QuestList({
  title,
  empty,
  items,
}: {
  title: string;
  empty: string;
  items: { id: string; name: string; trader?: string }[];
}) {
  return (
    <div>
      <h3 className="font-mono text-[10px] stencil text-olive-400">{title}</h3>
      {items.length === 0 ? (
        <p className="mt-2 text-sm text-sand-500">{empty}</p>
      ) : (
        <ul className="mt-2 space-y-1 text-sm text-sand-300">
          {items.map((task) => (
            <li key={task.id}>
              <span className="text-sand-100">{task.name}</span>
              {task.trader ? <span className="text-sand-500"> · {task.trader}</span> : null}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

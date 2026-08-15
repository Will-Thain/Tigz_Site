import { loadPolls } from "@/app/api/polls/store";
import { PollList } from "@/components/PollList";
import { isTwitchAuthEnabled, twitchSignInHref } from "@/lib/auth";

export const dynamic = "force-dynamic";
export const metadata = { title: "Polls" };

export default async function PollsPage() {
  const polls = await loadPolls();
  return (
    <div className="space-y-6">
      <header>
        <p className="font-mono text-[11px] stencil text-olive-400">Community</p>
        <h1 className="font-display text-4xl">Polls</h1>
        <p className="mt-2 text-sand-300">Kit and map votes that last longer than a Twitch poll.</p>
      </header>
      <PollList
        polls={polls}
        twitchSignIn={isTwitchAuthEnabled() ? twitchSignInHref("/polls") : null}
        turnstileSiteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || null}
      />
    </div>
  );
}

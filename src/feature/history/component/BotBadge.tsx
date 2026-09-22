/**
 * Marks a game played against the bot. The opponent is a real user document,
 * so without this a bot game looks like any other opponent.
 */
export default function BotBadge() {
  return (
    <span className="rounded bg-surface-raised px-1.5 py-0.5 text-[11px] font-semibold uppercase tracking-wider text-content-subtle">
      Bot
    </span>
  );
}

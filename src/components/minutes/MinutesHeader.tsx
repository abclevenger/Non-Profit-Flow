export type MinutesHeaderProps = {
  title?: string;
  description?: string;
};

export function MinutesHeader({
  title = "Meeting Minutes & Records",
  description = "Track official minutes, decisions, and board follow-up in one place.",
}: MinutesHeaderProps) {
  return (
    <header className="space-y-2">
      <p className="text-xs font-semibold uppercase tracking-wide text-stone-500">Records</p>
      <h1 className="font-serif text-3xl font-semibold tracking-tight text-stone-900 md:text-4xl">{title}</h1>
      <p className="max-w-2xl text-base leading-relaxed text-stone-600">{description}</p>
    </header>
  );
}

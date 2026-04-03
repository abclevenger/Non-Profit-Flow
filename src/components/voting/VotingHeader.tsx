export type VotingHeaderProps = {
  title?: string;
  description?: string;
};

export function VotingHeader({
  title = "Board Voting & Decision Workflow",
  description = "Track upcoming votes, decision timing, and board discussion in one place.",
}: VotingHeaderProps) {
  return (
    <header className="max-w-3xl">
      <h1 className="font-serif text-2xl font-semibold tracking-tight text-stone-900 sm:text-3xl">{title}</h1>
      <p className="mt-2 text-sm leading-relaxed text-stone-600 sm:text-base">{description}</p>
    </header>
  );
}
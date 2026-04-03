export type StrategicHeaderProps = {
  title?: string;
  description?: string;
};

export function StrategicHeader({
  title = "Strategic priorities",
  description = "Track what matters most and where attention is needed.",
}: StrategicHeaderProps) {
  return (
    <header className="max-w-3xl">
      <h1 className="font-serif text-2xl font-semibold tracking-tight text-stone-900 sm:text-3xl">{title}</h1>
      {description ? <p className="mt-2 text-sm leading-relaxed text-stone-600 sm:text-base">{description}</p> : null}
    </header>
  );
}
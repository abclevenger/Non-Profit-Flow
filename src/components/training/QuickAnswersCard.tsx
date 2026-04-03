import type { BoardTrainingBundle } from "@/lib/mock-data/types";

export function QuickAnswersCard({ items }: { items: BoardTrainingBundle["quickAnswers"] }) {
  return (
    <div className="rounded-2xl border border-stone-200/80 bg-white/60 p-6 shadow-sm ring-1 ring-white/50 backdrop-blur-md">
      <h3 className="font-serif text-lg font-semibold text-stone-900">Quick answers</h3>
      <p className="mt-1 text-sm text-stone-600">Common questions from new members.</p>
      <dl className="mt-5 space-y-5">
        {items.map((item) => (
          <div key={item.id}>
            <dt className="text-sm font-semibold text-stone-900">{item.question}</dt>
            <dd className="mt-2 text-sm leading-relaxed text-stone-600">{item.answer}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

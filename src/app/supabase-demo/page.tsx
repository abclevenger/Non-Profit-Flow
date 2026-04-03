import { cookies } from "next/headers";
import Link from "next/link";
import { createClient } from "@/utils/supabase/server";

export default async function SupabaseDemoPage() {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data: todos, error } = await supabase.from("todos").select();

  return (
    <div className="mx-auto max-w-lg space-y-4 p-6">
      <p className="text-sm text-stone-600">
        <Link href="/overview" className="font-semibold text-stone-800 underline">
          Back to dashboard
        </Link>
      </p>
      <h1 className="font-serif text-2xl font-semibold text-stone-900">Supabase demo</h1>
      <p className="text-sm text-stone-600">
        Sample read of <code className="rounded bg-stone-100 px-1">todos</code>. Create the table in Supabase if it does not exist.
      </p>
      {error ? (
        <p className="rounded-lg bg-amber-50 p-3 text-sm text-amber-950 ring-1 ring-amber-200/80">
          {error.message}
        </p>
      ) : (
        <ul className="list-disc space-y-1 pl-5 text-stone-800">
          {todos?.length ? (
            todos.map((todo: { id: string; name?: string }) => <li key={todo.id}>{todo.name ?? todo.id}</li>)
          ) : (
            <li className="list-none pl-0 text-stone-500">No rows (empty table or no table yet).</li>
          )}
        </ul>
      )}
    </div>
  );
}
"use client";

import { useCallback, useEffect, useState } from "react";

type HealthPayload = {
  ok: boolean;
  timestamp: string;
  environment: {
    nextPublicSupabaseUrl: boolean;
    nextPublicSupabaseAnonKey: boolean;
    supabaseServiceRoleKey: boolean;
    urlHost: string | null;
  };
  query: {
    attempted: boolean;
    usedServiceRole: boolean;
    success: boolean;
    hint?: string;
    postgresCode?: string;
  } | null;
};

type TodoRow = { id: string; name?: string; created_at?: string };

export function SupabaseDemoPanels() {
  const [health, setHealth] = useState<HealthPayload | null>(null);
  const [healthError, setHealthError] = useState<string | null>(null);
  const [todos, setTodos] = useState<TodoRow[] | null>(null);
  const [todosError, setTodosError] = useState<string | null>(null);
  const [todosMode, setTodosMode] = useState<string | null>(null);
  const [loadingTodos, setLoadingTodos] = useState(false);
  const [adding, setAdding] = useState(false);
  const [newName, setNewName] = useState("");

  const loadHealth = useCallback(() => {
    setHealthError(null);
    fetch("/api/supabase/health")
      .then((r) => r.json())
      .then(setHealth)
      .catch(() => setHealthError("Failed to fetch /api/supabase/health"));
  }, []);

  const loadTodos = useCallback(() => {
    setLoadingTodos(true);
    setTodosError(null);
    fetch("/api/supabase/todos")
      .then(async (r) => {
        const j = await r.json();
        if (!r.ok) {
          setTodos(null);
          setTodosError(j.error ?? `HTTP ${r.status}`);
          setTodosMode(null);
          return;
        }
        setTodos(j.items ?? []);
        setTodosMode(j.mode ?? null);
      })
      .catch(() => {
        setTodosError("Network error");
        setTodos(null);
      })
      .finally(() => setLoadingTodos(false));
  }, []);

  useEffect(() => {
    loadHealth();
    loadTodos();
  }, [loadHealth, loadTodos]);

  async function addTodo(e: React.FormEvent) {
    e.preventDefault();
    const name = newName.trim();
    if (!name) return;
    setAdding(true);
    setTodosError(null);
    try {
      const r = await fetch("/api/supabase/todos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      const j = await r.json();
      if (!r.ok) {
        setTodosError(j.error ?? j.hint ?? `HTTP ${r.status}`);
        return;
      }
      setNewName("");
      loadTodos();
    } catch {
      setTodosError("Network error");
    } finally {
      setAdding(false);
    }
  }

  return (
    <div className="space-y-8">
      <section className="rounded-2xl border border-stone-200/90 bg-white p-5 shadow-sm ring-1 ring-stone-100">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="font-serif text-lg font-semibold text-stone-900">Connection diagnostics</h2>
          <button
            type="button"
            onClick={loadHealth}
            className="rounded-lg border border-stone-300 bg-stone-50 px-3 py-1.5 text-xs font-semibold text-stone-800 hover:bg-stone-100"
          >
            Refresh
          </button>
        </div>
        <p className="mt-1 text-xs text-stone-500">
          Public endpoint <code className="rounded bg-stone-100 px-1">/api/supabase/health</code> — no secrets in the
          response.
        </p>
        {healthError ? (
          <p className="mt-3 text-sm text-rose-700">{healthError}</p>
        ) : health ? (
          <ul className="mt-4 space-y-2 text-sm text-stone-800">
            <li>
              <span className="font-medium">Configured:</span> {health.ok ? "yes" : "no"}
            </li>
            <li>
              <span className="font-medium">URL host:</span> {health.environment.urlHost ?? "—"}
            </li>
            <li>
              <span className="font-medium">Anon key set:</span> {health.environment.nextPublicSupabaseAnonKey ? "yes" : "no"}
            </li>
            <li>
              <span className="font-medium">Service role set:</span>{" "}
              {health.environment.supabaseServiceRoleKey ? "yes (server only)" : "no"}
            </li>
            {health.query ? (
              <li className="border-t border-stone-100 pt-2">
                <span className="font-medium">Test query (todos):</span>{" "}
                {health.query.success ? "ok" : "failed"}
                {health.query.postgresCode ? (
                  <span className="ml-2 text-stone-600">code {health.query.postgresCode}</span>
                ) : null}
                {health.query.hint ? <p className="mt-1 text-stone-600">{health.query.hint}</p> : null}
              </li>
            ) : null}
          </ul>
        ) : (
          <p className="mt-3 text-sm text-stone-500">Loading…</p>
        )}
      </section>

      <section className="rounded-2xl border border-stone-200/90 bg-white p-5 shadow-sm ring-1 ring-stone-100">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="font-serif text-lg font-semibold text-stone-900">Todos (API test)</h2>
          <button
            type="button"
            onClick={loadTodos}
            disabled={loadingTodos}
            className="rounded-lg border border-stone-300 bg-stone-50 px-3 py-1.5 text-xs font-semibold text-stone-800 hover:bg-stone-100 disabled:opacity-50"
          >
            {loadingTodos ? "Loading…" : "Reload"}
          </button>
        </div>
        <p className="mt-1 text-xs text-stone-500">
          Uses <code className="rounded bg-stone-100 px-1">GET/POST /api/supabase/todos</code> with your NextAuth session.
          Inserts require <code className="rounded bg-stone-100 px-1">SUPABASE_SERVICE_ROLE_KEY</code> on the server.
        </p>
        {todosMode ? (
          <p className="mt-2 text-xs font-medium text-stone-600">Mode: {todosMode}</p>
        ) : null}
        {todosError ? (
          <p className="mt-3 rounded-lg bg-amber-50 p-3 text-sm text-amber-950 ring-1 ring-amber-200/80">{todosError}</p>
        ) : null}
        <ul className="mt-4 list-disc space-y-1 pl-5 text-stone-800">
          {todos?.length ? (
            todos.map((todo) => (
              <li key={todo.id}>
                {todo.name ?? todo.id}
                {todo.created_at ? (
                  <span className="ml-2 text-xs text-stone-500">({new Date(todo.created_at).toLocaleString()})</span>
                ) : null}
              </li>
            ))
          ) : (
            <li className="list-none pl-0 text-stone-500">
              {loadingTodos ? "Loading…" : "No rows yet — add one below or create the table in Supabase."}
            </li>
          )}
        </ul>
        <form onSubmit={addTodo} className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-end">
          <div className="min-w-0 flex-1">
            <label htmlFor="todo-name" className="block text-xs font-semibold uppercase tracking-wide text-stone-500">
              New todo
            </label>
            <input
              id="todo-name"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="e.g. Verify RLS policies"
              className="mt-1 w-full rounded-lg border border-stone-200 px-3 py-2 text-stone-900 shadow-sm outline-none focus:ring-2 focus:ring-stone-300"
            />
          </div>
          <button
            type="submit"
            disabled={adding || !newName.trim()}
            className="rounded-lg bg-stone-900 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
          >
            {adding ? "Adding…" : "Add"}
          </button>
        </form>
      </section>
    </div>
  );
}

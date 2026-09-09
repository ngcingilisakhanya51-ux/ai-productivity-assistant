import { useCallback, useEffect, useState } from "react";
import type { UIMessage } from "ai";

const ACTIVITY_KEY = "veridian.activity.v1";
const THREADS_KEY = "veridian.threads.v1";
const messagesKey = (id: string) => `veridian.thread.${id}.messages.v1`;

export type ActivityItem = {
  id: string;
  tool: string;
  label: string;
  at: number;
};

export type ThreadMeta = {
  id: string;
  title: string;
  updatedAt: number;
};

const isBrowser = () => typeof window !== "undefined";

function read<T>(key: string, fallback: T): T {
  if (!isBrowser()) return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function write(key: string, value: unknown) {
  if (!isBrowser()) return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
    window.dispatchEvent(new Event("veridian-storage"));
  } catch {
    /* storage full or unavailable */
  }
}

/* ---------- recent activity ---------- */

export function logActivity(tool: string, label: string) {
  const items = read<ActivityItem[]>(ACTIVITY_KEY, []);
  const next = [
    { id: crypto.randomUUID(), tool, label: label.slice(0, 60), at: Date.now() },
    ...items,
  ].slice(0, 8);
  write(ACTIVITY_KEY, next);
}

export function useActivity() {
  const [items, setItems] = useState<ActivityItem[]>([]);
  useEffect(() => {
    const sync = () => setItems(read<ActivityItem[]>(ACTIVITY_KEY, []));
    sync();
    window.addEventListener("veridian-storage", sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener("veridian-storage", sync);
      window.removeEventListener("storage", sync);
    };
  }, []);
  return items;
}

/* ---------- saved tool drafts ---------- */

export function saveDraft(tool: string, text: string) {
  write(`veridian.draft.${tool}.v1`, text);
}

export function loadDraft(tool: string) {
  return read<string>(`veridian.draft.${tool}.v1`, "");
}

/* ---------- chat threads ---------- */

export function readThreads(): ThreadMeta[] {
  return read<ThreadMeta[]>(THREADS_KEY, []).sort((a, b) => b.updatedAt - a.updatedAt);
}

export function createThread(): ThreadMeta {
  const thread = { id: crypto.randomUUID(), title: "New conversation", updatedAt: Date.now() };
  write(THREADS_KEY, [thread, ...read<ThreadMeta[]>(THREADS_KEY, [])]);
  return thread;
}

export function touchThread(id: string, title?: string) {
  const threads = read<ThreadMeta[]>(THREADS_KEY, []);
  const existing = threads.find((t) => t.id === id);
  if (existing) {
    existing.updatedAt = Date.now();
    if (title && existing.title === "New conversation") existing.title = title.slice(0, 48);
    write(THREADS_KEY, threads);
  } else {
    write(THREADS_KEY, [
      { id, title: title?.slice(0, 48) ?? "New conversation", updatedAt: Date.now() },
      ...threads,
    ]);
  }
}

export function deleteThread(id: string) {
  write(
    THREADS_KEY,
    read<ThreadMeta[]>(THREADS_KEY, []).filter((t) => t.id !== id),
  );
  if (isBrowser()) window.localStorage.removeItem(messagesKey(id));
}

export function readMessages(id: string): UIMessage[] {
  return read<UIMessage[]>(messagesKey(id), []);
}

export function writeMessages(id: string, messages: UIMessage[]) {
  write(messagesKey(id), messages);
}

export function useThreads() {
  const [threads, setThreads] = useState<ThreadMeta[]>([]);
  const refresh = useCallback(() => setThreads(readThreads()), []);
  useEffect(() => {
    refresh();
    window.addEventListener("veridian-storage", refresh);
    window.addEventListener("storage", refresh);
    return () => {
      window.removeEventListener("veridian-storage", refresh);
      window.removeEventListener("storage", refresh);
    };
  }, [refresh]);
  return { threads, refresh };
}

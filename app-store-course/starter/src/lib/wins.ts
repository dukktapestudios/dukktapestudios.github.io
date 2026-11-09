/** Same limits as the browser lesson in ../../wins.js.
 *  This file is meant to be copied into an Expo project at src/lib/wins.ts.
 *  It was not compiled with Xcode or Expo in the environment that published this course. */

export const MAX_WIN_LENGTH = 120;
export const MAX_WINS = 200;

export type Win = {
  id: string;
  text: string;
  done: boolean;
  created: number;
};

export function normalizeText(text: string): string {
  return String(text ?? "").replace(/\s+/g, " ").trim();
}

export function addWin(list: Win[], text: string, now: number): { ok: boolean; error: string; list: Win[] } {
  const clean = normalizeText(text);
  if (!clean) return { ok: false, error: "empty", list };
  if (clean.length > MAX_WIN_LENGTH) return { ok: false, error: "long", list };
  if (list.length >= MAX_WINS) return { ok: false, error: "full", list };
  const win: Win = {
    id: `${now}-${list.length}`,
    text: clean,
    done: false,
    created: now,
  };
  return { ok: true, error: "", list: [...list, win] };
}

export function toggleWin(list: Win[], id: string): Win[] {
  return list.map((item) => (item.id === id ? { ...item, done: !item.done } : item));
}

export function removeWin(list: Win[], id: string): Win[] {
  return list.filter((item) => item.id !== id);
}

export function openWins(list: Win[]): Win[] {
  return list.filter((item) => !item.done);
}

export function parseWins(raw: string | null): Win[] {
  if (!raw) return [];
  try {
    const data = JSON.parse(raw);
    if (!Array.isArray(data)) return [];
    return data
      .filter((item) => item && typeof item.id === "string" && typeof item.text === "string")
      .map((item) => ({
        id: item.id,
        text: normalizeText(item.text),
        done: Boolean(item.done),
        created: typeof item.created === "number" ? item.created : 0,
      }))
      .filter((item) => item.text.length > 0 && item.text.length <= MAX_WIN_LENGTH)
      .slice(0, MAX_WINS);
  } catch {
    return [];
  }
}

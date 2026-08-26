export type ChallengeItem = {
  id: string;
};

export type ChallengeBank<T extends ChallengeItem> = {
  id: string;
  topicId: string;
  contentVersion: number;
  items: readonly T[];
};

export type ChallengeStorage = {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
};

type DrawOptions = {
  storage?: ChallengeStorage | null;
  scope?: string;
  random?: () => number;
};

type StoredBag = {
  remaining: string[];
};

function browserStorage(): ChallengeStorage | null {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

function defaultRandom(): number {
  if (typeof crypto !== "undefined" && typeof crypto.getRandomValues === "function") {
    const value = new Uint32Array(1);
    crypto.getRandomValues(value);
    return value[0] / 2 ** 32;
  }
  return Math.random();
}

export function shuffleList<T>(input: readonly T[], random: () => number = defaultRandom): T[] {
  const result = [...input];
  for (let index = result.length - 1; index > 0; index -= 1) {
    const value = random();
    const boundedValue = Number.isFinite(value) ? Math.min(Math.max(value, 0), 0.9999999999999999) : 0;
    const swapIndex = Math.floor(boundedValue * (index + 1));
    [result[index], result[swapIndex]] = [result[swapIndex], result[index]];
  }
  return result;
}

export function defineChallengeBank<T extends ChallengeItem>(bank: ChallengeBank<T>): ChallengeBank<T> {
  if (!bank.id.trim() || !bank.topicId.trim()) throw new Error("Challenge banks require an id and topicId.");
  if (!Number.isInteger(bank.contentVersion) || bank.contentVersion < 1) throw new Error("Challenge bank contentVersion must be a positive integer.");
  if (bank.items.length === 0) throw new Error(`Challenge bank "${bank.id}" cannot be empty.`);

  const ids = new Set<string>();
  for (const item of bank.items) {
    if (!item.id.trim()) throw new Error(`Challenge bank "${bank.id}" contains an empty item id.`);
    if (ids.has(item.id)) throw new Error(`Challenge bank "${bank.id}" contains duplicate item id "${item.id}".`);
    ids.add(item.id);
  }
  return bank;
}

export function drawChallengeSet<T extends ChallengeItem>(
  bank: ChallengeBank<T>,
  count: number,
  options: DrawOptions = {},
): T[] {
  if (!Number.isInteger(count) || count < 1 || count > bank.items.length) {
    throw new Error(`Draw count must be between 1 and ${bank.items.length}.`);
  }

  const storage = options.storage === undefined ? browserStorage() : options.storage;
  const random = options.random ?? defaultRandom;
  const scope = options.scope?.trim() || "device";
  const key = `rizal-arcade:challenge-bag:${scope}:${bank.id}:v${bank.contentVersion}`;
  const itemsById = new Map(bank.items.map((item) => [item.id, item]));
  const allIds = bank.items.map((item) => item.id);
  let remaining: string[] = [];

  if (storage) {
    try {
      const stored = storage.getItem(key);
      if (stored) {
        const parsed = JSON.parse(stored) as Partial<StoredBag>;
        if (Array.isArray(parsed.remaining)) {
          const seen = new Set<string>();
          remaining = parsed.remaining.filter((id): id is string => {
            if (typeof id !== "string" || !itemsById.has(id) || seen.has(id)) return false;
            seen.add(id);
            return true;
          });
        }
      }
    } catch {
      remaining = [];
    }
  }

  const selectedIds: string[] = [];
  while (selectedIds.length < count) {
    if (remaining.length === 0) remaining = shuffleList(allIds, random);
    const nextIndex = remaining.findIndex((id) => !selectedIds.includes(id));
    if (nextIndex < 0) {
      remaining = shuffleList(allIds.filter((id) => !selectedIds.includes(id)), random);
      continue;
    }
    selectedIds.push(remaining.splice(nextIndex, 1)[0]);
  }

  if (storage) {
    try {
      storage.setItem(key, JSON.stringify({ remaining } satisfies StoredBag));
    } catch {
      // Browsers may disable or limit storage. The game can still use this draw in memory.
    }
  }

  return selectedIds.map((id) => itemsById.get(id) as T);
}

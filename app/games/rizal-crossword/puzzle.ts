import { crosswordClues, normalizeCrosswordAnswer, type CrosswordClue } from "./content.ts";

export type CrosswordDirection = "across" | "down";

export type CrosswordEntry = CrosswordClue & {
  direction: CrosswordDirection;
  row: number;
  col: number;
  number: number;
  solution: string;
};

export type CrosswordCell = {
  row: number;
  col: number;
  solution: string;
  number?: number;
  entryIds: string[];
};

export type CrosswordPuzzle = {
  id: string;
  rows: number;
  cols: number;
  entries: CrosswordEntry[];
  cells: CrosswordCell[];
  gaps: Array<{ row: number; col: number }>;
};

type BoardCell = { letter: string; directions: Set<CrosswordDirection>; entryIds: Set<string> };
type PlacedEntry = Omit<CrosswordEntry, "number">;

const boardSize = 33;
const center = Math.floor(boardSize / 2);

function shuffleList<T>(input: readonly T[], random: () => number): T[] {
  const copy = [...input];
  for (let index = copy.length - 1; index > 0; index -= 1) {
    const nextIndex = Math.floor(random() * (index + 1));
    [copy[index], copy[nextIndex]] = [copy[nextIndex], copy[index]];
  }
  return copy;
}

function key(row: number, col: number): string {
  return `${row}:${col}`;
}

function location(entry: Pick<PlacedEntry, "row" | "col" | "direction">, index: number) {
  return entry.direction === "across"
    ? { row: entry.row, col: entry.col + index }
    : { row: entry.row + index, col: entry.col };
}

function canPlace(
  solution: string,
  row: number,
  col: number,
  direction: CrosswordDirection,
  board: Map<string, BoardCell>,
  requireCrossing: boolean,
): number {
  const before = direction === "across" ? key(row, col - 1) : key(row - 1, col);
  const after = direction === "across" ? key(row, col + solution.length) : key(row + solution.length, col);
  if (board.has(before) || board.has(after)) return -1;

  let crossings = 0;
  for (let index = 0; index < solution.length; index += 1) {
    const cellRow = direction === "across" ? row : row + index;
    const cellCol = direction === "across" ? col + index : col;
    if (cellRow < 1 || cellCol < 1 || cellRow >= boardSize - 1 || cellCol >= boardSize - 1) return -1;
    const existing = board.get(key(cellRow, cellCol));
    if (solution[index] === " ") {
      if (existing) return -1;
      const neighbors = direction === "across"
        ? [key(cellRow - 1, cellCol), key(cellRow + 1, cellCol)]
        : [key(cellRow, cellCol - 1), key(cellRow, cellCol + 1)];
      if (neighbors.some((neighbor) => board.has(neighbor))) return -1;
      continue;
    }
    if (existing) {
      if (existing.letter !== solution[index] || existing.directions.has(direction)) return -1;
      crossings += 1;
      continue;
    }

    const neighbors = direction === "across"
      ? [key(cellRow - 1, cellCol), key(cellRow + 1, cellCol)]
      : [key(cellRow, cellCol - 1), key(cellRow, cellCol + 1)];
    if (neighbors.some((neighbor) => board.has(neighbor))) return -1;
  }
  return requireCrossing && crossings === 0 ? -1 : crossings;
}

function addEntry(board: Map<string, BoardCell>, placed: PlacedEntry) {
  for (let index = 0; index < placed.solution.length; index += 1) {
    const cellLocation = location(placed, index);
    const cellKey = key(cellLocation.row, cellLocation.col);
    const existing = board.get(cellKey);
    if (placed.solution[index] === " ") {
      board.set(cellKey, { letter: " ", directions: new Set([placed.direction]), entryIds: new Set([placed.id]) });
      continue;
    }
    if (existing) {
      existing.directions.add(placed.direction);
      existing.entryIds.add(placed.id);
    } else {
      board.set(cellKey, { letter: placed.solution[index], directions: new Set([placed.direction]), entryIds: new Set([placed.id]) });
    }
  }
}

function bestPlacement(clue: CrosswordClue, board: Map<string, BoardCell>, placed: PlacedEntry[], random: () => number): PlacedEntry | null {
  const solution = normalizeCrosswordAnswer(clue.answer);
  const options: Array<PlacedEntry & { score: number }> = [];
  for (const anchor of placed) {
    const direction: CrosswordDirection = anchor.direction === "across" ? "down" : "across";
    for (let anchorIndex = 0; anchorIndex < anchor.solution.length; anchorIndex += 1) {
      if (anchor.solution[anchorIndex] === " ") continue;
      const anchorLocation = location(anchor, anchorIndex);
      for (let candidateIndex = 0; candidateIndex < solution.length; candidateIndex += 1) {
        if (solution[candidateIndex] === " ") continue;
        if (solution[candidateIndex] !== anchor.solution[anchorIndex]) continue;
        const row = direction === "across" ? anchorLocation.row : anchorLocation.row - candidateIndex;
        const col = direction === "across" ? anchorLocation.col - candidateIndex : anchorLocation.col;
        const crossings = canPlace(solution, row, col, direction, board, true);
        if (crossings < 0) continue;
        const distance = Math.abs(row - center) + Math.abs(col - center);
        options.push({ ...clue, solution, row, col, direction, score: crossings * 100 - distance + random() });
      }
    }
  }
  if (options.length === 0) return null;
  options.sort((left, right) => right.score - left.score);
  const { score: _score, ...winner } = options[0];
  void _score;
  return winner;
}

function buildAttempt(first: CrosswordClue, remaining: CrosswordClue[], random: () => number): PlacedEntry[] {
  const board = new Map<string, BoardCell>();
  const firstSolution = normalizeCrosswordAnswer(first.answer);
  const firstEntry: PlacedEntry = {
    ...first,
    solution: firstSolution,
    row: center,
    col: center - Math.floor(firstSolution.length / 2),
    direction: "across",
  };
  addEntry(board, firstEntry);
  const placed = [firstEntry];
  let pending = remaining.filter((clue) => clue.id !== first.id);

  for (let pass = 0; pass < 4 && placed.length < 8; pass += 1) {
    const nextPending: CrosswordClue[] = [];
    for (const clue of pending) {
      if (placed.length >= 8) break;
      const next = bestPlacement(clue, board, placed, random);
      if (!next) nextPending.push(clue);
      else {
        placed.push(next);
        addEntry(board, next);
      }
    }
    if (nextPending.length === pending.length) break;
    pending = nextPending;
  }
  return placed;
}

function finalize(placed: PlacedEntry[]): CrosswordPuzzle {
  const minRow = Math.min(...placed.map((entry) => entry.row));
  const minCol = Math.min(...placed.map((entry) => entry.col));
  const maxRow = Math.max(...placed.map((entry) => entry.direction === "down" ? entry.row + entry.solution.length - 1 : entry.row));
  const maxCol = Math.max(...placed.map((entry) => entry.direction === "across" ? entry.col + entry.solution.length - 1 : entry.col));
  const shifted = placed.map((entry) => ({ ...entry, row: entry.row - minRow, col: entry.col - minCol }));
  const startKeys = [...new Set(shifted.map((entry) => key(entry.row, entry.col)))].sort((left, right) => {
    const [leftRow, leftCol] = left.split(":").map(Number);
    const [rightRow, rightCol] = right.split(":").map(Number);
    return leftRow - rightRow || leftCol - rightCol;
  });
  const numbers = new Map(startKeys.map((startKey, index) => [startKey, index + 1]));
  const entries: CrosswordEntry[] = shifted.map((entry) => ({ ...entry, number: numbers.get(key(entry.row, entry.col)) ?? 0 }));
  const board = new Map<string, CrosswordCell>();
  const gaps = new Map<string, { row: number; col: number }>();
  for (const entry of entries) {
    for (let index = 0; index < entry.solution.length; index += 1) {
      const cellLocation = location(entry, index);
      const cellKey = key(cellLocation.row, cellLocation.col);
      if (entry.solution[index] === " ") {
        gaps.set(cellKey, cellLocation);
        continue;
      }
      const existing = board.get(cellKey);
      if (existing) existing.entryIds.push(entry.id);
      else board.set(cellKey, {
        ...cellLocation,
        solution: entry.solution[index],
        number: numbers.get(cellKey),
        entryIds: [entry.id],
      });
    }
  }
  return {
    id: entries.map((entry) => entry.id).join("-"),
    rows: maxRow - minRow + 1,
    cols: maxCol - minCol + 1,
    entries,
    cells: [...board.values()],
    gaps: [...gaps.values()],
  };
}

export function createCrosswordPuzzle(random: () => number = Math.random): CrosswordPuzzle {
  const shuffled = shuffleList(crosswordClues, random);
  let best: PlacedEntry[] = [];
  for (const first of shuffled.slice(0, 24)) {
    const attempt = buildAttempt(first, shuffleList(shuffled, random), random);
    if (attempt.length > best.length) best = attempt;
    if (best.length >= 8) break;
  }
  if (best.length < 8) throw new Error("Unable to compose an eight-entry crossword from the clue bank.");
  return finalize(best.slice(0, 8));
}

export function entryCellKey(entry: Pick<CrosswordEntry, "row" | "col" | "direction">, index: number): string {
  return key(
    entry.direction === "across" ? entry.row : entry.row + index,
    entry.direction === "across" ? entry.col + index : entry.col,
  );
}

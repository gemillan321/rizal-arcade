import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import * as jsxRuntime from "react/jsx-runtime";
import ts from "typescript";

const source = readFileSync(new URL("../app/games/shared/ArcadeGameKit.tsx", import.meta.url), "utf8");
const compiled = ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX },
}).outputText;
const board = { entries: [], mode: "section", status: "ok", sectionLabel: "Test section" };
const flush = () => new Promise((resolve) => setImmediate(resolve));
const BadgeAwardNotice = () => null;

function setup(submit) {
  const state = [];
  let cursor = 0;
  let effect;
  let dependencies;
  let cleanup;
  const hooks = {
    useState(initial) {
      const i = cursor++;
      if (!(i in state)) state[i] = initial;
      return [state[i], (value) => { state[i] = typeof value === "function" ? value(state[i]) : value; }];
    },
    useEffect(callback, deps) {
      if (!dependencies || deps.some((value, i) => value !== dependencies[i])) {
        cleanup?.();
        dependencies = deps;
        effect = callback;
        cleanup = callback();
      }
    },
  };
  const compiledModule = { exports: {} };
  new Function("require", "module", "exports", compiled)((name) => ({
    react: hooks,
    "react/jsx-runtime": jsxRuntime,
    "../../leaderboard": { loadLeaderboard: async () => board, submitLeaderboardScore: submit },
    "../../BadgeCollection": { BadgeAwardNotice },
  })[name], compiledModule, compiledModule.exports);
  return {
    state,
    render: (game = "revolution", score = 1275) => { cursor = 0; return compiledModule.exports.LeaderboardPanel({ game, score }); },
    replayEffect: () => { cleanup(); cleanup = effect(); },
    unmount: () => cleanup(),
  };
}

function findButton(node) {
  if (!node || typeof node !== "object") return undefined;
  if (node.type === "button" && node.props.children === "Retry saving score") return node;
  return [node.props?.children].flat(Infinity).map(findButton).find(Boolean);
}

function findAwardNotice(node) {
  if (!node || typeof node !== "object") return undefined;
  if (node.type === BadgeAwardNotice) return node;
  return [node.props?.children].flat(Infinity).map(findAwardNotice).find(Boolean);
}

test("a rejected save can retry the same game and score successfully", async () => {
  const calls = [];
  const harness = setup(async (...args) => {
    calls.push(args);
    if (calls.length === 1) throw new Error("Temporary outage");
    return board;
  });
  harness.render();
  await flush();
  const retry = findButton(harness.render());
  assert.equal(findAwardNotice(harness.render()), undefined);
  assert.ok(retry);
  assert.equal(retry.props.disabled, false);
  retry.props.onClick();
  harness.render();
  await flush();
  assert.deepEqual(calls, [["revolution", 1275], ["revolution", 1275]]);
  assert.equal(findButton(harness.render()), undefined);
  assert.equal(findAwardNotice(harness.render()).props.game, "revolution");
  assert.match(harness.state[1], /personal best is saved/);
  assert.equal(harness.state[2], false);
});

test("effect cleanup and replay does not leave score saving stuck", async () => {
  const pending = [];
  const harness = setup(() => new Promise((resolve) => pending.push(resolve)));
  harness.render();
  harness.replayEffect();
  pending.forEach((resolve) => resolve(board));
  await flush();
  assert.equal(harness.state[2], false);
  assert.match(harness.state[1], /personal best is saved/);
});

test("completion after unmount does not update panel state", async () => {
  let resolve;
  const harness = setup(() => new Promise((done) => { resolve = done; }));
  harness.render();
  harness.unmount();
  const before = [...harness.state];
  resolve(board);
  await flush();
  assert.deepEqual(harness.state, before);
});

test("every registered game is supported by the repair and fresh schema", () => {
  const registry = readFileSync(new URL("../app/games/registry.tsx", import.meta.url), "utf8");
  const games = [...registry.matchAll(/id: "([a-z]+)"/g)].map((match) => match[1]);
  assert.equal(games.length, 10);
  for (const file of ["repair_score_recording.sql", "rizal_arcade_scores.sql"]) {
    const sql = readFileSync(new URL(`../supabase/${file}`, import.meta.url), "utf8");
    for (const game of games) {
      const limit = sql.match(new RegExp(`when '${game}' then (\\d+)`));
      assert.ok(limit, `${file}: missing ${game} RPC support`);
      assert.ok(sql.includes(`game_id = '${game}' and score between 0 and ${limit[1]}`));
    }
  }
  const migration = readFileSync(new URL("../supabase/repair_score_recording.sql", import.meta.url), "utf8");
  assert.match(migration, /begin;/);
  assert.match(migration, /commit;/);
  assert.doesNotMatch(migration, /drop table|delete from|truncate/i);
  // Ten rounds: 100 base plus a streak bonus capped at 80, starting at zero.
  assert.equal(Array.from({ length: 10 }, (_, i) => 100 + Math.min(i, 4) * 20).reduce((a, b) => a + b), 1600);
  const dapitan = readFileSync(new URL("../app/games/dapitan-to-bagumbayan/index.tsx", import.meta.url), "utf8");
  assert.match(dapitan.slice(dapitan.indexOf('if (phase === "results")')), /<LeaderboardPanel game="dapitan" score=\{score\}/);
});

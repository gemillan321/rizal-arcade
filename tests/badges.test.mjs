import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import ts from "typescript";
import * as React from "react";
import * as jsxRuntime from "react/jsx-runtime";
import { renderToStaticMarkup } from "react-dom/server";

function compile(path, mocks = {}) {
  const source = readFileSync(new URL(path, import.meta.url), "utf8");
  const compiled = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX } }).outputText;
  const compiledModule = { exports: {} };
  new Function("require", "module", "exports", compiled)((name) => {
    assert.ok(name in mocks, `Unexpected import: ${name}`);
    return mocks[name];
  }, compiledModule, compiledModule.exports);
  return compiledModule.exports;
}
const catalog = compile("../app/badgeCatalog.ts");

test("each playable game maps to one supplied medal, including the 8–10 sequence", () => {
  const registry = readFileSync(new URL("../app/games/registry.tsx", import.meta.url), "utf8");
  const ids = [...registry.matchAll(/id: "([a-z]+)"/g)].map((m) => m[1]);
  assert.deepEqual(catalog.gameBadges.map((b) => b.game).sort(), ids.sort());
  assert.equal(new Set(catalog.gameBadges.map((b) => b.art)).size, 10);
  for (const [game, art] of [["dapitan", "b10"], ["revolution", "b8"], ["crossword", "b9"]]) {
    assert.equal(catalog.gameBadges.find((b) => b.game === game).art, art);
  }
  for (const art of [...catalog.gameBadges.map((b) => b.art), "bFinal", "lockSeal"]) {
    const svg = readFileSync(new URL(`../public/art/badges/${art}.svg`, import.meta.url), "utf8");
    assert.match(svg, /<svg xmlns=/);
    assert.doesNotMatch(svg, /<script|https:\/\/|{{/);
    for (const match of svg.matchAll(/href="#([^"]+)"/g)) assert.ok(svg.includes(`id="${match[1]}"`));
  }
});

test("the laureate requires all ten distinct recognized games", () => {
  const awards = catalog.gameBadges.map((b) => ({ game_id: b.game, awarded_at: "2026-09-08T00:00:00Z" }));
  assert.equal(catalog.collectionProgress(awards.slice(0, 9)).complete, false);
  assert.equal(catalog.collectionProgress([...awards.slice(0, 9), awards[0], {game_id:"unknown"}]).count, 9);
  assert.equal(catalog.collectionProgress(awards).complete, true);
  assert.equal(catalog.collectionProgress([]).count, 0);
});

test("badge reads are scoped to the signed-in student and failures remain failures", async () => {
  let snapshot = null;
  let queryError = null;
  const calls = [];
  const query = { select: () => query, eq: async (...args) => { calls.push(args); return { data: [{ game_id: "values" }], error: queryError }; } };
  const service = compile("../app/badges.ts", { "./auth": {
    getAuthSnapshot: async () => snapshot,
    getSupabaseClient: () => ({ from: (name) => { assert.equal(name, "rizal_arcade_badges"); return query; } }),
  } });
  for (const profile of [null, {role:"admin"}, {role:"student",active:false}, {role:"student",active:true,must_change_password:true}]) {
    snapshot = profile ? {profile} : null;
    assert.deepEqual(await service.loadMyBadges(), []);
  }
  assert.equal(calls.length, 0);
  snapshot = { profile: { id: "student-a", role:"student", active:true, must_change_password:false } };
  assert.equal((await service.loadMyBadges()).length, 1);
  assert.deepEqual(calls, [["student_id", "student-a"]]);
  snapshot.profile.id = "student-b";
  await service.loadMyBadges();
  assert.deepEqual(calls.at(-1), ["student_id", "student-b"]);
  queryError = {message:"Network unavailable"};
  await assert.rejects(service.loadMyBadges(), /could not be loaded/);
});

test("guests see an honest locked collection and a sign-in action", () => {
  const { default: Collection } = compile("../app/BadgeCollection.tsx", {
    react: React, "react/jsx-runtime": jsxRuntime,
    "./badgeCatalog": catalog, "./badges": { loadMyBadges: async () => [] },
  });
  const html = renderToStaticMarkup(React.createElement(Collection, {profile:null,refreshKey:"home",onPlay:()=>{},onSignIn:()=>{}}));
  assert.match(html, /Sign in to collect badges/);
  assert.match(html, /0 of 10 seals collected/);
  assert.equal((html.match(/Locked · Finish a round/g) ?? []).length, 10);
  assert.doesNotMatch(html, /Badge earned/);
});

test("earned and complete collections render persisted awards; errors do not claim a badge", () => {
  function render(component, awards, error = "") {
    let cursor = 0;
    const states = [awards, error, 0];
    const components = compile("../app/BadgeCollection.tsx", {
      react: { ...React, useEffect: () => {}, useState: () => [states[cursor++], () => {}] },
      "react/jsx-runtime": jsxRuntime, "./badgeCatalog": catalog, "./badges": {},
    });
    return renderToStaticMarkup(React.createElement(components[component], {
      profile: {id:"student-a",role:"student"}, refreshKey:"home", game:"values", onPlay:()=>{},onSignIn:()=>{},
    }));
  }
  const awards = catalog.gameBadges.map((b) => ({game_id:b.game,awarded_at:"2026-09-08T00:00:00Z"}));
  assert.match(render("default", awards.slice(0, 1)), /1 of 10 seals collected/);
  const complete = render("default", awards);
  assert.match(complete, /All ten seals earned/);
  assert.doesNotMatch(complete, /badge-medal is-locked/);
  assert.match(render("BadgeAwardNotice", awards), /Badge earned/);
  assert.match(render("BadgeAwardNotice", awards), /All ten collected/);
  const failed = render("BadgeAwardNotice", null, "Badges unavailable");
  assert.match(failed, /Your score is saved/);
  assert.match(failed, /Retry loading badge/);
  assert.doesNotMatch(failed, /Badge earned/);
});

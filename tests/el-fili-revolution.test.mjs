import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { readFile } from "node:fs/promises";
import test from "node:test";

import { revolutionCases, revolutionRoleLabels } from "../app/games/el-fili-revolution-files/content.ts";

test("Revolution Files has twelve distinct sourced causal cases", () => {
  assert.equal(revolutionCases.length, 12);
  assert.deepEqual(revolutionCases.map((item) => item.id), Array.from({ length: 12 }, (_, index) => `EF${String(index + 1).padStart(2, "0")}`));
  assert.equal(new Set(revolutionCases.map((item) => item.id)).size, 12);
  assert.deepEqual(revolutionRoleLabels.map((item) => item.role), ["actor", "pressure", "move", "consequence"]);

  for (const file of revolutionCases) {
    assert.equal(file.chain.length, 4, `${file.id} needs a four-link causal chain`);
    assert.deepEqual(file.chain.map((item) => item.role), ["actor", "pressure", "move", "consequence"]);
    assert.equal(file.decoys.length, 4, `${file.id} needs four plausible false links`);
    assert.equal(new Set([...file.chain, ...file.decoys].map((item) => item.id)).size, 8, `${file.id} has duplicate evidence ids`);
    assert.ok(file.briefing.length >= 70, `${file.id} needs a clear mission`);
    assert.ok(file.explanation.length >= 100, `${file.id} needs a useful debrief`);
    assert.ok(file.strategicReading.length >= 65, `${file.id} needs an interpretive takeaway`);
    assert.match(file.source, /José Rizal, El Filibusterismo/);
    assert.match(file.sourceUrl, /^https:\/\/www\.gutenberg\.org\//);
  }
});

test("Revolution Files packages original art, causal mechanics, and a layered adaptive soundtrack", async () => {
  assert.ok(existsSync(new URL("../public/art/el-fili-revolution-table.webp", import.meta.url)));
  assert.ok(existsSync(new URL("../public/audio/arcade-mystery.mp3", import.meta.url)));
  const implementation = await readFile(new URL("../app/games/el-fili-revolution-files/index.tsx", import.meta.url), "utf8");
  assert.match(implementation, /drawChallengeSet\(revolutionBank, roundSize\)/);
  assert.match(implementation, /Results game="revolution"/);
  assert.match(implementation, /AudioContext/);
  assert.match(implementation, /new Audio\("\/audio\/arcade-mystery\.mp3"\)/);
  assert.match(implementation, /noiseFilter/);
  assert.match(implementation, /onDragStart=/);
  assert.match(implementation, /onDrop=/);
  assert.match(implementation, /Illuminate a thread/);
  assert.match(implementation, /Test the chain/);
  assert.match(implementation, /Colonial exposure/);
});

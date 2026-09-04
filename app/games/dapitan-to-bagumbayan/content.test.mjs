import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { readFile } from "node:fs/promises";
import test from "node:test";

import {
  dapitanChallenges,
  EVIDENCE_OPTIONS,
  THEME_OPTIONS,
  TIMELINE_OPTIONS,
} from "./content.ts";
import { drawDapitanSession } from "./session.ts";

test("Dapitan to Bagumbayan has a complete 50-card challenge bank", () => {
  assert.equal(dapitanChallenges.length, 50);

  assert.deepEqual(
    dapitanChallenges.map((item) => item.id),
    Array.from(
      { length: 50 },
      (_, index) => `dapitan-${String(index + 1).padStart(3, "0")}`,
    ),
  );

  assert.equal(
    new Set(dapitanChallenges.map((item) => item.id)).size,
    50,
  );
});

test("every Dapitan challenge contains reviewable learning content", () => {
  for (const challenge of dapitanChallenges) {
    assert.ok(challenge.prompt.trim().length >= 10, `${challenge.id} needs a useful prompt`);
    assert.ok(challenge.answer.trim(), `${challenge.id} needs an answer`);
    assert.ok(
      challenge.explanation.trim().length >= 40,
      `${challenge.id} needs a useful explanation`,
    );
    assert.ok(
      challenge.source.trim().length >= 20,
      `${challenge.id} needs a named source`,
    );
  }
});

test("every answer belongs to the options for its task", () => {
  for (const challenge of dapitanChallenges) {
    const validAnswers =
      challenge.task === "timeline"
        ? TIMELINE_OPTIONS
        : challenge.task === "evidence"
          ? EVIDENCE_OPTIONS
          : THEME_OPTIONS;

    assert.ok(
      validAnswers.includes(challenge.answer),
      `${challenge.id} has an invalid ${challenge.task} answer`,
    );
  }
});

test("Dapitan challenge prompts are not exact duplicates", () => {
  const normalizedPrompts = dapitanChallenges.map((challenge) =>
    challenge.prompt.trim().toLowerCase(),
  );

  assert.equal(
    new Set(normalizedPrompts).size,
    dapitanChallenges.length,
  );
});

test("the challenge bank covers all three gameplay tasks", () => {
  const taskTypes = new Set(
    dapitanChallenges.map((challenge) => challenge.task),
  );

  assert.deepEqual(
    [...taskTypes].sort(),
    ["evidence", "theme", "timeline"],
  );
});

test("every ten-file session deliberately mixes all three archive tasks", () => {
  const session = drawDapitanSession({ storage: null, random: () => 0.42 });
  const counts = Object.groupBy(session, (challenge) => challenge.task);

  assert.equal(session.length, 10);
  assert.equal(counts.timeline?.length, 3);
  assert.equal(counts.evidence?.length, 4);
  assert.equal(counts.theme?.length, 3);
});

test("Chronicle Express packages its full mechanical redesign", async () => {
  assert.ok(existsSync(new URL("./chronicle-console-bg.png", import.meta.url)));

  const [implementation, styles] = await Promise.all([
    readFile(new URL("./index.tsx", import.meta.url), "utf8"),
    readFile(new URL("./dapitan.css", import.meta.url), "utf8"),
  ]);

  assert.match(implementation, /Chronicle Express/);
  assert.match(implementation, /TimelineSwitch/);
  assert.match(implementation, /SemaphoreControl/);
  assert.match(implementation, /CargoCrane/);
  assert.match(implementation, /drawDapitanSession\(\)/);
  assert.match(styles, /\.steam-train/);
  assert.match(styles, /\.boiler-gauge/);
  assert.match(styles, /\.semaphore-post/);
  assert.match(styles, /\.cargo-yard/);
});

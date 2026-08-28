import assert from "node:assert/strict";
import test from "node:test";
import { gameInstructions } from "../app/gameInstructions.ts";

const expectedGames = ["values", "novels", "codebreaker", "scholar", "hearts", "museum"];

test("every playable game has a complete pre-game briefing", () => {
  assert.deepEqual(Object.keys(gameInstructions), expectedGames);

  for (const game of expectedGames) {
    const instructions = gameInstructions[game];
    assert.equal(instructions.steps.length, 3, `${game} should have three clear steps`);
    assert.ok(instructions.title.length > 8, `${game} needs a title`);
    assert.ok(instructions.topic.length > 20, `${game} needs a topic`);
    assert.ok(instructions.goal.length > 50, `${game} needs a meaningful goal`);
    assert.ok(instructions.scoring.length > 45, `${game} needs scoring and lives guidance`);
    assert.ok(instructions.tip.length > 35, `${game} needs a useful player tip`);
    instructions.steps.forEach((step) => assert.ok(step.length > 35, `${game} has an unclear step`));
  }
});

test("instructions name the interaction that makes each game distinct", () => {
  assert.match(gameInstructions.values.steps.join(" "), /lily pads|frog/i);
  assert.match(gameInstructions.novels.steps.join(" "), /face-down|pair/i);
  assert.match(gameInstructions.codebreaker.steps.join(" "), /A becomes Z|decoded/i);
  assert.match(gameInstructions.scholar.steps.join(" "), /Study Route|passport tray/i);
  assert.match(gameInstructions.hearts.steps.join(" "), /identity seal|postmark/i);
  assert.match(gameInstructions.museum.steps.join(" "), /gallery|plaque/i);
});

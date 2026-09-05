import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const sharedAudio = await readFile(new URL("../app/games/shared/ArcadeGameKit.tsx", import.meta.url), "utf8");
const revolutionAudio = await readFile(new URL("../app/games/el-fili-revolution-files/index.tsx", import.meta.url), "utf8");

test("shared game audio discards closed contexts before reuse", () => {
  assert.match(sharedAudio, /contextRef\.current\?\.state === "closed"/);
  assert.match(sharedAudio, /contextRef\.current = null/);
  assert.match(sharedAudio, /context\.state !== "closed"/);
  assert.match(sharedAudio, /context\.close\(\)\.catch/);
});

test("Revolution Files rebuilds and safely disposes its layered audio rig", () => {
  assert.match(revolutionAudio, /current && current\.context\.state !== "closed"/);
  assert.match(revolutionAudio, /rigRef\.current = null/);
  assert.match(revolutionAudio, /rig\.context\.state !== "closed"/);
  assert.match(revolutionAudio, /rig\.context\.close\(\)\.catch/);
});

import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

test("builds the static Vercel entry with the arcade social card", async () => {
  const html = await readFile(new URL("../vercel-dist/index.html", import.meta.url), "utf8");

  assert.match(html, /<title>Rizal Arcade — History You Can Play<\/title>/i);
  assert.match(html, /https:\/\/rizal-arcade\.vercel\.app\/og-arcade\.png/i);
  assert.match(html, /<script[^>]+src="\/assets\/index-[^"]+\.js"/i);
  assert.match(html, /<link[^>]+href="\/assets\/index-[^"]+\.css"/i);
  assert.doesNotMatch(html, /\/og\.jpg/i);
});

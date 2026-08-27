import assert from "node:assert/strict";
import test from "node:test";

async function render() {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);

  return worker.fetch(
    new Request("http://localhost/", { headers: { accept: "text/html", host: "localhost" } }),
    { ASSETS: { fetch: async () => new Response("Not found", { status: 404 }) } },
    { waitUntil() {}, passThroughOnException() {} },
  );
}

test("server-renders the Rizal Arcade home page", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);

  const html = await response.text();
  assert.match(html, /<title>Rizal Arcade — History You Can Play<\/title>/i);
  assert.match(html, /Press play through/i);
  assert.match(html, /José Rizal’s life, works, and legacy\./i);
  assert.match(html, /Rizalian Values: River Quest/);
  assert.match(html, /Noli Case Files/);
  assert.match(html, /Rizal Roots: Codebreaker/);
  assert.match(html, /Scholar’s Journey/);
  assert.match(html, /200[\s\S]*sourced challenges/i);
  assert.match(html, /Classroom high scores/i);
  assert.match(html, /Student sign-in/i);
  assert.match(html, /Private section leaderboards/i);
  assert.match(html, /\/art\/rizal-portrait\.webp/);
  assert.match(html, /http:\/\/localhost\/og-arcade\.png/);
  assert.doesNotMatch(html, /codex-preview|SkeletonPreview|Your site is taking shape/i);
});

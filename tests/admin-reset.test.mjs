import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import * as jsxRuntime from "react/jsx-runtime";
import ts from "typescript";

const source = readFileSync(new URL("../app/AdminPortal.tsx", import.meta.url), "utf8");
const compiled = ts.transpileModule(`${source}\nexport { AdminSectionRoster };`, {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX },
}).outputText;

// Exercise the actual event handlers with persistent hooks and a controlled request.
function setup() {
  const students = ["A", "B"].map((id) => ({ id, student_id: id, display_name: id, active: false }));
  const state = ["section", students, "section", "", "", null];
  const refs = [];
  let cursor = 0;
  let refCursor = 0;
  const hooks = {
    useState() {
      const index = cursor++;
      return [state[index], (value) => { state[index] = typeof value === "function" ? value(state[index]) : value; }];
    },
    useRef(value) { return refs[refCursor++] ??= { current: value }; },
    useEffect() {},
  };
  const requests = [];
  const compiledModule = { exports: {} };
  const dependencies = {
    react: hooks,
    "react/jsx-runtime": jsxRuntime,
    "./auth": { getAccessToken: async () => "test-token" },
  };
  const fetch = (path, options) => new Promise((resolve) => {
    requests.push({ path, body: JSON.parse(options.body), resolve });
  });
  new Function("require", "module", "exports", "fetch", compiled)(
    (name) => dependencies[name] ?? {}, compiledModule, compiledModule.exports, fetch,
  );
  function elements(node, type) {
    if (Array.isArray(node)) return node.flatMap((child) => elements(child, type));
    if (!node || typeof node !== "object") return [];
    return [...(node.type === type ? [node] : []), ...elements(node.props?.children, type)];
  }
  return {
    requests,
    render() {
      cursor = 0;
      refCursor = 0;
      const tree = compiledModule.exports.AdminSectionRoster({ sections: [] });
      return { buttons: elements(tree, "button"), codes: elements(tree, "code"), messages: elements(tree, "p") };
    },
  };
}

test("roster serializes resets even when two clicks arrive before rerender", async () => {
  const ui = setup();
  const initial = ui.render();
  const first = initial.buttons[0].props.onClick();
  await initial.buttons[1].props.onClick();
  await initial.buttons[0].props.onClick();
  assert.equal(ui.requests.length, 1);
  assert.equal(ui.requests[0].path, "/api/admin/reset-student-password");
  assert.deepEqual(ui.requests[0].body, { studentId: "A" });
  assert.ok(ui.render().buttons.every((button) => button.props.disabled));

  ui.requests[0].resolve(Response.json({ credential: { studentId: "A", displayName: "A", temporaryPassword: "test-password-a" } }));
  await first;
  const completed = ui.render();
  assert.equal(completed.codes[0].props.children, "test-password-a");
  assert.ok(completed.buttons.every((button) => !button.props.disabled));

  const second = completed.buttons[1].props.onClick();
  await Promise.resolve();
  assert.equal(ui.requests.length, 2);
  assert.deepEqual(ui.requests[1].body, { studentId: "B" });
  ui.requests[1].resolve(Response.json({ credential: { studentId: "B", displayName: "B", temporaryPassword: "test-password-b" } }));
  await second;
  assert.equal(ui.render().codes[0].props.children, "test-password-b");
});

test("failed reset releases the guard and permits retry without showing a credential", async () => {
  const ui = setup();
  const first = ui.render().buttons[0].props.onClick();
  await Promise.resolve();
  ui.requests[0].resolve(Response.json({ error: "Reset failed" }, { status: 500 }));
  await first;
  const failed = ui.render();
  assert.equal(failed.codes.length, 0);
  assert.ok(failed.messages.some((node) => node.props.children === "Reset failed"));
  assert.ok(failed.buttons.every((button) => !button.props.disabled));

  const retry = failed.buttons[0].props.onClick();
  await Promise.resolve();
  assert.equal(ui.requests.length, 2);
  ui.requests[1].resolve(Response.json({ credential: { studentId: "A", temporaryPassword: "retry-password" } }));
  await retry;
  assert.equal(ui.render().codes[0].props.children, "retry-password");
});

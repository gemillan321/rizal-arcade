// Run against the local Vercel dev server. Set AGENT_BROWSER_CLI to an installed
// agent-browser JS entry point. This uses real DOM controls, not React internals.
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { mkdirSync } from "node:fs";
import { heartsChallenges, heartsProfilesById } from "../app/heartsChallenges.ts";
import { masterpieceChallenges } from "../app/masterpieceChallenges.ts";
import { crosswordClues } from "../app/games/rizal-crossword/content.ts";
import { dapitanChallenges, EVIDENCE_OPTIONS, TIMELINE_OPTIONS } from "../app/games/dapitan-to-bagumbayan/content.ts";

const cli = process.env.AGENT_BROWSER_CLI;
assert.ok(cli, "Set AGENT_BROWSER_CLI to the agent-browser JS entry point");
const base = process.env.TEST_URL || "http://127.0.0.1:5173/";
const output = "work/phone-review";
mkdirSync(output, { recursive: true });
function run(...args) {
  const raw = execFileSync(process.execPath, [cli, "--session", "rizal-review", "--json", ...args], { encoding: "utf8", timeout: 30000 });
  const result = JSON.parse(raw.trim());
  assert.ok(result.success, JSON.stringify(result.error));
  return result.data;
}
function evaluate(script) { return run("eval", script).result; }
function click(selector) { run("click", selector); }
function text(selector) { return evaluate(`document.querySelector(${JSON.stringify(selector)})?.textContent.trim()`); }
function clickText(selector, label) {
  const clicked = evaluate(`(() => {const el = [...document.querySelectorAll(${JSON.stringify(selector)})].find(el => el.textContent.trim() === ${JSON.stringify(label)}); if (!el) return false; el.click(); return true;})()`);
  assert.ok(clicked, `Missing ${selector}: ${label}`);
}
function visible(selector) { return evaluate(`!!document.querySelector(${JSON.stringify(selector)})?.checkVisibility()`); }
function hud(label) { return evaluate(`[...document.querySelectorAll('.game-hud > span')].find(el=>el.querySelector('small').textContent === ${JSON.stringify(label)})?.querySelector('strong').textContent`); }
function openGame(title, id) {
  if (visible('[aria-label="Close game"]')) click('[aria-label="Close game"]');
  evaluate(`document.querySelector(${JSON.stringify(`[aria-label="Play ${title}"]`)}).click()`);
  run("wait", '.game-intro');
  click('.intro-start-button');
  run("wait", `.game-${id}.is-playing`);
}
function layout(id, width, height) {
  run("set", "viewport", String(width), String(height));
  const metrics = evaluate(`(() => {const el=document.querySelector('.game-overlay');const buttons=[...el.querySelectorAll('button')].filter(b=>b.checkVisibility());return {width:el.clientWidth,scrollWidth:el.scrollWidth,clippedButtons:buttons.filter(b=>{let r=b.getBoundingClientRect();return r.left < -1 || r.right > innerWidth+1}).map(b=>b.textContent.trim())}})()`);
  assert.ok(metrics.scrollWidth <= metrics.width + 1, `${id} overflows at ${width}: ${JSON.stringify(metrics)}`);
  assert.deepEqual(metrics.clippedButtons, [], `${id} clips buttons at ${width}`);
}
run("open", base);
run("set", "viewport", "390", "844");
if (!process.env.TEST_FROM) {
openGame("Hearts & Horizons", "hearts");
for (const [w,h] of [[320,568],[360,640],[390,844],[430,932]]) {
  layout("hearts",w,h);
  assert.ok(evaluate(`(()=>{let e=document.querySelector('.hearts-dossier');return e.scrollHeight <= e.clientHeight+1})()`), "Evidence must not need an inner scroll");
}
run("set", "viewport", "390", "844");
run("screenshot", `${output}/hearts-phone.png`);
for (let round=0; round<6; round++) {
  const id = text('.dossier-topline span').split(' · ')[0];
  const work = heartsChallenges.find(work => work.id === id);
  const profile = heartsProfilesById[work.womanId];
  if (round === 0) {
    evaluate(`(()=>{const expected=${JSON.stringify(profile.name)};[...document.querySelectorAll('.identity-panel button')].find(b=>b.querySelector('strong').textContent !== expected).click()})()`);
    clickText('.horizon-panel button strong', profile.place);
    click('.hearts-seal-button');
    run('wait', '1000'); // Regress the former 700ms correction-panel timeout.
    assert.ok(visible('.identity-panel'), 'Wrong identity must remain open');
    assert.equal(hud('Lives'), '♥♥♥');
  }
  clickText('.identity-panel button strong', profile.name);
  if (visible('.horizon-panel')) clickText('.horizon-panel button strong', profile.place);
  assert.ok(visible('.hearts-ready-recap'));
  click('.hearts-seal-button');
  run('wait', '.hearts-feedback');
  click('.hearts-feedback button');
}
assert.ok(visible('.results-shell'), 'Hearts should finish six dossiers');
console.log('PASS Hearts: 4 phone sizes, persistent correction, six-dossier completion');

openGame('Masterpiece Museum','museum');
for (const [w,h] of [[320,568],[360,640],[390,844],[430,932]]) layout('museum',w,h);
run('set','viewport','390','844');
run('screenshot',`${output}/museum-phone.png`);
for (let round=0; round<6; round++) {
  const evidence = text('.museum-source-card li p');
  const work = masterpieceChallenges.find(work=>work.evidence[0] === evidence);
  assert.ok(work);
  const accurate = text('.museum-proposed-label blockquote') === work.correctPlaque;
  const decision = round===0 ? !accurate : accurate;
  assert.equal(evaluate(`document.querySelector('.museum-confirm').disabled`),true);
  click(`.museum-verdicts button:nth-child(${decision ? 1 : 2})`);
  assert.equal(visible('.museum-inspection-feedback'),false);
  click('.museum-confirm');
  run('wait','.museum-inspection-feedback');
  if(round===0) assert.equal(hud('Lives'),'♥♥♥');
  click('.museum-inspection-feedback button');
}
assert.ok(visible('.results-shell'), 'Museum should finish six inspections');
console.log('PASS Museum: 4 phone sizes, explicit confirmation, wrong-label correction, six-exhibit completion');

openGame('Dapitan to Bagumbayan','dapitan');
run('wait','.chronicle-phone-choices');
for (const [w,h] of [[320,568],[360,640],[390,844],[430,932]]) layout('dapitan',w,h);
run('set','viewport','390','844');
run('screenshot',`${output}/dapitan-phone.png`);
const tasks = new Set();
for(let round=0; round<10; round++) {
  run('wait','.chronicle-phone-choices');
  const prompt = text('#chronicle-file-title');
  const work = dapitanChallenges.find(work=>work.prompt===prompt);
  assert.ok(work); tasks.add(work.task);
  const score = hud('Score');
  assert.equal(evaluate(`document.querySelector('.chronicle-confirmation button').disabled`),true);
  click('.chronicle-phone-choices button');
  assert.equal(visible('.chronicle-resolution'),false);
  assert.equal(hud('Score'),score);
  clickText('.chronicle-phone-choices button > span',work.answer);
  evaluate(`(()=>{const b=document.querySelector('.chronicle-confirmation button'); b.click();b.click();})()`);
  run('wait','.chronicle-resolution');
  assert.equal(Number(hud('Score')), Number(score)+100+Math.min(round,4)*20, 'Confirm must score exactly once');
  click('.chronicle-resolution button');
}
run('wait','.chronicle-results');
assert.equal(tasks.size,3);
console.log('PASS Dapitan: all 3 tasks, changed selections, double-confirm guard, ten-file completion');
}

if (process.env.TEST_FROM !== 'controls') {
openGame('Rizal & the Nation: Crossword Chronicle','crossword');
for(const [w,h] of [[320,568],[360,640],[390,844],[430,932]]) {
  layout('crossword',w,h);
  assert.ok(evaluate(`(()=>{const grid=document.querySelector('.crossword-grid'),frame=document.querySelector('.crossword-grid-scroll');return grid.getBoundingClientRect().width <= frame.clientWidth})()`),`Whole crossword must fit at ${w}`);
}
run('set','viewport','390','844');
run('screenshot',`${output}/crossword-phone.png`);
assert.equal(evaluate(`document.activeElement.matches('input, textarea, [contenteditable="true"]')`),false,'Phone keyboard must stay closed until input is tapped');
click('.crossword-zoom-toggle');
assert.equal(text('.crossword-zoom-toggle'),'Fit whole puzzle');
click('.crossword-zoom-toggle');
click('.crossword-clue-toggle');
assert.ok(visible('.crossword-clue-index'));
click('.crossword-clue-index button');
assert.equal(visible('.crossword-clue-index'),false);
run('fill','.crossword-answer input','WRONG');
click('.crossword-actions button:last-child');
assert.equal(hud('Ink'),'4');
assert.ok(visible('.typeset-warning'));
const clue = text('.active-crossword-clue');
const entry = crosswordClues.find(entry=>entry.clue === clue);
assert.ok(entry);
run('fill','.crossword-answer input',entry.answer);
click('.crossword-actions button:last-child');
run('wait','.crossword-feedback');
assert.equal(hud('Words'),'1 / 8');
assert.ok(visible('.crossword-cell.is-solved'));
click('.crossword-feedback button');
console.log('PASS Crossword: whole-grid fit at 4 widths, zoom, clue selection, answer feedback');

for(const [title,id,selector] of [
  ['Hearts & Horizons','hearts','.hearts-desk'],
  ['Masterpiece Museum','museum','.museum-inspection-desk'],
  ['Dapitan to Bagumbayan','dapitan','.chronicle-console'],
  ['Rizal & the Nation: Crossword Chronicle','crossword','.crossword-pressroom'],
]) {
  openGame(title,id);
  layout(id,1440,900);
  assert.ok(visible(selector));
  run('screenshot',`${output}/${id}-desktop.png`);
}
console.log('PASS Desktop: four game layouts fit and render at 1440 × 900');
run('set','viewport','390','844');
for (const [title,id] of [
  ['Rizalian Values: River Quest','values'], ['Noli Case Files','novels'],
  ['Rizal Roots: Codebreaker','codebreaker'], ['Scholar’s Journey','scholar'],
  ['Global Sojourn — Chart the Journey','global'], ['El Fili: Revolution Files','revolution'],
]) {
  openGame(title,id);
  assert.ok(evaluate(`document.querySelector('.game-overlay.is-playing').innerText.length > 100`));
}
console.log('PASS Other six games: instructions and gameplay launch on phone');
}

run('set','viewport','1440','900');
openGame('Dapitan to Bagumbayan','dapitan');
run('wait','.chronicle-console');
const controlsSeen = new Set();
for(let round=0; round<10; round++) {
  run('wait','#chronicle-file-title');
  const prompt = text('#chronicle-file-title');
  const work = dapitanChallenges.find(work=>work.prompt===prompt);
  const beforeScore = hud('Score');
  if(work.task !== 'theme') {
    const selector = work.task==='timeline' ? '.switch-lever-track' : '.signal-lever-slot';
    evaluate(`document.querySelector(${JSON.stringify(selector)}).scrollIntoView({block:'center'})`);
    const rect = evaluate(`(()=>{let r=document.querySelector(${JSON.stringify(selector)}).getBoundingClientRect();return {x:r.x+r.width*.35,y:r.y+r.height*.35,width:r.width,height:r.height}})()`);
    run('mouse','move',String(Math.round(rect.x)),String(Math.round(rect.y)));
    run('mouse','down','left');
    run('mouse','move',String(Math.round(rect.x + (work.task==='timeline' ? rect.width*.3 : 0))),String(Math.round(rect.y + (work.task==='evidence' ? rect.height*.3 : 0))));
    run('mouse','up','left');
    assert.equal(visible('.chronicle-resolution'),false,'Releasing the lever must never submit');
    assert.equal(hud('Score'),beforeScore);
    click(selector);
    run('press','Home');
    assert.equal(evaluate(`document.querySelector(${JSON.stringify(selector)}).getAttribute('aria-valuenow')`),'1');
    run('press',work.task==='timeline' ? 'ArrowRight' : 'ArrowDown');
    assert.equal(evaluate(`document.querySelector(${JSON.stringify(selector)}).getAttribute('aria-valuenow')`),'2');
    // Number keys select only. Confirmation remains an explicit second action.
    evaluate('document.activeElement.blur()');
    const options = work.task==='timeline' ? TIMELINE_OPTIONS : EVIDENCE_OPTIONS;
    run('press',String(options.indexOf(work.answer)+1));
    assert.equal(visible('.chronicle-resolution'),false);
    click('.chronicle-confirmation button');
    run('wait','.chronicle-resolution');
    controlsSeen.add(work.task);
  } else {
    clickText('.theme-crate strong',work.answer);
    assert.equal(visible('.chronicle-resolution'),false);
    click('.cargo-carriage-drop');
    run('wait','.chronicle-resolution');
  }
  if(controlsSeen.size===2) break;
  click('.chronicle-resolution button');
  run('wait','.chronicle-console:has(.chronicle-phone-choices)');
}
assert.equal(controlsSeen.size,2);
console.log('PASS Desktop levers: pointer release, arrow keys, number selection, separate confirmation');
const errors = run('errors');
assert.deepEqual(errors.errors, []);
console.log('PASS No browser runtime errors');

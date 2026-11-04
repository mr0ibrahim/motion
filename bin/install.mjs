#!/usr/bin/env node
// npx motion-graphics-skill [--agent <id>[,<id>]] [-g|--global] [--dir <project>] [--list] [-y]
import { cpSync, existsSync, mkdirSync, rmSync } from 'node:fs';
import { homedir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import readline from 'node:readline/promises';

const NAME = 'motion-graphics';
const SRC = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'skills', NAME);
// project dir, global dir (relative to $HOME). Same layout as the open `skills` CLI.
const AGENTS = {
  'claude-code':    ['.claude/skills', '.claude/skills'],
  'cursor':         ['.agents/skills', '.agents/skills'],
  'codex':          ['.agents/skills', '.agents/skills'],
  'opencode':       ['.agents/skills', '.agents/skills'],
  'gemini-cli':     ['.agents/skills', '.agents/skills'],
  'github-copilot': ['.agents/skills', '.agents/skills'],
  'antigravity':    ['.agents/skills', '.gemini/config/skills'], // App + IDE + CLI global (antigravity.google/docs/skills)
  'windsurf':       ['.windsurf/skills', '.codeium/windsurf/skills'],
  'universal':      ['.agents/skills', '.agents/skills'],
};
const DETECT = { 'claude-code': '.claude', cursor: '.cursor', codex: '.codex', opencode: '.config/opencode',
  'gemini-cli': '.gemini', 'github-copilot': '.copilot', windsurf: '.codeium/windsurf', antigravity: '.gemini/antigravity' };

const a = process.argv.slice(2);
const has = (...f) => f.some(x => a.includes(x));
const val = f => { const i = a.indexOf(f); return i >= 0 ? a[i + 1] : undefined; };
if (has('-h', '--help')) {
  console.log(`Install the ${NAME} skill.\n\n  npx motion-graphics-skill [options]\n\n  -a, --agent <ids>  comma list or "all": ${Object.keys(AGENTS).join(', ')}\n  -g, --global       install for your user (~) instead of the current project\n  --dir <path>       project folder (default: cwd)\n  -y, --yes          no prompts (detected agents, or universal + claude-code)\n  --list             show agents and target folders`);
  process.exit(0);
}
const global = has('-g', '--global');
const base = global ? homedir() : path.resolve(val('--dir') || process.cwd());
const target = id => path.join(base, AGENTS[id][global ? 1 : 0], NAME);
if (has('--list')) { for (const id of Object.keys(AGENTS)) console.log(id.padEnd(15), target(id)); process.exit(0); }

let ids = (val('--agent') || val('-a') || '').split(',').filter(Boolean);
if (ids.includes('all')) ids = Object.keys(AGENTS);
if (!ids.length) {
  const found = Object.keys(DETECT).filter(id => existsSync(path.join(homedir(), DETECT[id])) || existsSync(path.join(base, DETECT[id].split('/')[0])));
  const def = found.length ? found : ['claude-code', 'universal'];
  if (has('-y', '--yes') || !process.stdin.isTTY) ids = def;
  else {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    const ans = await rl.question(`Agents (${Object.keys(AGENTS).join(', ')}, all)\n[${def.join(',')}]: `);
    rl.close();
    ids = ans.trim() ? ans.split(',').map(s => s.trim()) : def;
    if (ids.includes('all')) ids = Object.keys(AGENTS);
  }
}
const bad = ids.filter(id => !AGENTS[id]);
if (bad.length) { console.error(`Unknown agent: ${bad.join(', ')}. Use --list.`); process.exit(1); }

const done = new Map();
for (const id of ids) {
  const dst = target(id);
  if (!done.has(dst)) {
    rmSync(dst, { recursive: true, force: true });
    mkdirSync(path.dirname(dst), { recursive: true });
    cpSync(SRC, dst, { recursive: true, filter: s => !/node_modules/.test(path.relative(SRC, s)) });
    done.set(dst, []);
  }
  done.get(dst).push(id);
}
for (const [dst, who] of done) console.log(`✓ ${dst}  (${who.join(', ')})`);
console.log(`\nNext (once): cd "${[...done.keys()][0]}" && npm i && npx playwright install chromium\nAlso needs ffmpeg + Python 3 (numpy, scipy, pillow).`);

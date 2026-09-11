/**
 * EVERY GATE, ONE COMMAND.
 *
 *   npm run gates
 *
 * Typecheck, build, the honesty audit, then the freshly built site served on a
 * port of its own and checked by the contrast audit and the patient journey on
 * desktop and phone. Exit 1 means do not push.
 *
 * WHY IT SERVES ITS OWN BUILD. A finished feature once sat invisible for a whole
 * conversation because the server being looked at was still serving an older
 * build. The browser gates here run against the build this command just made,
 * on a port nothing else is using, so "it passed" always means THIS code.
 */
import { spawn, spawnSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import net from 'node:net';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const results = [];

const run = (label, cmd, args) => {
  process.stdout.write(`\n▶ ${label}\n`);
  const r = spawnSync(cmd, args, { cwd: root, stdio: 'inherit', shell: true });
  results.push({ label, ok: r.status === 0 });
  return r.status === 0;
};

/* A port the OS confirms is free, rather than one that merely looks unused. */
const freePort = () =>
  new Promise((resolve, reject) => {
    const s = net.createServer();
    s.listen(0, () => { const { port } = s.address(); s.close(() => resolve(port)); });
    s.on('error', reject);
  });

const waitFor = async (url, ms = 20000) => {
  const until = Date.now() + ms;
  while (Date.now() < until) {
    try { if ((await fetch(url)).ok) return true; } catch { /* not up yet */ }
    await new Promise((r) => setTimeout(r, 300));
  }
  return false;
};

let ok = run('typecheck', 'npx', ['tsc', '--noEmit'])
  && run('build', 'npm', ['run', 'build'])
  && run('honesty audit', 'node', ['scripts/audit-honesty.mjs']);

if (ok) {
  // Runs its own servers against a stand-in email service; never the real inbox.
  run('contact delivery', 'node', ['scripts/audit-contact.mjs']);

  const server = join(root, 'dist', 'server.cjs');
  if (!existsSync(server)) {
    console.error('\n✗ dist/server.cjs missing after build');
    ok = false;
  } else {
    const port = await freePort();
    const base = `http://localhost:${port}`;
    const child = spawn(process.execPath, [server], {
      cwd: root,
      env: { ...process.env, PORT: String(port), NODE_ENV: 'production' },
      stdio: 'ignore',
    });
    try {
      if (!(await waitFor(base + '/'))) {
        console.error(`\n✗ the fresh build never answered on ${base}`);
        results.push({ label: 'serve fresh build', ok: false });
      } else {
        console.log(`\n  serving THIS build on ${base}`);
        run('contrast audit', 'node', ['scripts/audit-contrast.mjs', base]);
        run('patient journey — desktop', 'node', ['scripts/audit-journey.mjs', base]);
        run('patient journey — phone', 'node', ['scripts/audit-journey.mjs', base, 'mobile']);
      }
    } finally {
      child.kill();
    }
  }
}

const failed = results.filter((r) => !r.ok);
console.log(`\n${'='.repeat(64)}`);
for (const r of results) console.log(`  ${r.ok ? 'PASS' : 'FAIL'}  ${r.label}`);
console.log(failed.length ? `\nGATES: ${failed.length} failed — do not push` : `\nGATES: all ${results.length} passed`);
process.exit(failed.length ? 1 : 0);

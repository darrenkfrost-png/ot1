/**
 * Build the site so that search engines are allowed to index it.
 *
 *   npm run build:live
 *
 * A wrapper rather than `LIVE=1 npm run build` because that syntax does not
 * work in the Windows shell npm uses by default, and adding cross-env for one
 * variable is a dependency this project does not need.
 */
import { spawnSync } from 'node:child_process';

const r = spawnSync('npm', ['run', 'build'], {
  stdio: 'inherit',
  shell: true,
  env: { ...process.env, LIVE: '1' },
});
process.exit(r.status ?? 1);

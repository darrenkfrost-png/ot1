#!/usr/bin/env node
/**
 * Starts the CT6 Wellbeing site for a preview pane.
 *
 * Runs the development server, so what you see is the working tree as it is
 * right now — edits appear without a rebuild. Kept as a script with an absolute
 * entry point so a launcher in another folder can start it without needing to
 * change directory first.
 */
const { spawn } = require('node:child_process');
const path = require('node:path');

const root = path.join(__dirname, '..');
const port = process.env.PORT || '3300';

console.log(`Starting CT6 Wellbeing (dev) from ${root} on port ${port}`);

const child = spawn(process.platform === 'win32' ? 'npm.cmd' : 'npm', ['run', 'dev'], {
  cwd: root,
  env: { ...process.env, PORT: String(port) },
  stdio: 'inherit',
  shell: process.platform === 'win32',
});

child.on('exit', (code) => process.exit(code ?? 0));
child.on('error', (error) => {
  console.error('Could not start the preview:', error.message);
  process.exit(1);
});

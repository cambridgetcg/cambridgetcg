import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
const root = fileURLToPath(new URL('../', import.meta.url));
const checks = [
  [process.execPath, 'scripts/build.mjs', '--check'],
  [process.execPath, '--test', 'tests/model.test.mjs', 'tests/core.test.mjs', 'tests/site.test.mjs'],
  [process.env.PYTHON || 'python3', '-B', '-m', 'unittest', 'discover', '-s', 'tests', '-p', 'test_packaging.py'],
];
for (const [command, ...args] of checks) {
  const result = spawnSync(command, args, { cwd: root, stdio: 'inherit', timeout: 25000 });
  if (result.error) { console.error(result.error.message); process.exit(1); }
  if (result.status !== 0) process.exit(result.status || 1);
}
console.log('Verified: exact build outputs, core snapshots, model invariants, static delivery and packaging boundaries.');

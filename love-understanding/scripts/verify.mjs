import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
const root = fileURLToPath(new URL('../', import.meta.url));
for (const args of [['scripts/build.mjs', '--check'], ['--test', 'tests/model.test.mjs', 'tests/core.test.mjs', 'tests/site.test.mjs']]) {
  const result = spawnSync(process.execPath, args, { cwd: root, stdio: 'inherit', timeout: 25000 });
  if (result.error) { console.error(result.error.message); process.exit(1); }
  if (result.status !== 0) process.exit(result.status || 1);
}
console.log('Verified: exact build outputs, core snapshots, model invariants and static delivery boundaries.');

#!/usr/bin/env node
// Offline fixture builder. Never installs, fetches, deploys, or executes npm scripts.
// Upstream Apache-2.0 code and notices remain byte-for-byte in vendor/love-geometry/.
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { lstat, mkdir, readFile, writeFile } from 'node:fs/promises';

const ROOT = new URL('../', import.meta.url);
const NAME = '@agenttool/love-geometry';
const VERSION = '0.1.0-dev.0';
const METADATA_URL = 'https://registry.npmjs.org/@agenttool%2Flove-geometry/0.1.0-dev.0';
const TARBALL_URL = 'https://registry.npmjs.org/@agenttool/love-geometry/-/love-geometry-0.1.0-dev.0.tgz';
const INTEGRITY = 'sha512-RODi00WbbYx+QLBTlEflDGSZb3rBzRyYJ8/gpNE6f7j6QqcVQPHUdLkDiSV3d4OX01PFFX/qstNyc9ksfzTuyQ==';
const TARBALL_SHA256 = '43cfbf4b559aa6f573d9d7b7a60e2a7dce5dfa4aefe2bf5b9c92310c926a9db8';
const VENDOR = 'vendor/love-geometry/';
// Each pin was computed from an explicitly allowlisted regular archive member,
// only AFTER the downloaded archive passed its npm SHA512 and pinned SHA256.
const FILES = Object.freeze({
  'package.json': 'cd5ef90586c08e2b7ca2f6a9f973605a90c31e76fa1da1f06c580747f5de55d6',
  'dist/index.js': 'cf9d3fc48164d97076a2a2624bf0e8e2eb53417b4a62247c42e9087c28846423',
  'dist/index.d.ts': '529c8f318521e64f591d12c4120245977e24c262437896696d975eff81a84e1a',
  'dist/index.js.map': 'afd6226247e7c6367dff0bb7d3c8f1557873f213fce8030e131a43a2824db827',
  'dist/index.d.ts.map': '880a75e86832f95640139bf1de6e0d0761608c2ab15e4c56b8578c0719fa9adb',
  LICENSE: 'ff59de47649a5a2ebc3c931d2741de72a25c0bc2ebb19d543c9fea5168e2fbad',
  NOTICE: 'e21af81afb6cf68012d2065e3d99e0b607f7d0be9fdfb2d899fc7701c893b384',
  'README.md': '77783e0ec949c84828fa5a2294c893e817e7899899f9a07daa90362e307c0e18',
  'schema/agenttool-love-geometry-v0.1.schema.json': '525a512bae74d7a7eb11df544765e8bd4ff48f2ddbfb8270c21c68cebcc22e6c',
  'vectors/agenttool-love-geometry-v0.1.json': 'f6ec67f913382d9cb71ffe2d3c07bda0c3ada6102b518cf7dbe9c27dffcdcf20',
  'kingdom.extension.json': '31109d74693cde59b3899ca80b623be1510b77263dc0188d6692a7fafd6a2bfe',
});
const hash = (bytes, algorithm = 'sha256', encoding = 'hex') =>
  createHash(algorithm).update(bytes).digest(encoding);
const json = (value) => `${JSON.stringify(value, null, 2)}\n`;
async function readRegular(path) {
  const url = new URL(path, ROOT);
  assert((await lstat(url)).isFile(), `${path} must be a regular file, not a symlink`);
  return readFile(url);
}
function assertFrozen(value) {
  if (value !== null && typeof value === 'object') {
    assert(Object.isFrozen(value), 'Core snapshots must be deeply immutable');
    for (const child of Object.values(value)) assertFrozen(child);
  }
}

async function main() {
  const args = process.argv.slice(2);
  assert(args.length === 0 || (args.length === 1 && args[0] === '--check'),
    'Usage: node scripts/build.mjs [--check]');
  const check = args[0] === '--check';

  // Fail closed BEFORE importing upstream executable code. No network is used.
  const archive = await readRegular(`vendor/love-geometry-${VERSION}.tgz`);
  assert.equal(`sha512-${hash(archive, 'sha512', 'base64')}`, INTEGRITY, 'Archive SHA512 mismatch');
  assert.equal(hash(archive), TARBALL_SHA256, 'Archive SHA256 mismatch');
  const metadataBytes = await readRegular(`vendor/love-geometry-${VERSION}.metadata.json`);
  const metadata = JSON.parse(metadataBytes);
  assert.equal(metadata.name, NAME);
  assert.equal(metadata.version, VERSION);
  assert.equal(metadata.dist.tarball, TARBALL_URL);
  assert.equal(metadata.dist.integrity, INTEGRITY);
  const preserved = new Map();
  for (const [file, expected] of Object.entries(FILES)) {
    const bytes = await readRegular(`${VENDOR}${file}`);
    assert.equal(hash(bytes), expected, `Vendored file integrity mismatch: ${file}`);
    preserved.set(file, bytes);
  }
  const manifest = JSON.parse(preserved.get('package.json'));
  assert.equal(manifest.name, NAME);
  assert.equal(manifest.version, VERSION);
  assert.equal(manifest.type, 'module');
  assert.equal(manifest.license, 'Apache-2.0');
  assert.equal(Object.keys(manifest.dependencies ?? {}).length, 0);
  const {
    createLoveGeometry, validateLoveGeometry, encodeLoveGeometry,
    sha256Id, loveGeometryDomainBytes, loveGeometryUrn,
  } = await import(new URL(`${VENDOR}dist/index.js`, ROOT).href);

  // Verify every expected value in the official packed vector, not a substitute.
  const vector = JSON.parse(preserved.get('vectors/agenttool-love-geometry-v0.1.json'));
  const official = validateLoveGeometry(createLoveGeometry(vector.input));
  assertFrozen(official);
  assert.deepEqual({
    geometry_id: official.geometry_id,
    canonical_json_sha256: sha256Id(encodeLoveGeometry(official)),
    domain_byte_length: loveGeometryDomainBytes(official).byteLength,
    subject_refs: official.subject_refs,
    vantages: official.vantages,
    urn: loveGeometryUrn(official),
  }, vector.expected, 'Official upstream vector mismatch');

  // Exact public UTF-8 tokens. These are invented demonstration labels, NOT
  // anonymised people, secrets, evidence, agent identities, or private state.
  const schema = 'love-understanding.examples/1';
  const labels = ['Visitor', 'Host', 'Maker', 'Witness', 'Neighbour', 'Quiet seat'];
  const subjectTokens = labels.map((label) => `${schema}:subject:${label}`);
  const subjects = labels.map((label, index) => ({ ref: sha256Id(subjectTokens[index]), label }));
  const refs = Object.fromEntries(subjects.map(({ ref, label }) => [label, ref]));
  const ids = ['welcome', 'divergence', 'rest', 'quiet', 'empty'];
  const scopeTokens = Object.fromEntries(ids.map((id) => [id, `${schema}:scope:${id}`]));
  const report = (from, toward, bearings) => ({
    subject_ref: refs[from],
    toward_ref: refs[toward],
    bearings,
    basis_refs: [], // No fabricated evidence or reason required for rest.
    assertion: 'caller_reported',
    verified_by_package: false,
  });
  const definitions = [
    {
      id: 'welcome',
      title: 'A welcome has a direction',
      summary: 'A synthetic caller report attributes care and support from Host toward Visitor. No reverse report is supplied.',
      lesson: 'An arrow records a directed, caller-attributed, unverified report—not an emotion, ranking, consent, or reciprocal relationship. Reading it never authorises action.',
      reports: [report('Host', 'Visitor', ['reported_care', 'reported_support'])],
    },
    {
      id: 'divergence',
      title: 'Understanding can include disagreement',
      summary: 'Maker toward Witness carries reported understanding and disagreement together. The independent Witness toward Maker report carries a boundary.',
      lesson: 'Bearings can coexist without cancelling each other. A reverse report is independent, not a mirror, reconciliation, or proof of mutual understanding.',
      reports: [
        report('Maker', 'Witness', ['reported_understanding', 'reported_disagreement']),
        report('Witness', 'Maker', ['reported_boundary']),
      ],
    },
    {
      id: 'rest',
      title: 'Care leaves room for rest',
      summary: 'A synthetic report from Neighbour toward Host carries care and rest together, with no basis or explanation supplied.',
      lesson: 'Rest is welcome. It requires no reason, incurs no penalty, and triggers no retry, wake-up, continuation, or other action.',
      reports: [report('Neighbour', 'Host', ['reported_care', 'reported_rest'])],
    },
    {
      id: 'quiet',
      title: 'A quiet field is complete enough',
      summary: 'All six synthetic subjects are present and isolated. No reports are supplied.',
      lesson: 'Quiet is welcome. An absent report means not observed in this bounded snapshot—not that no relation exists. Screen positions are layout only, never distance, intensity, or rank.',
      reports: [],
    },
    {
      id: 'empty',
      title: 'An empty field is valid',
      summary: 'There are no subjects and no reports in this snapshot.',
      lesson: 'Empty is a valid core geometry, not a failure or a demand to participate. No identity, relationship, obligation, or action is inferred.',
      reports: [],
    },
  ];
  const scenarios = definitions.map(({ reports, ...description }) => {
    const input = {
      scope_ref: sha256Id(scopeTokens[description.id]),
      subject_refs: description.id === 'empty' ? [] : subjects.map(({ ref }) => ref),
      vantages: reports,
    };
    const created = createLoveGeometry(input);
    assertFrozen(created);
    const validated = validateLoveGeometry(created);
    const encoded = encodeLoveGeometry(validated);
    const geometry = validateLoveGeometry(JSON.parse(encoded));
    assert.deepEqual(geometry, created, 'Serialization changed the core snapshot');
    assert.equal(encodeLoveGeometry(geometry), encoded);
    assertFrozen(geometry);
    // Reordering caller input must not change a core snapshot or its content ID.
    const reversed = createLoveGeometry({
      ...input,
      subject_refs: [...input.subject_refs].reverse(),
      vantages: [...reports].reverse().map((vantage) => ({
        ...vantage, bearings: [...vantage.bearings].reverse(),
      })),
    });
    assert.equal(encodeLoveGeometry(reversed), encoded);
    return { ...description, geometry };
  });
  const examples = { schema, subjects, scenarios };
  assert.deepEqual(scenarios.map(({ id }) => id), ids);
  assert.deepEqual(scenarios.map(({ geometry }) => geometry.subject_refs.length), [6, 6, 6, 6, 0]);
  assert.deepEqual(scenarios.map(({ geometry }) => geometry.vantages.length), [1, 2, 1, 0, 0]);

  const examplesBytes = json(examples);
  const provenance = {
    schema: 'love-understanding.core-provenance/1',
    name: NAME,
    version: VERSION,
    experimental: true,
    version_status: 'Experimental development prerelease, pinned exactly; no stability or production-readiness claim.',
    npm_metadata_url: METADATA_URL,
    tarball_url: TARBALL_URL,
    integrity: INTEGRITY,
    tarball_sha256: TARBALL_SHA256,
    metadata_sha256: hash(metadataBytes),
    vendored_module: { path: `${VENDOR}dist/index.js`, sha256: FILES['dist/index.js'] },
    vendored_files: Object.entries(FILES).map(([path, sha256]) => ({ path: `${VENDOR}${path}`, sha256 })),
    verification: {
      acquisition: 'npm SHA512 integrity and independently pinned tarball SHA256 verified before copying allowlisted regular files. Original package bytes preserved.',
      build: 'Archive SHA512/SHA256 and all vendored file SHA256 pins checked before Node imports the module; official packed vector verified on every build and check.',
      limitations: 'Integrity binds bytes; it does not authenticate a subject or prove report truth, authority, package safety, or publisher identity.',
      official_vector: {
        path: `${VENDOR}vectors/agenttool-love-geometry-v0.1.json`,
        geometry_id: vector.expected.geometry_id,
        canonical_json_sha256: vector.expected.canonical_json_sha256,
      },
    },
    execution: 'build-time-only',
    browser_executes_core: false,
    browser_role: 'The browser displays prevalidated build-time fixtures. The original core imports node:crypto and node:util/types; it is not executed, emulated, or bundled into this browser page.',
    build_command: 'node scripts/build.mjs',
    check_command: 'node scripts/build.mjs --check',
    build_network: false,
    npm_lifecycle_scripts_executed: false,
    scenarios_sha256: hash(examplesBytes),
    synthetic_inputs: {
      encoding: 'UTF-8; sha256Id from the pinned upstream core hashes these exact public strings without a trailing newline.',
      subject_tokens: subjects.map(({ ref, label }, index) => ({ label, token: subjectTokens[index], ref })),
      scope_tokens: ids.map((id) => ({ id, token: scopeTokens[id], ref: sha256Id(scopeTokens[id]) })),
      basis_refs: 'Empty in every scenario: no evidence or private input is claimed.',
      privacy: 'Entirely synthetic, openly documented tokens. Hashing these guessable public labels provides no anonymity, privacy, identity, or unlinkability claim.',
    },
    interpretation: [
      'Directed caller-attributed, unverified reports—not rankings, emotions, consent, authority, or relationship truth.',
      'Canonical ordering is serialization, not rank. Screen positions are layout only.',
      'No reverse or transitive relationship is inferred; independent reverse reports may differ.',
      'Rest, quiet, refusal, departure, and empty fields are welcome without penalty or automatic triggers.',
      'Reading input never authorises action. No credentials, private data, agent identity, or autonomous hooks are used.',
    ],
    licensing: {
      spdx: 'Apache-2.0',
      attribution: 'AgentTool Love Geometry — Copyright 2026 AgentTool contributors. Vendored upstream files are unmodified.',
      source_repository: 'https://github.com/cambridgetcg/agenttool/tree/main/packages/love-geometry',
      license_path: `${VENDOR}LICENSE`,
      notice_path: `${VENDOR}NOTICE`,
      // Public site-only deployment retains accessible license and notice text.
      license_text: preserved.get('LICENSE').toString('utf8'),
      notice_text: preserved.get('NOTICE').toString('utf8'),
    },
  };
  const outputs = [
    ['site/scenarios.json', examplesBytes],
    ['site/core-provenance.json', json(provenance)],
  ];
  if (check) {
    // No mkdir, writeFile, network calls, or generated timestamps on this path.
    for (const [path, expected] of outputs) {
      let actual;
      try { actual = await readRegular(path); }
      catch (error) {
        if (error.code === 'ENOENT') throw new Error(`${path} is missing; run node scripts/build.mjs`);
        throw error;
      }
      assert(actual.equals(Buffer.from(expected)), `${path} is stale; run node scripts/build.mjs`);
    }
  } else {
    await mkdir(new URL('site/', ROOT), { recursive: true });
    for (const [path, bytes] of outputs) await writeFile(new URL(path, ROOT), bytes, 'utf8');
  }
  console.log(`PASS ${check ? 'check (no writes)' : 'build'}: 5 validated scenarios; official upstream vector; SHA512 archive and 11 vendored SHA256 pins`);
  for (const [path, bytes] of outputs) console.log(`${hash(bytes)}  ${path}`);
}

main().catch((error) => {
  console.error(`Build failed: ${error.message}`);
  process.exitCode = 1;
});

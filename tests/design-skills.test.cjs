const assert = require('node:assert/strict');
const { mkdtempSync, readFileSync, writeFileSync, chmodSync, existsSync, rmSync } = require('node:fs');
const { tmpdir } = require('node:os');
const path = require('node:path');
const { spawnSync } = require('node:child_process');
const { test } = require('node:test');

const launcher = path.resolve(__dirname, '../.agents/skills/impeccable/scripts/impeccable');

test('project launcher exits without downloading when no engine is installed', () => {
  const dir = mkdtempSync(path.join(tmpdir(), 'community-cases-skill-'));
  try {
    const cache = path.join(dir, 'cache');
    const result = spawnSync('/bin/sh', [launcher, 'context'], {
      env: { PATH: '/usr/bin:/bin', IMPECCABLE_HOME: cache },
      encoding: 'utf8',
      timeout: 5000,
    });
    assert.equal(result.error, undefined);
    assert.equal(result.status, 127);
    assert.match(result.stderr, /automatic download is disabled/);
    assert.equal(existsSync(cache), false);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test('project launcher preserves arguments and skill location for an installed engine', () => {
  const dir = mkdtempSync(path.join(tmpdir(), 'community-cases-skill-'));
  try {
    const engine = path.join(dir, 'installed-engine');
    writeFileSync(engine, '#!/bin/sh\nprintf "%s\\n" "$IMPECCABLE_SKILL_DIR" "$@"\n');
    chmodSync(engine, 0o700);
    const result = spawnSync('/bin/sh', [launcher, 'context', '--target', 'a path with spaces.html'], {
      env: { PATH: '/usr/bin:/bin', IMPECCABLE_BIN: engine },
      encoding: 'utf8',
      timeout: 5000,
    });
    assert.equal(result.error, undefined);
    assert.equal(result.status, 0);
    assert.deepEqual(result.stdout.trimEnd().split('\n'), [
      path.dirname(path.dirname(launcher)), 'context', '--target', 'a path with spaces.html',
    ]);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test('neither platform launcher contains a download command', () => {
  for (const file of [launcher, `${launcher}.cmd`]) {
    assert.doesNotMatch(readFileSync(file, 'utf8'), /\bcurl\b|\bwget\b|DOWNLOAD_BASE|fetch_url|:download/);
  }
});

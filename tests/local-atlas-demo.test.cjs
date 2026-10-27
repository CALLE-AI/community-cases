const assert = require('node:assert/strict');
const { test } = require('node:test');
const model = import('../assets/local-atlas-demo/model.mjs');

test('one answered question is stored with its quote and reused by the next visitor', async () => {
  const { createSandbox, samples, questionKey } = await model;
  let now = 1793095200000;
  const demo = createSandbox(() => now);
  const first = demo.start('parking');
  assert.equal(first.kind, 'started');
  assert.equal(demo.start('parking').kind, 'pending');
  assert.equal(demo.snapshot().calls, 1);
  const entry = demo.finish(first.pending.id);
  assert.equal(entry.evidenceQuote, samples[0].quote);
  assert.equal(entry.qHash, questionKey('  IS THERE PARKING ON SITE?  '));
  assert.equal(entry.collectedAt, now);
  assert.equal(entry.expiresAt - now, 90 * 86400000);
  assert.equal(entry.simulated, true);
  demo.nextVisitor(); now += 60000;
  const again = demo.start('parking');
  assert.equal(again.kind, 'reused');
  assert.strictEqual(again.entry, entry);
  assert.equal(demo.snapshot().visitor, 2);
  assert.equal(demo.snapshot().calls, 1);
});

test('expired answers and deliberate rechecks start a new request', async () => {
  const { createSandbox } = await model;
  let now = 0;
  const demo = createSandbox(() => now);
  demo.finish(demo.start('parking').pending.id);
  const forced = demo.start('parking', true);
  assert.equal(forced.kind, 'started'); demo.finish(forced.pending.id);
  assert.equal(demo.snapshot().facts.length, 1);
  now = 90 * 86400000;
  assert.equal(demo.start('parking').kind, 'started');
  assert.equal(demo.snapshot().calls, 3);
});

test('reset discards an in-flight reply and unrelated questions remain separate', async () => {
  const { createSandbox } = await model;
  const demo = createSandbox(() => 0);
  const first = demo.start('parking');
  demo.nextVisitor(); assert.equal(demo.snapshot().visitor, 1);
  demo.reset();
  assert.equal(demo.finish(first.pending.id), null);
  assert.equal(demo.snapshot().calls, 0);
  demo.finish(demo.start('parking').pending.id);
  demo.finish(demo.start('wheelchair').pending.id);
  assert.equal(demo.snapshot().facts.length, 2);
  assert.equal(demo.snapshot().calls, 2);
  assert.throws(() => demo.start('unknown'), /sample questions/);
});

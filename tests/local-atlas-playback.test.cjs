const test = require('node:test');
const assert = require('node:assert/strict');

function fakeMedia() {
  return { currentTime: 0, paused: true, play() { this.paused = false; return Promise.resolve(); }, pause() { this.paused = true; } };
}

test('narration is the clock and pauses offscreen, resumes, seeks and replays without drift', async () => {
  const { createPlayback } = await import('../assets/local-atlas-demo/playback.mjs');
  const media = fakeMedia(), playback = createPlayback(media);
  playback.setInView(true); playback.enableNarration();
  media.currentTime = 9.4;
  assert.equal(playback.advance(5000).time, 9.4);
  playback.setInView(false);
  assert.equal(media.paused, true);
  assert.equal(playback.advance(10000).time, 9.4);
  playback.setInView(true);
  assert.equal(media.paused, false);
  playback.seek(3);
  assert.equal(media.paused, true);
  assert.equal(media.currentTime, 3);
  playback.play(); media.currentTime = 4.2;
  assert.equal(playback.advance(20000).time, 4.2);
  playback.setPageVisible(false); assert.equal(media.paused, true);
  playback.setPageVisible(true); assert.equal(media.paused, false);
  playback.replay(); assert.equal(media.currentTime, 0);
  playback.ended(); assert.equal(playback.snapshot().time, 25);
  assert.equal(playback.snapshot().playing, false);
});

test('rejected audio falls back to silent playback and can be explicitly retried', async () => {
  const { createPlayback } = await import('../assets/local-atlas-demo/playback.mjs');
  const media = fakeMedia(); let errors = 0;
  media.play = () => Promise.reject(new Error('blocked'));
  const playback = createPlayback(media, { onError() { errors++; } });
  playback.setInView(true); playback.enableNarration();
  await new Promise(resolve => setImmediate(resolve));
  assert.equal(errors, 1); assert.equal(playback.snapshot().narration, false);
  assert.equal(playback.snapshot().playing, true);
  playback.advance(0); assert.equal(playback.advance(100).time, .1);
  media.play = function () { this.paused = false; return Promise.resolve(); };
  playback.enableNarration(); assert.equal(playback.snapshot().time, 0);
  assert.equal(playback.snapshot().narration, true);
});

test('a pending play cannot restart narration after a pause or mode change', async () => {
  const { createPlayback } = await import('../assets/local-atlas-demo/playback.mjs');
  const media = fakeMedia(); let finish;
  media.play = () => new Promise(resolve => { finish = () => { media.paused = false; resolve(); }; });
  const playback = createPlayback(media);
  playback.setInView(true); playback.enableNarration(); playback.pause();
  finish(); await new Promise(resolve => setImmediate(resolve));
  assert.equal(media.paused, true); assert.equal(playback.snapshot().playing, false);
  playback.enableNarration(); playback.disableNarration();
  finish(); await new Promise(resolve => setImmediate(resolve));
  assert.equal(media.paused, true); assert.equal(playback.snapshot().narration, false);
});

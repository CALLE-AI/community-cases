export function createPlayback(media, { duration = 25, onChange = () => {}, onError = () => {} } = {}) {
  let time = 0, playing = false, narration = false, inView = false, pageVisible = true, last = null, revision = 0;
  const running = () => playing && inView && pageVisible;
  const snapshot = () => ({ time, playing, narration, running: running() });
  function sync() {
    const ticket = ++revision;
    last = null;
    if (!running() || !narration) media.pause();
    else if (media.paused) {
      Promise.resolve(media.play()).then(() => {
        if (ticket !== revision && (!running() || !narration)) media.pause();
      }).catch(() => {
        if (ticket !== revision) return;
        narration = false; media.pause(); onError(); onChange(snapshot());
      });
    }
    onChange(snapshot());
  }
  function position(value) {
    time = Math.max(0, Math.min(duration, value));
    media.currentTime = time;
  }
  return {
    snapshot,
    play() { if (time >= duration) position(0); playing = true; sync(); },
    pause() { playing = false; sync(); },
    replay() { position(0); playing = true; sync(); },
    seek(value) { position(value); playing = false; sync(); },
    enableNarration() { position(0); narration = true; playing = true; sync(); },
    disableNarration() { narration = false; sync(); },
    setInView(value) { inView = value; sync(); },
    setPageVisible(value) { pageVisible = value; sync(); },
    ended() { time = duration; playing = false; sync(); },
    failNarration() { narration = false; media.pause(); onError(); sync(); },
    advance(now) {
      if (!running()) { last = null; return snapshot(); }
      if (narration) time = Math.min(duration, media.currentTime);
      else time = Math.min(duration, time + (last === null ? 0 : Math.min(.1, (now - last) / 1000)));
      last = now;
      if (time >= duration) { playing = false; media.pause(); }
      return snapshot();
    }
  };
}

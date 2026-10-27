import { createPlayback } from './local-atlas-demo/playback.mjs';
import { samples, questionKey, makeEntry, createSandbox } from './local-atlas-demo/model.mjs';

const byId = id => document.getElementById(id);
const checkIcon = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="m8 12 3 3 5-6"/></svg>';
const dateText = ts => new Date(ts).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });

function startStory() {
  const stage = byId('atlas-stage'), world = byId('atlas-world'), audio = byId('atlas-narration');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const entry = makeEntry(samples[0], Date.now());
  let cafeScene = null, sceneState = { time: 0, reduced: reduced.matches };
  import('./local-atlas-demo/cafe-scene.mjs').then(({ createCafeScene }) => {
    cafeScene = createCafeScene(world, { entry }); cafeScene.render(sceneState);
  }).catch(() => { world.dataset.renderer = 'fallback'; });
  const play = byId('atlas-play'), seek = byId('atlas-progress'), voice = byId('atlas-voice');
  const faqFrame = byId('atlas-story-faq');
  const steps = [
    ['Is there parking?', 'A visitor needs a detail the map doesn’t show.'],
    ['Ask the café.', 'CALL-E asks the café one useful question.'],
    ['Keep the answer.', 'Saved with the staff’s words and a collection date.'],
    ['Someone already asked.', 'The next visitor asks the same question.'],
    ['Ask once. Share the answer.', 'One call. A shared answer for the next visitor.']
  ];
  let raf = 0, phase = -1, audioReady = false, audioLoading = false;
  function render(state) {
    const t = state.time, current = t < 3 ? 0 : t < 8 ? 1 : t < 13 ? 2 : t < 21.75 ? 3 : 4;
    if (phase !== current) {
      phase = current; stage.dataset.phase = current;
      byId('atlas-scene-title').textContent = steps[current][0];
      byId('atlas-story-calls').textContent = current ? '1' : '0';
      byId('atlas-story-calls').nextSibling.textContent = current ? ' simulated call' : ' simulated calls';
      byId('atlas-connection-label').textContent = ['One useful question.', 'CALL-E asks Example café.', 'The answer stays with this place.', 'Shared FAQ. No new call.', 'Shared FAQ. No new call.'][current];
      document.querySelectorAll('.atlas-chapters span').forEach((el, i) => {
        if (i === Math.min(3, current)) el.setAttribute('aria-current', 'step'); else el.removeAttribute('aria-current');
      });
    }
    const caption = current === 1 && t >= 5.4 ? '“Yes, we have a small customer lot out back.”'
      : current === 3 && t >= 18.2 ? 'The saved answer is still valid. No new call is needed.' : steps[current][1];
    byId('atlas-caption').textContent = caption;
    sceneState = { time: t, reduced: reduced.matches };
    cafeScene?.render(sceneState);
    seek.value = t; seek.setAttribute('aria-valuetext', `${Math.floor(t)} of 25 seconds. ${['Ask', 'Call', 'Save', 'Reuse', 'Reuse'][current]}.`);
    byId('atlas-time').textContent = `0:${String(Math.floor(t)).padStart(2, '0')} / 0:25`;
    play.textContent = state.playing ? 'Pause' : t >= 25 ? 'Play again' : 'Play';
    voice.textContent = audioLoading ? 'Loading narration…' : state.narration ? 'Turn narration off' : 'Play with narration';
    voice.setAttribute('aria-pressed', state.narration);
  }
  function tick(now) {
    raf = 0; const state = playback.advance(now); render(state);
    if (state.running) raf = requestAnimationFrame(tick);
  }
  function wake(state) {
    if (raf) cancelAnimationFrame(raf);
    raf = state.running ? requestAnimationFrame(tick) : 0;
  }
  const playback = createPlayback(audio, {
    onChange(state) { render(state); wake(state); },
    onError() { const status = byId('atlas-audio-status'); status.hidden = false; status.textContent = 'Narration couldn’t play. Try Play with narration again, or watch silently.'; }
  });
  play.addEventListener('click', () => playback.snapshot().playing ? playback.pause() : playback.play());
  byId('atlas-replay').addEventListener('click', () => playback.replay());
  voice.addEventListener('click', () => {
    byId('atlas-audio-status').hidden = true;
    if (playback.snapshot().narration) playback.disableNarration();
    else if (audioReady) playback.enableNarration();
    else prepareNarration().then(() => playback.enableNarration()).catch(narrationLoadError);
  });
  seek.addEventListener('input', () => playback.seek(Number(seek.value)));
  audio.addEventListener('ended', () => playback.ended());
  audio.addEventListener('error', () => { if (playback.snapshot().narration) playback.failNarration(); });
  new IntersectionObserver(entries => playback.setInView(entries[0].isIntersecting), { threshold: .15 }).observe(stage);
  document.addEventListener('visibilitychange', () => playback.setPageVisible(!document.hidden));
  reduced.addEventListener('change', () => { if (reduced.matches) playback.seek(25); else render(playback.snapshot()); });
  function sendFaq() { faqFrame.contentWindow.postMessage({ type: 'atlas:story-faq', entry }, location.origin); }
  faqFrame.addEventListener('load', sendFaq);
  addEventListener('message', e => {
    if (e.source !== faqFrame.contentWindow || e.origin !== location.origin) return;
    if (e.data?.type === 'atlas:story-ready') sendFaq();
    else if (e.data?.type === 'atlas:story-height' && Number.isFinite(e.data.height) && e.data.height > 0) {
      const height = `${Math.ceil(Math.min(600, e.data.height) + 2)}px`;
      faqFrame.style.height = height;
    }
  });
  sendFaq();
  if (reduced.matches) playback.seek(25); else playback.play();
  const audioSource = audio.src;
  function narrationLoadError() {
    const status = byId('atlas-audio-status'); status.hidden = false;
    status.textContent = 'Narration couldn’t load. Try Play with narration again, or watch silently.';
  }
  async function prepareNarration() {
    audioLoading = true; voice.disabled = true; render(playback.snapshot());
    try {
      const response = await fetch(audioSource);
      if (!response.ok) throw new Error('Audio unavailable');
      // A complete local blob also seeks on preview servers without HTTP Range support.
      audio.src = URL.createObjectURL(await response.blob());
      audio.load(); audioReady = true;
    } finally {
      audioLoading = false; voice.disabled = false; render(playback.snapshot());
    }
  }
  prepareNarration().catch(narrationLoadError);
}

function startMock() {
  const sandbox = createSandbox(), frame = byId('atlas-product');
  const next = byId('atlas-next-visitor'), repeat = byId('atlas-use-answer');
  let timer = 0, lastQuestion = '', log = [];
  function add(text) { log.push(text); if (log.length > 5) log.shift(); }
  function sync() {
    const state = sandbox.snapshot();
    frame.contentWindow.postMessage({ type: 'atlas:state', state: { ...state, samples: samples.map(s => ({ id: s.id, text: s.text, key: questionKey(s.text) })) } }, location.origin);
    byId('atlas-visitor-number').textContent = state.visitor;
    byId('atlas-visitor-label').textContent = state.visitor === 1 ? 'First visitor' : `Visitor ${state.visitor} · Same place`;
    next.disabled = !!state.pending || !state.facts.length;
    repeat.hidden = state.visitor < 2 || !lastQuestion; repeat.disabled = !!state.pending;
    byId('atlas-stats').textContent = `${state.calls} simulated ${state.calls === 1 ? 'call' : 'calls'} · ${state.facts.length} shared ${state.facts.length === 1 ? 'answer' : 'answers'}`;
    const activity = byId('atlas-activity'); activity.replaceChildren();
    for (const text of log) { const li = document.createElement('li'); li.innerHTML = checkIcon; const span = document.createElement('span'); span.textContent = text; li.append(span); activity.append(li); }
  }
  function status(title, text) { byId('atlas-session-title').textContent = title; byId('atlas-session-status').textContent = text; }
  function ask(id, force = false) {
    const result = sandbox.start(id, force); lastQuestion = id;
    if (result.kind === 'pending') return;
    if (result.kind === 'reused') {
      status('The shared answer is ready.', `The café’s existing answer is still valid. Visitor ${sandbox.snapshot().visitor} can use it without another call.`);
      add('Reused the same answer, source quote and collection date.'); sync(); return;
    }
    status('Asking the café…', 'The simulated assistant introduces itself as AI, asks one question and waits for the reply.');
    add(`Asked: “${result.pending.sample.text}”`); sync();
    timer = setTimeout(() => {
      const entry = sandbox.finish(result.pending.id); if (!entry) return;
      status('Saved for the next visitor.', `“${entry.evidenceQuote}” The answer and its source are now on this place. Choose Next visitor to try sharing it.`);
      add(`Saved a dated FAQ on ${dateText(entry.collectedAt)}.`); sync();
    }, 1800);
  }
  addEventListener('message', e => {
    if (e.source !== frame.contentWindow || e.origin !== location.origin) return;
    if (e.data.type === 'atlas:ready') sync();
    else if (e.data.type === 'atlas:height' && Number.isFinite(e.data.height)) frame.style.height = `${Math.max(250, Math.min(1600, e.data.height + 8))}px`;
    else if ((e.data.type === 'atlas:ask' || e.data.type === 'atlas:recheck') && samples.some(s => s.id === e.data.id)) ask(e.data.id, e.data.type === 'atlas:recheck');
  });
  frame.addEventListener('load', sync);
  next.addEventListener('click', () => {
    sandbox.nextVisitor();
    status('Someone already asked.', 'The same café already has a shared answer. Read it in the panel, or ask the same question to see the stored answer reused.');
    add(`Visitor ${sandbox.snapshot().visitor} opened Example café. The saved FAQ stays visible.`); sync();
  });
  repeat.addEventListener('click', () => ask(lastQuestion));
  byId('atlas-reset').addEventListener('click', () => {
    clearTimeout(timer); sandbox.reset(); log = []; lastQuestion = '';
    status('What would you like to know?', 'Choose a sample question in the café panel to start.'); sync();
  });
  sync();
}

startStory(); startMock();

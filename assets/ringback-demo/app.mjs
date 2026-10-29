import { phases, initialState, advance, viewOf } from './state.mjs';

const host = document.querySelector('.rb-game'), world = host.querySelector('.rb-world');
const panels = { diary: host.querySelector('.rb-diary'), call: host.querySelector('.rb-call') };
const mark = new URL('../call-e-mark.svg', import.meta.url).href;
const reduced = matchMedia('(prefers-reduced-motion: reduce)');
let state = initialState(), scene, age = 0, idle = 0, auto = !reduced.matches, inView = false, last = null, raf = 0;
let inputMethod = 'pointer', lastStatus = '', lastAuto;
const actions = (view) => `<div class="rb-actions"><button type="button" class="rb-primary" data-action="${view.action}">${view.label}</button>${state.phase === 'sam' ? '<button type="button" data-action="unclear">I’m not sure</button>' : ''}</div>`;
function setUI(takeFocus = false) {
  const view = viewOf(state), home = view.location !== 'salon';
  panels.diary.hidden = home; panels.call.hidden = !home;
  panels.diary.dataset.slot = view.slot;
  panels.diary.innerHTML = `<header><span>STUDIO DIARY</span><b>Thursday</b></header>
    <div class="rb-slot"><strong>14:00</strong><div><b>${view.slot === 'booked' ? 'Sam' : view.slot === 'conflict' ? 'No longer free' : 'One opening'}</b><small>${view.slot === 'booked' ? 'Saved in local diary' : view.slot === 'conflict' ? 'No booking saved' : 'Cut & style'}</small></div></div>
    <div class="rb-brand"><img src="${mark}" alt=""><b>CALL-E</b><span>${state.calls} simulated call${state.calls === 1 ? '' : 's'}</span></div>
    <ol class="rb-waiting">${['alex','sam','taylor'].map((name,i) => `<li data-status="${view[name]}"><span>${i+1}</span><b>${name[0].toUpperCase()+name.slice(1)}</b><em>${view[name]}</em></li>`).join('')}</ol>
    <p class="rb-outcome">${view.hint}</p>
    ${state.phase === 'review' ? `<label class="rb-availability"><input type="checkbox" data-action="availability" ${state.available ? 'checked' : ''}> Slot is still available</label>` : ''}
    ${!home && view.action ? actions(view) : !view.action ? '<div class="rb-actions"><button type="button" class="rb-primary" data-action="restart">Try another outcome</button></div>' : ''}`;
  panels.call.dataset.answered = state.phase;
  panels.call.innerHTML = `<header class="rb-brand"><img src="${mark}" alt=""><b>CALL-E</b><span>Studio appointment</span></header>
    <div class="rb-recipient"><span>${view.caller[0]}</span><div><b>${view.caller} · at home</b><small>${view.answered ? 'Call result' : 'Choose the reply'}</small></div></div>
    <div class="rb-offer"><strong>14:00</strong><div><span>Thursday</span><p>Can you take this opening?</p></div></div>
    ${view.answered ? `<p class="rb-quote">${view.reply}</p>` : ''}
    ${home ? actions(view) : ''}
    <p class="rb-call-note">${view.answered ? state.phase === 'accepted' ? 'Calling stopped. Taylor is not called.' : 'The opening stays available.' : state.phase === 'sam' ? 'Try either answer to see what happens.' : 'Alex cannot take this time. Hear the reply to continue.'}</p>`;
  const list = host.querySelector('.rb-history ol');
  list.replaceChildren(...state.history.map(event => { const li = document.createElement('li'); li.textContent = event; return li; }));
  host.querySelector('.rb-announcement').textContent = view.title + ' ' + view.hint;
  host.dataset.phase = state.phase;
  host.querySelector('.rb-scene-title').textContent = view.title;
  host.querySelector('.rb-scene-place').textContent = home ? `${view.caller}’s home` : 'The studio';
  if (takeFocus) {
    const target = (home ? panels.call : panels.diary).querySelector('button');
    target?.focus({ preventScroll: true });
  }
  idle = 0; age = 0; render(); updateStatus(); wake();
}
function dispatch(action, manual = false) {
  const takeFocus = inputMethod === 'keyboard' && (manual || world.contains(document.activeElement));
  if (action === 'restart') { state = initialState(); setUI(takeFocus); return; }
  const next = advance(state, action);
  if (next === state) return;
  state = next; setUI(takeFocus);
  if (action === 'availability' && manual && inputMethod === 'keyboard') panels.diary.querySelector('input').focus({ preventScroll: true });
}
function render() { scene?.render(viewOf(state), age / 1000, reduced.matches); }
function updateStatus() {
  const step = phases[state.phase];
  const message = !step.action ? 'Your result is ready. Start over to try another path.' : !auto ? 'Auto is paused. Choose an action in the scene.' : `Auto in ${Math.max(1, Math.ceil(step.delay - idle / 1000))}s · ${step.label}`;
  if (message !== lastStatus) { host.querySelector('.rb-auto-status').textContent = message; lastStatus = message; }
  if (auto !== lastAuto) {
    host.querySelector('.rb-auto').textContent = auto ? 'Pause auto' : 'Resume auto';
    host.querySelector('.rb-auto').setAttribute('aria-pressed', String(!auto));
    lastAuto = auto;
  }
}
function active() { return inView && !document.hidden; }
function tick(now) {
  raf = 0;
  const delta = last === null ? 0 : Math.min(now - last, 100); last = now;
  if (active()) {
    age += delta;
    if (auto && phases[state.phase].action) {
      idle += delta;
      if (idle >= phases[state.phase].delay * 1000) dispatch(phases[state.phase].action);
    }
    if (!reduced.matches) render();
  }
  updateStatus();
  if (active() && (!reduced.matches || auto && phases[state.phase].action)) wake();
}
function wake() { if (!raf && active()) raf = requestAnimationFrame(tick); }
function visibility() { host.dataset.motion = active() && !reduced.matches ? 'playing' : 'paused'; last = null; if (!active()) { cancelAnimationFrame(raf); raf = 0; } else wake(); }
world.addEventListener('click', event => {
  const button = event.target.closest('button[data-action]');
  if (button) dispatch(button.dataset.action, true);
});
world.addEventListener('change', event => {
  if (event.target.matches('[data-action="availability"]')) dispatch('availability', true);
});
function activity() { idle = 0; updateStatus(); wake(); }
for (const event of ['pointermove', 'input', 'wheel']) host.addEventListener(event, activity, { passive: true });
host.addEventListener('pointerdown', () => { inputMethod = 'pointer'; activity(); });
host.addEventListener('keydown', () => { inputMethod = 'keyboard'; activity(); });
host.querySelector('.rb-auto').onclick = () => { auto = !auto; idle = 0; updateStatus(); wake(); };
host.querySelector('.rb-reset').onclick = () => dispatch('restart', true);
new IntersectionObserver(entries => { inView = entries[0].isIntersecting; visibility(); }, { threshold: .15 }).observe(world);
document.addEventListener('visibilitychange', visibility);
reduced.addEventListener('change', () => { if (reduced.matches) auto = false; idle = 0; render(); updateStatus(); visibility(); });
setUI();
import('./scene.mjs?v=94ee9ebac5').then(({ createScene }) => { scene = createScene(world); render(); }).catch(() => { world.dataset.renderer = 'fallback'; });

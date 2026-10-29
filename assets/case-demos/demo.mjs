import { cases, restaurants, initialState, advance, viewOf } from './data.mjs?v=8560c647e4';

const host = document.querySelector('[data-case-demo]'), id = host.dataset.caseDemo, world = host.querySelector('.flow-world');
const panel = host.querySelector('.flow-panel'), reduced = matchMedia('(prefers-reduced-motion: reduce)');
const mark = new URL('../call-e-mark.svg', import.meta.url).href;
let state = initialState(id), scene, age = 0, idle = 0, auto = !reduced.matches, inView = false, last = null, raf = 0;
let inputMethod = 'pointer', lastStatus = '', lastAuto;
const brand = v => `<div class="flow-brand"><img src="${mark}" alt=""><b>CALL-E</b><span>${v.calls} simulated call${v.calls === 1 ? '' : 's'}</span></div>`;
function actions(v) {
  return `<div class="flow-actions">${v.action ? `<button type="button" class="flow-primary" data-action="${v.action}">${v.label}</button>${(v.kind === 'office' && v.phase === 'calling') || (v.kind === 'care' && v.phase === 'callback') ? '<button type="button" data-action="unclear">No clear answer</button>' : ''}` : '<button type="button" class="flow-primary" data-action="restart">Try another path</button>'}</div>`;
}
function officePanel(v) {
  let body;
  if (v.phase === 'start') body = `<div class="email-thread"><div><b>You</b><p>Would you prefer the <em>morning or afternoon</em> visit?</p></div><div><b>Contact</b><p>“That sounds fine.”</p></div></div><p class="flow-note">Agreement, but no time chosen.</p>`;
  else if (v.phase === 'approval') body = `<p class="email-question">“Morning or afternoon?”</p><dl class="email-review"><div><dt>Contact</dt><dd>Fictional · ending 0142</dd></div><div><dt>Purpose</dt><dd>Confirm the visit time</dd></div></dl><p class="flow-note">One question. Review it before the sample call.</p>`;
  else if (v.phase === 'calling') body = `<div class="phone-contact"><span class="phone-pulse" aria-hidden="true"></span><b>The contact is listening.</b></div><p class="email-question">“Would you prefer morning or afternoon?”</p><p class="flow-note">Take the contact’s part. Choose a clear reply or leave it unresolved.</p>`;
  else if (v.phase === 'answer') body = `<blockquote class="email-answer">“Afternoon, please.”</blockquote><dl class="email-review"><div><dt>Choice</dt><dd>Afternoon</dd></div><div><dt>Support</dt><dd>The person’s own words</dd></div></dl><p class="flow-note">This supports a draft. It has not sent a reply.</p>`;
  else if (v.phase === 'draft') body = `<div class="email-draft"><span>Unsent draft</span><p>Thanks for confirming the <mark>afternoon</mark> visit.</p></div><p class="flow-note">Check the recipient and original thread yourself before sending.</p>`;
  else body = `<p class="email-question">Morning or afternoon?</p><p>The call did not settle the choice.</p><p class="flow-note">No draft created. Leave the original question open for a person to follow up.</p>`;
  return `<header class="email-subject"><span>Re: Visit arrangements</span><b>${v.phase === 'draft' ? 'Ready for your review' : v.phase === 'unresolved' ? 'Still unanswered' : 'One missing detail'}</b></header>${body}${brand(v)}${actions(v)}`;
}
function carePanel(v) {
  const hasCleaning = v.needs.includes('Cleaning'), hasCallback = ['callback', 'combined', 'handoff'].includes(v.phase);
  const prompt = v.phase === 'start' ? 'A coordinator reviews Morgan’s everyday support check-in before outreach.'
    : v.phase === 'checkin' ? '“Could someone help with cleaning?”'
    : v.phase === 'recorded' ? 'Later that morning, Morgan remembers something else.'
    : v.phase === 'callback' ? 'The first request stays. What does Morgan add?'
    : v.phase === 'combined' ? v.uncertain ? 'Keep cleaning. Flag the unclear callback for follow-up.' : 'Cleaning and groceries travel together to the coordinator.'
    : 'Ready for a person to review and arrange support. Nothing has been delivered.';
  return `<header class="care-heading"><b>Morgan</b><span>Today’s check-in</span></header>
    <ol class="care-log"><li data-recorded="${hasCleaning}"><time>09:30</time><div><b>${hasCleaning ? 'Cleaning' : 'First conversation'}</b><p>${hasCleaning ? 'Help at home requested' : 'Everyday support · with approval'}</p></div></li>
    ${hasCallback ? `<li data-recorded="${v.needs.includes('Groceries')}"><time>11:10</time><div><b>${v.needs.includes('Groceries') ? 'Groceries' : v.uncertain ? 'Needs follow-up' : 'A later callback'}</b><p>${v.needs.includes('Groceries') ? 'Added to the same record' : v.uncertain ? 'No new need assumed' : 'Earlier request retained'}</p></div></li>` : ''}</ol>
    <p class="care-prompt">${prompt}</p>${v.phase === 'handoff' ? '<p class="care-handoff">For coordinator review</p>' : ''}${brand(v)}${actions(v)}`;
}
function restaurantPanel(v) {
  const r = restaurants[v.index], result = v.results.at(-1);
  const brief = v.phase === 'brief';
  return `<header class="food-heading"><b>${brief ? 'Your dinner brief' : v.phase === 'matched' ? 'A match to review' : v.phase === 'exhausted' ? 'No match this time' : r.name}</b><span>${brief ? 'Fictional address · 12 Example Lane' : `Delivery required · total ≤ $${v.budget}`}</span></header>
    ${brief ? `<div class="food-brief"><label for="food-budget">Maximum total, including delivery<div class="food-budget"><span>$</span><input id="food-budget" name="budget" type="number" min="1" max="100" step="any" value="${v.budget}" required inputmode="decimal"></div></label><p>Delivery is essential.<br>Stop at the first place that fits.</p></div>`
    : `<div class="food-response"><strong>${v.phase === 'calling' ? 'Asking…' : '$' + r.price}</strong><span>${v.phase === 'calling' ? 'Total price, including delivery?' : r.delivery ? 'Delivery available' : 'Pickup only · no delivery'}</span>${v.phase === 'calling' ? '' : `<b data-result="${result}">${result}</b>`}</div>`}
    <ol class="food-route">${restaurants.map((place, i) => `<li data-state="${v.results[i] || (v.phase === 'calling' && v.index === i ? 'Calling' : 'Not called')}"><span>${place.name}</span><b>${v.results[i] || (v.phase === 'calling' && v.index === i ? 'Calling…' : 'Not called')}</b></li>`).join('')}</ol>
    ${v.done ? `<p class="flow-note">${v.phase === 'matched' ? 'Calling stopped at this match. No order placed.' : 'Four responses, no match. Try a different budget; no order placed.'}</p>` : ''}
    ${brand(v)}${actions(v)}`;
}
function setUI(takeFocus = false) {
  const v = viewOf(state);
  host.dataset.phase = state.phase; host.dataset.kind = v.kind;
  panel.innerHTML = v.kind === 'office' ? officePanel(v) : v.kind === 'care' ? carePanel(v) : restaurantPanel(v);
  host.querySelector('.flow-title').textContent = v.title;
  host.querySelector('.flow-place').textContent = v.place;
  host.querySelector('.flow-announcement').textContent = v.title + (state.history.at(-1) ? ' ' + state.history.at(-1) : '');
  host.querySelector('.flow-history ol').replaceChildren(...state.history.map(text => { const li = document.createElement('li'); li.textContent = text; return li; }));
  if (takeFocus) panel.querySelector('button')?.focus({ preventScroll: true });
  age = 0; idle = 0; render(); updateStatus(); wake();
}
function dispatch(action, manual = false) {
  const takeFocus = inputMethod === 'keyboard' && (manual || panel.contains(document.activeElement));
  if (action === 'restart') { state = initialState(id); setUI(takeFocus); return; }
  if (action === 'search' && !panel.querySelector('input').checkValidity()) {
    if (manual) panel.querySelector('input').reportValidity();
    auto = false; updateStatus(); return;
  }
  const next = advance(state, action);
  if (next !== state) { state = next; setUI(takeFocus); }
}
function render() { scene?.render(viewOf(state), age / 1000, reduced.matches); }
function updateStatus() {
  const v = viewOf(state);
  const text = v.done ? 'Your result is ready. Try another path whenever you like.' : !auto ? 'Auto is paused. Choose an action to continue.' : `Auto in ${Math.max(1, Math.ceil(v.delay - idle / 1000))}s · ${v.label}`;
  if (text !== lastStatus) { host.querySelector('.flow-auto-status').textContent = text; lastStatus = text; }
  if (auto !== lastAuto) {
    host.querySelector('.flow-auto').textContent = auto ? 'Pause auto' : 'Resume auto';
    host.querySelector('.flow-auto').setAttribute('aria-pressed', String(!auto)); lastAuto = auto;
  }
}
function active() { return inView && !document.hidden; }
function tick(now) {
  raf = 0;
  const delta = last === null ? 0 : Math.min(now - last, 100); last = now;
  if (active()) {
    age += delta;
    const v = viewOf(state);
    if (auto && v.action) { idle += delta; if (idle >= v.delay * 1000) dispatch(v.action); }
    if (!reduced.matches) render();
  }
  updateStatus();
  if (active() && (!reduced.matches || auto && viewOf(state).action)) wake();
}
function wake() { if (!raf && active()) raf = requestAnimationFrame(tick); }
function visibility() {
  host.dataset.motion = active() && !reduced.matches ? 'playing' : 'paused'; last = null;
  if (!active()) { cancelAnimationFrame(raf); raf = 0; } else wake();
}
function activity() { idle = 0; updateStatus(); wake(); }
world.addEventListener('click', e => { const b = e.target.closest('button[data-action]'); if (b) dispatch(b.dataset.action, true); });
host.addEventListener('input', e => {
  if (e.target.matches('[name="budget"]')) state = advance(state, 'budget', e.target.valueAsNumber);
  activity();
});
for (const event of ['pointermove', 'wheel']) host.addEventListener(event, activity, { passive: true });
host.addEventListener('pointerdown', () => { inputMethod = 'pointer'; activity(); });
host.addEventListener('keydown', () => { inputMethod = 'keyboard'; activity(); });
host.querySelector('.flow-auto').onclick = () => { auto = !auto; idle = 0; updateStatus(); wake(); };
host.querySelector('.flow-reset').onclick = () => dispatch('restart', true);
new IntersectionObserver(entries => { inView = entries[0].isIntersecting; visibility(); }, { threshold: .15 }).observe(world);
document.addEventListener('visibilitychange', () => { visibility(); if (document.hidden) host.querySelector('audio')?.pause(); });
reduced.addEventListener('change', () => { if (reduced.matches) auto = false; render(); updateStatus(); visibility(); });
host.querySelector('.flow-overview')?.addEventListener('toggle', e => { if (!e.target.open) host.querySelector('audio').pause(); });
setUI();
import('./scene.mjs?v=ed6651d378').then(({ createScene }) => { scene = createScene(world, cases[id].kind); render(); }).catch(() => { world.dataset.renderer = 'fallback'; });

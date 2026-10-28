import { timing, chapterAt } from './timing.mjs?v=151a699909';
import { cases, initialState, advanceMock } from './data.mjs?v=de3dd7f6f9';
import { createPlayback } from '../local-atlas-demo/playback.mjs';
const host = document.querySelector('[data-case-demo]'), id = host.dataset.caseDemo, config = cases[id];
const find = s => host.querySelector(s), audio = find('audio'), reduced = matchMedia('(prefers-reduced-motion: reduce)');
let scene, raf = 0, duration = Number(host.dataset.duration), loaded = false, loading = false, narrationRequest = 0;
function render(state) {
    const fraction = state.time / duration, step = chapterAt(config.kind, state.time);
    find('.demo-title').textContent = config.titles[step];
    find('.demo-speech').textContent = config.lines[step];
    find('.demo-progress').value = state.time;
    find('time').textContent = Math.floor(state.time) + ' / ' + Math.ceil(duration) + 's';
    find('.demo-play').textContent = state.playing ? 'Pause' : state.time >= duration ? 'Play again' : 'Play';
    find('.demo-voice').textContent = loading ? 'Loading narration…' : state.narration ? 'Turn narration off' : 'Play with narration';
    find('.demo-voice').setAttribute('aria-pressed', state.narration);
    host.querySelectorAll('.demo-chapters button').forEach((b, i) => i === step ? b.setAttribute('aria-current', 'step') : b.removeAttribute('aria-current'));
    scene?.render(fraction, reduced.matches);
}
function tick(now) { const s = playback.advance(now); render(s); raf = s.running ? requestAnimationFrame(tick) : 0; }
function error() { find('.demo-error').hidden = false; find('.demo-error').textContent = 'Narration could not play. Try again, or watch silently and read the transcript.'; }
const playback = createPlayback(audio, { duration, onChange(s) { render(s); cancelAnimationFrame(raf); raf = s.running ? requestAnimationFrame(tick) : 0; }, onError: error });
function cancelPendingNarration() { narrationRequest++; loading = false; find('.demo-voice').disabled = false; }
find('.demo-play').onclick = () => { cancelPendingNarration(); playback.snapshot().playing ? playback.pause() : playback.play(); };
find('.demo-replay').onclick = () => { cancelPendingNarration(); playback.replay(); };
find('.demo-progress').oninput = e => { cancelPendingNarration(); playback.seek(Number(e.target.value)); };
host.querySelectorAll('.demo-chapters button').forEach((b, i) => b.onclick = () => { cancelPendingNarration(); playback.seek(timing[config.kind].previews[i]); });
find('.demo-voice').onclick = async () => {
    find('.demo-error').hidden = true;
    if (playback.snapshot().narration) {
        playback.disableNarration();
        return;
    }
    const request = ++narrationRequest;
    // Freeze the opening shot while audio downloads; a later user action cancels this start.
    playback.seek(0);
    if (!loaded) {
        loading = true;
        find('.demo-voice').disabled = true;
        render(playback.snapshot());
        try {
            const r = await fetch(audio.src);
            if (!r.ok)
                throw new Error('Audio unavailable');
            const blob = await r.blob();
            if (request !== narrationRequest)
                return;
            audio.src = URL.createObjectURL(blob);
            audio.load();
            loaded = true;
        }
        catch {
            if (request === narrationRequest)
                error();
            return;
        }
        finally {
            if (request === narrationRequest) {
                loading = false;
                find('.demo-voice').disabled = false;
                render(playback.snapshot());
            }
        }
    }
    if (request === narrationRequest)
        playback.enableNarration();
};
audio.onended = () => playback.ended();
audio.onerror = () => { if (playback.snapshot().narration)
    playback.failNarration(); };
new IntersectionObserver(entries => playback.setInView(entries[0].isIntersecting), { threshold: .15 }).observe(find('.demo-stage'));
document.addEventListener('visibilitychange', () => playback.setPageVisible(!document.hidden));
reduced.addEventListener('change', () => { if (reduced.matches)
    playback.seek(duration);
else
    render(playback.snapshot()); });
import('./scene.mjs?v=bedc0bb142').then(({ createScene }) => { scene = createScene(find('.demo-world'), config); render(playback.snapshot()); }).catch(() => { find('.demo-world').dataset.renderer = 'fallback'; });
if (reduced.matches)
    playback.seek(duration);
else
    playback.play();
let state = initialState();
function settings() { return { answer: find('[name=answer]')?.value, callback: find('[name=callback]')?.value, available: find('[name=available]')?.checked, budget: Number(find('[name=budget]')?.value) }; }
function updateMock() {
    find('.demo-result-title').textContent = state.title;
    find('.demo-result-body').textContent = state.body;
    find('.demo-count').textContent = state.calls + ' simulated call' + (state.calls === 1 ? '' : 's');
    find('.demo-next').textContent = state.action;
    find('.demo-next').disabled = state.done;
    find('.demo-history').replaceChildren(...state.history.map(text => { const li = document.createElement('li'); li.textContent = text; return li; }));
    host.querySelectorAll('.demo-settings input,.demo-settings select').forEach(el => { el.disabled = state.step > 0; });
}
find('.demo-next').onclick = () => { state = advanceMock(id, state, settings()); updateMock(); };
find('.demo-reset').onclick = () => { state = initialState(); updateMock(); };
updateMock();

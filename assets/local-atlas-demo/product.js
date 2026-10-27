// Original Local Atlas public-facts components. MIT, Omar Miri. See SOURCE.md.
function esc(s){ return String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }

const ASK_FAIL = {
  unclear:     'We called and asked — whoever answered wasn\'t sure.',
  refused:     'We called and asked — they preferred not to answer over the phone.',
  unreachable: 'We called, but the line went to voicemail. No message was left.',
  unknown:     'We called, but the call didn\'t produce a usable answer.'
};

/* A stored fact leads with its subject, not with the sentence somebody typed
   to get it. See topicFor in calle.js — older entries have no topic and fall
   back to their question, which is never wrong, only wordier. */
/* Inline SVG rather than unicode glyphs. The first pass used characters like
   ⌸ and ♿, which is a lottery: half of them fall back to a tofu box on
   Windows, and the ones that do resolve arrive as full-colour emoji, which is
   the one thing that cannot sit in a panel drawn entirely in one green. These
   stroke in currentColor, so they take the colour of whatever they sit in and
   stay correct in both themes. */
const svg = d => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"
  stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${d}</svg>`;
const ICON = {
  check:  svg('<circle cx="12" cy="12" r="9"/><path d="M8.5 12.2l2.4 2.4 4.6-4.9"/>'),
  clock:  svg('<circle cx="12" cy="12" r="9"/><path d="M12 7v5.2l3.2 1.9"/>'),
  food:   svg('<path d="M6 3v7a2 2 0 004 0V3M8 10v11"/><path d="M17 3c-1.3 1-2 2.6-2 4.5 0 1.7.7 2.9 2 3.5v10"/>'),
  access: svg('<circle cx="12" cy="4.6" r="1.9"/><path d="M8.4 8.2l4 1.1v4.1h3.4"/><path d="M15.6 20.2l-1.8-4.1H10a3.9 3.9 0 11-3.1-3.6"/>'),
  park:   svg('<rect x="4" y="3.5" width="16" height="17" rx="3"/><path d="M10 16.5v-9h2.8a2.6 2.6 0 010 5.2H10"/>'),
  rest:   svg('<path d="M7.5 21v-6H6l1.6-5.2a1.6 1.6 0 013.1 0L12.3 15h-1.5v6z"/><circle cx="9.1" cy="4.7" r="1.8"/><path d="M17 21v-5.5h1.8L17 9.6h-3.2"/><circle cx="16.4" cy="4.7" r="1.8"/>'),
  pet:    svg('<ellipse cx="6.6" cy="10.6" rx="1.9" ry="2.4"/><ellipse cx="17.4" cy="10.6" rx="1.9" ry="2.4"/><ellipse cx="10.2" cy="6.2" rx="1.7" ry="2.2"/><ellipse cx="14.6" cy="6.6" rx="1.5" ry="2"/><path d="M12 13.4c2.6 0 4.6 1.8 4.6 3.8S14.8 20.6 12 20.6 7.4 19.2 7.4 17.2 9.4 13.4 12 13.4z"/>'),
  kids:   svg('<circle cx="12" cy="8" r="4.6"/><path d="M12 12.6v3.6M8.6 20.5l3.4-4.3 3.4 4.3"/>'),
  card:   svg('<rect x="2.8" y="5.4" width="18.4" height="13.2" rx="2.4"/><path d="M2.8 10h18.4M6.4 14.8h3.4"/>'),
  book:   svg('<rect x="3.6" y="5" width="16.8" height="15.4" rx="2.4"/><path d="M3.6 9.8h16.8M8.4 3.2v3.6M15.6 3.2v3.6"/>'),
  phone:  svg('<path d="M7.6 3.8l2.6 3.4-1.9 2.1a12 12 0 004.4 4.4l2.1-1.9 3.4 2.6v3a1.9 1.9 0 01-2.1 1.9C10 18.6 5.4 14 4.7 6.9a1.9 1.9 0 011.9-2.1z"/>'),
  lock:   svg('<rect x="4.4" y="10.2" width="15.2" height="10.4" rx="2.4"/><path d="M8.2 10.2V7.4a3.8 3.8 0 017.6 0v2.8"/><circle cx="12" cy="15.4" r="1.2"/>'),
  eye:    svg('<path d="M1.9 12S5.7 5.4 12 5.4 22.1 12 22.1 12 18.3 18.6 12 18.6 1.9 12 1.9 12z"/><circle cx="12" cy="12" r="2.9"/>'),
  clip:   svg('<rect x="5.4" y="4.4" width="13.2" height="16.2" rx="2.2"/><path d="M9.2 4.4a2.8 2.8 0 015.6 0"/><path d="M9 12.6l2 2 4-4.2"/>')
};

const FACT_ICONS = [
  [/hour|open|clos|time/i,              'clock'],
  [/food|drink|menu|eat|snack|vending/i,'food'],
  [/wheelchair|access|mobility|ramp/i,  'access'],
  [/park|lot/i,                         'park'],
  [/restroom|toilet|bathroom/i,         'rest'],
  [/dog|pet/i,                          'pet'],
  [/kid|child|play|stroller/i,          'kids'],
  [/card|pay|price|cost|fee/i,          'card'],
  [/reserv|book|slot|ticket/i,          'book']
];
const factIcon = e =>
  ICON[(FACT_ICONS.find(([re]) => re.test(e.topic || e.question || '')) || [, 'check'])[1]];

/* "2 DAYS" reads as a freshness stamp; "Confirmed 2 days ago" reads as a
   sentence you have to finish before you learn anything. Same number. */
function factAge(ts){
  const days = Math.floor((Date.now() - ts) / 86400e3);
  if(days <= 0) return 'TODAY';
  if(days === 1) return '1 DAY';
  if(days < 30)  return days + ' DAYS';
  return new Date(ts).toLocaleDateString(undefined, { month:'short', year:'numeric' }).toUpperCase();
}

function factHTML(e, idx, it){
  const answered = e.answerStatus === 'answered';
  const stale = e.expiresAt <= Date.now();
  const body = answered
    ? `<div class="faq-a">${esc(e.answer)}</div>` +
      (e.evidenceQuote ? `<div class="faq-quote">“${esc(e.evidenceQuote)}”</div>` : '')
    : `<div class="faq-a muted">${esc(ASK_FAIL[e.answerStatus] || ASK_FAIL.unknown)}</div>`;

  /* Who said it and who asked. Both halves matter: "staff" is the reason the
     answer counts for anything, and "CALL-E" is the reason it exists at all —
     leaving the machine out would be passing off an automated call as a
     conversation somebody had. */
  const src = [`${esc(it.name)} staff · CALL-E`];
  if(e.staffConfidence === 'hedged') src.push('staff were unsure');
  if(e.simulated) src.push(`<span class="faq-sim">simulated call</span>`);

  /* Always offer a recheck, but only shout about it when the record is
     actually suspect. A stored answer is the point of the feature, so the
     quiet variant keeps reuse the default while still admitting that hours
     and policies change well before a 90-day TTL expires — and that whoever
     is reading the page may simply know better. */
  /* A recheck of a private result has to stay private, and has to carry the
     same visit with it — otherwise the second call is a different question
     whose answer lands on the public listing. The privacy of an entry travels
     on the button that reasks it. */
  const recheck = `<button class="ask-again${answered && !stale ? ' quiet' : ''}" data-idx="${idx}"
      data-q="${esc(e.question)}"${e.private ? ' data-priv="1"' : ''}
      title="Places a fresh call and replaces this answer"
      >${answered && !stale ? 'Recheck' : 'Ask again'}</button>`;

  /* The raw transcript is deliberately not sent to the browser — it is a
     stranger's phone conversation, and publishing it verbatim reads as
     surveillance rather than as a source. This is the written account of the
     call instead: grounded in the transcript, but a note to a reader. */
  const note = e.callSummary
    ? `<details class="faq-note"><summary>How the call went</summary>
         <p>${esc(e.callSummary)}</p></details>`
    : '';

  return `<div class="fact">
      <div class="fact-ico">${factIcon(e)}</div>
      <div class="fact-main">
        <div class="fact-top">
          <div class="fact-title">${esc(e.topic || e.question)}</div>
          <div class="fact-age${answered && !stale ? '' : ' stale'}">${answered && !stale ? '✓ ' : ''}${esc(factAge(e.collectedAt))}</div>
        </div>
        ${body}
        <div class="fact-src"><span>${src.join(' · ')}</span>${recheck}</div>
        ${note}
      </div>
    </div>`;
}



function factsPaneHTML(it, idx, faq, chips){
  return `
    <div class="ask-sec">
      <h5>Confirmed by phone</h5>
      <span class="tag">Reusable · dated</span>
    </div>
    ${faq.length ? faq.map(e=>factHTML(e, idx, it)).join('')
                 : `<div class="ask-note" style="margin-bottom:9px">Nothing confirmed here yet.
                     Ask the first question and the answer stays on this listing for everyone.</div>`}
    <div class="ask-next">
      <h5>What should we verify next?</h5>
      <div class="ask-note" style="margin-top:3px">Pick one useful fact. A fresh answer is
        shared here for future visitors.</div>
      ${!SIGNED_IN() ? signInPrompt('Verifying a new fact') : `
        ${chips.length ? `<div class="ask-chips" style="margin-top:8px">` +
          chips.map(s=>`<button data-t="${esc(s.id || '')}" data-q="${esc(s.text)}"${s.generated ? ' class="gen"' : ''}>${esc(s.text)}</button>`).join('') +
          `</div>` : ''}
        <form class="ask-form">
          <input name="q" placeholder="Or type your own question…" maxlength="180" aria-label="Your question">
          <button type="submit">Ask</button>
        </form>`}
    </div>`;
}



function liveNote(box, text, sub, overlay){
  if(overlay !== false) showCallOverlay(text, sub);
  const panel = box.querySelector('.ask-card-body') || box.querySelector('.ask-panel');
  if(!panel) return;
  clearLiveNote(box);
  panel.insertAdjacentHTML('beforeend',
    `<div class="ask-live"><div class="spinner"></div><span>${esc(text)}</span></div>`);
}
const clearLiveNote = box => box.querySelectorAll('.ask-live').forEach(n=>n.remove());

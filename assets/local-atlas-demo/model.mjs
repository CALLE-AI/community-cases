// Adapted from omarmiri/Local-atlas @ 0b1095d, calle.js:263,1116,1553.
// MIT © 2026 Omar Miri; see LICENSE. Browser-only, fixed synthetic replies.
export const samples = [
  { id: 'parking', text: 'Is there parking on site?', topic: 'Parking', answer: 'Yes. There’s a customer lot behind the café.', quote: 'Yes, we have a small customer lot out back.' },
  { id: 'wheelchair', text: 'Is the entrance wheelchair accessible?', topic: 'Wheelchair access', answer: 'Yes. The front entrance has step-free access.', quote: 'Yes, the front entrance is step-free.' }
];
export const questionKey = q => String(q || '').trim().toLowerCase().replace(/\s+/g, ' ').replace(/[^a-z0-9]/g, '').slice(0, 60);
export function makeEntry(sample, now) {
  return { qHash: questionKey(sample.text), question: sample.text, topic: sample.topic,
    answer: sample.answer, answerStatus: 'answered', evidenceQuote: sample.quote,
    staffConfidence: 'certain', source: 'first_party_phone', simulated: true,
    collectedAt: now, expiresAt: now + 90 * 86400000 };
}
export function createSandbox(now = () => Date.now()) {
  let facts = new Map(), pending = null, calls = 0, visitor = 1, serial = 0;
  return {
    snapshot: () => ({ facts: [...facts.values()], pending, calls, visitor }),
    start(id, force = false) {
      const sample = samples.find(s => s.id === id);
      if (!sample) throw new Error('Choose one of the sample questions.');
      if (pending) return { kind: 'pending', pending };
      const entry = facts.get(questionKey(sample.text));
      if (!force && entry && entry.expiresAt > now()) return { kind: 'reused', entry };
      pending = { id: ++serial, sample }; calls += 1;
      return { kind: 'started', pending };
    },
    finish(id) {
      if (!pending || pending.id !== id) return null;
      const entry = makeEntry(pending.sample, now());
      facts.set(entry.qHash, entry); pending = null; return entry;
    },
    nextVisitor() { if (!pending) visitor += 1; return visitor; },
    reset() { facts.clear(); pending = null; calls = 0; visitor = 1; serial += 1; }
  };
}

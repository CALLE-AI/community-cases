export const phases = {
  opening: { title: 'One opening. Who can take it?', hint: 'Thursday at 14:00 is free. Offer it to the waiting list.', action: 'call-alex', label: 'Call Alex', delay: 6 },
  alex: { title: 'Alex gets the first call.', hint: 'You are Alex. The studio is offering Thursday at 14:00.', action: 'decline', label: 'I can’t make it', delay: 5 },
  declined: { title: 'Alex is unavailable.', hint: 'Keep the opening and move to the next person.', action: 'call-sam', label: 'Call Sam', delay: 3 },
  sam: { title: 'Try Sam next.', hint: 'Choose Sam’s answer. An unclear answer needs a person to follow up.', action: 'accept', label: 'Yes, I can take it', delay: 6 },
  accepted: { title: 'Sam accepts. Stop calling.', hint: 'Taylor stays uncalled. Return to the diary to check the opening.', action: 'review', label: 'Check the diary', delay: 3 },
  review: { title: 'Is the opening still free?', hint: 'Try changing availability before saving the replacement.', action: 'save', label: 'Check & save', delay: 6 },
  booked: { title: 'The opening is filled.', hint: 'Sam is in the local diary. Two calls; Taylor was not called.' },
  unclear: { title: 'Pause for human review.', hint: 'Sam did not give a clear yes. No booking is saved and Taylor is not called.' },
  conflict: { title: 'The opening is no longer free.', hint: 'Sam accepted, but the availability check prevented a conflicting booking.' },
};
export function initialState() {
  return { phase: 'opening', calls: 0, available: true, history: ['Thursday 14:00 opened up.'] };
}
export function advance(state, action) {
  const next = { ...state, history: [...state.history] };
  const move = (phase, event) => { next.phase = phase; if (event) next.history.push(event); return next; };
  if (action === 'availability' && state.phase === 'review') return { ...state, available: !state.available };
  switch (state.phase + ':' + action) {
    case 'opening:call-alex': next.calls = 1; return move('alex', 'CALL-E called Alex.');
    case 'alex:decline': return move('declined', 'Alex: “I can’t make that time.”');
    case 'declined:call-sam': next.calls = 2; return move('sam', 'CALL-E called Sam.');
    case 'sam:accept': return move('accepted', 'Sam accepted. Calling stopped; Taylor was not called.');
    case 'sam:unclear': return move('unclear', 'Sam’s answer was unclear. Stopped for human review; no booking saved.');
    case 'accepted:review': return move('review');
    case 'review:save': return state.available ? move('booked', 'Availability checked. Thursday 14:00 → Sam, saved in the local diary.') : move('conflict', 'Availability check failed. No booking saved.');
    default: return state;
  }
}
export function viewOf(state) {
  const p = state.phase, first = p === 'alex' || p === 'declined';
  const home = ['alex', 'declined', 'sam', 'accepted'].includes(p);
  const accepted = ['accepted', 'review', 'booked', 'conflict'].includes(p);
  return {
    ...state, ...phases[p], location: home ? first ? 'alex' : 'sam' : 'salon',
    answered: p === 'declined' || p === 'accepted',
    alex: p === 'opening' ? 'Waiting' : p === 'alex' ? 'Calling…' : 'Unavailable',
    sam: ['opening', 'alex', 'declined'].includes(p) ? 'Waiting' : p === 'sam' ? 'Calling…' : p === 'unclear' ? 'Needs review' : 'Accepted',
    taylor: accepted || p === 'unclear' ? 'Not called' : 'Waiting',
    slot: p === 'booked' ? 'booked' : p === 'conflict' ? 'conflict' : 'open',
    caller: first ? 'Alex' : 'Sam',
    reply: p === 'declined' ? '“I can’t make that time.”' : p === 'accepted' ? '“Yes, Thursday at two works.”' : '“Can you take Thursday at two?”',
  };
}

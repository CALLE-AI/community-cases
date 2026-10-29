export const cases = {
  'conversation-clarify': { name: 'Conversation-Clarify', kind: 'office' },
  'care-call-ai': { name: 'Care Call AI', kind: 'care' },
  hungrycall: { name: 'HungryCall', kind: 'restaurants' },
};
export const restaurants = [
  { name: 'Trattoria', price: 32, delivery: true },
  { name: 'Burger House', price: 18, delivery: false },
  { name: 'Asia Wok', price: 24, delivery: true },
  { name: 'Sushi Kudo', price: 29, delivery: true },
];
export function restaurantDecision(restaurant, budget) {
  return !restaurant.delivery ? 'No delivery' : restaurant.price > budget ? 'Over budget' : 'Match';
}
export function initialState(id) {
  return { id, phase: id === 'hungrycall' ? 'brief' : 'start', calls: 0, history: [], needs: [], budget: 25, index: 0, results: [], answer: null, uncertain: false };
}
export function advance(state, action, value) {
  const s = { ...state, history: [...state.history], needs: [...state.needs], results: [...state.results] };
  const move = (phase, event) => { s.phase = phase; if (event) s.history.push(event); return s; };
  const key = state.phase + ':' + action;
  if (state.id === 'conversation-clarify') {
    switch (key) {
      case 'start:inspect': return move('approval');
      case 'approval:call': s.calls = 1; return move('calling', 'Approved one simulated call: morning or afternoon?');
      case 'calling:afternoon': s.answer = 'Afternoon, please.'; return move('answer', 'Phone quote: “Afternoon, please.”');
      case 'calling:unclear': return move('unresolved', 'No clear choice. No draft was created.');
      case 'answer:draft': return move('draft', 'Afternoon added to an unsent draft. Recipient and original thread still need review.');
    }
  } else if (state.id === 'care-call-ai') {
    switch (key) {
      case 'start:check-in': s.calls = 1; return move('checkin', '09:30 · Coordinator approved a simulated check-in with Morgan.');
      case 'checkin:cleaning': s.needs.push('Cleaning'); return move('recorded', '09:30 · “Could someone help with cleaning?”');
      case 'recorded:callback': s.calls = 2; return move('callback', '11:10 · Morgan calls back. The cleaning request is retained.');
      case 'callback:groceries': s.needs.push('Groceries'); return move('combined', '11:10 · “I also need groceries.”');
      case 'callback:unclear': s.uncertain = true; return move('combined', '11:10 · Callback unclear; flagged for a person to follow up.');
      case 'combined:handoff': return move('handoff', 'Prepared one handoff for coordinator review. No support has been arranged or delivered.');
    }
  } else if (state.id === 'hungrycall') {
    if (key === 'brief:budget') return { ...state, budget: value };
    if (key === 'brief:search') {
      if (!Number.isFinite(state.budget) || state.budget < 1 || state.budget > 100) return state;
      s.calls = 1; return move('calling', `Delivery required. Maximum total $${state.budget}. Calling Trattoria.`);
    }
    if (key === 'calling:response') {
      const r = restaurants[state.index], decision = restaurantDecision(r, state.budget);
      s.results.push(decision);
      return move(decision === 'Match' ? 'matched' : state.index === restaurants.length - 1 ? 'exhausted' : 'rejected', `${r.name}: ${decision} · $${r.price} total.`);
    }
    if (key === 'rejected:next') { s.index++; s.calls++; return move('calling', `Calling ${restaurants[s.index].name}.`); }
  }
  return state;
}
const office = {
  start: ['One reply. One missing detail.', 'At the desk', 'inspect', 'Find the missing detail', 6],
  approval: ['Ask just what is missing.', 'Before the call', 'call', 'Approve this sample call', 6],
  calling: ['Let the person choose.', 'On the other end', 'afternoon', '“Afternoon, please.”', 7],
  answer: ['Keep the answer and its words.', 'Back to the email', 'draft', 'Prepare the draft', 4],
  draft: ['A clearer reply, still yours to send.', 'Draft for review'],
  unresolved: ['The question stays open.', 'Human follow-up'],
};
const care = {
  start: ['A small check-in, with permission.', 'Morgan’s home', 'check-in', 'Approve sample check-in', 6],
  checkin: ['Listen to what Morgan needs.', '09:30 · First check-in', 'cleaning', 'Record the cleaning request', 6],
  recorded: ['One need is on the record.', '09:30 · Cleaning retained', 'callback', 'Take the later callback', 4],
  callback: ['“There’s one more thing…”', '11:10 · Same-day callback', 'groceries', '“I also need groceries.”', 7],
  combined: ['The new request joins the first.', 'One record for today', 'handoff', 'Prepare the team handoff', 5],
  handoff: ['Two conversations. One handoff.', 'For the coordinator'],
};
export function viewOf(state) {
  const kind = cases[state.id].kind;
  let row, location;
  if (kind === 'office') { row = office[state.phase]; location = state.phase === 'calling' ? 'recipient' : 'desk'; }
  else if (kind === 'care') {
    row = care[state.phase];
    if (state.phase === 'combined' && state.uncertain) row = ['Keep the request. Follow up on the callback.', ...row.slice(1)];
    location = ['combined', 'handoff'].includes(state.phase) ? 'coordinator' : 'home';
  }
  else {
    const r = restaurants[state.index];
    location = state.phase === 'brief' ? 'street' : r.name;
    row = state.phase === 'brief' ? ['Dinner starts with the brief.', 'A short walk through the options', 'search', 'Start the sample search', 7]
      : state.phase === 'calling' ? [`Ask ${r.name}.`, 'Check price and delivery', 'response', 'Hear the saved response', 5]
      : state.phase === 'rejected' ? [state.results.at(-1) === 'Over budget' ? 'Good food. Too much for this brief.' : 'No delivery. Try the next restaurant.', r.name, 'next', `Try ${restaurants[state.index + 1].name}`, 4]
      : state.phase === 'matched' ? ['Both conditions met. Stop here.', r.name + ' · delivery match']
      : ['The brief has no match today.', 'All four checked'];
  }
  const [title, place, action, label, delay] = row;
  return { ...state, kind, title, place, action, label, delay, location, done: !action };
}

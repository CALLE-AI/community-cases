const { test } = require('node:test');
const assert = require('node:assert/strict');
const load = () => import('../assets/ringback-demo/state.mjs');
test('automatic defaults and the same manual choices produce exactly the same diary and history', async () => {
  const { initialState, advance, phases } = await load();
  let auto=initialState();
  for(let i=0;i<10 && phases[auto.phase].action;i++) auto=advance(auto,phases[auto.phase].action);
  let manual=initialState();
  for(const action of ['call-alex','decline','call-sam','accept','review','save']) manual=advance(manual,action);
  assert.deepEqual(auto,manual); assert.equal(auto.phase,'booked'); assert.equal(auto.calls,2);
  assert.equal(auto.history.filter(e=>e.startsWith('CALL-E called')).length,2);
  assert.equal(advance(auto,'call-sam'),auto);assert.equal(advance(auto,'save'),auto);
});
test('unclear answer stops without booking or calling Taylor', async () => {
  const { initialState, advance, viewOf, phases }=await load();let s=initialState();
  for(const action of ['call-alex','decline','call-sam','unclear']) s=advance(s,action);
  assert.equal(s.phase,'unclear');assert.equal(phases[s.phase].action,undefined);assert.equal(s.calls,2);
  assert.equal(viewOf(s).taylor,'Not called');assert.equal(viewOf(s).slot,'open');
  assert.equal(advance(s,'save'),s);assert.equal(advance(s,'accept'),s);
});
test('availability is rechecked on save; an accepted call cannot bypass a conflict', async () => {
  const { initialState,advance,viewOf }=await load();let s=initialState();
  for(const action of ['call-alex','decline','call-sam','accept','review']) s=advance(s,action);
  const original=s;s=advance(s,'availability');assert.equal(s.available,false);assert.equal(original.available,true);
  const conflict=advance(s,'save');assert.equal(conflict.phase,'conflict');assert.equal(viewOf(conflict).sam,'Accepted');assert.equal(viewOf(conflict).taylor,'Not called');
  assert.equal(advance(advance(s,'availability'),'save').phase,'booked');
});
test('out-of-order, duplicate and stale actions do not advance or duplicate calls', async () => {
  const {initialState,advance}=await load();let s=initialState();
  for(const a of ['accept','save','call-sam','availability']) assert.equal(advance(s,a),s);
  s=advance(s,'call-alex');assert.equal(advance(s,'call-alex'),s);assert.equal(s.calls,1);
  s=advance(advance(s,'decline'),'call-sam');assert.equal(advance(s,'decline'),s);assert.equal(s.calls,2);
  const reset=initialState();assert.equal(reset.calls,0);assert.equal(reset.available,true);assert.equal(reset.history.length,1);
});

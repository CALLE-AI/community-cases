const {test}=require('node:test');
const assert=require('node:assert/strict');
const load=()=>import('../assets/case-demos/data.mjs');
async function run(id, choices={}) {
 const {initialState,advance,viewOf}=await load();let state=initialState(id);
 if(choices.budget!==undefined)state=advance(state,'budget',choices.budget);
 for(let i=0;i<20&&viewOf(state).action;i++)state=advance(state,choices[state.phase]||viewOf(state).action);
 return state;
}
test('all three idle stories finish with their own result and no external fulfillment',async()=>{
 const office=await run('conversation-clarify');assert.equal(office.phase,'draft');assert.equal(office.calls,1);assert.equal(office.answer,'Afternoon, please.');
 const care=await run('care-call-ai');assert.equal(care.phase,'handoff');assert.equal(care.calls,2);assert.deepEqual(care.needs,['Cleaning','Groceries']);
 const food=await run('hungrycall');assert.equal(food.phase,'matched');assert.equal(food.calls,3);assert.deepEqual(food.results,['Over budget','No delivery','Match']);
});
test('unresolved phone answers never manufacture a draft or a new care request',async()=>{
 const office=await run('conversation-clarify',{calling:'unclear'});assert.equal(office.phase,'unresolved');assert.equal(office.answer,null);
 const care=await run('care-call-ai',{callback:'unclear'});assert.equal(care.phase,'handoff');assert.deepEqual(care.needs,['Cleaning']);assert.equal(care.uncertain,true);
 const {initialState,advance,viewOf}=await load();let pending=initialState('care-call-ai');
 for(const action of ['check-in','cleaning','callback','unclear'])pending=advance(pending,action);
 assert.equal(viewOf(pending).title,'Keep the request. Follow up on the callback.');
});
test('restaurant budget changes the first match; invalid budgets cannot start or alter an active search',async()=>{
 const {initialState,advance}=await load();
 for(const [budget,calls,result] of [[40,1,'matched'],[25,3,'matched'],[24,3,'matched'],[23.99,4,'exhausted'],[10,4,'exhausted']]) {
  const state=await run('hungrycall',{budget});assert.equal(state.calls,calls);assert.equal(state.phase,result);
  assert.equal(advance(state,'response'),state);assert.equal(advance(state,'budget',100),state);
 }
 for(const budget of [NaN,Infinity,0,-1,100.1]){const state=advance(initialState('hungrycall'),'budget',budget);assert.equal(advance(state,'search'),state);}
});
test('delivery rejection does not claim the restaurant fits the budget',async()=>{
 const {initialState,advance,viewOf}=await load();
 for(const budget of [1,10,17.99,18,25]) {
  let state=advance(initialState('hungrycall'),'budget',budget);
  for(const action of ['search','response','next','response'])state=advance(state,action);
  assert.equal(state.phase,'rejected');assert.equal(state.results.at(-1),'No delivery');
  assert.equal(viewOf(state).title,'No delivery. Try the next restaurant.');
 }
});
test('transitions are immutable and duplicate actions cannot duplicate calls or needs',async()=>{
 const {initialState,advance}=await load();const original=initialState('care-call-ai'),first=advance(original,'check-in');
 assert.equal(original.calls,0);assert.deepEqual(original.history,[]);assert.equal(advance(first,'check-in'),first);
 const cleaning=advance(first,'cleaning');assert.deepEqual(cleaning.needs,['Cleaning']);assert.equal(advance(cleaning,'cleaning'),cleaning);
 assert.equal(advance(initialState('conversation-clarify'),'draft').phase,'start');
});
module.exports={run};

const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');

async function page(reduce=false,caseId='conversation-clarify') {
 const data=await import('../assets/case-demos/data.mjs');
 const frames=new Map(),elements=new Map();let now=0,id=0,observer,paints=0;
 const document={hidden:false,activeElement:null,addEventListener(type,fn){this[type]=fn;},createElement:()=>({})};
 const control={inWorld:true,focus(){document.activeElement=this;},closest:()=>({}),matches:()=>false,checkValidity:()=>true};
 function element() {return {dataset:{},events:{},addEventListener(type,fn){this.events[type]=fn;},setAttribute(){},replaceChildren(){},querySelector:()=>control,contains:node=>!!node?.inWorld};}
 const find=selector=>{if(!elements.has(selector))elements.set(selector,element());return elements.get(selector);};
 const host={...element(),dataset:{caseDemo:caseId},querySelector:find};document.querySelector=()=>host;
 const context={...data,URL,document,paint:()=>{paints++;},matchMedia:()=>({matches:reduce,addEventListener(){}}),requestAnimationFrame:fn=>{frames.set(++id,fn);return id;},cancelAnimationFrame:key=>frames.delete(key),IntersectionObserver:class{constructor(fn){observer=fn;}observe(){observer([{isIntersecting:true}]);}}};
 let code=fs.readFileSync(require.resolve('../assets/case-demos/demo.mjs'),'utf8').replace(/^import .*;\n/gm,'').replaceAll('import.meta.url',"'http://localhost/assets/case-demos/demo.mjs'");
 code=code.replace(/import\('\.\/scene[^']*'\)/,'Promise.resolve({createScene:()=>({render:paint})})');
 vm.runInNewContext(code+'\nthis.snapshot=()=>({phase:state.phase,idle,auto,age});',context);await Promise.resolve();
 return {host,find,document,control,snapshot:context.snapshot,paintCount:()=>paints,
  fire(target,type,event={}){target.events[type]?.({target:control,...event});},
  advance(ms,step=20){for(let elapsed=0;elapsed<ms;elapsed+=step){now+=step;const callbacks=[...frames.values()];frames.clear();callbacks.forEach(fn=>fn(now));}},
  visible(value){observer([{isIntersecting:value}]);},
 };
}
test('all three flows automatically finish after a user stops interacting',async()=>{
 for(const [id,result] of [['conversation-clarify','draft'],['care-call-ai','handoff'],['hungrycall','matched']]) {
  const p=await page(false,id);p.document.activeElement=p.control;p.fire(p.host,'keydown');p.advance(65000);
  assert.equal(p.snapshot().phase,result,id);
 }
});
test('input only resets idle; each visible display frame advances animation',async()=>{
 const p=await page();p.advance(500);const start=p.snapshot().age,before=p.paintCount();
 for(let i=0;i<120;i++){p.fire(p.host,'pointermove');p.advance(1000/60,1000/60);}
 assert.ok(p.snapshot().age-start>=1990);assert.ok(p.snapshot().idle<18);assert.equal(p.snapshot().phase,'start');assert.ok(p.paintCount()-before>=120);
 p.advance(6500);assert.equal(p.snapshot().phase,'approval');
});
test('pause, offscreen and reduced motion leave the scene operable without continuous rendering',async()=>{
 const p=await page();p.find('.flow-auto').onclick();p.advance(60000);assert.equal(p.snapshot().phase,'start');
 p.visible(false);const before=p.paintCount();p.advance(5000);assert.equal(p.paintCount(),before);
 const r=await page(true);r.advance(1000);const still=r.paintCount();r.advance(40000);assert.equal(r.paintCount(),still);assert.equal(r.snapshot().phase,'start');
 r.find('.flow-auto').onclick();r.advance(50000);assert.equal(r.snapshot().phase,'draft');
});

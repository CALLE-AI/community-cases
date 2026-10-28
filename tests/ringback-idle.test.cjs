const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');

async function page(reduce=false) {
 const data=await import('../assets/ringback-demo/state.mjs');
 const frames=new Map(),elements=new Map();let now=0,id=0,observer,paints=0;
 const document={hidden:false,activeElement:null,addEventListener(type,fn){this[type]=fn;},createElement:()=>({})};
 const control={inWorld:true,focus(){document.activeElement=this;},closest:()=>({}),matches:()=>false};
 function element() {return {dataset:{},events:{},addEventListener(type,fn){this.events[type]=fn;},setAttribute(){},replaceChildren(){},querySelector:()=>control,contains:node=>!!node?.inWorld};}
 const find=selector=>{if(!elements.has(selector))elements.set(selector,element());return elements.get(selector);};
 const host={...element(),querySelector:find};document.querySelector=()=>host;
 const context={...data,URL,document,paint:()=>{paints++;},matchMedia:()=>({matches:reduce,addEventListener(){}}),requestAnimationFrame:fn=>{frames.set(++id,fn);return id;},cancelAnimationFrame:key=>frames.delete(key),IntersectionObserver:class{constructor(fn){observer=fn;}observe(){observer([{isIntersecting:true}]);}}};
 let code=fs.readFileSync(require.resolve('../assets/ringback-demo/app.mjs'),'utf8').replace(/^import .*;\n/gm,'').replaceAll('import.meta.url',"'http://localhost/assets/ringback-demo/app.mjs'");
 code=code.replace(/import\('\.\/scene[^']*'\)/,'Promise.resolve({createScene:()=>({render:paint})})');
 vm.runInNewContext(code+'\nthis.snapshot=()=>({phase:state.phase,idle,auto,age});',context);await Promise.resolve();
 return {host,find,document,control,snapshot:context.snapshot,paintCount:()=>paints,
  fire(target,type,event={}){target.events[type]?.({target:control,...event});},
  advance(ms,step=20){for(let elapsed=0;elapsed<ms;elapsed+=step){now+=step;const callbacks=[...frames.values()];frames.clear();callbacks.forEach(fn=>fn(now));}},
  visible(value){observer([{isIntersecting:value}]);},
 };
}
test('a parked pointer or keyboard focus cannot indefinitely stop the full idle demonstration',async()=>{
 for(const method of['pointer','keyboard']) {
  const p=await page(),world=p.find('.rb-world');
  if(method==='pointer')p.fire(world,'pointerover',{pointerType:'mouse'});
  else {p.document.activeElement=p.control;p.fire(p.host,'keydown',{key:'Tab'});p.fire(p.host,'focusin');}
  p.advance(6200);assert.equal(p.snapshot().phase,'alex',method);
  p.advance(25000);assert.equal(p.snapshot().phase,'booked',method);
 }
});
test('real input restarts the wait, then automatic progression resumes without pointer exit or blur',async()=>{
 const p=await page();p.advance(4000);p.fire(p.host,'pointermove');p.advance(4000);
 assert.equal(p.snapshot().phase,'opening');p.advance(2200);assert.equal(p.snapshot().phase,'alex');
 p.document.activeElement=p.control;p.fire(p.host,'keydown',{key:'ArrowDown'});p.advance(5200);assert.equal(p.snapshot().phase,'declined');
});
test('explicit pause, reduced motion and offscreen pages retain their pause behavior',async()=>{
 const paused=await page();paused.find('.rb-auto').onclick();paused.advance(40000);assert.equal(paused.snapshot().phase,'opening');
 paused.find('.rb-auto').onclick();paused.advance(6200);assert.equal(paused.snapshot().phase,'alex');
 const reduced=await page(true);reduced.advance(40000);assert.equal(reduced.snapshot().phase,'opening');
 const hidden=await page();hidden.visible(false);hidden.advance(40000);assert.equal(hidden.snapshot().phase,'opening');
 hidden.visible(true);hidden.advance(6200);assert.equal(hidden.snapshot().phase,'alex');
});

test('visible scenes keep rendering after the entrance and stop rendering offscreen',async()=>{
 const p=await page();p.find('.rb-auto').onclick();p.advance(3000);const before=p.paintCount();
 p.advance(1000);assert.ok(p.paintCount()>before+15);
 p.visible(false);const stopped=p.paintCount();p.advance(5000);assert.equal(p.paintCount(),stopped);
});

test('animation uses each display frame instead of alternating 33ms and 50ms gaps',async()=>{
 const p=await page();p.find('.rb-auto').onclick();p.advance(1000,1000/60);const before=p.paintCount();
 p.advance(3000,1000/60);const painted=p.paintCount()-before;
 assert.ok(painted>=179&&painted<=181,`expected about 180 display frames, got ${painted}`);
});
test('continuous pointer activity resets idle time without freezing scene time',async()=>{
 const p=await page();p.advance(500);const before=p.snapshot().age;
 for(let i=0;i<100;i++){p.fire(p.host,'pointermove');p.advance(20);}
 assert.ok(p.snapshot().age-before>=1980);assert.ok(p.snapshot().idle<=20);
 assert.equal(p.snapshot().phase,'opening');
});

test('reduced motion stays still between actions and can still finish an explicitly resumed auto flow',async()=>{
 const p=await page(true);p.advance(1000);const before=p.paintCount();
 p.advance(4000);assert.equal(p.paintCount(),before);
 p.find('.rb-auto').onclick();p.advance(32000);assert.equal(p.snapshot().phase,'booked');
});

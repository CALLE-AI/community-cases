const {test} = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');

async function page() {
  const data = await import('../assets/case-demos/data.mjs');
  const timing = await import('../assets/case-demos/timing.mjs');
  const {createPlayback} = await import('../assets/local-atlas-demo/playback.mjs');
  const elements = new Map(), chapters = Array.from({length:4},()=>({setAttribute(){},removeAttribute(){}}));
  const find = selector => {
    if (!elements.has(selector)) elements.set(selector,{value:0,hidden:true,disabled:false,setAttribute(){},replaceChildren(){}});
    return elements.get(selector);
  };
  const audio = {src:'narration.mp3',currentTime:0,paused:true,plays:0,load(){},pause(){this.paused=true;},play(){this.paused=false;this.plays++;return Promise.resolve();}};
  elements.set('audio',audio);
  const host={dataset:{caseDemo:'conversation-clarify',duration:'25'},querySelector:find,querySelectorAll:s=>s==='.demo-chapters button'?chapters:[]};
  let receive;
  const context={...data,...timing,createPlayback,document:{hidden:false,querySelector:()=>host,addEventListener(){},createElement:()=>({})},matchMedia:()=>({matches:false,addEventListener(){}}),requestAnimationFrame:()=>1,cancelAnimationFrame(){},URL:{createObjectURL:()=> 'blob:sample'},fetch:()=>new Promise(resolve=>{receive=resolve;}),IntersectionObserver:class{constructor(cb){this.cb=cb;}observe(){this.cb([{isIntersecting:true}]);}}};
  let code=fs.readFileSync(require.resolve('../assets/case-demos/demo.mjs'),'utf8').replace(/^import .*;\n/gm,'');
  code=code.replace(/import\('\.\/scene[^']*'\)/,'Promise.resolve({createScene:()=>({render(){}})})');
  vm.runInNewContext(code+'\nthis.playbackForTest=playback;',context);
  await Promise.resolve();
  return {find,chapters,audio,playback:context.playbackForTest,respond:()=>receive({ok:true,blob:async()=>({})})};
}

test('waiting for narration freezes the opening scene until audio is ready',async()=>{
  const p=await page();p.playback.advance(0);p.playback.advance(5000);
  const start=p.find('.demo-voice').onclick();
  p.playback.advance(10000);p.playback.advance(15000);
  assert.equal(p.playback.snapshot().time,0);assert.equal(p.playback.snapshot().playing,false);assert.equal(p.audio.plays,0);
  p.respond();await start;
  assert.equal(p.playback.snapshot().time,0);assert.equal(p.playback.snapshot().narration,true);assert.equal(p.audio.plays,1);
});

test('a chapter selection cancels pending narration and is not reset by its late download',async()=>{
  const p=await page();const pending=p.find('.demo-voice').onclick();p.chapters[3].onclick();
  const selected=p.playback.snapshot().time;p.respond();await pending;
  assert.equal(p.playback.snapshot().time,selected);assert.equal(p.playback.snapshot().narration,false);assert.equal(p.audio.plays,0);assert.equal(p.find('.demo-voice').disabled,false);
});

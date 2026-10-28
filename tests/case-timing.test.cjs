const {test}=require('node:test');
const assert=require('node:assert/strict');
test('speech cues and chapter previews share a monotonic complete timeline',async()=>{
 const {timing,chapterAt,storyTime}=await import('../assets/case-demos/timing.mjs');
 for(const [kind,cues] of Object.entries(timing)) {
  assert.equal(storyTime(kind,0),0);assert.equal(storyTime(kind,25),25);
  for(let i=1;i<cues.points.length;i++) {assert.ok(cues.points[i][0]>cues.points[i-1][0]);assert.ok(cues.points[i][1]>cues.points[i-1][1]);}
  cues.previews.forEach((time,index)=>assert.equal(chapterAt(kind,time),index));
 }
});
test('answers and requests appear at their spoken cues and a booking waits for the diary phase',async()=>{
 const {storyTime}=await import('../assets/case-demos/timing.mjs');
 const {buildStory}=await import('../assets/case-demos/stories.mjs');
 const office=buildStory('office');office.sample(storyTime('office',13));assert.equal(office.moving[0].visible,false);office.sample(storyTime('office',14.4));assert.equal(office.moving[0].visible,true);
 const care=buildStory('care');care.sample(storyTime('care',10.8));assert.equal(care.moving[0].visible,true);assert.equal(care.moving[1].visible,false);care.sample(storyTime('care',13.1));assert.ok(care.moving.every(o=>o.visible));
 const studio=buildStory('studio');studio.sample(storyTime('studio',21));assert.ok(studio.moving[0].position.y>3);studio.sample(storyTime('studio',24));assert.equal(studio.moving[0].position.y,1.65);
 const restaurants=buildStory('restaurants');restaurants.sample(storyTime('restaurants',14));assert.equal(restaurants.moving[0].visible,false);restaurants.sample(storyTime('restaurants',14.6));assert.equal(restaurants.moving[0].visible,true);
});

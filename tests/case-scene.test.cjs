const {test}=require('node:test');
const assert=require('node:assert/strict');
const load=()=>Promise.all([import('../assets/case-demos/stories.mjs'),import('../assets/local-atlas-demo/vendor/three.module.min.js'),import('../assets/case-demos/data.mjs')]);
function visible(o){for(let p=o;p;p=p.parent)if(!p.visible)return false;return true;}
function projected(object,camera,T) {
 const b=new T.Box3().setFromObject(object),out=new T.Box2();
 for(const x of [b.min.x,b.max.x])for(const y of[b.min.y,b.max.y])for(const z of[b.min.z,b.max.z]){const p=new T.Vector3(x,y,z).project(camera);out.expandByPoint(new T.Vector2(p.x,p.y));}return out;
}
async function states(id) {
 const [,,{initialState,advance,viewOf}]=await load();const out=[];
 for(const branch of ['default','unclear']){
  let state=initialState(id);
  for(let i=0;i<20;i++){
   const v=viewOf(state);out.push(v);if(v.done)break;
   state=advance(state,branch==='unclear'&&((id==='conversation-clarify'&&v.phase==='calling')||(id==='care-call-ai'&&v.phase==='callback'))?'unclear':v.action);
  }
 }
 if(id==='hungrycall'){
  let s=advance(initialState(id),'budget',10);for(let i=0;i<20;i++){const v=viewOf(s);out.push(v);if(v.done)break;s=advance(s,v.action);}
 }
 return out;
}
for(const [id,kind] of [['conversation-clarify','office'],['care-call-ai','care'],['hungrycall','restaurants']]) {
 test(kind+': all branch poses reconstruct and reduced motion stays still',async()=>{
  const [{buildStory}]=await load(),w=buildStory(kind),views=await states(id);
  const snapshot=()=>{const out=[];w.root.traverse(o=>out.push([o.visible,...o.position.toArray(),...o.quaternion.toArray(),...o.scale.toArray()]));return out;};
  for(const v of views){
   w.sample(v,.7);const before=snapshot();w.sample(views[0],5);w.sample(v,.7);assert.deepEqual(snapshot(),before);
   w.sample(v,.1,2,true);const still=snapshot();w.sample(v,5,2,true);assert.deepEqual(snapshot(),still);
  }
 });
 test(kind+': records stay clear of faces during motion and cameras retain the active content',async()=>{
  const [{buildStory},T]=await load(),w=buildStory(kind),views=await states(id);
  for(const [width,height,narrow] of [[1120,660,false],[837,660,false],[689,360,true],[339,360,true],[269,360,true]]) {
   const panel=new T.Box2(new T.Vector2(1-2*330/width,-.9),new T.Vector2(1,1-2*132/height));
   for(const v of views)for(let f=0;f<=90;f+=3){
    w.sample(v,f/30,width/height,false,narrow);
    for(const a of w.actors){
     const head=new T.Box3().setFromObject(a.head),phone=new T.Box3().setFromObject(a.phone);
     // World-aligned bounds are conservative for the inward-rotating handset; exact contact is covered by the shared rig tests.
     if(visible(a.phone))assert.ok(head.getCenter(new T.Vector3()).distanceTo(phone.getCenter(new T.Vector3()))>.1);
     for(const record of w.records)if(visible(record))assert.equal(head.intersectsBox(new T.Box3().setFromObject(record)),false,`${id} record/head ${v.phase} ${f}`);
    }
    if(f>=90 && !(kind==='restaurants' && v.phase==='brief')) {
     const activeActor=kind==='office'?w.actors[v.phase==='calling'?1:0]:kind==='care'?w.actors[v.phase==='handoff'?1:0]:w.actors[v.index];
     const b=projected(activeActor.head,w.camera,T);
     assert.ok(b.min.x>=-1&&b.max.x<=1&&b.min.y>=-1&&b.max.y<=1,`${id} active face clipped ${v.phase} ${width}`);
     if(!narrow){const o=b.clone().intersect(panel).getSize(new T.Vector2());assert.ok(o.x<=0||o.y<=0,`${id} panel/active face ${v.phase} ${width}`);}
    }
    if(f>=45)for(const record of w.records)if(visible(record)){
     const b=projected(record,w.camera,T);
     assert.ok(b.min.x>=-1&&b.max.x<=1&&b.min.y>=-1&&b.max.y<=1,`${id} record clipped ${v.phase} ${f} ${width}`);
     if(!narrow){const o=b.clone().intersect(panel).getSize(new T.Vector2());assert.ok(o.x<=0||o.y<=0,`${id} panel/record ${v.phase} ${f} ${width}`);}
    }
   }
  }
 });
}
test('care retains the first physical note on callbacks and hands off the complete record',async()=>{
 const [{buildStory},,D]=await load();const w=buildStory('care');let s=D.initialState('care-call-ai');
 for(const action of ['check-in','cleaning','callback'])s=D.advance(s,action);
 w.sample(D.viewOf(s),3);assert.equal(w.records.find(o=>o.name==='cleaning').visible,true);assert.equal(w.records.find(o=>o.name==='groceries').visible,false);
 s=D.advance(D.advance(s,'groceries'),'handoff');w.sample(D.viewOf(s),3);assert.ok(w.records.every(o=>o.visible));assert.equal(w.records[0].parent,w.records[1].parent);
});

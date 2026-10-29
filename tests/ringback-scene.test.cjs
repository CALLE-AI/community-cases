const { test }=require('node:test');
const assert=require('node:assert/strict');
const load=()=>Promise.all([import('../assets/ringback-demo/scene.mjs'),import('../assets/local-atlas-demo/vendor/three.module.min.js'),import('../assets/ringback-demo/state.mjs')]);
function bounds(object,camera,THREE) {
 const b=new THREE.Box3().setFromObject(object),out=new THREE.Box2();
 for(const x of[b.min.x,b.max.x])for(const y of[b.min.y,b.max.y])for(const z of[b.min.z,b.max.z]) {const p=new THREE.Vector3(x,y,z).project(camera);out.expandByPoint(new THREE.Vector2(p.x,p.y));}
 return out;
}
function boxIn(object,reference,T) {
 const out=new T.Box3(),inverse=reference.matrixWorld.clone().invert();
 object.traverse(o=>{if(!o.isMesh)return;o.geometry.computeBoundingBox();const b=o.geometry.boundingBox,m=inverse.clone().multiply(o.matrixWorld);
  for(const x of[b.min.x,b.max.x])for(const y of[b.min.y,b.max.y])for(const z of[b.min.z,b.max.z])out.expandByPoint(new T.Vector3(x,y,z).applyMatrix4(m));
 });return out;
}
test('all stages keep faces clear of the native controls, with phones outside heads',async()=>{
 const [{buildWorld},T,{phases,initialState,viewOf}]=await load();const w=buildWorld();
 for(const [width,height,narrow] of [[1120,640,false],[837,640,false],[836,760,true],[689,760,true],[339,760,true],[269,760,true]])for(const p of Object.keys(phases))for(let f=0;f<=90;f++) {
  const aspect=width/(narrow?360:height),v=viewOf({...initialState(),phase:p});w.sample(v,f/30,aspect,false,narrow);
  const b=new T.Box2(new T.Vector2(1-2*324/width,-.8),new T.Vector2(1,1-2*126/height));
  for(const a of Object.values(w.actors)) {
   assert.equal(boxIn(a.head,a.head,T).intersectsBox(boxIn(a.phone,a.head,T)),false,`phone/head ${p}, ${f}`);
   if(!narrow && a.g.parent.visible){const overlap=b.clone().intersect(bounds(a.head,w.camera,T)).getSize(new T.Vector2());assert.ok(overlap.x<=0||overlap.y<=0,`panel/face ${p}, ${aspect}`);}
  }
 }
});
test('restart and arbitrary branch changes reconstruct poses; reduced motion removes gesture movement',async()=>{
 const [{buildWorld},T,{initialState,viewOf}]=await load();const w=buildWorld();
 const snapshot=()=>{const out=[];w.root.traverse(o=>out.push([o.visible,...o.position.toArray(),...o.quaternion.toArray(),...o.scale.toArray()]));return out;};
 for(const p of ['opening','alex','declined','sam','accepted','review','conflict','unclear','booked']){
  const v=viewOf({...initialState(),phase:p});w.sample(v,.4);const before=snapshot();w.sample(viewOf(initialState()),0);w.sample(v,.4);assert.deepEqual(snapshot(),before);
  w.sample(v,.1,2,true);const still=snapshot();w.sample(v,2,2,true);assert.deepEqual(snapshot(),still);
 }
});
test('earpiece stays beside the ear with screen inward; arm lengths remain fixed throughout the lift',async()=>{
 const [{buildWorld},T]=await load();const w=buildWorld();
 for(const actor of Object.values(w.actors)) {
  for(let f=0;f<=60;f++) {
   actor.pose(f/60);const {shoulder,elbow,wrist}=actor.joints;
   assert.ok(Math.abs(shoulder.distanceTo(elbow)-.23)<1e-9);
   assert.ok(Math.abs(elbow.distanceTo(wrist)-.22)<1e-9);
  }
  for(const reaction of[-1,0,1]) {
   actor.pose(1,reaction);w.root.updateMatrixWorld(true);
   const ear=actor.ear.getWorldPosition(new T.Vector3()),speaker=actor.speaker.getWorldPosition(new T.Vector3());
   assert.ok(Math.abs(ear.distanceTo(speaker)-.008*actor.g.scale.x)<1e-9,'earpiece floats away from ear');
   const normal=new T.Vector3(0,0,1).applyQuaternion(actor.phone.getWorldQuaternion(new T.Quaternion()));
   assert.ok(normal.dot(ear.sub(speaker).normalize())>.999,'screen must face the ear');
  }
 }
});
test('the reused two-bone solver clamps zero-distance and unreachable targets without stretching',async()=>{
 const {ik2}=await import('../assets/ringback-demo/ik2.mjs');
 for(const target of[[0,0],[10,0],[.1,.2]]) {
  const {E,H}=ik2([0,0],target,.23,.22);
  assert.ok([...E,...H].every(Number.isFinite));
  assert.ok(Math.abs(Math.hypot(...E)-.23)<1e-9);
  assert.ok(Math.abs(Math.hypot(E[0]-H[0],E[1]-H[1])-.22)<1e-9);
 }
});

test('the studio walk settles at the desk and call gestures continue past the entrance',async()=>{
 const [{buildWorld},T,{initialState,viewOf}]=await load();const w=buildWorld();
 const opening=viewOf(initialState());w.sample(opening,1);const start=w.stylist.g.position.clone();
 assert.notEqual(w.stylist.legs[0].hip.rotation.x,0);
 w.sample(opening,4);assert.ok(w.stylist.g.position.x>start.x+1);assert.ok(Math.abs(w.stylist.legs[0].hip.rotation.x)<1e-9);
 const call=viewOf({...initialState(),phase:'sam'});w.sample(call,3);const pose=w.actors.sam.head.quaternion.clone();
 w.sample(call,4);assert.notDeepEqual(w.actors.sam.head.quaternion.toArray(),pose.toArray());
 w.sample(viewOf({...initialState(),phase:'conflict'}),2);assert.equal(w.slip.visible,false);
 w.sample(viewOf({...initialState(),phase:'booked'}),2);assert.equal(w.slip.visible,true);
});

test('the stylist swings their free arm while walking and settles after arrival',async()=>{
 const [{buildWorld},,{initialState,viewOf}]=await load();const w=buildWorld();
 const opening=viewOf(initialState()),standing=viewOf({...initialState(),phase:'unclear'});
 for(const time of [.9,1.1,1.4,2.2]) {
  w.sample(opening,time);const walkingArm=w.stylist.freeArm.rotation.x;
  w.sample(standing,time);assert.ok(Math.abs(walkingArm-w.stylist.freeArm.rotation.x)>.01,`missing arm swing at ${time}s`);
 }
 w.sample(opening,4);const settledArm=w.stylist.freeArm.rotation.x;
 w.sample(standing,4);assert.equal(w.stylist.freeArm.rotation.x,settledArm);
});

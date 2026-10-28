import * as THREE from '../local-atlas-demo/vendor/three.module.min.js';
const smooth=x=>{x=Math.max(0,Math.min(1,x));return x*x*(3-2*x);};
export function createScene(host,config){
  const renderer=new THREE.WebGLRenderer({antialias:true,alpha:true});
  renderer.setPixelRatio(devicePixelRatio||1);renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;
  renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.setClearColor(0xeaf2fb,1);host.append(renderer.domElement);
  const evidence=document.createElement('div');evidence.className='scene-evidence';host.append(evidence);
  const statements={office:['Morning or afternoon?','Approve one call · ending 0142','“Afternoon, please.”','Reply draft · review before sending'],care:['Review Morgan’s check-in','Cleaning requested','Cleaning + groceries','One reviewed team handoff'],studio:['Thursday · 2:00 PM · open','Alex declines → offer to Sam','Sam accepts · stop calling','Thursday · 2:00 PM → Sam'],restaurants:['Delivery · maximum $25','Trattoria: $32 · Burger House: no delivery','Asia Wok · delivery · $24','Match kept · Sushi Kudo not called']};
  const scene=new THREE.Scene(),camera=new THREE.OrthographicCamera(-8,8,5,-5,.1,100),root=new THREE.Group();scene.add(root);
  scene.add(new THREE.HemisphereLight(0xffffff,0xb9b5a2,2.4));
  const light=new THREE.DirectionalLight(0xfff4dc,3);light.position.set(-3,9,6);light.castShadow=true;light.shadow.mapSize.set(2048,2048);Object.assign(light.shadow.camera,{left:-12,right:12,top:9,bottom:-9});light.shadow.normalBias=.035;scene.add(light);
  const mats=new Map();function mat(c){if(!mats.has(c))mats.set(c,new THREE.MeshStandardMaterial({color:c,roughness:.82}));return mats.get(c);}
  function mesh(g,c,x,y,z,parent=root){const m=new THREE.Mesh(g,mat(c));m.position.set(x,y,z);m.castShadow=true;m.receiveShadow=true;parent.add(m);return m;}
  const box=(w,h,d,c,x,y,z,p)=>mesh(new THREE.BoxGeometry(w,h,d),c,x,y,z,p);
  const cyl=(r,h,c,x,y,z,p)=>mesh(new THREE.CylinderGeometry(r,r,h,24),c,x,y,z,p);
  const ball=(r,c,x,y,z,p)=>mesh(new THREE.SphereGeometry(r,20,12),c,x,y,z,p);
  const cream=0xf5f0df,wood=0xb99b6b,blue=0x527dab,yellow=0xf0ce46,ink=0x2f3c3a,green=0x71916d;
  box(16,.24,7,0xdde4d8,0,-.12,0);box(16,.04,1,0xc3ceca,0,.02,2.8);
  function plant(x,z){cyl(.22,.38,wood,x,.2,z);cyl(.045,.8,wood,x,.7,z);ball(.38,green,x,1.1,z);ball(.29,0x98ae84,x+.2,1.32,z);}
  [-7.4,7.4].forEach(x=>plant(x,-1.8));
  function person(x,z,c){const g=new THREE.Group();g.position.set(x,0,z);root.add(g);box(.45,.72,.3,c,0,1.05,0,g);ball(.23,0xdcb992,0,1.64,0,g);ball(.235,0x61594d,0,1.75,-.06,g);ball(.035,ink,-.08,1.66,.21,g);ball(.035,ink,.08,1.66,.21,g);box(.19,.6,.22,ink,-.13,.42,0,g);box(.19,.6,.22,ink,.13,.42,0,g);box(.25,.12,.37,ink,-.13,.09,.06,g);box(.25,.12,.37,ink,.13,.09,.06,g);const arm=box(.13,.63,.14,c,-.32,1.04,0,g);box(.13,.63,.14,c,.32,1.04,0,g);ball(.085,0xdcb992,-.32,.71,0,g);return {g,arm};}
  function desk(x,z){box(2.1,.14,1.2,wood,x,1,z);for(const dx of [-.85,.85])for(const dz of [-.43,.43])box(.1,1,.1,ink,x+dx,.48,z+dz);}
  function screen(x,z){box(1.13,.72,.1,ink,x,1.57,z);box(1.01,.59,.02,0xd5e5df,x,1.57,z+.06);box(.12,.22,.12,ink,x,1.12,z);box(.55,.04,.3,ink,x,1.03,z);for(let i=0;i<3;i++)box(.7-i*.13,.025,.025,0x809e8d,x-.1,1.72-i*.15,z+.075);}
  function room(x,color){box(4.2,2.65,.15,color,x,1.33,-1.5);box(.15,2.65,2.8,color,x-2.1,1.33,-.15);box(1.1,1,.04,wood,x+.9,1.75,-1.39);box(.96,.86,.045,0xc6d9db,x+.9,1.75,-1.36);box(.04,.86,.04,cream,x+.9,1.75,-1.32);box(.96,.04,.04,cream,x+.9,1.75,-1.32);}
  const xs=[-5,0,5];let actors=[],receipt,calendarSlots=[],stores=[];
  if(config.kind==='restaurants'){
    for(let i=0;i<4;i++){const x=-5.7+i*3.8;box(3.1,2.3,2,cream,x,1.15,-.65);box(3.3,.18,2.2,[green,blue,0xb48868,green][i],x,2.4,-.65);box(1.5,1,.04,0xa2c6cb,x-.4,1.35,.38);box(.55,1.65,.08,wood,x+.95,.85,.4);for(let j=0;j<7;j++)box(.43,.1,.65,j%2?cream:[green,blue,0xb48868,green][i],x-1.29+j*.43,2.02,.68);actors.push(person(x,1.25,[yellow,blue,green,blue][i]));const flag=box(.2,.8,.08,0xc0c8bf,x-1.2,2.9,-.6);stores.push(flag);}
    receipt=new THREE.Group();root.add(receipt);box(.65,.55,.6,wood,0,.33,0,receipt);box(.12,.56,.61,yellow,0,.33,0,receipt);cyl(.08,.16,ink,-.22,.08,.24,receipt);cyl(.08,.16,ink,.22,.08,.24,receipt);
  }else{
    xs.forEach((x,i)=>room(x,i===1?0xe5e4d4:0xeeeada));
    desk(-5,0);screen(-5,-.25);actors.push(person(-4.4,1.2,yellow));
    if(config.kind==='care'){
      box(1.9,.48,.8,blue,0,.45,-.5);box(1.9,.8,.25,blue,0,.8,-.95);box(.24,.65,.8,blue,-1,.62,-.5);box(.24,.65,.8,blue,1,.62,-.5);actors.push(person(0,.55,green));plant(1.5,-.7);
      box(2,.12,1.1,wood,5,1,0);for(const x of [4.2,5.8])for(const z of [-.4,.4]){box(.07,.8,.07,ink,x,.55,z);ball(.12,ink,x,.13,z);}box(.9,.12,.6,cream,5,1.12,0);
      actors.push(person(6.4,.6,blue));
    }else if(config.kind==='studio'){
      cyl(.55,.13,ink,0,.2,0);cyl(.09,.65,ink,0,.55,0);box(.9,.18,.8,blue,0,.9,0);box(.9,1,.18,blue,0,1.3,-.35);box(.12,.2,.8,blue,-.5,1.05,0);box(.12,.2,.8,blue,.5,1.05,0);actors.push(person(1.15,.65,green));
      box(2.5,1.9,.15,wood,5,1.65,-.6);box(2.32,1.72,.03,cream,5,1.65,-.51);for(let i=0;i<6;i++)calendarSlots.push(box(.62,.57,.05,i===4?0xcdd8cc:blue,4.25+(i%3)*.75,2.05-Math.floor(i/3)*.75,-.47));actors.push(person(6.5,.9,blue));
    }else{desk(0,0);actors.push(person(.7,1.2,blue));desk(5,0);screen(5,-.25);box(1,.12,.7,wood,5.6,1.12,.25);actors.push(person(6.5,1,green));}
    // The receiver moves beside the face; the information label has its own reserved row.
    const receiver=new THREE.Group();receiver.name='receiver';root.add(receiver);box(.12,.42,.13,ink,0,0,0,receiver);box(.23,.12,.2,ink,0,.23,0,receiver);box(.23,.12,.2,ink,0,-.23,0,receiver);receipt=receiver;
  }
  const sheet=new THREE.Group();root.add(sheet);box(.68,.03,.85,cream,0,0,0,sheet);for(let i=0;i<3;i++)box(.45,.012,.04,blue,0,.025,-.2+i*.17,sheet);
  const second=sheet.clone();root.add(second);
  box(.3,.08,.45,yellow,0,1.1,.45);
  if(config.kind!=='restaurants'){for(const x of [-5,5]){box(.65,.035,.24,ink,x,1.1,.23);cyl(.1,.19,cream,x-.75,1.17,.24);for(let i=0;i<4;i++)box(.68,.025,.45,i%2?cream:blue,x+.65,1.1+i*.028,-.1);}}
  let width=1,height=1,last=0,lost=false;
  function render(progress=last,reduced=false){last=progress;if(lost)return;const beat=Math.min(3,Math.floor(progress*4)),p=reduced||progress>=1?1:smooth((progress*4)%1);host.dataset.beat=String(beat);
    const targets=config.kind==='restaurants'?[-5.7,-1.9,1.9,1.9]:config.kind==='care'?[-5,0,5,5]:[-5,0,2.5,5];const target=targets[beat],previous=targets[Math.max(0,beat-1)];const cx=reduced?target:previous+(target-previous)*smooth(p*(config.kind==='care'&&beat===2?6:2));
    const aspect=width/height,span=aspect<1?3.8:3.25;camera.left=-span*aspect;camera.right=span*aspect;camera.top=span;camera.bottom=-span;camera.position.set(cx+1.5,6.5,13);camera.lookAt(cx,1.15,0);camera.updateProjectionMatrix();
    if(config.kind==='restaurants'){
      const visited=beat===0?0:beat===1?Math.min(2,1+Math.floor(p*2)):3;stores.forEach((m,i)=>{m.material=mat(i<visited?(i===2?0x568c67:0xc88764):0xc0c8bf);});receipt.visible=beat>=2;receipt.position.set(1.9+(beat===3?p*2:0),0,1.7+(beat===3?p:0));sheet.visible=beat===0;sheet.position.set(-5,2.7,1);second.visible=false;
    }else{
      receipt.position.set(beat===1?actors[1].g.position.x-.3:0,beat===1?1.65:1.1,beat===1?actors[1].g.position.z+.1:.45);receipt.rotation.z=beat===1?-.3:Math.PI/2;
      actors[1].arm.rotation.z=beat===1?-.7:0;
      sheet.visible=true;second.visible=config.kind==='care'&&beat>=2;
      const sx=beat===0?-5:beat===1?-5+5*p:beat===2?5*p:5;
      sheet.position.set(sx,beat===0?1.1:beat===3?1.2:2.4+Math.sin(p*Math.PI)*.25,.4);sheet.rotation.x=beat===3?0:.25;
      second.position.set(4.55,1.22,.2);
      if(config.kind==='care'&&beat>=2){sheet.position.set(5.45,beat===2?2.4-1.18*smooth(p*3):1.22,.2);sheet.rotation.x=0;}
      if(config.kind==='studio'){sheet.visible=beat<3;calendarSlots[4].material=mat(beat===3?0x568c67:0xcdd8cc);calendarSlots[4].position.z=beat===3?-.46+p*.08:-.47;}
    }
    if(renderer.getPixelRatio()!==(devicePixelRatio||1))renderer.setPixelRatio(devicePixelRatio||1);renderer.render(scene,camera);evidence.textContent=statements[config.kind][beat];host.dataset.renderer='webgl';
  }
  function resize(){const r=host.getBoundingClientRect();width=Math.max(1,r.width);height=Math.max(1,r.height);renderer.setSize(width,height,false);render(last,matchMedia('(prefers-reduced-motion: reduce)').matches);}
  const observer=new ResizeObserver(resize);observer.observe(host);renderer.domElement.addEventListener('webglcontextlost',e=>{e.preventDefault();lost=true;host.dataset.renderer='fallback';});renderer.domElement.addEventListener('webglcontextrestored',()=>{lost=false;resize();});resize();return {render};
}

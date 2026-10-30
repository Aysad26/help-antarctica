import {pughPose} from './expedition-motion.mjs?v=31';
import {sceneStride} from './motion.mjs?v=31';

// Reuse the complete v8 photograph. Animated mattes keep the identity and pose
// intact while separating the head/torso from the two foreground hands.
export function createPugh(wrap){
 const source=wrap.querySelector('img'),canvas=document.createElement('canvas');
 canvas.className='pugh-surface';canvas.setAttribute('aria-hidden','true');
 canvas.width=1040;canvas.height=Math.round(1040*906/1737);
 wrap.insertBefore(canvas,source.nextSibling);
 const ctx=canvas.getContext('2d'),W=canvas.width,H=canvas.height;
 const frame=document.createElement('canvas');frame.width=W;frame.height=H;const f=frame.getContext('2d',{willReadFrequently:true});
 let ready=false,lastKey='',previous={torso:0,near:0,far:0};
 const regions=[
  // Source-coordinate mattes remove the old sea between the three islands.
  {id:'torso',line:.685,x:.47,span:.48,path:[[0,0],[1280,0],[1280,540],[1214,548],[1180,550],[1160,599],[1115,611],[1050,616],[970,614],[900,609],[830,610],[760,616],[685,622],[600,623],[510,619],[396,610],[420,540],[0,540]]},
  {id:'far',line:.751,x:.919,span:.15,path:[[1450,435],[1737,435],[1737,676],[1714,680],[1685,683],[1655,682],[1615,672],[1570,668],[1525,669],[1490,662],[1480,608],[1450,608]]},
  {id:'near',line:.839,x:.694,span:.28,path:[[1000,752],[1020,720],[1043,680],[1114,646],[1155,614],[1167,570],[1177,551],[1206,554],[1220,575],[1223,601],[1210,624],[1250,623],[1300,617],[1350,613],[1370,618],[1380,625],[1380,645],[1360,659],[1380,663],[1400,673],[1410,685],[1415,700],[1408,710],[1420,719],[1420,736],[1412,754],[1375,767],[1300,769],[1220,766],[1140,762],[1060,758]]}
 ];
 function prepare(){
  if(!source.naturalWidth)return;
  for(const r of regions){
   const c=document.createElement('canvas');c.width=W;c.height=H;
   const g=c.getContext('2d');g.save();g.beginPath();r.path.forEach(([x,y],i)=>i?g.lineTo(x/1737*W,y/906*H):g.moveTo(x/1737*W,y/906*H));g.closePath();g.clip();g.drawImage(source,0,0,W,H);g.restore();
   // The only photograph below each body part is a narrow, feathered contact.
   g.globalCompositeOperation='destination-in';const fade=g.createLinearGradient(0,H*(r.line-.022),0,H*(r.line+.026));fade.addColorStop(0,'#fff');fade.addColorStop(1,'#fff0');g.fillStyle=fade;g.fillRect(0,0,W,H);r.layer=c;
  }
  ready=true;wrap.classList.add('pugh-ready');
 }
 if(source.complete)prepare();else source.addEventListener('load',prepare,{once:true});
 return {paint(progress,width,reduced,time,foam,splash,allowBurst,arrivalPhase){
  if(!ready||Math.abs(progress-6)>1)return;
  const pose=pughPose(reduced?6:progress,sceneStride(width)/width,reduced?undefined:arrivalPhase);
  const key=[pose.torso,pose.near,pose.far,!!foam].join(':');if(key===lastKey)return;lastKey=key;
  ctx.clearRect(0,0,W,H);
  for(const r of regions){
   const amount=pose[r.id],line=H*r.line,shift=(1-amount)*H*(r.id==='torso'?.73:r.id==='near'?.237:.248);
   if(amount<=0){previous[r.id]=amount;continue;}
   // A restrained, broken reflection below the exact water contact.
   ctx.save();ctx.beginPath();ctx.rect(0,line,W,H-line);ctx.clip();ctx.globalAlpha=.11*amount;ctx.filter='blur(1.1px)';
   ctx.translate(0,line*1.28);ctx.scale(1,-.28);ctx.drawImage(r.layer,0,shift);ctx.restore();
   f.clearRect(0,0,W,H);f.globalCompositeOperation='source-over';f.drawImage(r.layer,0,shift);
   const edge=f.createLinearGradient(0,line-H*.01,0,line+H*.023);edge.addColorStop(0,'#fff');edge.addColorStop(1,'#fff0');
   f.globalCompositeOperation='destination-in';f.fillStyle=edge;f.fillRect(0,0,W,H);ctx.drawImage(frame,0,0);
   if(foam&&amount>.14){
    const rise=Math.sin(Math.PI*amount),fw=W*r.span*(.6+.25*rise),fh=fw*.045;
    ctx.save();ctx.globalAlpha=(.22+rise*.18)*amount;ctx.drawImage(foam,W*r.x-fw/2,line-fh*.4,fw,fh);ctx.restore();
   }
   // Sample the actual shifted skin matte near the waterline. Broken flecks
   // sit only where this body part meets water, never across the empty gaps.
   const from=Math.max(0,Math.floor(line-H*.027)),band=Math.min(H-from,Math.ceil(H*.05));
   const pixels=f.getImageData(0,from,W,band).data;
   ctx.save();ctx.strokeStyle='#dfedf0';ctx.lineCap='round';
   for(let x=1;x<W-3;x+=3){
    let contact=-1;
    for(let y=0;y<band;y++)if(pixels[(y*W+x)*4+3]>90)contact=from+y;
    if(contact<0)continue;
    const n=(Math.sin(x*127.1+r.x*331)*43758.5453)%1,q=Math.abs(n);
    if(q<.24)continue;
    ctx.globalAlpha=(.32+.32*q)*amount;ctx.lineWidth=.55+q*.55;
    ctx.beginPath();ctx.moveTo(x,contact-.5);ctx.lineTo(x+1+q*2,contact-.9-q*.8);ctx.stroke();
   }
   ctx.restore();
   if(allowBurst&&previous[r.id]<.6&&amount>=.6){
    const b=canvas.getBoundingClientRect();splash(b.left+b.width*r.x,b.top+b.height*r.line,r.id==='torso'?.45:.25,'swimmer');
   }
   previous[r.id]=amount;
  }
  canvas.dataset.head=pose.head.toFixed(3);canvas.dataset.torso=pose.torso.toFixed(3);canvas.dataset.hands=Math.min(pose.near,pose.far).toFixed(3);
 }};
}

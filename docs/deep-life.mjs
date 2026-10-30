import {createShallowBird} from './near-surface.mjs?v=31';
import {clamp,sceneTravel} from './motion.mjs?v=31';
export function leopardSwimPose(progress,width,height){
 const mobile=width<=700,q=clamp((progress-4)*.82+(mobile?.145:.11),-.7,.7);
 // Screen-space arc, not a second horizontal camera offset: the nose enters
 // from below-right, climbs across the frame, then leaves at upper-left.
 const dx=-4.2-q,dy=-2.5+1.2*q;
 return {x:width*((mobile?1.25:1.3)-4.2*q-.5*q*q),
  y:height*((mobile?1.145:.9)-2.5*q+.6*q*q),
  angle:Math.atan2(-dy*height,-dx*width)-.18,
  width:width*(mobile?1.65:.85),alpha:1};
}
export function leopardLandmarks(p){
 const at=(x,y)=>({x:p.x+p.width*(x*Math.cos(p.angle)-y*Math.sin(p.angle)),y:p.y+p.width*(x*Math.sin(p.angle)+y*Math.cos(p.angle))});
 return {nose:at(-.475,-.077),head:at(-.37,-.081),fin:at(.13,.11)};
}
export function fishPose(index,progress,time,width,height){
 const a=index*2.399963+progress*1.45+time*.028,r=.55+(index%13)/28,mobile=width<=700;
 const rx=width*(mobile?.34:.19)*r,ry=height*.14*r;
 const world=(sceneTravel(3.5,width)-sceneTravel(progress,width))*.44;
 return {x:width*.59+world+Math.cos(a)*rx,y:height*.49+Math.sin(a)*ry,angle:Math.atan2(ry*Math.cos(a),-rx*Math.sin(a))+Math.PI,size:(mobile?10:16)*(.55+(Math.sin(a)+1)*.22),alpha:.16+(Math.sin(a)+1)*.11};
}
// A second, closer school occupies the lower water between the leopard and
// the shallow tern dive. The camera reveals it through the frame edges.
export function nearFishPose(index,progress,time,width,height){
 if(width<=700)return null;
 const a=index*2.399963+(progress-4.38)*1.25+time*.018;
 const r=.46+(index%17)/30,rx=width*.43*r,ry=height*.25*r;
 const travel=(sceneTravel(4.38,width)-sceneTravel(progress,width))*.70;
 return {x:width*.50+travel+Math.cos(a)*rx,y:height*.965+Math.sin(a)*ry,
  // The source fish points left; add pi to align its nose with the tangent.
  angle:Math.atan2(ry*Math.cos(a),-rx*Math.sin(a))+Math.PI,
  size:Math.min(48,Math.max(24,width*.018))*(.8+(index%7)*.065),
  alpha:.38+(Math.sin(a)+1)*.10};
}
export function createDeepLife(ctx,onReady=()=>{}){
 const bird=createShallowBird(ctx,onReady);
 const photos={};for(const name of ['underice','leopard','fish','seaweed']){
  const img=new Image();photos[name]=img;
  img.addEventListener('load',onReady,{once:true});
  img.src=`assets/${name}-${name==='leopard'?'v15':'v14'}.webp`;
 }
 const ready=n=>photos[n].complete&&photos[n].naturalWidth;
 const image=(name,x,y,w,h)=>{if(ready(name))ctx.drawImage(photos[name],x,y,w,h??w*photos[name].naturalHeight/photos[name].naturalWidth);};
 return {paint(progress,time,width,height){
  const mobile=width<=700,shift=(sceneTravel(progress,width)-sceneTravel(3.5,width))*.13;
  ctx.save();ctx.globalAlpha=.30;const iw=mobile?width*1.85:width*.85;
  image('underice',width*(mobile?-.15:.36)-shift,-height*.05,iw,height*.80);
  ctx.globalAlpha=.17;image('seaweed',-width*.12-shift*.35,height*.75,width*(mobile?.75:.36),height*.31);
  ctx.globalAlpha=.10;image('seaweed',width*.77-shift*.25,height*.85,width*.34,height*.20);
  if(ready('fish'))for(let i=0;i<76;i++){
   const f=fishPose(i,progress,time,width,height);ctx.save();ctx.translate(f.x,f.y);ctx.rotate(f.angle);ctx.globalAlpha=f.alpha;
   const h=f.size*photos.fish.naturalHeight/photos.fish.naturalWidth;ctx.drawImage(photos.fish,-f.size/2,-h/2,f.size,h);ctx.restore();
  }
  if(!mobile&&ready('fish')&&progress>3.8&&progress<4.95)for(let i=0;i<112;i++){
   const f=nearFishPose(i,progress,time,width,height),h=f.size*photos.fish.naturalHeight/photos.fish.naturalWidth;
   if(f.x+f.size<0||f.x-f.size>width||f.y-h>height)continue;
   ctx.save();ctx.translate(f.x,f.y);ctx.rotate(f.angle);ctx.globalAlpha=f.alpha;
   ctx.drawImage(photos.fish,-f.size/2,-h/2,f.size,h);ctx.restore();
  }
  const p=leopardSwimPose(progress,width,height);
  if(ready('leopard')&&p.x+p.width*.6>0&&p.x-p.width*.6<width){
   ctx.save();ctx.translate(p.x,p.y);ctx.rotate(p.angle);ctx.globalAlpha=1;
   const h=p.width*photos.leopard.naturalHeight/photos.leopard.naturalWidth;ctx.drawImage(photos.leopard,-p.width/2,-h/2,p.width,h);ctx.restore();
  }
  bird.paint(progress,time,width,height);
  const veil=ctx.createLinearGradient(0,height*.4,0,height);veil.addColorStop(0,'#052b4200');veil.addColorStop(1,'#021c3130');ctx.globalAlpha=1;ctx.fillStyle=veil;ctx.fillRect(0,0,width,height);ctx.restore();
 }};
}

import {clamp,smooth} from './motion.mjs?v=31';

// A brief shallow plunge. The bird never appears in the air later in the trip.
export function shallowBirdPose(progress,width,height){
 const q=clamp(progress-4.5,-.7,.7),mobile=width<=700;
 // Air trail at the upper-right tail; the bill leads down and left from
 // just beneath the surface. Scrolling backwards retraces the same plunge.
 return {x:width*((mobile?.56:.78)-3.2*q),y:height*(.45+2.6*q+.3*q*q),
  width:width*(mobile?.94:.43),
  angle:Math.atan2((2.6+.6*q)*height,-3.2*width)-2.58,alpha:1};
}

export function ternTail(p){
 const h=p.width*2/3;
 return {x:p.x+p.width*.36*Math.cos(p.angle)+h*.33*Math.sin(p.angle),y:p.y+p.width*.36*Math.sin(p.angle)-h*.33*Math.cos(p.angle)};
}
const random=n=>{const r=Math.sin(n*127.1+311.7)*43758.5453;return r-Math.floor(r);};
export function ternBubblePose(index,progress,time,width,height){
 const stream=index%3,age=(random(index+7)+time*(.023+stream*.003))%1;
 // Sample the tail's earlier scroll position, then add buoyant rise. The
 // wake traces a diagonal history instead of following the bird as a column.
 const tail=ternTail(shallowBirdPose(progress-age*.055,width,height));
 const spread=(3+age*width*.022),cluster=.7+.3*random(Math.floor(index/3)+53);
 return {x:tail.x+(random(index+19)-.5)*spread+(stream-1)*2.8,
  y:tail.y-age*height*.11+(random(index+37)-.5)*(3+age*7),
  radius:(.7+random(index+71)*2.7)*(1-age*.35),
  alpha:(.19+random(index+89)*.36)*Math.pow(1-age,.6)*cluster,
  stream,age};
}

export function createShallowBird(ctx,onReady=()=>{}){
 const photo=new Image();
 photo.addEventListener('load',onReady,{once:true});
 photo.src='assets/tern-underwater-v17.webp';
 return {paint(progress,time,width,height){
  if(progress<4.08||progress>4.96)return;
  const p=shallowBirdPose(progress,width,height);
  const near=1-smooth((Math.abs(progress-4.5)-.12)/.3);
  // Constant soft shafts and a rippled underside put this encounter close to
  // the surface; they never expose an underlying transparent ocean layer.
  const light=ctx.createLinearGradient(0,0,0,height*.58);
  light.addColorStop(0,`rgba(141,202,207,${near*.23})`);light.addColorStop(1,'#8dcacf00');
  ctx.save();ctx.globalAlpha=1;ctx.fillStyle=light;ctx.fillRect(0,0,width,height*.58);
  for(let row=0;row<5;row++){
   ctx.beginPath();
   for(let x=0;x<=width+10;x+=10){const y=height*(.035+row*.024)+Math.sin(x/width*11+row*1.8+time*.15)*(4+row*2);x?ctx.lineTo(x,y):ctx.moveTo(x,y);}
   ctx.lineWidth=1+row*.5;ctx.strokeStyle=`rgba(179,221,222,${near*(.08-row*.01)})`;ctx.stroke();
  }
  if(photo.complete&&photo.naturalWidth&&p.x+p.width*.6>0&&p.x-p.width*.6<width){
   const h=p.width*photo.naturalHeight/photo.naturalWidth;
   // Small air pockets trail the upper-right tail and rise to the surface.
   for(let i=0;i<63;i++){
    const b=ternBubblePose(i,progress,time,width,height),{x,y,radius:r}=b,a=near*b.alpha;
    ctx.beginPath();ctx.ellipse(x,y,r*.8,r,Math.sin(i)*.2,0,Math.PI*2);
    ctx.lineWidth=.75;ctx.strokeStyle=`rgba(197,231,232,${a})`;ctx.stroke();
    ctx.beginPath();ctx.ellipse(x-r*.22,y-r*.26,r*.24,r*.13,-.5,0,Math.PI*2);
    ctx.fillStyle=`rgba(232,246,244,${a*.9})`;ctx.fill();
   }
   ctx.translate(p.x,p.y);ctx.rotate(p.angle);ctx.globalAlpha=1;
   ctx.drawImage(photo,-p.width/2,-h/2,p.width,h);
  }
  ctx.restore();
 }};
}

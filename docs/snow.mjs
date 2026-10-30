import {snowScreenX,surfaceY} from './expedition-motion.mjs?v=32';
export function snowLayerX(x,travel,z,width,layer){
 if(layer==='near')return snowScreenX(x,travel,z,width);
 const span=width+100;return ((x-travel)%span+span)%span-50;
}
export function createSnow(){
 const sprites=new Map();
 function sprite(radius){
  const key=Math.round(radius*4);if(sprites.has(key))return sprites.get(key);
  const size=Math.ceil(radius*6+6),c=document.createElement('canvas');c.width=c.height=size;
  const g=c.getContext('2d'),r=radius*1.15,fill=g.createRadialGradient(size/2,size/2,r*.1,size/2,size/2,r*1.65);
  fill.addColorStop(0,'#ffffffd9');fill.addColorStop(.42,'#ffffffa8');fill.addColorStop(1,'#ffffff00');g.fillStyle=fill;g.fillRect(0,0,size,size);sprites.set(key,c);return c;
 }
 return {paint(ctx,flakes,travel,width,height,progress,time,depth,layer){
  if(depth>=1)return;
  ctx.save();
  // Only air above the physical waterline contains snow; never a crossfade.
  if(depth>0){ctx.beginPath();ctx.moveTo(0,0);ctx.lineTo(width,0);for(let x=width;x>=0;x-=12)ctx.lineTo(x,surfaceY(x,width,height,progress,time));ctx.closePath();ctx.clip();}
  for(const f of flakes){
   const x=snowLayerX(f.x,travel,f.z,width,layer)+Math.sin(time*.2+f.phase)*5;
   if(layer==='near'){const c=sprite(f.r);ctx.globalAlpha=width>700?.55:.46;ctx.drawImage(c,x-c.width/2,f.y-c.height/2);}
   else{ctx.globalAlpha=.27+f.z*.15;ctx.fillStyle='#fff';ctx.beginPath();ctx.arc(x,f.y,f.r,0,Math.PI*2);ctx.fill();}
  }
  ctx.restore();
 }};
}

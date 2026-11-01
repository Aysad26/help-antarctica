import {shoreGroundX} from './motion.mjs?v=32';
export const terrainAlpha=alpha=>alpha>=200?255:alpha;
const outline=[[0,1],[0,.96],[.005,.92],[.009,.85],[.015,.82],[.018,.73],[.025,.70],[.029,.61],[.035,.59],[.04,.48],[.0465,.45],[.05,.38],[.06,.34],[.065,.26],[.075,.22],[.085,.14],[.1,.12],[.115,.05],[.13,0],[1,0],[1,1]];
export function groundGeometry(progress,width,height){
 const mobile=width<=700,tileWidth=width*(mobile?2.55:1.8),h=height*(mobile?.36:.43);
 const x=shoreGroundX(progress,width),top=height-h+2;
 return {x,top,height:h,tileWidth,points:outline.map(([u,v])=>[x+u*tileWidth*2,top+v*h])};
}
// A viewport-sized canvas replaces the multi-screen filtered CSS surface.
// Mirrored panels overlap by one pixel and sample the same photographic edge.
export function createShoreRenderer(canvas){
 const ctx=canvas.getContext('2d'),photo=new Image();photo.src='assets/shore-ground-v10.webp';
 let last='',size='',ready=false;const graded=document.createElement('canvas');
 photo.onload=()=>{
  graded.width=photo.naturalWidth;graded.height=photo.naturalHeight;
  const g=graded.getContext('2d',{willReadFrequently:true});g.drawImage(photo,0,0);
  const pixels=g.getImageData(0,0,graded.width,graded.height),a=pixels.data;
  for(let i=0;i<a.length;i+=4){a[i]=a[i]*1.06+2.04;a[i+1]=a[i+1]*1.08+1.275;a[i+2]=a[i+2]*1.10+.51;a[i+3]=terrainAlpha(a[i+3]);}
  g.putImageData(pixels,0,0);ready=true;last='';
 };
 return {paint(progress,width,height,dpr,verticalOffset=0){
  const key=[width,height,dpr].join(':');if(key!==size){size=key;canvas.width=Math.round(width*dpr);canvas.height=Math.round(height*dpr);ctx.setTransform(dpr,0,0,dpr,0,0);last='';}
  const poseKey=`${progress}:${verticalOffset}`;
  if(!ready||last===poseKey)return;last=poseKey;ctx.clearRect(0,0,width,height);
  if(progress<9)return;
  const p=groundGeometry(progress,width,height);
  if(verticalOffset>0){
   p.top-=verticalOffset;
   // Extend the existing snow photograph down to the viewport edge. Moving
   // the camera must never reveal an empty strip below the foreground.
   p.points=p.points.map(([x,y])=>[x,y===height+2?y:y-verticalOffset]);

  }
  ctx.save();ctx.beginPath();ctx.moveTo(...p.points[0]);for(let i=1;i<18;i++){const a=p.points[i],b=p.points[i+1];ctx.quadraticCurveTo(a[0],a[1],(a[0]+b[0])/2,(a[1]+b[1])/2);}for(let i=18;i<p.points.length;i++)ctx.lineTo(...p.points[i]);ctx.closePath();ctx.clip();
  for(let i=0;i<2;i++){
   const x=p.x+i*(p.tileWidth-.6);if(x>width||x+p.tileWidth<0)continue;
   ctx.save();if(i%2){ctx.translate(x+p.tileWidth,0);ctx.scale(-1,1);}else ctx.translate(x,0);
   ctx.drawImage(graded,0,p.top,p.tileWidth+1,p.height);
   if(verticalOffset>0){
    // Mirror the same bottom edge into the newly exposed strip. The original
    // ground keeps its scale, and the join samples exactly the same pixels.
    ctx.translate(0,2*(p.top+p.height));ctx.scale(1,-1);
    ctx.drawImage(graded,0,p.top,p.tileWidth+1,p.height);
   }
   ctx.restore();
  }
  ctx.restore();
 },reset(){last='';size='';}};
}

import {createDeepLife} from './deep-life.mjs?v=32';
import {depthPose,surfaceBoundary} from './expedition-motion.mjs?v=32';

// A single canvas owns the opaque water and its moving boundary. CSS no longer
// swaps visibility, clip-path modes, backdrop filters or animated light layers.
export function createDepthWorld(canvas){
 const ctx=canvas.getContext('2d',{alpha:true});
 let assetRevision=0;
 const life=createDeepLife(ctx,()=>{assetRevision++;});
 const backdrop=document.createElement('canvas');
 let lastSize='',lastFrame='';
 function resize(width,height,dpr){
  const key=[width,height,dpr].join(':');if(key===lastSize)return;
  lastSize=key;lastFrame='';canvas.width=backdrop.width=Math.round(width*dpr);canvas.height=backdrop.height=Math.round(height*dpr);
  ctx.setTransform(dpr,0,0,dpr,0,0);ctx.imageSmoothingEnabled=true;ctx.imageSmoothingQuality='high';const b=backdrop.getContext('2d');b.setTransform(dpr,0,0,dpr,0,0);
  const fill=b.createRadialGradient(width*.62,-height*.15,0,width*.62,-height*.15,height*1.4);
  fill.addColorStop(0,'#39798b');fill.addColorStop(.35,'#164e65');fill.addColorStop(.68,'#082d48');fill.addColorStop(1,'#021b31');
  b.fillStyle=fill;b.fillRect(0,0,width,height);
  // Fixed, faint shafts of light cannot pulse or expose the surface panorama.
  for(let i=0;i<3;i++){
   const x=width*(.25+i*.25),beam=b.createLinearGradient(x,0,x,height*.8);beam.addColorStop(0,'#b8e6dd0c');beam.addColorStop(1,'#b8e6dd00');
   b.save();b.filter=`blur(${height*.035}px)`;b.fillStyle=beam;b.beginPath();b.moveTo(x-width*.025,0);b.lineTo(x+width*.025,0);b.lineTo(x+width*.35,height);b.lineTo(x-width*.12,height);b.closePath();b.fill();b.restore();
  }
 }
 return {reset(){lastSize='';lastFrame='';},paint(progress,time,width,height,dpr){
  resize(width,height,dpr);
  const amount=depthPose(progress).amount;
  const key=amount===0?'surface':`${progress}:${time}:${assetRevision}`;
  if(lastFrame===key)return;lastFrame=key;
  ctx.clearRect(0,0,width,height);
  if(amount===0){canvas.dataset.depth='0';return;}
  ctx.save();
  if(amount<1){const points=surfaceBoundary(width,height,progress,time);ctx.beginPath();ctx.moveTo(0,height);for(const [x,y]of points)ctx.lineTo(x,y);ctx.lineTo(width,height);ctx.closePath();ctx.clip();}
  ctx.drawImage(backdrop,0,0,width,height);life.paint(progress,time,width,height);ctx.restore();
  canvas.dataset.depth=amount.toFixed(4);
 }};
}

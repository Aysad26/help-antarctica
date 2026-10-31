import {paintFoamEdge} from './surface-contact.mjs?v=44';
// Keep the original birds and floe, discarding the old rectangular water foot.
// Their new reflection is compressed and broken by the existing sea's ripples.
export function floeWaterY(u,height){
 // The source sea starts just below .833h. Stay in solid ice throughout the
 // irregular cut, so none of the old flat photographic water can reappear.
 return height*(.831-(1+Math.sin(u*19.7+.4))*.0024-(1+Math.sin(u*43.1+1.7))*.0012-Math.pow(u,7)*.004);
}
export function penguinContactY(u,height,time=0,reduced=false){
 const wave=reduced?0:(.5+.5*Math.sin(u*27-time*.65+Math.sin(u*11)))*height*.0045*(.55+.45*Math.sin(u*Math.PI));
 return floeWaterY(u,height)-wave;
}
export function createPenguinWater(wrap){
 const image=wrap.querySelector('.animal-image');
 const canvas=document.createElement('canvas');canvas.className='penguin-water-surface';
 canvas.setAttribute('aria-hidden','true');wrap.insertBefore(canvas,image);
 const ctx=canvas.getContext('2d'),art=document.createElement('canvas'),artCtx=art.getContext('2d');
 const reflected=document.createElement('canvas'),reflectionCtx=reflected.getContext('2d');
 let ready=false,lastSize='';
 function resize(){
  if(!ready)return;
  const key=[image.offsetLeft,image.offsetTop,image.clientWidth,image.clientHeight].join(':');
  if(key===lastSize)return;lastSize=key;
  canvas.style.left=`${image.offsetLeft}px`;canvas.style.top=`${image.offsetTop}px`;
  canvas.style.width=`${image.clientWidth}px`;canvas.style.height=`${image.clientHeight}px`;
 }
 function prepare(){
  if(!image.complete||!image.naturalWidth)return;
  const w=image.naturalWidth,h=image.naturalHeight;
  canvas.width=art.width=w;canvas.height=art.height=h;
  artCtx.save();artCtx.beginPath();artCtx.moveTo(0,0);artCtx.lineTo(w,0);
  for(let x=w;x>=0;x-=2)artCtx.lineTo(x,floeWaterY(x/w,h));
  artCtx.closePath();artCtx.clip();artCtx.drawImage(image,0,0);artCtx.restore();
  reflected.width=w;reflected.height=h;
  // Local strips keep the reflection attached to the irregular ice contact.
  const compression=.20,depth=h*.071;
  for(let col=0;col<16;col++){
   const x=w*col/16,sw=w/16,c=floeWaterY((col+.5)/16,h);
   for(let band=0;band<9;band++){
    const y=c+band*depth/9;
    reflectionCtx.save();reflectionCtx.beginPath();reflectionCtx.rect(x,y,sw+.3,depth/9-.55);reflectionCtx.clip();
    reflectionCtx.globalAlpha=.17*Math.pow(1-band/9,1.6);reflectionCtx.filter='blur(.65px)';
    reflectionCtx.translate(0,c*(1+compression));
    reflectionCtx.scale(1,-compression);reflectionCtx.drawImage(art,0,0);reflectionCtx.restore();
   }
  }
  ready=true;resize();wrap.classList.add('penguin-water-ready');paint(0,true);
 }
 function paint(time,reduced){
  if(!ready)return;
  const w=canvas.width,h=canvas.height,t=reduced?0:time;
  ctx.clearRect(0,0,w,h);
  // Cache the optical work once; only nine small ripple strips move per frame.
  const top=Math.floor(h*.815),step=Math.ceil(h*.105/9);
  for(let row=0;row<9;row++){
   const y=top+row*step,dx=Math.sin(t*.42+row*2.3)*(.25+row*.11);
   ctx.drawImage(reflected,0,y,w,step,dx,y,w,step);
  }
  // The real water underneath occludes a few source pixels at the ice edge.
  // The birds remain intact; the subtle lap is confined to the bottom seam.
  ctx.save();ctx.beginPath();ctx.moveTo(0,0);ctx.lineTo(w,0);
  for(let x=w;x>=0;x-=2)ctx.lineTo(x,penguinContactY(x/w,h,t,reduced));
  ctx.closePath();ctx.clip();ctx.drawImage(art,0,0);ctx.restore();
  const edge=Array.from({length:170},(_,i)=>{const u=.015+.97*i/169;return {x:u*w,y:penguinContactY(u,h,t,reduced)};});
  paintFoamEdge(ctx,edge,t,.9);
  // Quiet, unequal ripple segments break the former straight baseline.
  for(const [a,length] of [[.04,.07],[.17,.095],[.34,.05],[.53,.12],[.76,.065],[.9,.045]]){
   const b=a+length;
   ctx.beginPath();
   for(let i=0;i<=8;i++){
    const u=a+(b-a)*i/8,x=u*w,y=penguinContactY(u,h,t,reduced)+1.8+Math.sin(u*63-t*.35)*.4;
    i?ctx.lineTo(x,y):ctx.moveTo(x,y);
   }
   ctx.lineWidth=.65;ctx.strokeStyle='#c5dbe95e';ctx.stroke();
  }
 }
 image.addEventListener('load',prepare,{once:true});if(image.complete)prepare();
 return {paint,resize};
}

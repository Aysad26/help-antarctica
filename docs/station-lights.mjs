// Keep the actual photographic window geometry. Six circuits warm up on approach.
export function createStationLights(root){
 const image=root.querySelector('img'),canvas=document.createElement('canvas');
 canvas.className='station-lit';canvas.setAttribute('aria-hidden','true');root.append(canvas);
 let base,layers,ctx,last=-1;
 const setup=()=>{
  const w=Math.min(image.naturalWidth,innerWidth<=700?1024:1600),h=Math.round(w*image.naturalHeight/image.naturalWidth);if(!w)return;
  canvas.width=w;canvas.height=h;ctx=canvas.getContext('2d');ctx.drawImage(image,0,0,w,h);
  const pixels=ctx.getImageData(0,0,w,h),original=new Uint8ClampedArray(pixels.data);
  const arrays=Array.from({length:6},()=>new Uint8ClampedArray(original.length));
  for(let y=Math.floor(h*.47);y<h*.8;y++)for(let x=0;x<w;x++){
   const i=(y*w+x)*4,r=original[i],g=original[i+1],b=original[i+2];
   if(r>165&&g>100&&r>g*1.12&&g>b*1.3&&original[i+3]>150){
    const group=Math.max(0,Math.min(5,Math.floor((x/w-.3)*15)));
    arrays[group].set(original.subarray(i,i+4),i);
    pixels.data[i]*=.26;pixels.data[i+1]*=.30;pixels.data[i+2]*=.4;
   }
  }
  base=document.createElement('canvas');base.width=w;base.height=h;base.getContext('2d').putImageData(pixels,0,0);
  layers=arrays.map(data=>{const c=document.createElement('canvas');c.width=w;c.height=h;c.getContext('2d').putImageData(new ImageData(data,w,h),0,0);return c;});
  image.style.visibility='hidden';
 };
 image.addEventListener('load',setup);if(image.complete)setup();
 return {paint(approach){
  if(!layers||Math.abs(approach-last)<.002)return;last=approach;
  ctx.clearRect(0,0,canvas.width,canvas.height);ctx.drawImage(base,0,0);
  layers.forEach((layer,i)=>{let a=Math.max(0,Math.min(1,(approach-.48-i*.04)/.20));a=a*a*(3-2*a);ctx.globalAlpha=a;ctx.drawImage(layer,0,0);});ctx.globalAlpha=1;
 }};
}

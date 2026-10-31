// Measured ice outlines, not a rectangular water patch below the photograph.
export function iceContactProfile(data,width,height){
 const raw=[];
 for(let x=0;x<width;x++){
  let ice=-1;
  for(let y=height-1;y>=Math.floor(height*.48);y--){
   const i=(y*width+x)*4;if(data[i+3]<232)continue;
   const light=(data[i]+data[i+1]+data[i+2])/3;
   if(light>85&&data[i+2]-data[i+1]<78){ice=y;break;}
  }
  // Never retain an opaque dark water tail just because it is close to ice.
  raw.push(ice<0?null:ice/height);
 }
 return raw.map((y,x)=>{
  if(y===null)return null;
  const near=raw.slice(Math.max(0,x-2),x+3).filter(v=>v!==null).sort((a,b)=>a-b);
  return near[Math.floor(near.length/2)];
 });
}

export function contactSegments(profile,maxJump=.045){
 const segments=[];let current=[];
 for(let i=0;i<profile.length;i++){
  const y=profile[i],last=current.at(-1);
  if(y===null||(last&&Math.abs(y-last.y)>maxJump)){
   if(current.length>2)segments.push(current);current=[];
  }
  if(y!==null)current.push({x:i/(profile.length-1),y});
 }
 if(current.length>2)segments.push(current);return segments;
}

const hash=n=>{const value=Math.sin(n*127.1+73.3)*43758.5453;return value-Math.floor(value);};

// Sparse clusters, sampled by physical distance. Steep ice teeth do not acquire
// a bright white outline; the small highlights lie flat on the water instead.
export function paintFoamEdge(ctx,points,time=0,strength=1){
 if(points.length<2)return;
 ctx.save();ctx.lineCap='round';ctx.lineJoin='round';
 let distance=0,next=1.1;
 for(let i=1;i<points.length;i++){
  const a=points[i-1],b=points[i],length=Math.hypot(b.x-a.x,b.y-a.y);
  if(length>22||length<.1)continue;
  while(next<distance+length){
   const u=(next-distance)/length,x=a.x+(b.x-a.x)*u,y=a.y+(b.y-a.y)*u;
   const noise=hash(Math.floor(next*1.37)),cluster=hash(Math.floor(next/13));
   if(cluster>.28&&Math.abs(b.y-a.y)<Math.max(1.2,Math.abs(b.x-a.x)*.7)){
    const offset=.25+Math.sin(time*.35+next*.19)*.12;
    ctx.beginPath();ctx.ellipse(x,y+offset,.45+noise*1.35,.22+noise*.28,0,0,Math.PI*2);
    ctx.fillStyle=`rgba(224,240,243,${(.22+noise*.34)*strength})`;ctx.fill();
    if(noise>.78){
     ctx.beginPath();ctx.ellipse(x+1.3,y+1.1,1.1+noise,.22,0,0,Math.PI*2);
     ctx.fillStyle=`rgba(196,220,227,${.19*strength})`;ctx.fill();
    }
   }
   next+=1.3+hash(Math.floor(next*2.7))*3.8;
  }
  distance+=length;
 }
 ctx.restore();
}

export function createFloeContacts(entries){
 const renderers=entries.map(({image,index})=>{
  const wrap=image.parentElement,canvas=document.createElement('canvas'),cache=document.createElement('canvas');
  canvas.className='floe-water-contact';canvas.setAttribute('aria-hidden','true');wrap.append(canvas);
  const ctx=canvas.getContext('2d'),cached=cache.getContext('2d'),cleanArt=document.createElement('canvas');
  let profile,segments,lines=[],dirty=true,ready=false,ratio=1;
  const observer=typeof ResizeObserver==='function'?new ResizeObserver(()=>dirty=true):null;observer?.observe(image);
  function prepare(){
   if(!image.complete||!image.naturalWidth)return;
   const sample=document.createElement('canvas');sample.width=Math.min(1024,image.naturalWidth);sample.height=Math.round(sample.width*image.naturalHeight/image.naturalWidth);
   const s=sample.getContext('2d',{willReadFrequently:true});s.drawImage(image,0,0,sample.width,sample.height);
   const frame=s.getImageData(0,0,sample.width,sample.height),pixels=frame.data;
   profile=iceContactProfile(pixels,sample.width,sample.height);
   segments=contactSegments(profile);if(!segments.length)return;
   // Suppress low-alpha remnants of the old water and isolated key-colour
   // fringes. Solid fur, feathers and ice retain their original colour/alpha.
   for(let i=0;i<pixels.length;i+=4){
    const r=pixels[i],g=pixels[i+1],b=pixels[i+2],a=Math.max(0,Math.min(1,(pixels[i+3]-55)/165));
    const fringe=(b>g+70&&b>r+100)||(g>225&&b>225&&r<30)||(r>220&&g<70&&b<70);
    const x=(i/4)%sample.width,y=Math.floor(i/4/sample.width),contact=profile[x];
    const edge=contact===null?1:Math.max(0,Math.min(1,(contact*sample.height+1-y)/1.5));
    pixels[i]=pixels[i+1]=pixels[i+2]=255;pixels[i+3]=fringe?0:255*a*a*(3-2*a)*edge;
   }
   s.putImageData(frame,0,0);image.style.setProperty('--floe-mask',`url("${sample.toDataURL('image/png')}")`);
   // Canvas drawImage ignores CSS masks. Cache the same cleaned alpha for the
   // reflection/wet band, so neither can bring the discarded sea pixels back.
   cleanArt.width=sample.width;cleanArt.height=sample.height;
   const clean=cleanArt.getContext('2d');clean.drawImage(image,0,0,cleanArt.width,cleanArt.height);
   clean.globalCompositeOperation='destination-in';clean.drawImage(sample,0,0);
   image.style.clipPath='none';wrap.classList.add('floe-contact-ready');ready=true;dirty=true;
  }
  function resize(){
   const w=image.clientWidth,h=image.clientHeight;if(!w||!h)return false;
   const valid=profile.filter(y=>y!==null),top=Math.min(...valid)*h-h*.045,bottom=Math.max(...valid)*h+Math.min(19,h*.047);
   ratio=Math.min(window.devicePixelRatio||1,1.5,1200/(w+12));
   canvas.style.left=`${image.offsetLeft-6}px`;canvas.style.top=`${image.offsetTop+top}px`;
   canvas.style.width=`${w+12}px`;canvas.style.height=`${bottom-top}px`;
   canvas.width=cache.width=Math.ceil((w+12)*ratio);canvas.height=cache.height=Math.ceil((bottom-top)*ratio);
   cached.setTransform(ratio,0,0,ratio,0,0);cached.clearRect(0,0,w+12,bottom-top);
   // Cool wet ice only in the lowest few pixels, preserving the dry white top.
   // A cached band follows the same measured outline and cannot tint open water.
   const wet=document.createElement('canvas');wet.width=cache.width;wet.height=cache.height;
   const wetCtx=wet.getContext('2d');wetCtx.setTransform(ratio,0,0,ratio,0,0);
   wetCtx.drawImage(cleanArt,6,-top,w,h);wetCtx.globalCompositeOperation='source-in';
   wetCtx.fillStyle='#4c7a8b';wetCtx.fillRect(0,0,w+12,bottom-top);
   wetCtx.globalCompositeOperation='destination-in';wetCtx.beginPath();
   for(let x=0;x<profile.length;x++)if(profile[x]!==null)wetCtx.rect(6+x/profile.length*w,profile[x]*h-top-h*.022,w/profile.length+1,h*.024);
   wetCtx.fillStyle='#fff';wetCtx.fill();
   cached.globalAlpha=.12;cached.drawImage(wet,0,0,wet.width,wet.height,0,0,w+12,bottom-top);cached.globalAlpha=1;
   // Reflect narrow columns at their own measured contact instead of one flat axis.
   const columns=32,compression=.14,depth=Math.min(17,h*.039);
   for(let col=0;col<columns;col++){
    const u=(col+.5)/columns,y=profile[Math.min(profile.length-1,Math.round(u*(profile.length-1)))];if(y===null)continue;
    const x=6+w*col/columns,water=y*h-top;
    for(let band=0;band<5;band++){
     cached.save();cached.beginPath();cached.rect(x,water+band*depth/5,w/columns+.4,depth/5-.25);cached.clip();
     cached.globalAlpha=.11*Math.pow(1-band/5,1.7);cached.filter='blur(.65px)';
     cached.translate(0,water*(1+compression));cached.scale(1,-compression);
     cached.drawImage(cleanArt,6,-top,w,h);cached.restore();
    }
   }
   const step=Math.max(1,Math.round(profile.length/(w*.6)));
   lines=segments.map(segment=>segment.filter((_,i)=>i%step===0).map(p=>({x:6+p.x*w,y:p.y*h-top})));
   dirty=false;return true;
  }
  image.addEventListener('load',prepare,{once:true});if(image.complete)prepare();
  return {paint(progress,time,reduced){
   if(!ready||document.hidden||Math.abs(progress-index)>1.05)return;
   if(dirty&&!resize())return;
   ctx.setTransform(1,0,0,1,0,0);ctx.clearRect(0,0,canvas.width,canvas.height);ctx.drawImage(cache,0,0);
   ctx.setTransform(ratio,0,0,ratio,0,0);
   for(const line of lines)paintFoamEdge(ctx,line,reduced?0:time,.68);
  }};
 });
 return {paint(progress,time,reduced){for(const renderer of renderers)renderer.paint(progress,time,reduced);}};
}

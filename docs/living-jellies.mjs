// One context, one photograph and one vertex buffer for all three animals.
// The invisible slots retain the existing responsive positions in realism.css.
export function jellySurface(boxes,dpr=1,mobile=false){
 const left=Math.min(...boxes.map(b=>b.x)),top=Math.min(...boxes.map(b=>b.y));
 const width=Math.max(...boxes.map(b=>b.x+b.width))-left;
 const height=Math.max(...boxes.map(b=>b.y+b.height))-top;
 const scale=Math.min(dpr,2,Math.sqrt((mobile?400000:1000000)/(width*height)),2048/width,2048/height);
 return {left,top,width,height,pixelWidth:Math.max(1,Math.floor(width*scale)),pixelHeight:Math.max(1,Math.floor(height*scale))};
}

export function createLivingJellies(wrap,image){
 const slots=Array.from({length:3},(_,i)=>{
  const el=document.createElement('div');el.className=`living-jelly jelly-${i}`;
  el.style.visibility='hidden';el.setAttribute('aria-hidden','true');wrap.prepend(el);return el;
 });
 const canvas=document.createElement('canvas');canvas.className='living-jellies';
 canvas.setAttribute('aria-hidden','true');wrap.prepend(canvas);
 let gl,program,buffer,texture,uniforms,meshes,ready=false,lost=false,shown='',dirty=true,surface,boxes,fallbackCanvas,fallbackCtx;
 const fallback=(reason='context lost')=>{
  ready=false;shown='';canvas.style.visibility='hidden';wrap.classList.remove('mesh-ready');wrap.dataset.jellyRenderer='image';wrap.dataset.jellyFallback=reason;
  if(!fallbackCanvas){
   fallbackCanvas=document.createElement('canvas');fallbackCanvas.className='living-jellies';fallbackCanvas.setAttribute('aria-hidden','true');wrap.prepend(fallbackCanvas);
   fallbackCtx=fallbackCanvas.getContext('2d');dirty=true;
  }
 };
 const shader=(kind,source)=>{
  const s=gl.createShader(kind);gl.shaderSource(s,source);gl.compileShader(s);
  if(!gl.getShaderParameter(s,gl.COMPILE_STATUS)){const reason=gl.getShaderInfoLog(s);gl.deleteShader(s);throw Error(reason||'Jellyfish shader unavailable');}return s;
 };
 function initialize(){
  const vertex=shader(gl.VERTEX_SHADER,`attribute vec2 uv;varying vec2 tex;
   uniform float time,phase,motion;uniform vec4 animal;uniform vec2 extent;
   void main(){
    tex=uv;float t=time*.62+phase;float lower=smoothstep(.28,.94,uv.y);
    float bend=(sin(uv.y*8.-t+uv.x*4.)*.024+sin(uv.y*15.-t*.8+uv.x*9.)*.010)*lower;
    float pulse=sin(t*1.4)*.025*(1.-lower);
    vec2 p=uv;
    p.x+=(bend+(uv.x-.5)*pulse)*motion;
    p.y+=(sin(t-uv.y*2.)*.009+sin(t*1.4)*.012*(1.-lower))*motion;
    p=p*.87+.065;
    vec2 pixel=animal.xy+p*animal.zw;
    gl_Position=vec4(pixel.x/extent.x*2.-1.,1.-pixel.y/extent.y*2.,0.,1.);
   }`);
  const fragment=shader(gl.FRAGMENT_SHADER,`precision mediump float;varying vec2 tex;
   uniform sampler2D photo;uniform float opacity,softness;uniform vec2 texel;
   void main(){
    vec4 color=texture2D(photo,tex);
    if(softness>0.){
     vec2 d=texel*softness;
     color=color*.4+(texture2D(photo,tex+vec2(d.x,0.))+texture2D(photo,tex-vec2(d.x,0.))
      +texture2D(photo,tex+vec2(0.,d.y))+texture2D(photo,tex-vec2(0.,d.y)))*.15;
    }
    gl_FragColor=color*opacity;
   }`);
  program=gl.createProgram();gl.attachShader(program,vertex);gl.attachShader(program,fragment);gl.linkProgram(program);
  gl.deleteShader(vertex);gl.deleteShader(fragment);
  if(!gl.getProgramParameter(program,gl.LINK_STATUS))throw Error('Jellyfish program unavailable');
  const vertices=[];meshes=[];
  for(const [columns,rows] of [[24,38],[8,14],[8,14]]){
   const first=vertices.length/2;
   for(let y=0;y<rows;y++)for(let x=0;x<columns;x++){
    const a=x/columns,b=y/rows,c=(x+1)/columns,d=(y+1)/rows;
    vertices.push(a,b,c,b,a,d,c,b,c,d,a,d);
   }
   meshes.push({first,count:vertices.length/2-first});
  }
  gl.useProgram(program);buffer=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,buffer);
  gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(vertices),gl.STATIC_DRAW);
  const attribute=gl.getAttribLocation(program,'uv');gl.enableVertexAttribArray(attribute);gl.vertexAttribPointer(attribute,2,gl.FLOAT,false,0,0);
  texture=gl.createTexture();gl.activeTexture(gl.TEXTURE0);gl.bindTexture(gl.TEXTURE_2D,texture);
  gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);
  uniforms=Object.fromEntries(['time','phase','motion','animal','extent','photo','opacity','softness','texel'].map(name=>[name,gl.getUniformLocation(program,name)]));
  gl.uniform1i(uniforms.photo,0);gl.enable(gl.BLEND);gl.blendFunc(gl.ONE,gl.ONE_MINUS_SRC_ALPHA);
  gl.disable(gl.DEPTH_TEST);gl.clearColor(0,0,0,0);dirty=true;
 }
 function upload(){
  if(!gl||lost||!image.complete||!image.naturalWidth)return;
  try{
   gl.bindTexture(gl.TEXTURE_2D,texture);gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL,true);
   gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,image);ready=true;
  }catch(error){fallback(error.message);}
 }
 canvas.addEventListener('webglcontextlost',event=>{event.preventDefault();lost=true;fallback();});
 canvas.addEventListener('webglcontextrestored',()=>{
  lost=false;try{initialize();upload();}catch(error){fallback(error.message);}
 });
 try{
  gl=canvas.getContext('webgl',{alpha:true,premultipliedAlpha:true,antialias:false,depth:false,stencil:false,preserveDrawingBuffer:false,powerPreference:'low-power'});
  if(!gl)throw Error('WebGL unavailable');initialize();
 }catch(error){gl=null;fallback(error.message);}
 image.addEventListener('load',upload);upload();
 const observer=typeof ResizeObserver==='function'?new ResizeObserver(()=>{dirty=true;}):null;
 observer?.observe(wrap);
 window.addEventListener('resize',()=>{dirty=true;},{passive:true});
 window.addEventListener('pageshow',()=>{dirty=true;});
 function resize(){
  boxes=slots.map(el=>({x:el.offsetLeft,y:el.offsetTop,width:el.offsetWidth,height:el.offsetHeight}));
  if(boxes.some(b=>!b.width||!b.height))return false;
  surface=jellySurface(boxes,window.devicePixelRatio||1,window.innerWidth<=700);
  for(const target of [canvas,fallbackCanvas].filter(Boolean)){
   target.style.left=surface.left+'px';target.style.top=surface.top+'px';
   target.style.width=surface.width+'px';target.style.height=surface.height+'px';
   target.width=surface.pixelWidth;target.height=surface.pixelHeight;
  }
  dirty=false;return true;
 }
 function paintFallback(time,reduced){
  if(!fallbackCtx||!image.complete||!image.naturalWidth)return;
  const ctx=fallbackCtx;ctx.setTransform(1,0,0,1,0,0);ctx.clearRect(0,0,fallbackCanvas.width,fallbackCanvas.height);
  ctx.scale(fallbackCanvas.width/surface.width,fallbackCanvas.height/surface.height);
  for(const i of [2,1,0]){
   const b=boxes[i],t=reduced?0:time*(1-i*.11),pulse=reduced?0:Math.sin(t*.62+i*2.3)*.018;
   ctx.save();ctx.globalAlpha=[.92,.4,.25][i];ctx.filter=i===0?'none':`blur(${i===1?.45:.8}px)`;
   ctx.translate(b.x-surface.left+b.width/2,b.y-surface.top+b.height/2);
   ctx.rotate(reduced?0:Math.sin(t*.25+i)*.018);ctx.scale(1+pulse,1-pulse*.6);
   ctx.drawImage(image,-b.width*.4375,-b.height*.4375+(reduced?0:Math.sin(t*.45+i)*b.height/640*3),b.width*.875,b.height*.875);ctx.restore();
  }
  if(shown!=='canvas2d'){fallbackCanvas.style.visibility='';wrap.classList.add('mesh-ready');wrap.dataset.jellyRenderer='canvas2d';shown='canvas2d';}
 }
 return {paint(time,progress,reduced){
  if(document.hidden||Math.abs(progress-3.5)>=.75)return;
  if(dirty&&!resize())return;
  if(!ready||lost){paintFallback(time,reduced);return;}
  gl.viewport(0,0,canvas.width,canvas.height);gl.clear(gl.COLOR_BUFFER_BIT);gl.useProgram(program);
  gl.uniform2f(uniforms.extent,surface.width,surface.height);
  gl.uniform2f(uniforms.texel,1/image.naturalWidth,1/image.naturalHeight);
  // Paint distant animals first. One shared surface preserves premultiplied alpha.
  for(const i of [2,1,0]){
   const b=boxes[i];gl.uniform4f(uniforms.animal,b.x-surface.left,b.y-surface.top,b.width,b.height);
   gl.uniform1f(uniforms.time,reduced?0:time*(1-i*.11));gl.uniform1f(uniforms.phase,i*2.3);
   gl.uniform1f(uniforms.motion,reduced?0:1);gl.uniform1f(uniforms.opacity,[.92,.4,.25][i]);
   gl.uniform1f(uniforms.softness,i===0?0:i===1?2.5:7);
   gl.drawArrays(gl.TRIANGLES,meshes[i].first,meshes[i].count);
  }
  if(shown!=='webgl'){canvas.style.visibility='';if(fallbackCanvas)fallbackCanvas.style.visibility='hidden';wrap.classList.add('mesh-ready');wrap.dataset.jellyRenderer='webgl';shown='webgl';}
 }};
}

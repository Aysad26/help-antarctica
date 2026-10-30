// Three independent deformable jellyfish. A subdivided photographic mesh keeps
// every tentacle while bending its lower vertices with a delayed current.
export function createLivingOcean(root){
 const jellyImage=new Image();jellyImage.src='assets/jellyfish-v5.webp';
 const krillImage=new Image();krillImage.src='assets/krill-v6.webp';
 const renderers=[];
 for(let i=0;i<3;i++){
  const canvas=document.createElement('canvas');canvas.className='living-jelly jelly-'+i;
  canvas.width=640;canvas.height=640;canvas.setAttribute('aria-hidden','true');
  root.querySelector('.jellyfish-wrap').prepend(canvas);
  const gl=canvas.getContext('webgl',{alpha:true,premultipliedAlpha:true,antialias:false,preserveDrawingBuffer:true,powerPreference:'low-power'});
  if(!gl){canvas.remove();continue;}
  canvas.addEventListener('webglcontextlost',()=>{root.querySelector('.jellyfish-wrap').classList.remove('mesh-ready');for(const c of root.querySelectorAll('.living-jelly'))c.style.display='none';});
  const shader=(kind,code)=>{const s=gl.createShader(kind);gl.shaderSource(s,code);gl.compileShader(s);if(!gl.getShaderParameter(s,gl.COMPILE_STATUS))throw Error(gl.getShaderInfoLog(s));return s;};
  const vs=shader(gl.VERTEX_SHADER,`attribute vec2 uv;varying vec2 tex;uniform float time;uniform float phase;uniform float motion;
   void main(){tex=uv;float t=time*.62+phase;float lower=smoothstep(.28,.94,uv.y);
    float bend=(sin(uv.y*8.-t+uv.x*4.)*.024+sin(uv.y*15.-t*.8+uv.x*9.)*.010)*lower;
    float pulse=sin(t*1.4)*.025*(1.-lower);
    vec2 p=uv;p.x+=(bend+(uv.x-.5)*pulse)*motion;
    p.y+=(sin(t-uv.y*2.)*.009+sin(t*1.4)*.012*(1.-lower))*motion;
    p=p*.87+.065;gl_Position=vec4(p.x*2.-1.,1.-p.y*2.,0.,1.);}`);
  const fs=shader(gl.FRAGMENT_SHADER,`precision mediump float;varying vec2 tex;uniform sampler2D photo;void main(){gl_FragColor=texture2D(photo,tex);}`);
  const program=gl.createProgram();gl.attachShader(program,vs);gl.attachShader(program,fs);gl.linkProgram(program);
  if(!gl.getProgramParameter(program,gl.LINK_STATUS))throw Error(gl.getProgramInfoLog(program));
  const vertices=[];for(let y=0;y<38;y++)for(let x=0;x<24;x++){const a=x/24,b=y/38,c=(x+1)/24,d=(y+1)/38;vertices.push(a,b,c,b,a,d,c,b,c,d,a,d);}
  gl.useProgram(program);const buffer=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,buffer);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(vertices),gl.STATIC_DRAW);
  const location=gl.getAttribLocation(program,'uv');gl.enableVertexAttribArray(location);gl.vertexAttribPointer(location,2,gl.FLOAT,false,0,0);
  const texture=gl.createTexture();gl.bindTexture(gl.TEXTURE_2D,texture);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);
  const time=gl.getUniformLocation(program,'time'),phase=gl.getUniformLocation(program,'phase'),motion=gl.getUniformLocation(program,'motion');let ready=false;
  const upload=()=>{gl.bindTexture(gl.TEXTURE_2D,texture);gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL,true);gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,jellyImage);ready=true;};
  jellyImage.addEventListener('load',upload);if(jellyImage.complete&&jellyImage.naturalWidth)upload();
  renderers.push((t,reduced)=>{if(!ready)return;gl.viewport(0,0,640,640);gl.clearColor(0,0,0,0);gl.clear(gl.COLOR_BUFFER_BIT);gl.uniform1f(time,t*(1-i*.11));gl.uniform1f(phase,i*2.3);gl.uniform1f(motion,reduced?0:1);gl.drawArrays(gl.TRIANGLES,0,vertices.length/2);});
 }
 if(renderers.length===3)root.querySelector('.jellyfish-wrap').classList.add('mesh-ready');
 const school=document.createElement('canvas');school.className='living-krill';school.width=1000;school.height=700;school.setAttribute('aria-hidden','true');root.querySelector('.krill-wrap').prepend(school);
 const ctx=school.getContext('2d');
 ctx.imageSmoothingEnabled=true;ctx.imageSmoothingQuality='high';
 krillImage.addEventListener('load',()=>root.querySelector('.krill-wrap').classList.add('school-ready'));
 return {paint(time,progress,reduced){
  if(Math.abs(progress-3.5)<.75)for(const render of renderers)render(time,reduced);
  if(Math.abs(progress-3)<.85&&krillImage.complete&&krillImage.naturalWidth){
   ctx.clearRect(0,0,1000,700);const t=reduced?0:time;
   // Different speeds and vertical oscillations, with no synchronized flock jump.
   for(let i=0;i<23;i++){
    const layer=i%3,sz=layer===0?150:layer===1?100:65;
    const u=((i*.618+t*(.004+layer*.001))%1);
    const x=35+u*760;
    const y=100+((i*109.7)%420)+Math.sin(t*.55+i*2.4)*(5+layer*3);
    ctx.save();ctx.globalAlpha=(layer===0?.85:layer===1?.55:.25)*Math.min(1,u*10,(1-u)*10);ctx.translate(x,y);ctx.rotate(Math.sin(t*.65+i)*.035-.035);
    const h=sz*krillImage.naturalHeight/krillImage.naturalWidth;
    // One filtered sprite avoids shimmering seams between tiny moving strips.
    ctx.drawImage(krillImage,0,0,sz,h);ctx.restore();
   }
  }
 }};
}

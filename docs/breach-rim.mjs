import {breachFoamGeometry} from './motion.mjs?v=32';
const strips=new WeakMap();
const smooth=value=>{const x=Math.max(0,Math.min(1,value));return x*x*(3-2*x);};

export function breachRimDensity(u){
 const taper=smooth(u/.12)*smooth((1-u)/.12);
 const core=Math.exp(-Math.pow((u-.5)/.25,4));
 const grain=.74+.26*(.5+.5*Math.sin(u*72+.5*Math.sin(u*19)));
 const gaps=1-.5*Math.exp(-Math.pow((u-.18)/.022,2))-.5*Math.exp(-Math.pow((u-.78)/.025,2));
 return taper*(.42+.58*core)*(core*.7+(1-core*.7)*grain)*gaps;
}

// Reuse the earlier photographic foam, flattened to a narrow surface band.
// This denser breach foam is independent of the quiet ice-edge highlights.
export function paintBreachRim(ctx,photo,kind,contact,viewportWidth,subjectWidth,phase){
 if(!photo||phase<.28)return;
 let strip=strips.get(photo);
 if(!strip){
  strip=document.createElement('canvas');strip.width=960;strip.height=112;
  const g=strip.getContext('2d'),w=strip.width,h=strip.height;
  g.drawImage(photo,0,photo.height*.6,photo.width,photo.height*.4,0,0,w,h);
  g.globalCompositeOperation='source-in';g.fillStyle='#f1f9fa';g.fillRect(0,0,w,h);
  g.globalCompositeOperation='destination-in';
  const across=g.createLinearGradient(0,0,w,0);
  for(let i=0;i<=100;i++)across.addColorStop(i/100,`rgba(255,255,255,${breachRimDensity(i/100).toFixed(3)})`);
  g.fillStyle=across;g.fillRect(0,0,w,h);
  const down=g.createLinearGradient(0,0,0,h);
  down.addColorStop(0,'#fff0');down.addColorStop(.18,'#fff');down.addColorStop(.68,'#fff');down.addColorStop(1,'#fff0');
  g.fillStyle=down;g.fillRect(0,0,w,h);strips.set(photo,strip);
 }
 const {width}=breachFoamGeometry(kind,contact.width,viewportWidth,subjectWidth);
 const height=Math.max(5,Math.min(16,width*.024));
 const reveal=Math.max(0,Math.min(1,(phase-.28)/.32));
 ctx.save();ctx.beginPath();ctx.rect(contact.x-width*.5,contact.y-height*.42*reveal,width,height*1.1);ctx.clip();
 ctx.drawImage(strip,contact.x-width*.5,contact.y-height*.42,width,height);
 ctx.restore();
}

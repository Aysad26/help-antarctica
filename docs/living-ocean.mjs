import {createLivingJellies} from './living-jellies.mjs?v=41';
// Shared photographic jellyfish renderer; the existing krill scene stays 2D.
export function createLivingOcean(root){
 const jellyImage=new Image();jellyImage.src='assets/jellyfish-v5.webp';
 const krillImage=new Image();krillImage.src='assets/krill-v6.webp';
 const jellies=createLivingJellies(root.querySelector('.jellyfish-wrap'),jellyImage);
 const school=document.createElement('canvas');school.className='living-krill';school.width=1000;school.height=700;school.setAttribute('aria-hidden','true');root.querySelector('.krill-wrap').prepend(school);
 const ctx=school.getContext('2d');
 ctx.imageSmoothingEnabled=true;ctx.imageSmoothingQuality='high';
 krillImage.addEventListener('load',()=>root.querySelector('.krill-wrap').classList.add('school-ready'));
 return {paint(time,progress,reduced){
  jellies.paint(time,progress,reduced);
  if(Math.abs(progress-3)<.85&&krillImage.complete&&krillImage.naturalWidth){
   ctx.clearRect(0,0,1000,700);const t=reduced?0:time;
   // Different speeds and vertical oscillations, with no synchronized flock jump.
   for(let i=0;i<23;i++){
    const layer=i%3,sz=layer===0?150:layer===1?100:65;
    const u=((i*.618+t*(.004+layer*.001))%1);
    const x=35+u*760;
    const y=100+((i*109.7)%420)+Math.sin(t*.55+i*2.4)*(5+layer*3);
    ctx.save();ctx.globalAlpha=(layer===0?.85:layer===1?.55:.25);ctx.translate(x,y);ctx.rotate(Math.sin(t*.65+i)*.035-.035);
    const h=sz*krillImage.naturalHeight/krillImage.naturalWidth;
    // One filtered sprite avoids shimmering seams between tiny moving strips.
    ctx.drawImage(krillImage,0,0,sz,h);ctx.restore();
   }
  }
 }};
}

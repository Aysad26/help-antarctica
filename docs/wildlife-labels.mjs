import {clamp} from './motion.mjs?v=32';
import {leopardSwimPose,leopardLandmarks} from './deep-life.mjs?v=32';
import {shallowBirdPose} from './near-surface.mjs?v=32';

export function ternBeak(p){
 return {x:p.x+p.width*(-.405*Math.cos(p.angle)-.294*Math.sin(p.angle)),y:p.y+p.width*(-.405*Math.sin(p.angle)+.294*Math.cos(p.angle))};
}
export function wildlifeHintPose(kind,pose,width,height,labelWidth,labelHeight,card){
 const point=kind==='leopard'?leopardLandmarks(pose).head:ternBeak(pose);
 const footer=height-(width<=700?82:76),margin=16;
 const visible=point.x>margin&&point.x<width-margin&&point.y>100&&point.y<Math.min(height*.86,footer-28);
 const sideOffset=kind==='leopard'?(width<=700?.42:.20):.14;
 let x=clamp(point.x+width*sideOffset-labelWidth/2,margin,width-labelWidth-margin);
 let y=kind==='leopard'?point.y-labelHeight-28:point.y+38;
 y=clamp(y,102,footer-labelHeight-12);
 if(card&&x<card.right+12&&x+labelWidth>card.left-12&&y<card.bottom+12&&y+labelHeight>card.top-12)y=card.bottom+12;
 return {x,y,visible:visible&&y+labelHeight<footer-8,point};
}
export function createWildlifeLabels(story){
 const leopard=story.querySelector('.underleopard-wrap .species-label'),tern=story.querySelector('.tern-passage .passage-label');
 const wrap=leopard.parentElement;
 const labels=[{kind:'leopard',button:leopard},{kind:'tern',button:tern}];
 for(const l of labels){l.button.className='species-label wildlife-hint '+l.kind+'-hint';l.button.style.visibility='hidden';story.append(l.button);}
 wrap.remove();
 let measuredWidth=0,wasActive=false;
 document.fonts?.ready.then(()=>{measuredWidth=0;});
 return {paint(progress,width,height,started){
  if(started)for(const button of story.querySelectorAll('.scene.active .species-label,.journey-passage[aria-hidden="false"] .species-label')){
   const r=button.getBoundingClientRect(),visible=r.left>=12&&r.right<=width-12&&r.top>=86&&r.bottom<=height-64;
   const value=visible?'visible':'hidden';if(button.style.visibility!==value)button.style.visibility=value;
  }
  if(!started||progress<3.55||progress>4.95){
   if(wasActive)for(const l of labels){l.button.style.visibility='hidden';l.button.inert=true;l.button.setAttribute('aria-hidden','true');}
   wasActive=false;return;
  }
  wasActive=true;
  if(width!==measuredWidth){for(const l of labels){l.width=l.button.offsetWidth;l.height=l.button.offsetHeight;}measuredWidth=width;}
  const card=story.querySelector('.underleopard-scene .story-card').getBoundingClientRect();
  for(const l of labels){
   const pose=l.kind==='leopard'?leopardSwimPose(progress,width,height):shallowBirdPose(progress,width,height);
   const p=wildlifeHintPose(l.kind,pose,width,height,l.width,l.height,l.kind==='leopard'?card:null);
   const active=started&&(l.kind==='leopard'?progress>3.6&&progress<4.4:progress>4.2&&progress<4.9)&&p.visible;
   l.button.style.transform=`translate3d(${p.x}px,${p.y}px,0)`;
   l.button.style.visibility=active?'visible':'hidden';l.button.inert=!active;l.button.setAttribute('aria-hidden',String(!active));
  }
 }};
}

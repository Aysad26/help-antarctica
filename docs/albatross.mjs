import {sceneTravel,clamp,smooth} from './motion.mjs?v=32';

// The bird belongs to the near air layer. Progress determines its diagonal
// course; time only adds a tiny banking correction while it holds the wind.
export function albatrossPose(progress,width,height,time=0,reduced=false){
 const mobile=width<=700;
 const travel=(sceneTravel(progress,width)-sceneTravel(mobile?1.5:1.62,width))/width;
 const flight=travel*(mobile?1.04:1.20);
 const sway=reduced?0:Math.sin(time*.42)*1.15;
 return {
  x:width*(.5-flight),
  y:height*((mobile?.56:.49)-travel*(mobile?.095:.24))+(reduced?0:Math.sin(time*.37)*height*.004),
  width:mobile?Math.min(width*.9,height*.67)/1.16:Math.min(width*.72,height*1.1)/1.74,
  angle:-4+clamp(travel,-1,1)*4+sway,
  alpha:1,
  label:1-smooth((Math.abs(flight/1.04)-(mobile?.35:.38))/.28)
 };
}

export function createAlbatross(root){
 const bird=root.querySelector('img'),label=root.querySelector('button');
 const far=document.createElement('img');far.className='albatross-flight albatross-far';far.src='assets/albatross-fish-v32.webp';far.alt='Второй альбатрос с небольшой рыбой в клюве летит в противоположную сторону';root.prepend(far);
 let wasActive=false;
 return {paint(progress,time,width,height,reduced,started){
  const active=started&&progress>.9&&progress<2.3;
  if(!active){if(wasActive){root.style.visibility='hidden';root.inert=true;root.setAttribute('aria-hidden','true');}wasActive=false;return;}
  const p=albatrossPose(progress,width,height,time,reduced);
  root.style.opacity='1';root.style.visibility='visible';root.inert=p.label<.1;root.setAttribute('aria-hidden',String(p.label<.1));
  bird.style.width=`${p.width}px`;bird.style.left=`${p.x}px`;bird.style.top=`${p.y}px`;
  bird.style.transform=`translate(-50%,-50%) rotate(${p.angle}deg)`;
  const travel=(sceneTravel(progress,width)-sceneTravel(width<=700?1.5:1.62,width))/width;
  far.style.width=`${p.width*.24}px`;far.style.left=`${width*(.66+travel*(width<=700?.72:.52))}px`;far.style.top=`${height*(width<=700?.32+travel*.045:.19+travel*.13)}px`;far.style.transform=`translate(-50%,-50%) rotate(${8-travel*6}deg)`;far.style.opacity='1';
  label.style.left=`${clamp(p.x,width*.34,width*.66)}px`;
  label.style.top=`${Math.min(height*.78,p.y+p.width*.28)}px`;
  label.style.opacity=p.label;
  root.dataset.phase=progress.toFixed(4);wasActive=true;
 }};
}

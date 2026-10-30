import {sceneTravel,smooth} from './motion.mjs?v=31';
export function passagePose(progress,stop,width){
 const x=sceneTravel(stop,width)-sceneTravel(progress,width);
 return {x,alpha:1-smooth((Math.abs(x)/width-.45)/.55)};
}
export function createPassages(story,route){
 const definitions=[{stop:.5,id:'tourists',name:'Туризм в Антарктике',detail:'Поездки и ограничения',subject:'Туризм в Антарктике',modal:'tourists'}, {stop:3.5,id:'jellies',name:'Живая прозрачность',detail:'Пауза в глубине',subject:'Медузы подо льдом',modal:'jelly'}, {stop:4.5,id:'tern',name:'Под самой поверхностью',detail:'Короткий нырок',subject:'Антарктическая крачка',modal:'tern'}];
 const roots=definitions.map(d=>{
  const root=document.createElement('section');root.className=`journey-passage ${d.id}-passage`;root.setAttribute('aria-label',d.name);root.inert=true;
  const artwork=d.id==='tourists'?'<div class="tourist-rig"><img class="tourist-photo" src="assets/tourists-v18.webp" alt="Шлюпка направлена носом влево к зрителю: фотограф снимает влево, девушка показывает вправо"><div class="boat-contact" aria-hidden="true"></div><img class="boat-reflection" src="assets/tourists-v18.webp" alt="" aria-hidden="true"></div>':d.id==='jellies'?'<div class="animal-wrap jellyfish-wrap"><img class="animal-image" src="assets/jellyfish-v5.webp" alt="Медузы плывут перед далёким косяком рыб"><img class="jelly-distant" src="assets/jellyfish-v5.webp" alt="" aria-hidden="true"><img class="jelly-distant second" src="assets/jellyfish-v5.webp" alt="" aria-hidden="true"></div>':'';
  root.innerHTML=artwork+`<button class="species-label passage-label" data-modal="${d.modal}" aria-label="${d.subject}: открыть справку" aria-haspopup="dialog" aria-controls="infoDialog"><span class="info-i" aria-hidden="true">i</span><span class="species-name" aria-hidden="true">${d.subject}</span><span class="passage-more" aria-hidden="true">↗</span></button>`;
  story.append(root);
  route.querySelector(`[data-chapter="${Math.floor(d.stop)}"]`).insertAdjacentHTML('afterend',`<button class="route-item route-passage" data-chapter="${d.stop}"><span aria-hidden="true">↝</span><span class="route-item-name">${d.name}<small>${d.detail}</small></span><span aria-hidden="true">↗</span></button>`);
  return root;
 });
 return {paint(progress,time,width,height,started){
  for(let i=0;i<roots.length;i++){
   const p=passagePose(progress,definitions[i].stop,width),root=roots[i];
   const visible=started&&Math.abs(p.x)<width*1.6;
   root.style.visibility=visible?'visible':'hidden';root.style.opacity='1';root.style.transform=`translate3d(${p.x}px,0,0)`;
   root.inert=!visible||Math.abs(p.x)>width*.7;root.setAttribute('aria-hidden',String(root.inert));
  }
 }};
}

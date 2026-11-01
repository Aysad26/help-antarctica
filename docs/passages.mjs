import {sceneTravel,smooth} from './motion.mjs?v=32';
import {ui,text} from './i18n.mjs?v=51';
export function passagePose(progress,stop,width){
 const x=sceneTravel(stop,width)-sceneTravel(progress,width);
 return {x,alpha:1-smooth((Math.abs(x)/width-.45)/.55)};
}
export function createPassages(story,route){
 const definitions=[{stop:.5,id:'tourists',modal:'tourists'},{stop:3.5,id:'jellies',modal:'jelly'},{stop:4.5,id:'tern',modal:'tern'}],labels=[],routeItems=[];
 const roots=definitions.map((definition,i)=>{
  const d={...definition,...ui.passages[i]};
  const root=document.createElement('section');root.className=`journey-passage ${d.id}-passage`;root.setAttribute('aria-label',d.name);root.inert=true;
  const artwork=d.id==='tourists'?`<div class="tourist-rig"><img class="tourist-photo" src="assets/tourists-v18.webp" alt="${d.alt}"><div class="boat-contact" aria-hidden="true"></div><img class="boat-reflection" src="assets/tourists-v18.webp" alt="" aria-hidden="true"></div>`:d.id==='jellies'?`<div class="animal-wrap jellyfish-wrap"><img class="animal-image" src="assets/jellyfish-v5.webp" alt="${d.alt}"><img class="jelly-distant" src="assets/jellyfish-v5.webp" alt="" aria-hidden="true"><img class="jelly-distant second" src="assets/jellyfish-v5.webp" alt="" aria-hidden="true"></div>`:'';
  root.innerHTML=artwork+`<button class="species-label passage-label" data-modal="${d.modal}" aria-label="${text('infoLabel',{subject:d.subject})}" aria-haspopup="dialog" aria-controls="infoDialog"><span class="info-i" aria-hidden="true">i</span><span class="species-name" aria-hidden="true">${d.subject}</span><span class="passage-more" aria-hidden="true">↗</span></button>`;
  story.append(root);labels.push(root.querySelector('button'));
  route.querySelector(`[data-chapter="${Math.floor(d.stop)}"]`).insertAdjacentHTML('afterend',`<button class="route-item route-passage" data-passage="${d.id}" data-chapter="${d.stop}"><span aria-hidden="true">↝</span><span class="route-item-name">${d.name}<small>${d.detail}</small></span><span aria-hidden="true">↗</span></button>`);
  routeItems.push(route.querySelector(`[data-passage="${d.id}"]`));return root;
 });
 return {localize(){
  roots.forEach((root,i)=>{const d=ui.passages[i],label=labels[i];root.setAttribute('aria-label',d.name);label.setAttribute('aria-label',text('infoLabel',{subject:d.subject}));label.querySelector('.species-name').textContent=d.subject;const image=root.querySelector('.tourist-photo,.animal-image');if(image)image.alt=d.alt;routeItems[i].querySelector('.route-item-name').innerHTML=`${d.name}<small>${d.detail}</small>`;});
 },paint(progress,time,width,height,started){
  for(let i=0;i<roots.length;i++){
   const p=passagePose(progress,definitions[i].stop,width),root=roots[i];
   const visible=started&&Math.abs(p.x)<width*1.6;
   root.style.visibility=visible?'visible':'hidden';root.style.opacity='1';root.style.transform=`translate3d(${p.x}px,0,0)`;
   root.inert=!visible||Math.abs(p.x)>width*.7;root.setAttribute('aria-hidden',String(root.inert));
  }
 }};
}

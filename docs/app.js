import {advanceFinalScroll,finalScrollLayout} from './final-scroll.mjs?v=53';
import {surfaceClipPolygon} from './surface-clip.mjs?v=47';
import {createSnow} from './snow.mjs?v=32';
import {createShoreRenderer} from './shore-renderer.mjs?v=53';
import {createPassages} from './passages.mjs?v=51';
import {shipApproachPose,shipContactAt,archLayoutBox} from './ship-approach.mjs?v=50';
import {createPenguinWater} from './penguin-water.mjs?v=46';
import {createForegroundWater} from './foreground-water.mjs?v=42';
import {createFloeContacts,paintFoamEdge} from './surface-contact.mjs?v=44';
import {breachArtGeometry} from './breach-art.mjs?v=42';
import {scrollArrivalPhase,easedCamera} from './arrival-motion.mjs?v=32';
import {sprayThresholds} from './breach-spray.mjs?v=32';
import {staticSprayGeometry} from './static-spray.mjs?v=43';
import {paintBreachRim} from './breach-rim.mjs?v=46';
import {createAlbatross} from './albatross.mjs?v=51';
import {createDepthWorld} from './ocean-depth.mjs?v=47';
import {createPugh} from './pugh.mjs?v=43';
import {createStationLights} from './station-lights.mjs?v=32';
import {createLivingOcean} from './living-ocean.mjs?v=41';
import {paintContactReflection,surfaceContactSpace} from './contact-water.mjs?v=50';
import {createWildlifeLabels} from './wildlife-labels.mjs?v=32';
import {createPaintBudget,paintDeadline} from './rendering.mjs?v=50';
import {depthPose,encounterOpacity,snowScreenX,holdAmount,surfaceY,surfaceBoundary,surfaceForegroundOpacity} from './expedition-motion.mjs?v=48';
import {scenes as russianScenes,modals as russianModals} from './story.mjs?v=47';
import {scenes as englishScenes,modals as englishModals} from './story.en.mjs?v=51';
import {language,ui,text,setLanguage,applyStaticLanguage,languageURL} from './i18n.mjs?v=51';
import {createSoundscape} from './soundscape.mjs?v=32';
import {clamp,lerp,smooth,breachPose,landingPose,introMaskGeometry,sceneStride,sceneTravel,travelProgress,oceanTiles,adjacentStop} from './motion.mjs?v=32';
'use strict';
let scenes=language==='en'?englishScenes:russianScenes,modals=language==='en'?englishModals:russianModals;
applyStaticLanguage();
const $ = (s, root=document) => root.querySelector(s);
const $$ = (s, root=document) => [...root.querySelectorAll(s)];
const ASSET='assets/';
const soundscape=createSoundscape();
const stationLights=createStationLights(document.querySelector('#landingStation'));
const LAST=scenes.length-1,SHIP=scenes.findIndex(s=>s.animal==='ship'),BIRDS=scenes.findIndex(s=>s.animal==='cormorant');
const arrow='<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M4 12h15m-6-6 6 6-6 6"/></svg>';
const track=$('#sceneTrack');
track.innerHTML=scenes.map((s,i)=>`<section class="scene ${s.animal}-scene ${i===0?'active':''}" aria-labelledby="sceneTitle${i}" data-index="${i}" ${i?'inert aria-hidden="true"':''}>
 <article class="story-card"><div class="card-eyebrow">${String(i+1).padStart(2,'0')} / ${s.eyebrow.replace(/^\d+ \/ /,'')}</div><h2 id="sceneTitle${i}">${s.title}</h2><p class="card-full">${s.text}</p><p class="card-full">${s.text2}</p><p class="card-mobile">${s.mobileText}</p><div class="card-divider"></div><p class="card-fact">${s.fact}</p><div class="card-actions"><button class="card-link" data-modal="${s.modal}">${s.cta}${arrow}</button></div></article>
 ${i===LAST?`<button class="primary-button final-share" id="shareButton"><span class="share-label">${ui.share}</span><svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><circle cx="18" cy="5" r="2.5"/><circle cx="6" cy="12" r="2.5"/><circle cx="18" cy="19" r="2.5"/><path d="m8.2 10.7 7.6-4.4m-7.6 7 7.6 4.4"/></svg></button><div class="shore-foreground" aria-hidden="true"></div>`:''}
 <div class="animal-wrap ${s.animal}-wrap" ${['ship','station'].includes(s.animal)?'data-landing-anchor':''}>
 ${s.splash?`<div class="breach-window"><div class="breach-orbit"><img class="animal-image" src="${ASSET+s.image}" alt="${s.subject}" decoding="async"></div></div>`:s.animal==='swimmer'?`<img class="animal-image swimmer-original" src="${ASSET+s.image}" alt="${ui.swimmerAlt}">`:!['ship','station'].includes(s.animal)?`<img class="animal-image" src="${ASSET+s.image}" alt="${s.subject}" decoding="async">`:''}
 ${s.animal==='krill'?'<img class="krill-distant" src="assets/krill-v5.webp" alt="" aria-hidden="true"><img class="krill-distant second" src="assets/krill-v5.webp" alt="" aria-hidden="true">':''}${s.animal==='jellyfish'?'<img class="jelly-distant" src="assets/jellyfish-v5.webp" alt="" aria-hidden="true"><img class="jelly-distant second" src="assets/jellyfish-v5.webp" alt="" aria-hidden="true">':''}
 ${s.animal==='ship'?'<div class="ship-wake" aria-hidden="true"></div>':''}${s.animal==='station'?'<div class="station-glow" aria-hidden="true"></div>':''}
 <button class="species-label" data-modal="${s.speciesModal}" aria-label="${text('infoLabel',{subject:s.subject})}" aria-haspopup="dialog" aria-controls="infoDialog"><span class="info-i" aria-hidden="true">i</span><span class="species-name" aria-hidden="true">${s.subject}</span></button>
 </div>
 <div class="scene-note" aria-hidden="true">${s.note}</div></section>`).join('');
// The ship is a visual pause; its sourced detail remains available as a hint.
const shipChapter=track.querySelector('.ship-scene');
shipChapter.querySelector('.story-card').remove();
// Elephant seal is another quiet encounter; its small sourced hint remains.
const elephantChapter=track.querySelector('.leopard-scene');
elephantChapter.querySelector('.story-card').remove();
elephantChapter.removeAttribute('aria-labelledby');elephantChapter.setAttribute('aria-label',ui.elephant);
shipChapter.removeAttribute('aria-labelledby');shipChapter.setAttribute('aria-label',ui.expedition);
shipChapter.insertAdjacentHTML('beforeend',`<button class="species-label ship-info" data-modal="ship" aria-label="${text('infoLabel',{subject:ui.researchShip})}" aria-haspopup="dialog" aria-controls="infoDialog"><span class="info-i" aria-hidden="true">i</span><span class="species-name" aria-hidden="true">${ui.researchShip}</span></button>`);
$('#chapterNav').innerHTML=scenes.map((s,i)=>`<button class="chapter-dot" data-chapter="${i}" data-label="${s.name}" aria-label="${text('chapterLabel',{number:i+1,name:s.name})}" ${i===0?'aria-current="step"':''}></button>`).join('');
$('#routeList').innerHTML=scenes.map((s,i)=>`<button class="route-item" data-chapter="${i}"><span>${String(i+1).padStart(2,'0')}</span><span class="route-item-name">${s.name}<small>${s.subject}</small></span><span aria-hidden="true">↗</span></button>`).join('');


let width=innerWidth,height=innerHeight,progress=0,target=0,chapter=0,started=false,opening=false,paused=false,snowOn=true,elapsed=0,lastTime=performance.now(),lastPaint=0,lastPaintAt=lastTime,frameId,scrollVelocity=0;
const paintBudget=createPaintBudget(width<=700);
const reducedQuery=matchMedia('(prefers-reduced-motion: reduce)');
let reduced=reducedQuery.matches;
document.body.classList.toggle('reduced-motion',reduced);
const sceneEls=$$('.scene');
const finalCard=$('.workers-scene .story-card'),finalShare=$('#shareButton'),finalPeople=$('.workers-wrap');
let finalOffset=0,finalTarget=0,finalLimit=0,finalButtonTop=0,finalButtonHeight=0,finalFooterTop=0;
function positionFinalShare(){
 // Measure only on layout changes, never in the animation loop.
 finalCard.style.maxHeight='';
 const card=finalCard.getBoundingClientRect(),scene=sceneEls[LAST].getBoundingClientRect();
 if(innerWidth<=700){
  const cardLimit=finalPeople.offsetTop-finalShare.offsetHeight-14-finalCard.offsetTop-16;
  finalCard.style.maxHeight=`${Math.max(118,Math.ceil(cardLimit)+2)}px`;
  const peopleBottom=finalPeople.offsetTop+finalPeople.offsetHeight;
  const layout=finalScrollLayout(peopleBottom,finalShare.offsetHeight,innerHeight,$('.journey-footer').offsetHeight);
  finalLimit=layout.limit;finalButtonTop=layout.top;finalButtonHeight=finalShare.offsetHeight;finalFooterTop=innerHeight-$('.journey-footer').offsetHeight;
  finalShare.style.top=`${layout.top}px`;
 }else{
  finalLimit=finalTarget=finalOffset=0;
  document.documentElement.style.setProperty('--final-scroll',0);
  finalShare.style.top=`${card.bottom-scene.top+14}px`;
 }
 finalShare.style.left=`${card.left-scene.left}px`;
 finalTarget=Math.min(finalTarget,finalLimit);finalOffset=Math.min(finalOffset,finalLimit);
}
if(typeof ResizeObserver==='function'){
 const observer=new ResizeObserver(positionFinalShare);observer.observe(finalCard);observer.observe(finalPeople);
}
addEventListener('resize',positionFinalShare);
document.fonts?.ready.then(positionFinalShare);
$('.animal-image',finalPeople).addEventListener('load',positionFinalShare);
finalShare.addEventListener('focus',()=>{if(width<=700&&chapter===LAST)finalTarget=finalLimit;});

const arrivalScenes=[['orca',1],['whale',2],['swimmer',6]].map(([kind,index])=>({kind,index,card:$('.story-card',sceneEls[index]),image:$('.animal-image',sceneEls[index])}));
function currentBreachPose(kind){
 return breachPose(kind,progress,sceneStride(width)/width,width>700?(reduced?1:scrollArrivalPhase(kind,progress)):undefined);
}
const foregroundWater=createForegroundWater($('#foregroundWater'),$('#nearWaterBackdrop'));
const oceanLayers=[$('#ocean')].map(el=>{
 el.innerHTML='<div class="ocean-tile"></div><div class="ocean-tile"></div>';
 return $$('.ocean-tile',el);
});
let lastOceanPosition='';
function positionOcean(travel){
 foregroundWater.paint(travel,width,height,progress);
 const key=[travel,width,height].join(':');if(key===lastOceanPosition)return;lastOceanPosition=key;
 const tiles=oceanTiles(travel,width,height);
 for(const layers of oceanLayers)for(let i=0;i<2;i++){
  layers[i].style.backgroundPositionX=`${tiles[i].backgroundX}px`;
  layers[i].style.transform=tiles[i].mirrored?'scaleX(-1)':'none';
  // Clip coordinates precede the mirror transform. A subpixel overlap avoids
  // a hairline when adjacent edges land between device pixels.
  const {clipLeft,clipRight,mirrored}=tiles[i];
  layers[i].style.clipPath=`inset(0 ${mirrored?clipLeft:clipRight}px 0 ${mirrored?clipRight:clipLeft}px)`;
 }
}
const passages=createPassages($('#story'),$('#routeList'));
const wildlifeLabels=createWildlifeLabels($('#story'));
const livingOcean=createLivingOcean($('#story'));
const pugh=createPugh($('.swimmer-wrap'));
const albatross=createAlbatross($('#albatrossPassage'));
// A compact upright serif mark, independent of installed fonts.
for(const mark of $$('.info-i'))mark.innerHTML='<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><circle cx="12" cy="5.3" r="1.45"/><path d="M8.8 9.2h4.3v9.1c0 .8.4 1.1 1.2 1.1h1v1H8.7v-1h1c.8 0 1.2-.3 1.2-1.1v-6.9c0-.8-.4-1.1-1.2-1.1h-.9Z"/></svg>';
$('#routeList [data-chapter="1"]').insertAdjacentHTML('afterend',`<button id="albatrossRoute" class="route-item route-passage" data-chapter="1.5"><span aria-hidden="true">↝</span><span class="route-item-name">${ui.albatrossRoute}<small>${ui.albatrossRouteDetail}</small></span><span aria-hidden="true">↗</span></button>`);
let dialogTrigger=null;
function sourceLinks(items){return items.map(([label,url])=>`<a href="${url}" target="_blank" rel="noopener noreferrer">${label}</a>`).join('');}
function openModal(id,trigger){const data=modals[id];if(!data)return;dialogTrigger=trigger||document.activeElement;if($('#routeDialog').open)$('#routeDialog').close();$('#modalContent').innerHTML=`<div class="dialog-eyebrow">${data.eyebrow}</div><h2 id="modalTitle">${data.title}</h2>${data.latin?`<p class="dialog-latin">${data.latin}</p>`:''}${data.image?`<figure class="modal-photo"><img class="modal-visual" src="${ASSET+data.image}" alt="${data.photoAlt||data.title}" decoding="async">${data.photoCaption?`<figcaption>${data.photoCaption}</figcaption>`:''}</figure>`:''}<div class="modal-body">${data.body.map(t=>`<p>${t}</p>`).join('')}<div class="modal-fact">${data.fact}</div>${data.archive?`<a class="archive-link" href="${data.archive[1]}" target="_blank" rel="noopener noreferrer">${data.archive[0]} ↗</a>`:''}${data.footnote?`<p class="modal-footnote">${data.footnote}</p>`:''}<div class="modal-source">${sourceLinks(data.sources)}</div></div>`;$('#infoDialog').showModal();$('#infoDialog').scrollTop=0;document.body.classList.add('modal-open');$('#closeDialog').focus({preventScroll:true});}
function closeInfo(){$('#infoDialog').close();document.body.classList.remove('modal-open');if(dialogTrigger?.isConnected&&!dialogTrigger.closest('[inert]'))dialogTrigger.focus({preventScroll:true});}
$('#closeDialog').addEventListener('click',closeInfo);
$('#infoDialog').addEventListener('cancel',()=>document.body.classList.remove('modal-open'));
$('#infoDialog').addEventListener('click',e=>{if(e.target===$('#infoDialog')){const r=e.target.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)closeInfo();}});
document.addEventListener('click',e=>{const m=e.target.closest('[data-modal]');if(m)openModal(m.dataset.modal,m);const c=e.target.closest('[data-chapter]');if(c){const n=Number(c.dataset.chapter);if($('#routeDialog').open)$('#routeDialog').close();document.body.classList.remove('modal-open');if(!started)start(n);else go(n);}});
$('#menuButton').addEventListener('click',()=>{$('#routeDialog').showModal();document.body.classList.add('modal-open');});
$('#closeRoute').addEventListener('click',()=>{$('#routeDialog').close();document.body.classList.remove('modal-open');$('#menuButton').focus();});
$('#routeDialog').addEventListener('cancel',()=>document.body.classList.remove('modal-open'));
function start(n=0){if(started||opening)return;opening=true;target=progress=n;chapter=n;positionIntroMask();$('#startButton').disabled=true;$('#intro').classList.add('opening');$('#intro').inert=true;$('#story').inert=false;updateChapter(true);setTimeout(()=>{started=true;opening=false;$('#intro').classList.add('hidden');$('#journeyUI').classList.add('visible');$('#journeyUI').inert=false;$('#headerCenter').textContent=ui.taglineJourney;$('#story').focus({preventScroll:true});document.body.classList.remove('prestart');},reduced?30:1550);}
$('#startButton').addEventListener('click',()=>start());
$('#homeButton').addEventListener('click',()=>{if(!started)return;started=false;opening=false;document.body.classList.add('prestart');target=progress=chapter=0;finalTarget=finalOffset=0;$('#intro').classList.remove('opening','hidden');$('#intro').inert=false;$('#startButton').disabled=false;$('#journeyUI').classList.remove('visible');$('#journeyUI').inert=true;$('#story').inert=true;$('#headerCenter').textContent=ui.taglineIntro;scrollVelocity=0;updateChapter(true);positionIntroMask();$('#startButton').focus({preventScroll:true});});
function go(n){scrollVelocity=0;finalTarget=0;target=Math.max(0,Math.min(scenes.length-1,n));if(reduced){progress=target;updateChapter();}}
$('#nextButton').addEventListener('click',()=>go(adjacentStop(target,1)));
$('#previousButton').addEventListener('click',()=>go(adjacentStop(target,-1)));
addEventListener('wheel',e=>{if(!started||$('.info-dialog[open]')||$('.route-dialog[open]'))return;if(e.target.closest('.story-card')&&e.target.closest('.story-card').scrollHeight>e.target.closest('.story-card').clientHeight+3){const el=e.target.closest('.story-card');if((e.deltaY>0&&el.scrollTop+el.clientHeight<el.scrollHeight-3)||(e.deltaY<0&&el.scrollTop>2))return;}e.preventDefault();const delta=Math.abs(e.deltaX)>Math.abs(e.deltaY)?e.deltaX:e.deltaY;const norm=delta*(e.deltaMode===1?16:e.deltaMode===2?height:1);advanceInput(norm*width/(width<=700?720:1050));scrollVelocity=0;},{passive:false});
let seekDragging=false;$('#journeyScrubber').addEventListener('pointerdown',()=>seekDragging=true);addEventListener('pointerup',()=>seekDragging=false);addEventListener('pointercancel',()=>seekDragging=false);
$('#journeyScrubber').addEventListener('input',e=>{scrollVelocity=0;finalTarget=0;target=travelProgress(Number(e.target.value)/1000*sceneTravel(LAST,width),width);});
let gesture=null,zoomAmount=0,cameraScale=1;
function advanceInput(delta,initial=target,offset=finalTarget){
 const next=advanceFinalScroll(initial,offset,delta,width,finalLimit,LAST);
 target=next.progress;finalTarget=next.offset;
}
function beginGesture(x,y,card){scrollVelocity=0;gesture={began:performance.now(),moved:false,x,y,initial:target,initialOffset:finalTarget,card,scrolling:false,lastPosition:sceneTravel(target,width)+finalTarget,lastTime:performance.now(),velocity:0};}
function moveGesture(x,y,event){
  if(!gesture||!started)return;
  const dx=gesture.x-x,dy=gesture.y-y;
  if(Math.hypot(dx,dy)>8)gesture.moved=true;
  if(gesture.card&&Math.abs(dy)>Math.abs(dx)&&gesture.card.scrollHeight>gesture.card.clientHeight+2){gesture.scrolling=true;return;}
  if(event.cancelable)event.preventDefault();
  const d=Math.abs(dx)>Math.abs(dy)?dx:dy;
  advanceInput(d,gesture.initial,gesture.initialOffset);
  const position=sceneTravel(target,width)+finalTarget,now=performance.now(),deltaTime=(now-gesture.lastTime)/1000;
  if(deltaTime>.004){const velocity=(position-gesture.lastPosition)/Math.min(deltaTime,.12);gesture.velocity=lerp(gesture.velocity,clamp(velocity,-3*width,3*width),.45);gesture.lastPosition=position;gesture.lastTime=now;}
}
function finishGesture(){
  if(!gesture)return;
  if(!gesture.scrolling&&performance.now()-gesture.lastTime<100)scrollVelocity=Math.abs(gesture.velocity)>8?gesture.velocity:0;
  gesture=null;
}
const story=$('#story');
story.addEventListener('dragstart',e=>e.preventDefault());
story.addEventListener('contextmenu',e=>{if(started&&!e.target.closest('a,button'))e.preventDefault();});
story.addEventListener('touchstart',e=>{if(!started||e.target.closest('button,a'))return;beginGesture(e.touches[0].clientX,e.touches[0].clientY,e.target.closest('.story-card'));},{passive:true});
story.addEventListener('touchmove',e=>{if(gesture)moveGesture(e.touches[0].clientX,e.touches[0].clientY,e);},{passive:false});
story.addEventListener('touchend',finishGesture,{passive:true});
story.addEventListener('touchcancel',finishGesture,{passive:true});
story.addEventListener('pointerdown',e=>{if(e.pointerType==='touch'||!started||e.target.closest('button,a,.story-card'))return;beginGesture(e.clientX,e.clientY,null);story.setPointerCapture(e.pointerId);});
story.addEventListener('pointermove',e=>{if(e.pointerType!=='touch')moveGesture(e.clientX,e.clientY,e);});
story.addEventListener('pointerup',e=>{if(e.pointerType!=='touch')finishGesture();});
story.addEventListener('pointercancel',e=>{if(e.pointerType!=='touch')finishGesture();});
addEventListener('keydown',e=>{if(!started||$('dialog[open]')||e.altKey||e.ctrlKey||e.metaKey)return;if(e.target.closest('button,a,input,textarea,select'))return;const map={ArrowRight:1,ArrowDown:1,PageDown:1,ArrowLeft:-1,ArrowUp:-1,PageUp:-1};if(map[e.key]){e.preventDefault();if(width<=700&&((target===LAST&&map[e.key]>0)||finalTarget>0))advanceInput(map[e.key]*finalLimit);else go(adjacentStop(target,map[e.key]));}if(e.key==='Home'){e.preventDefault();go(0);}if(e.key==='End'){e.preventDefault();go(LAST);}});
let chapterUiKey='';
function updateChapter(force=false){const passage=[.5,1.5,3.5,4.5].map((stop,i)=>({stop,name:ui.passageNames[i]})).find(s=>Math.abs(sceneTravel(progress,width)-sceneTravel(s.stop,width))<width*.36);const next=Math.max(0,Math.min(LAST,Math.round(progress)));const key=`${next}:${passage?.stop??-1}:${progress<.001}:${progress>LAST-.001}`;if(key===chapterUiKey&&!force)return;chapterUiKey=key;chapter=next;sceneEls.forEach((el,i)=>{if(i===chapter&&!el.classList.contains('active')){const card=$('.story-card',el);if(card)card.scrollTop=0;}el.classList.toggle('active',i===chapter&&!passage);el.inert=i!==chapter||!!passage;el.setAttribute('aria-hidden',String(i!==chapter||!!passage));});$$('.chapter-dot').forEach((b,i)=>i===chapter&&!passage?b.setAttribute('aria-current','step'):b.removeAttribute('aria-current'));$('#pageCounter').innerHTML=passage?`↝ <i>${passage.name}</i>`:`${String(chapter+1).padStart(2,'0')} <i>/ ${String(scenes.length).padStart(2,'0')}</i>`;$('#previousButton').disabled=progress<.001;$('#nextButton').disabled=progress>LAST-.001;}

const fx=$('#effectsCanvas'),ctx=fx.getContext('2d',{alpha:true}),water=$('#waterCanvas'),wctx=water.getContext('2d',{alpha:true});
const depthRenderer=createDepthWorld($('#depthWorld'));
const wakeCanvas=$('#shipWakeCanvas'),wakeCtx=wakeCanvas.getContext('2d',{alpha:true});
const archImage=$('.icearch-wrap .animal-image'),archIndex=scenes.findIndex(s=>s.animal==='icearch');
const archWrap=archImage.parentElement;
const penguinWater=createPenguinWater($('.penguins-wrap'));
const floeContacts=createFloeContacts(['weddell','leopard','cormorant'].map(kind=>({image:$('.'+kind+'-wrap>.animal-image'),index:scenes.findIndex(s=>s.animal===kind)})));
const shipApproach=$('#shipApproach'),shipElement=$('#landingShip'),shipImage=$('img',shipElement);
let shipPose=null;
let archContacts=[],archContactFraction=1;
archWrap.insertAdjacentHTML('beforeend',`<div class="arch-contact-reflection" aria-hidden="true"><img src="${archImage.getAttribute('src')}" alt="" class="arch-reflected-image"></div>`);
archImage.addEventListener('load',positionArchContact);
const snow=createSnow(),middleSnow=$('#middleSnow'),mctx=middleSnow.getContext('2d');
const shoreRenderer=createShoreRenderer($('#shoreCanvas'));
let middleFlakes=[];
let flakes=[],droplets=[],surfaceBursts=[],dpr=1,depthAmount=0;
let viewportKey='';
function resize(){const key=[innerWidth,innerHeight,devicePixelRatio].join(':');if(key===viewportKey)return;viewportKey=key;width=innerWidth;height=innerHeight;paintBudget.reset(width<=700);dpr=Math.min(devicePixelRatio||1,width<=700?1.35:1.75);[fx,water,wakeCanvas,middleSnow].forEach(c=>{c.width=Math.round(width*dpr);c.height=Math.round(height*dpr);});ctx.setTransform(dpr,0,0,dpr,0,0);wctx.setTransform(dpr,0,0,dpr,0,0);wakeCtx.setTransform(dpr,0,0,dpr,0,0);mctx.setTransform(dpr,0,0,dpr,0,0);flakes=Array.from({length:width<700?37:115},()=>({x:Math.random()*width,y:Math.random()*height,r:(.5+Math.random()*2.0)*(width>700?1.8:1),z:.3+Math.random()*.9,phase:Math.random()*7}));middleFlakes=flakes.slice(0,width<=700?26:76).map((f,i)=>({...f,x:(i*137.7)%width,y:(i*83.1)%height}));positionBreachLayers();positionArchContact();depthRenderer.paint(progress,elapsed,width,height,dpr);}
resize();let viewportTimer;const scheduleViewport=()=>{clearTimeout(viewportTimer);viewportTimer=setTimeout(()=>{resize();positionIntroMask();},140);};addEventListener('resize',scheduleViewport);window.visualViewport?.addEventListener('resize',scheduleViewport);for(const c of [fx,water,wakeCanvas,middleSnow])c.addEventListener('contextrestored',()=>{viewportKey='';depthRenderer.reset();shoreRenderer.reset();resize();});
function splashAt(x,y,power=1,kind='breach'){
  if(reduced||paused)return;
  soundscape.splash(power);
  const bird=kind==='bird',count=bird?(width<700?30:42):(width<700?22:32);
  const travel=sceneTravel(progress,width);
  if(bird)surfaceBursts.push({x,y,travel,age:0,life:.75,width:width<700?35:72});
  for(let i=0;i<count;i++)droplets.push({x:x+(Math.random()-.5)*(bird?12:42),y:y+Math.random()*3,vx:(Math.random()-.5)*(bird?90:70)*power,vy:-((bird?50:24)+Math.random()*(bird?100:60))*power,r:bird?.6+Math.random()*1.1:.3+Math.random()*1.1,age:0,life:bird?.65+Math.random()*.45:.4+Math.random()*.4,travel});
  if(droplets.length>130)droplets=droplets.slice(-130);
}
$('#snowToggle').addEventListener('click',()=>{snowOn=!snowOn;$('#snowToggle').setAttribute('aria-pressed',snowOn);$('#snowToggle').setAttribute('aria-label',snowOn?ui.snowOff:ui.snowOn);$('#snowToggle').title=snowOn?ui.snowOff:ui.snowOn;});
$('#motionToggle').addEventListener('click',()=>{paused=!paused;document.body.classList.toggle('motion-paused',paused);$('#motionToggle').setAttribute('aria-pressed',paused);$('#motionToggle').setAttribute('aria-label',paused?ui.resume:ui.pause);$('#motionIcon').classList.toggle('is-play',paused);soundscape.suspend(paused||document.hidden);});
reducedQuery.addEventListener('change',e=>{reduced=e.matches;document.body.classList.toggle('reduced-motion',reduced);});
function drawBird(x,y,size,phase,opacity){ctx.save();ctx.translate(x,y);ctx.strokeStyle=`rgba(249,254,255,${opacity})`;ctx.lineWidth=size*.1;ctx.lineCap='round';const flap=Math.sin(phase)*size*.4;ctx.beginPath();ctx.moveTo(-size,flap);ctx.quadraticCurveTo(-size*.4,-size*.15,0,0);ctx.quadraticCurveTo(size*.4,-size*.15,size,flap);ctx.stroke();ctx.restore();}
function paint(dt){
 ctx.clearRect(0,0,width,height);
 const travel=sceneTravel(progress,width),depth=depthPose(progress);depthAmount=depth.amount;
 depthRenderer.paint(progress,elapsed,width,height,dpr);
 mctx.clearRect(0,0,width,height);
 if(!reduced&&snowOn){
  for(const list of [flakes,middleFlakes])for(const f of list)if(!paused){f.y+=dt*(5+f.z*11);f.x+=dt*(1+f.z*2);if(f.y>height+12)f.y=-12;}
  snow.paint(ctx,flakes,travel,width,height,progress,elapsed,depth.amount,'near');
  snow.paint(mctx,middleFlakes,travel,width,height,progress,elapsed,depth.amount,'middle');
 }
 shoreRenderer.paint(progress,width,height,dpr,finalOffset);
 if(depth.amount>.01){
  ctx.save();ctx.globalAlpha=depth.amount;
  ctx.beginPath();ctx.moveTo(0,height);for(let x=0;x<=width+16;x+=16)ctx.lineTo(x,surfaceY(x,width,height,progress,elapsed));ctx.lineTo(width,height);ctx.closePath();ctx.clip();
  for(let i=0;i<58;i++){const z=.25+(i%5)*.15,x=snowScreenX(i*137.7,travel,.1,width),y=((i*83.1+elapsed*(3+z*7))%(height+30))-15;ctx.fillStyle=`rgba(175,230,232,${.1+z*.18})`;ctx.beginPath();ctx.arc(x,y,.45+z,0,Math.PI*2);ctx.fill();}
  ctx.restore();
 }
 drawSurfaceBoundary(depth);
 if(progress<.9){penguinWater.resize();penguinWater.paint(elapsed,reduced);}
 livingOcean.paint(elapsed,progress,reduced);
 floeContacts.paint(progress,elapsed,reduced);
 drawBreachFoam();
 drawArchWaterlap();
 pugh.paint(progress,width,reduced,elapsed,foamTextures.whale,splashAt,started&&!paused&&!reduced,width>700?scrollArrivalPhase('swimmer',progress):undefined);
 for(let i=surfaceBursts.length-1;i>=0;i--){
  const b=surfaceBursts[i];if(!paused)b.age+=dt;
  if(b.age>b.life){surfaceBursts.splice(i,1);continue;}
  const photo=foamTextures.whale;if(!photo)continue;
  const w=b.width*(1+b.age*.3),h=w*photo.height/photo.width;
  ctx.save();ctx.globalAlpha=(1-b.age/b.life)*.8;
  ctx.drawImage(photo,b.x-(travel-b.travel)-w/2,b.y-h*.56,w,h);ctx.restore();
 }
 for(let i=droplets.length-1;i>=0;i--){const p=droplets[i];if(!paused){p.age+=dt;p.x+=p.vx*dt;p.y+=p.vy*dt;p.vy+=280*dt;p.vx*=Math.pow(.7,dt);}if(p.age>p.life){droplets.splice(i,1);continue;}ctx.beginPath();ctx.fillStyle=`rgba(235,252,255,${Math.max(0,1-p.age/p.life)*.65})`;ctx.ellipse(p.x-(travel-p.travel),p.y,p.r*.7,p.r*(1+Math.min(1,Math.abs(p.vy)/170)),0,0,Math.PI*2);ctx.fill();}
 drawShipWake();
 wctx.clearRect(0,0,width,height);if(!reduced){for(let j=0;j<17;j++){const y=height*(.68+j*.019);wctx.beginPath();wctx.strokeStyle=`rgba(191,227,242,${(.06+j*.008)*(1-depth.amount)})`;wctx.lineWidth=.5;for(let x=0;x<=width;x+=18){const yy=y+Math.sin(x*.012+elapsed*.6+j*1.4)*(1+j*.2);if(x===0)wctx.moveTo(x,yy);else wctx.lineTo(x,yy);}wctx.stroke();}}
 soundscape.tick(dt,elapsed);
}
function drawSurfaceBoundary(depth){
 if(depth.amount<=.001||depth.amount>=.999)return;
 const points=surfaceBoundary(width,height,progress,elapsed);
 const band=width<700?14:20,center=depth.surface*height;
 ctx.save();
 const lens=ctx.createLinearGradient(0,center-8,0,center+band*2);
 lens.addColorStop(0,'#badce100');lens.addColorStop(.24,'#aacbd930');lens.addColorStop(.4,'#102f4348');lens.addColorStop(1,'#0b3a5000');
 ctx.fillStyle=lens;ctx.beginPath();
 for(const [x,y] of points) x===0?ctx.moveTo(x,y-8):ctx.lineTo(x,y-8);
 for(const [x,y] of [...points].reverse())ctx.lineTo(x,y+band*2);
 ctx.closePath();ctx.fill();ctx.restore();
 // Broken glints and a refracted dark underside, not a rigid luminous rule.
 for(let line=0;line<2;line++){
  ctx.beginPath();for(const [x,y] of points){const yy=y+line*2+Math.sin(x*.04+elapsed)*.8;x===0?ctx.moveTo(x,yy):ctx.lineTo(x,yy);}
  ctx.lineWidth=line?2.3:1;ctx.strokeStyle=line?'#061f3940':'#b2d8dc59';ctx.stroke();
 }
}

// The wake follows the measured hull, from the small vessel in the opening
// to its final berth. There is no independent scale or opacity entrance.
function drawShipWake(){
 wakeCtx.clearRect(0,0,width,height);
 const p=shipPose;
 if(!started||!p?.visible||!shipImage.complete||!shipImage.naturalWidth)return;
 const strength=1-.72*p.arrival;
 const rim=Array.from({length:71},(_,i)=>shipContactAt(p,.03+.86*i/70));
 paintFoamEdge(wakeCtx,rim,reduced?0:elapsed,.65);
 // Local reflection strips follow the perspective waterline, never a shadow oval.
 for(let i=0;i<14;i++){
  const u=.03+i*.86/14,next=u+.86/14,c=shipContactAt(p,(u+next)*.5);
  wakeCtx.save();wakeCtx.beginPath();wakeCtx.rect(p.x+p.width*u,c.y,p.width*(next-u)+.5,25);wakeCtx.clip();
  paintContactReflection(wakeCtx,shipImage,{left:p.x,top:p.y,width:p.width,height:p.height},c.y,.20,elapsed);
  wakeCtx.restore();
 }
 for(let band=0;band<3;band++){
  wakeCtx.beginPath();wakeCtx.lineWidth=Math.max(.55,Math.min(1.5,p.width*.0012))*(band? .6:1);
  wakeCtx.strokeStyle=`rgba(227,245,248,${(.32-band*.075)*(.55+.45*strength)})`;
  for(let i=0;i<=70;i++){
   const u=.03+.86*i/70,c=shipContactAt(p,u);
   const x=c.x,y=c.y+band*p.width*.002+Math.sin(u*63-elapsed*.8+band)*Math.min(1.1,p.width*.001);
   i?wakeCtx.lineTo(x,y):wakeCtx.moveTo(x,y);
  }
  wakeCtx.stroke();
 }
 // Fine broken foam trails away from the stern and settles as the ship moors.
 const stern=shipContactAt(p,.05);
 for(let i=0;i<100;i++){
  const t=i/100,noise=(Math.sin(i*127.1)*43758.5453)%1;
  const u=.89-.84*t,c=shipContactAt(p,u);
  const drift=(elapsed*.025+i*.618)%1;
  wakeCtx.fillStyle=`rgba(236,251,252,${(.18+Math.abs(noise)*.3)*strength})`;
  wakeCtx.beginPath();wakeCtx.ellipse(c.x-p.width*.018*drift,c.y+p.width*.006*drift,
   Math.max(.35,Math.min(1.7,p.width*.0013))*(.5+Math.abs(noise)),.4,0,0,Math.PI*2);wakeCtx.fill();
 }
 if(strength>.3){
  for(let j=0;j<3;j++){
   wakeCtx.beginPath();wakeCtx.strokeStyle=`rgba(203,233,240,${strength*(.13-j*.025)})`;wakeCtx.lineWidth=.7;
   for(let k=0;k<=28;k++){
    const t=k/28,x=stern.x-p.width*.22*t,y=stern.y+p.width*(.014+j*.008)*t+Math.sin(t*28+elapsed*.4)*.6;
    k?wakeCtx.lineTo(x,y):wakeCtx.moveTo(x,y);
   }wakeCtx.stroke();
  }
 }
}
const breachLayers=[1,2].map(index=>({index,kind:scenes[index].animal,window:$('.breach-window',sceneEls[index]),orbit:$('.breach-orbit',sceneEls[index]),previousPhase:0,spray:[]}));
const silhouette=document.createElement('canvas');silhouette.width=silhouette.height=256;
const sctx=silhouette.getContext('2d',{willReadFrequently:true});
const foamTextures={};
const orcaStaticSpray=new Image();orcaStaticSpray.src=ASSET+'orca-static-spray-v43.webp';
for(const kind of ['orca','whale','spray']){
 const photo=new Image();photo.src=ASSET+(kind==='spray'?'breach-spray-v16.webp':kind==='orca'?'orca-water-2.webp':'whale-water.webp');
 photo.onload=()=>{
  const canvas=document.createElement('canvas');canvas.width=photo.naturalWidth;canvas.height=photo.naturalHeight;
  const c=canvas.getContext('2d',{willReadFrequently:true});c.drawImage(photo,0,0);
  const frame=c.getImageData(0,0,canvas.width,canvas.height),d=frame.data;
  // Only foam remains. The blue water in the old cutout must never recolour the sea.
  for(let i=0;i<d.length;i+=4){const light=Math.min(d[i],d[i+1],d[i+2])/255;d[i+3]*=smooth((light-(kind==='spray'?.63:.57))/(kind==='spray'?.27:.30));d[i]=222;d[i+1]=239;d[i+2]=243;}
  c.putImageData(frame,0,0);foamTextures[kind]=canvas;
 };
}
function breachContact(layer,pose,angle){
 const image=layer.orbit.querySelector('img'),box=layer.window.getBoundingClientRect();
 if(image.complete&&image.naturalWidth&&Math.abs((layer.contactAngle??999)-angle)>.15){
  const size=256,art=breachArtGeometry(layer.kind,pose);
  const ox=art.pivotX*size,oy=art.pivotY*size;
  sctx.clearRect(0,0,size,size);sctx.save();sctx.translate(ox,oy);sctx.rotate(angle*Math.PI/180);sctx.translate(-ox,-oy);sctx.drawImage(image,art.left*size,art.top*size,art.width*size,art.height*size);sctx.restore();
  const data=sctx.getImageData(0,Math.floor(pose.waterline*size)-2,size,1).data;
  // Alpha-weighted contact does not jump between the body and a flipper when
  // the longest opaque interval changes by a single raster sample.
  let weight=0,moment=0;
  for(let x=0;x<size;x++){const a=data[x*4+3]/255;weight+=a;moment+=x*a;}
  if(weight>1){
   let sum=0,left=0,right=size-1,found=false;
   for(let x=0;x<size;x++){
    sum+=data[x*4+3]/255;
    if(!found&&sum>=weight*.05){left=x;found=true;}
    if(sum>=weight*.95){right=x;break;}
   }
   layer.contact={x:moment/weight/size,width:Math.max(1,right-left)/size};
  }
  if(!layer.reflection){layer.reflection=document.createElement('canvas');layer.reflection.width=layer.reflection.height=size;}
  const reflection=layer.reflection.getContext('2d');reflection.clearRect(0,0,size,size);reflection.drawImage(silhouette,0,0);
  layer.contactAngle=angle;
 }
 const c=layer.contact||{x:layer.kind==='orca'?.5:.35,width:.2};
 return {x:box.left+box.width*c.x,y:box.top+box.height*pose.waterline,width:box.width*c.width};
}
function drawBreachFoam(){
 if(!started||depthAmount>.5)return;
 for(const layer of breachLayers){
  const pose=currentBreachPose(layer.kind),photo=foamTextures.spray||foamTextures[layer.kind];
  if(!photo||pose.phase<.15||Math.abs(progress-layer.index)>1)continue;
  const screenContact=breachContact(layer,pose,reduced?breachPose(layer.kind,layer.index).angle:pose.angle);
  const screenBox=layer.window.getBoundingClientRect();
  const {box,contact:c}=surfaceContactSpace(screenBox,screenContact,cameraScale);
  // Foam grain belongs to the animal's local water plane. Scaling that plane
  // must not regenerate a new screen-pixel pattern at every zoom step.
  ctx.save();ctx.translate(screenBox.left,screenBox.top);ctx.scale(cameraScale,cameraScale);
  const visible=1-smooth((Math.abs(progress-layer.index)-.55)/.4);
  if(layer.reflection){
   paintContactReflection(ctx,layer.reflection,box,c.y,.105*(1-depthAmount)*visible*smooth((pose.phase-.2)/.5),elapsed);
  }
  if(layer.kind==='whale'){
   ctx.save();ctx.globalAlpha=visible*(1-depthAmount);
   paintBreachRim(ctx,photo,layer.kind,c,width,box.width,pose.phase);
   const count=Math.max(10,Math.ceil(c.width/4));
   const rim=Array.from({length:count},(_,i)=>({x:c.x-c.width*.5+c.width*i/(count-1),y:c.y}));
   paintFoamEdge(ctx,rim,reduced?0:elapsed,.48);ctx.restore();ctx.restore();continue;
  }
  if(orcaStaticSpray.complete&&orcaStaticSpray.naturalWidth&&layer.contact){
   const spray=staticSprayGeometry(c,box.width,width,pose.phase);
   ctx.save();ctx.beginPath();ctx.rect(-screenBox.left/cameraScale,spray.clipTop,width/cameraScale,spray.clipBottom-spray.clipTop);ctx.clip();
   ctx.drawImage(orcaStaticSpray,spray.x,spray.y,spray.width,spray.height);ctx.restore();
  }
  paintBreachRim(ctx,photo,layer.kind,c,width,box.width,pose.phase);
  const rim=Array.from({length:Math.max(10,Math.ceil(c.width/3))},(_,i)=>({x:c.x-c.width*.6+c.width*1.2*i/Math.max(9,Math.ceil(c.width/3)-1),y:c.y+.4}));
  paintFoamEdge(ctx,rim,reduced?0:elapsed,.8);
  ctx.restore();
 }
}
function positionArchContact(){
 if(!archImage.complete||!archImage.naturalWidth)return;
 const r=archImage.getBoundingClientRect(),localHeight=archImage.offsetHeight;
 if(!r.height||!localHeight)return;
 // One near-water plane, just before the original foreground occlusion.
 const cut=clamp((height*.875-r.top)*localHeight/r.height,0,localHeight);
 archContactFraction=cut/localHeight;
 archWrap.style.setProperty('--arch-contact',`${cut}px`);
 const sample=document.createElement('canvas');sample.width=512;sample.height=1;
 const s=sample.getContext('2d',{willReadFrequently:true});
 const row=clamp(Math.round(archContactFraction*archImage.naturalHeight),0,archImage.naturalHeight-1);
 s.drawImage(archImage,0,row,archImage.naturalWidth,1,0,0,512,1);
 const pixels=s.getImageData(0,0,512,1).data;archContacts=[];let start=-1;
 for(let x=0;x<=512;x++){
  if(x<512&&pixels[x*4+3]>110){if(start<0)start=x;}
  else if(start>=0){if(x-start>8)archContacts.push([start/512,x/512]);start=-1;}
 }
}
function drawArchWaterlap(){
 const photo=foamTextures.whale,distance=Math.abs(progress-archIndex);
 if(!started||distance>.95||!photo||!archContacts.length)return;
 const r=archImage.getBoundingClientRect(),localWidth=r.width/cameraScale,y=r.height/cameraScale*archContactFraction;
 const alpha=encounterOpacity('icearch',Math.abs(sceneTravel(archIndex,width)-sceneTravel(progress,width))/sceneStride(width),depthAmount,false);
 ctx.save();ctx.translate(r.left,r.top);ctx.scale(cameraScale,cameraScale);
 for(const [a,b] of archContacts){
  const x=localWidth*a,w=localWidth*(b-a);
  if(r.left+r.width*a>width||r.left+r.width*b<0)continue;
  // Use the dense lower foam of the photo, not its mostly empty upper spray.
  // Broken shallow washes sit on the sea at each solid arch column.
  for(let i=0;i<3;i++){
   const shift=i*w*.3,bandWidth=w*(i===1?.42:.37);
   ctx.globalAlpha=alpha*(i===1?.58:.68);
   ctx.drawImage(photo,0,photo.height*.64,photo.width,photo.height*.36,x+shift-4,y-2.5+(i%2)*.8,bandWidth+8,7);
  }
  ctx.globalAlpha=alpha;
  const points=Array.from({length:Math.max(3,Math.ceil(w/3))},(_,i)=>({x:x+w*i/Math.max(2,Math.ceil(w/3)-1),y:y+Math.sin(i*.71)*.25}));
  paintFoamEdge(ctx,points,reduced?0:elapsed,1.18);
 }
 ctx.restore();
}
function positionBreachLayers(){
  for(const kind of ['orca','whale']){
    const wrap=$('.'+kind+'-wrap');
    wrap.style.top=`${height*(kind==='orca'&&width<=700?.89:.87)-wrap.offsetWidth*breachPose(kind,0).waterline}px`;
    wrap.style.bottom='auto';
  }
}
function positionIntroMask(){
  const animal=$('.penguins-wrap',sceneEls[0]);
  const m=introMaskGeometry(width,height,animal.offsetLeft+animal.offsetWidth*.5);
  const size=`${m.imageWidth}px ${m.imageHeight}px`,position=`${m.x}px ${m.y}px`;
  const mask=$('#introMask');mask.style.maskSize=`100% 100%,${size},${size}`;mask.style.maskPosition=`0px 0px,${position},${position}`;mask.style.transformOrigin=`${m.centerX}px ${m.centerY}px`;
}
function updateSceneMotion(){
  for(const layer of breachLayers){
    const pose=currentBreachPose(layer.kind);
    const angle=reduced?breachPose(layer.kind,layer.index).angle:pose.angle;
    const art=breachArtGeometry(layer.kind,pose);
    layer.orbit.style.left=`${art.left*100}%`;layer.orbit.style.top=`${art.top*100}%`;
    layer.orbit.style.width=`${art.width*100}%`;layer.orbit.style.height=`${art.height*100}%`;
    layer.orbit.style.transformOrigin=`${(art.pivotX-art.left)/art.width*100}% ${(art.pivotY-art.top)/art.height*100}%`;
    layer.orbit.style.transform=`rotate(${angle}deg)`;
    layer.window.dataset.phase=pose.phase.toFixed(4);
    layer.window.style.setProperty('--waterline',`${pose.waterline*100}%`);
    if(pose.phase<.1||pose.phase<layer.previousPhase-.15)layer.spray=[];
    if(started&&!paused&&!reduced&&pose.phase>layer.previousPhase){
      const thresholds=sprayThresholds(layer.kind);
      for(const [i,threshold] of thresholds.entries())if(layer.previousPhase<threshold&&pose.phase>=threshold){
        if(i===2)soundscape.splash(layer.kind==='whale'?.32:.24);
      }
      if(layer.spray.length>14)layer.spray=layer.spray.slice(-14);
    }
    layer.previousPhase=pose.phase;
  }
  const p=landingPose(progress-SHIP+6,width,width<=700),landing=$('#landingLayer');
  landing.style.opacity='1';landing.style.visibility=progress>8.5?'visible':'hidden';
  landing.dataset.docked=String(p.docked);
  stationLights.paint(progress-SHIP);
  shipPose=shipApproachPose(progress,width,height,archLayoutBox(archImage.getBoundingClientRect(),cameraScale),shipImage.naturalWidth?shipImage.naturalHeight/shipImage.naturalWidth:.5);
  shipApproach.style.visibility=started&&shipPose.visible?'visible':'hidden';
  shipElement.style.width=`${shipPose.width}px`;
  shipElement.style.transform=`translate3d(${shipPose.x}px,${shipPose.y}px,0)`;
  $('#coastTerrain').style.transform=`translate3d(${p.shoreX}px,0,0)`;
  $('#landingStation').style.transform=`translate3d(${p.stationX}px,0,0)`;
  $('#landingStation').style.width=`${p.stationWidth}px`;
  $('#landingDock').style.transform=`translate3d(${p.dockX}px,0,0)`;
  landing.style.setProperty('--wake-opacity',1-smooth(progress-SHIP+.2));
  landing.style.setProperty('--coast-shade',smooth(progress-SHIP));
}
function updateEnvironment(dt){
 const p=depthPose(progress),dusk=smooth((progress-(SHIP+.25))/1.75)*.8;
 const held=gesture&&!gesture.card?holdAmount((performance.now()-gesture.began)/1000,gesture.moved,reduced):0;
 zoomAmount+=(held-zoomAmount)*(1-Math.exp(-dt*(held>zoomAmount?13:19)));
 cameraScale=Number((1+zoomAmount*.15).toFixed(4));
 document.documentElement.style.setProperty('--zoom',cameraScale);
 document.documentElement.style.setProperty('--dusk',dusk.toFixed(4));
 document.documentElement.style.setProperty('--depth',p.amount.toFixed(4));
 document.body.classList.toggle('camera-close',zoomAmount>.2);
 document.body.classList.toggle('underwater',p.amount>.65);
 document.body.classList.toggle('evening',dusk>.25);
 const boundary=p.amount>0&&p.amount<1?surfaceBoundary(width,height,progress,elapsed):null;
 const boundaryBox=boundary?$('#depthWorld').getBoundingClientRect():null;
 for(const water of [$('#foregroundWater'),$('#nearWaterBackdrop')]){
  water.style.opacity='1';water.style.display=surfaceForegroundOpacity(p.amount)?'':'none';water.style.visibility=surfaceForegroundOpacity(p.amount)?'visible':'hidden';
  if(p.amount>0&&p.amount<1){
   const r=water.getBoundingClientRect();
   water.style.clipPath=surfaceClipPolygon(boundary,boundaryBox,width,height,r,water.offsetWidth,water.offsetHeight);
  }else water.style.clipPath='none';
 }

 document.body.classList.toggle('approaching-land',progress>SHIP-.85);
 for(const [i,el] of sceneEls.entries()){
  const a=$('.animal-wrap',el);if(!a)continue;
  const distance=Math.abs(sceneTravel(i,width)-sceneTravel(progress,width))/sceneStride(width);
  a.style.opacity=encounterOpacity(scenes[i].animal,distance,p.amount,scenes[i].underwater);
  const x=sceneTravel(i,width)-sceneTravel(progress,width);
  el.style.visibility=Math.abs(x)<width*1.8?'visible':'hidden';
  if(p.amount>0&&p.amount<1&&Math.abs(i-progress)<1.4){
   const r=a.getBoundingClientRect();
   a.style.clipPath=surfaceClipPolygon(boundary,boundaryBox,width,height,r,a.offsetWidth,a.offsetHeight,scenes[i].underwater);
  }else a.style.clipPath='none';
 }
 // Keep the station in the distance while the final researchers enter foreground.
 const finalApproach=smooth(progress-(SHIP+1));

 document.body.classList.toggle('on-land',progress>=SHIP+.92);
 $('#landingStation').style.scale=1-finalApproach*.22;
 $('#landingStation').style.transformOrigin='50% 100%';
 albatross.paint(progress,elapsed,width,height,reduced,started||opening);
 passages.paint(progress,elapsed,width,height,started||opening);
 wildlifeLabels.paint(progress,width,height,started||opening);
 if(width>700){
  for(const item of arrivalScenes){
   const threshold=item.kind==='orca'?.66:item.kind==='whale'?.32:.22;
   if(scrollArrivalPhase(item.kind,progress)<threshold)$('.species-label',sceneEls[item.index]).style.visibility='hidden';
  }
 }
 soundscape.setScene(progress>.36&&progress<.64?'tourists':progress>1.2&&progress<1.8?'albatross':progress>3.22&&progress<3.78?'jellyfish':progress>4.22&&progress<4.78?'tern':scenes[chapter].animal==='leopard'?'elephant':scenes[chapter].animal,p.amount);
}
function animate(time){
 const frameSeconds=Math.max(0,(time-lastTime)/1000),dt=Math.min(.045,frameSeconds);lastTime=time;
 if(!paused&&!reduced&&!document.hidden)elapsed+=dt;
 if(!gesture&&started&&!$('dialog[open]')&&Math.abs(scrollVelocity)>8){
  advanceInput(scrollVelocity*dt);scrollVelocity*=Math.exp(-dt*5.5);
  if(target===0||(target===LAST&&finalTarget>=finalLimit))scrollVelocity=0;
 }
 progress=easedCamera(progress,target,dt,reduced,!!gesture);
 if(Math.abs(target-progress)<.0001)progress=target;
 const finalGoal=width<=700&&progress>=LAST-.0001?finalTarget:0;
 finalOffset=reduced?finalGoal:lerp(finalOffset,finalGoal,1-Math.exp(-dt*(gesture?20:14)));
 if(Math.abs(finalOffset-finalGoal)<.05)finalOffset=finalGoal;
 document.documentElement.style.setProperty('--final-scroll',finalOffset.toFixed(3));
 const clipped=width<=700?clamp(finalButtonTop-finalOffset+finalButtonHeight-finalFooterTop,0,finalButtonHeight):0;
 finalShare.style.clipPath=`inset(0 0 ${clipped}px 0)`;
 finalShare.style.visibility=width>700||progress>=LAST-.0001?'visible':'hidden';
 const travel=sceneTravel(progress,width);track.style.transform=`translateX(${-travel}px)`;
 $('#sky').style.backgroundPositionX=`${-travel*.11}px`;
 const panoramaHeight=height*(width<=700?.6:1),iceRange=Math.max(0,8520/1080*panoramaHeight-width);
 const distantRange=Math.max(0,8520/1080*height*(width<=700?.3:.42)-width*1.2);
 $('#distantIce').style.backgroundPositionX=`${-progress/LAST*distantRange}px`;
 $('#icebergs').style.backgroundPositionX=`${-progress/LAST*iceRange}px`;
 positionOcean(travel);$('#progressBar').style.width=`${progress/LAST*100}%`;const seek=travel/sceneTravel(LAST,width);$('#journeyScrubber').style.setProperty('--seek',`${seek*100}%`);if(!seekDragging)$('#journeyScrubber').value=seek*1000;$('#journeyScrubber').setAttribute('aria-valuetext',text('chapterCount',{number:chapter+1,total:scenes.length}));
 // During a plunge the opaque canvas and every CSS mask share this RAF's
 // progress/time and the exact same sampled edge. The normal paint budget
 // remains in effect for the fully submerged, stable background.
 const frameDepth=depthPose(progress).amount;
 if(frameDepth>0&&frameDepth<1)depthRenderer.paint(progress,elapsed,width,height,dpr);
 // Camera close-up follows wall time even if scene drawing drops frames.
 // Physics still uses the conservative timestep above.
 const previousScale=cameraScale;
 updateChapter();updateSceneMotion();updateEnvironment(Math.min(.3,frameSeconds));
 const moving=!!gesture?.moved||Math.abs(target-progress)>.0001||Math.abs(finalOffset-finalGoal)>.05||Math.abs(scrollVelocity)>8;
 // Surface foam/reflections use the freshly scaled DOM bounds. Redraw them,
 // and the snow, in this same RAF instead of holding a previous 30/45Hz frame.
 // The stable underwater renderer and the resting budget stay unchanged.
 const syncSurfaceZoom=frameDepth<.999&&cameraScale!==previousScale;
 const rate=frameDepth>0&&frameDepth<1?60:paintBudget.rate(moving),deadline=paintDeadline(lastPaint,time,rate,syncSurfaceZoom);
 if(deadline!==null){
  const began=performance.now();paint(Math.min(.06,(time-lastPaintAt)/1000));
  lastPaint=deadline;lastPaintAt=time;paintBudget.sample(performance.now()-began);
 }
 frameId=requestAnimationFrame(animate);
}
updateChapter(true);positionIntroMask();frameId=requestAnimationFrame(animate);
document.addEventListener('visibilitychange',()=>{lastTime=performance.now();lastPaint=lastPaintAt=lastTime;soundscape.suspend(document.hidden||paused);});
$('#soundToggle').addEventListener('click',async()=>{try{const enabled=await soundscape.setEnabled(!soundscape.enabled);soundscape.suspend(paused||document.hidden);$('#soundToggle').setAttribute('aria-pressed',enabled);$('#soundToggle').setAttribute('aria-label',enabled?ui.soundOff:ui.soundOn);$('#soundToggle').title=enabled?ui.soundOff:ui.soundOn;}catch{toast('soundUnavailable');}});
let toastTimer,toastKey='';
function toast(key){toastKey=key;$('#toast').textContent=ui[key];$('#toast').classList.add('visible');clearTimeout(toastTimer);toastTimer=setTimeout(()=>$('#toast').classList.remove('visible'),3500);}
$('#shareButton').addEventListener('click',async()=>{const data={title:ui.pageTitle,text:ui.shareText,url:languageURL(language,location.origin+location.pathname)};try{if(navigator.share){await navigator.share(data);return;}if(navigator.clipboard&&isSecureContext){await navigator.clipboard.writeText(data.url);toast('shareCopied');return;}openModal('about',$('#shareButton'));}catch(e){if(e.name!=='AbortError')toast('shareError');}});

addEventListener('pageshow',()=>{depthRenderer.reset();shoreRenderer.reset();resize();});

function localizeJourney(){
 applyStaticLanguage();
 for(let i=0;i<scenes.length;i++){
  const data=scenes[i],scene=sceneEls[i],card=$('.story-card',scene);
  if(card){
   $('.card-eyebrow',card).textContent=`${String(i+1).padStart(2,'0')} / ${data.eyebrow.replace(/^\d+ \/ /,'')}`;
   $('h2',card).innerHTML=data.title;
   $$('.card-full',card).forEach((p,n)=>p.textContent=n?data.text2:data.text);
   $('.card-mobile',card).textContent=data.mobileText;$('.card-fact',card).textContent=data.fact;
   $('.card-link',card).innerHTML=data.cta+arrow;
  }
  const image=$('.animal-wrap .animal-image',scene);if(image)image.alt=data.animal==='swimmer'?ui.swimmerAlt:data.subject;
  const label=$('.animal-wrap .species-label',scene);if(label){label.setAttribute('aria-label',text('infoLabel',{subject:data.subject}));$('.species-name',label).textContent=data.subject;}
  $('.scene-note',scene).textContent=data.note;
  const dot=$(`#chapterNav [data-chapter="${i}"]`);dot.dataset.label=data.name;dot.setAttribute('aria-label',text('chapterLabel',{number:i+1,name:data.name}));
  $(`#routeList [data-chapter="${i}"] .route-item-name`).innerHTML=`${data.name}<small>${data.subject}</small>`;
 }
 elephantChapter.setAttribute('aria-label',ui.elephant);shipChapter.setAttribute('aria-label',ui.expedition);
 const shipHint=$('.ship-info');shipHint.setAttribute('aria-label',text('infoLabel',{subject:ui.researchShip}));$('.species-name',shipHint).textContent=ui.researchShip;
 const leopardHint=$('.leopard-hint');leopardHint.setAttribute('aria-label',text('infoLabel',{subject:scenes[4].subject}));$('.species-name',leopardHint).textContent=scenes[4].subject;
 $('#shareButton .share-label').textContent=ui.share;
 $('#albatrossRoute .route-item-name').innerHTML=`${ui.albatrossRoute}<small>${ui.albatrossRouteDetail}</small>`;
 passages.localize();albatross.localize();positionFinalShare();
 $('#headerCenter').textContent=started||opening?ui.taglineJourney:ui.taglineIntro;
 $('#snowToggle').setAttribute('aria-label',snowOn?ui.snowOff:ui.snowOn);$('#snowToggle').title=snowOn?ui.snowOff:ui.snowOn;
 $('#soundToggle').setAttribute('aria-label',soundscape.enabled?ui.soundOff:ui.soundOn);$('#soundToggle').title=soundscape.enabled?ui.soundOff:ui.soundOn;
 $('#motionToggle').setAttribute('aria-label',paused?ui.resume:ui.pause);
 if(toastKey&&$('#toast').classList.contains('visible'))$('#toast').textContent=ui[toastKey];
 updateChapter(true);
}
$('#languageSwitch').addEventListener('click',()=>{
 const next=language==='ru'?'en':'ru';if(!setLanguage(next))return;
 scenes=language==='en'?englishScenes:russianScenes;modals=language==='en'?englishModals:russianModals;
 history.replaceState(null,'',languageURL(language,location.href));
 localizeJourney();
});
localizeJourney();

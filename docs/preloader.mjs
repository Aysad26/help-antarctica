import {imageAssets,fontAssets} from './asset-manifest.mjs?v=44';

// No fixed-duration escape: the mark remains until every active image has
// finished loading/decoding and the used webfonts are ready. Failed requests
// settle as errors, so a broken URL does not lock the rest of the site forever.
const loader=document.querySelector('#sitePreloader');
if(loader){
 const began=performance.now(),intro=document.querySelector('#intro'),header=document.querySelector('.header');
 const status=loader.querySelector('.preloader-status'),total=imageAssets.length+fontAssets.length;
 const failures=[];let settled=0;
 intro.inert=true;header.inert=true;
 const update=()=>{
  loader.dataset.loaded=String(settled);loader.dataset.total=String(total);
  if(status)status.textContent=`Загрузка ${Math.round(settled/total*100)}%`;
 };
 const track=async(name,load)=>{
  try{await load();}catch{failures.push(name);}
  settled++;update();
 };
 update();performance.mark('antarctica-assets-start');
 await Promise.all([
  ...imageAssets.map(name=>track(name,async()=>{
   const image=new Image();image.src='assets/'+name;await image.decode();
  })),
  ...fontAssets.map(font=>track(font,()=>document.fonts.load(font)))
 ]);
 await document.fonts.ready;
 performance.mark('antarctica-assets-ready');
 performance.measure('antarctica-asset-loading','antarctica-assets-start','antarctica-assets-ready');
 // Let load handlers prepare their canvas textures before removing the cover.
 await new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve)));
 const report={images:imageAssets.length,fonts:fontAssets.length,settled,total,failed:failures,
  assetMs:Math.round(performance.getEntriesByName('antarctica-asset-loading').at(-1).duration),
  loaderMs:Math.round(performance.now()-began),navigationMs:Math.round(performance.now())};
 document.documentElement.dataset.assetLoad=JSON.stringify(report);
 intro.inert=false;header.inert=false;
 loader.classList.add('is-ready');loader.setAttribute('aria-hidden','true');
 document.body.classList.remove('is-loading');
 setTimeout(()=>loader.remove(),400);
}

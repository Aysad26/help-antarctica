export const clamp = (v, min=0, max=1) => Math.max(min, Math.min(max, v));
export const lerp = (a, b, t) => a+(b-a)*t;
export const smooth = t => {t=clamp(t);return t*t*(3-2*t);};

// The pivot lies outside the photographic layer. Scrolling moves the photograph
// around this same circle; elapsed time never determines a breach pose.
export const sceneStride = width => width*(width<=700?2:1);

// Extra travel gives the albatross its own interval; chapter indices stay stable.
export function sceneTravel(progress,width){
 const mobile=width<=700;
 return width*(progress*(mobile?2:1)+(mobile?1:1.6)*clamp(progress-1)+(mobile?1:1.5)*clamp(progress)+(mobile?1:1.8)*clamp(progress-3)+(mobile?1.4:1.8)*clamp(progress-4));
}
export function travelProgress(travel,width){
 let lo=0,hi=12;
 for(let i=0;i<44;i++){const mid=(lo+hi)/2;if(sceneTravel(mid,width)<travel)lo=mid;else hi=mid;}
 return (lo+hi)/2;
}
export function adjacentStop(progress,direction){
 const stops=[0,.5,1,1.5,2,3,3.5,4,4.5,5,6,7,8,9,10,11,12];
 return direction>0?(stops.find(p=>p>progress+.08)??12):([...stops].reverse().find(p=>p<progress-.08)??0);
}
export function shoreGroundX(progress,width){
 // The near bank travels faster than the middle coast. It enters after docking,
 // keeping the pier clear. On desktop it then follows the researchers' camera.
 const inlandTravel=Math.max(0,sceneTravel(progress,width)-sceneTravel(11,width));
 return landingPose(progress-4,width,width<=700).shoreX-width*.48+width*.75*(1-smooth(progress-10))-inlandTravel;
}

export function breachPose(kind, progress, spacing=1,arrivalPhase) {
  const index=kind==='orca'?1:2;
  // On desktop the large orca used to finish most of its arc before entering
  // the frame. Keep it below the water until the approach is actually visible.
  const duration=kind==='orca'&&spacing===1?.18:.82;
  const phase=arrivalPhase===undefined?clamp(((progress-index)*spacing+duration)/duration):clamp(arrivalPhase);
  // Timed desktop rises lose upward speed toward their apex, without a second
  // acceleration in the most visible part of the jump. Scroll poses are kept.
  const rise=arrivalPhase===undefined?smooth(phase):phase*(2-phase);
  return {
    phase,
    waterline:kind==='orca'?.56:.70,
    angle:kind==='orca'?lerp(55,-28,rise):lerp(-60,0,rise),
    pivotX:kind==='orca'?-.32:1.35,
    pivotY:kind==='orca'?1.09:1.10
  };
}

// Alternating photographic tiles meet at the same source edge. Unlike repeat-x,
// this is colour-continuous at every viewport aspect ratio and keeps 1:1 travel.
export function oceanTiles(travel,width,height){
 // The original image's final 3 columns are nearly transparent. Exclude an
 // 8-source-pixel guard band in CSS sampling, without changing the photograph.
 const tileWidth=14392/1080*height*(width<=700?.7:1);
 const first=Math.floor(travel/tileWidth),offset=travel-first*tileWidth;
 return [0,1].map(n=>{
  const index=first+n,left=n*tileWidth-offset,mirrored=index%2!==0;
  return {index,left,width:tileWidth,mirrored,backgroundX:mirrored?width-left-tileWidth:left,
   clipLeft:Math.max(0,left-.6),clipRight:Math.max(0,width-left-tileWidth-.6)};
 });
}

// One spatial composition for the two final chapters. The ship's bow reaches
// the pier before the camera continues inland; its relation to the pier then
// stays fixed while both leave the viewport together.
export function landingPose(progress, viewportWidth, mobile) {
  const arrive=smooth((progress-5.45)/.55);
  const inland=smooth(progress-6);
  const shoreStart=lerp(1.25,.80,arrive);
  const camera=inland*1.02;
  const dockTip=shoreStart-.115;
  const bow=lerp(.57,dockTip+.006,arrive);
  return {
    opacity:1,
    shipX:(bow-(mobile?1.55:.74)-camera)*viewportWidth,
    shoreX:(shoreStart-camera)*viewportWidth,
    stationX:(shoreStart+(mobile?-.04:.08)-camera)*viewportWidth,
    stationWidth:mobile?viewportWidth*2:Math.min(viewportWidth*1.2,1700),
    dockX:(dockTip-camera)*viewportWidth,
    camera,
    docked:progress>=6-.0001
  };
}

// The PNG is an inverse mask from the original site. All three CSS mask layers
// use this same rectangle, including the fully opaque region outside the PNG.
export function introMaskGeometry(width,height,animalCenterX) {
  const mobile=width<=700;
  const holeHeight=height*(mobile?.50:.84);
  const scale=holeHeight/840;
  const imageWidth=1920*scale,imageHeight=1080*scale;
  const centerX=animalCenterX;
  const centerY=height*(mobile?.69:.53);
  return {imageWidth,imageHeight,x:centerX-imageWidth*.697,y:centerY-imageHeight*.472,centerX,centerY};
}

// Wide, shallow photographic spray attached to the measured body-water contact.
export function breachFoamGeometry(kind,contactWidth,viewportWidth,subjectWidth){
 const mobile=viewportWidth<=700,whale=kind==='whale';
 const min=viewportWidth*(mobile?(whale?.88:.72):(whale?.40:.34));
 const width=Math.min(viewportWidth*1.18,Math.max(min,subjectWidth===undefined?contactWidth*(whale?4.7:4.1):subjectWidth*(whale?.80:.70)));
 return {width,height:width*(whale?.135:.12)};
}

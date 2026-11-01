import {clamp,sceneTravel,travelProgress} from './motion.mjs?v=32';

// Continue the same gesture beyond the horizontal endpoint in CSS pixels.
// Reverse travel consumes the vertical tail before leaving the final chapter.
export function advanceFinalScroll(progress,offset,delta,width,limit,last=12){
 const end=sceneTravel(last,width),tail=width<=700?Math.max(0,limit):0;
 const position=clamp(sceneTravel(progress,width)+offset+delta,0,end+tail);
 return {progress:position>=end?last:travelProgress(position,width),offset:Math.max(0,position-end)};
}

export function finalScrollLayout(peopleBottom,buttonHeight,viewportHeight,footerHeight){
 const gap=14,limit=buttonHeight+gap;
 // Initially hidden below the pinned navigation. One button-height scroll
 // reveals it, while keeping it directly below the researchers.
 const top=Math.max(peopleBottom+gap,viewportHeight-footerHeight+gap);
 return {top,limit};
}

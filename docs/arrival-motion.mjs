import {clamp} from './motion.mjs?v=32';
// Poses depend only on the same eased camera position as the panorama.
// A pause in scrolling holds the animal; reversing retraces its arc exactly.
export function scrollArrivalPhase(kind,progress){
 const [start,end]=({orca:[.70,1],whale:[1.74,2],swimmer:[5.55,6]})[kind];
 return clamp((progress-start)/(end-start));
}
export function easedCamera(current,target,dt,reduced=false,dragging=false){
 const next=reduced?target:current+(target-current)*(1-Math.exp(-Math.min(.05,Math.max(0,dt))*(dragging?26:12)));
 return Math.abs(target-next)<.00001?target:next;
}

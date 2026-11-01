import {clamp,smooth,lerp} from './motion.mjs?v=32';
export function depthPose(progress){
 const descent=smooth((progress-2.28)/.72),ascent=smooth((progress-4.62)/.24);
 const amount=descent*(1-ascent);
 return {amount,surface:lerp(1.06,-.12,amount),submerged:amount>.8};
}
// The Weddell encounter arrives by camera travel and physical surface clipping.
// Its animal pixels never crossfade over the iceberg behind it.
export function encounterOpacity(animal,distance,depth,underwater){
 return 1;
}
export function snowScreenX(worldX,travel,depth,width){
 const span=width+100;
 return ((worldX-travel*(1.15+depth*1.05))%span+span)%span-50;
}
export function surfaceY(x,width,height,progress,time){
 const base=depthPose(progress).surface*height;
 const amplitude=(width<700?5:8)*(1+Math.sin(progress*2)*.2);
 return base+Math.sin(x/width*6.2+time*.65)*amplitude+Math.sin(x/width*17.3-time*.38)*amplitude*.3;
}
export function holdAmount(heldSeconds,moved,reduced){return moved||reduced?0:smooth((heldSeconds-.12)/.22);}

// Hands start at one-third of visible head height, then settle after the torso.
export function pughPose(progress,spacing=1,arrivalPhase){
 const approach=arrivalPhase===undefined?(progress-6)*spacing*1.10:lerp(-.72,0,clamp(arrivalPhase));
 const torso=smooth((approach+.72)/.58);
 const near=smooth((approach+.495)/.495);
 const far=smooth((approach+.485)/.485);
 const head=clamp((.698-(.026+.73*(1-torso)))/(.595-.026));
 return {torso,near,far,head};
}

// One shared sampled surface, always finite and inclusive of both screen edges.
export function surfaceBoundary(width,height,progress,time){
 const count=Math.ceil(width/12);
 return Array.from({length:count+1},(_,i)=>{const x=width*i/count;return [x,surfaceY(x,width,height,progress,time)];});
}
export function surfaceForegroundOpacity(depth){return depth>=1?0:1;}

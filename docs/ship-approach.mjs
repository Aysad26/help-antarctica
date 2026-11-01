import {clamp,lerp,smooth,landingPose} from './motion.mjs?v=32';

// The arch has a 55%/80% CSS scale origin. Recover its layout before using it
// as the ship's anchor; the ship's own parent applies the camera zoom once.
export function archLayoutBox(rect,zoom=1){
 const width=rect.width/zoom,height=rect.height/zoom;
 return {left:rect.left+(rect.width-width)*.55,top:rect.top+(rect.height-height)*.8,width,height};
}

// The ship is registered to the opening in the actual, responsive arch image.
// Its path lives in the same world coordinates as the pier, so scrolling back
// retraces the approach and a moored ship cannot slide against the landing.
export function shipApproachPose(progress,width,height,arch,aspect=.5){
 const mobile=width<=700,t=smooth(progress-9);
 const startWidth=Math.min(width*(mobile?.33:.25),arch.width*.24);
 const endWidth=Math.min(width*(mobile?1.20:.68),height*1.4);
 const startX=arch.left+arch.width*(mobile?.38:.55)-startWidth*.5;
 const dock=landingPose(progress-4,width,mobile).dockX;
 const endX=dock+width*.006-endWidth*.98;
 const shipWidth=lerp(startWidth,endWidth,t),shipHeight=shipWidth*aspect;
 const startWater=clamp(arch.top+arch.height*.85,height*.70,height*.81);
 // It is a vessel beyond the arch, not an object passing through its opening.
 // Approach depth and scale advance together while the right pier occludes it.
 const waterY=lerp(startWater,height*.875,t);
 const x=lerp(startX,endX,t);
 return {x,y:waterY-shipHeight*.972,
  width:shipWidth,height:shipHeight,waterY,arrival:t,
  opacity:1,visible:progress>8.3&&progress<11.2};
}

// Measured bottom contour of the generated hull. The gentle slope belongs to
// the three-quarter view; foam and the compressed reflection share this line.
const hull=[[.03,.8895],[.1,.9132],[.2,.9233],[.3,.9346],[.4,.9448],
 [.5,.9538],[.6,.9594],[.7,.9628],[.8,.9673],[.89,.972]];
export function shipContactAt(p,u){
 const q=clamp(u,.03,.89),i=hull.findIndex(([x])=>x>=q);
 const a=hull[Math.max(0,i-1)],b=hull[Math.max(0,i)];
 const y=a===b?a[1]:lerp(a[1],b[1],(q-a[0])/(b[0]-a[0]));
 return {x:p.x+p.width*q,y:p.y+p.height*y};
}

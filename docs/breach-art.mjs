// Register the photographed whale+foam as one sprite. These two landmarks keep
// the old head height and the physical surface unchanged at the jump's apex.
export function breachArtGeometry(kind,pose){
 if(kind!=='whale')return {left:0,top:.3,width:1,height:1,pivotX:pose.pivotX,pivotY:.3+pose.pivotY};
 const head={x:.8138020833,y:.025390625},foamY=.96875,aspect=2/3;
 const target={x:.9*.9066985646,y:.1+.9*.0135566188};
 const height=(pose.waterline-target.y)/(foamY-head.y),width=height/aspect;
 const top=target.y-height*head.y,left=target.x-width*head.x;
 return {left,top,width,height,pivotX:pose.pivotX*.9,pivotY:.1+pose.pivotY*.9};
}

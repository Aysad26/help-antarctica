// Project the opaque water's sampled edge into a transformed DOM layer.
// The canvas and subjects may have different zoom origins and pixel sizes.
export function surfaceClipPolygon(points,canvasBox,canvasWidth,canvasHeight,box,width,height,below=false){
 const sx=canvasBox.width/canvasWidth,sy=canvasBox.height/canvasHeight;
 const edge=points.map(([x,y])=>[(canvasBox.left+x*sx-box.left)*width/box.width,Math.max(0,Math.min(height,(canvasBox.top+y*sy-box.top)*height/box.height))]);
 const side=below?height:0;
 return `polygon(0px ${side}px,${width}px ${side}px,${edge.reverse().map(([x,y])=>`${x}px ${y}px`).join(',')})`;
}

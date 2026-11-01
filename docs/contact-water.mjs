// Reflections use the actual subject pixels and its measured water contact.
// Compression maps that contact back onto itself; clipping keeps every reflected
// pixel below the surface, without a coloured water patch or an ellipse.
export function surfaceContactSpace(box,contact,zoom=1){
 return {box:{left:0,top:0,width:box.width/zoom,height:box.height/zoom},
  contact:{x:(contact.x-box.left)/zoom,y:(contact.y-box.top)/zoom,width:contact.width/zoom}};
}
export function reflectionGeometry(waterY,height,compression=.13){
 return {translateY:waterY*(1+compression),scaleY:-compression,
  top:waterY+.5,depth:Math.min(28,Math.max(8,height*.035))};
}
export function paintContactReflection(ctx,source,box,waterY,opacity,time=0){
 const g=reflectionGeometry(waterY,box.height),bands=7;
 ctx.save();ctx.globalAlpha*=opacity;ctx.filter='blur(.8px)';
 for(let row=0;row<bands;row++){
  const y=g.top+g.depth*row/bands,band=g.depth/bands;
  ctx.save();ctx.beginPath();ctx.rect(box.left-3,y,box.width+6,band-.35);ctx.clip();
  ctx.globalAlpha*=Math.pow(1-row/bands,1.5);
  ctx.translate(Math.sin(time*.38+row*2.7)*(.3+row*.2),g.translateY);
  ctx.scale(1,g.scaleY);ctx.drawImage(source,box.left,box.top,box.width,box.height);
  ctx.restore();
 }
 ctx.restore();
}

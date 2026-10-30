// Only the near plane changes. Its world travel remains exactly 1:1, as it
// was with the original panorama. Alternating neighbours share source edges.
export function foregroundTiles(travel,width,height){
 const tileHeight=height*(width<=700?.30:.34),tileWidth=tileHeight*3;
 const first=Math.floor(travel/tileWidth),offset=travel-first*tileWidth;
 return Array.from({length:Math.ceil(width/tileWidth)+1},(_,n)=>({
  index:first+n,left:n*tileWidth-offset,width:tileWidth,height:tileHeight,
  mirrored:(first+n)%2!==0
 }));
}
export const foregroundSection=progress=>progress<4?'open':'ice';

export function createForegroundWater(...roots){
 roots.forEach(root=>root.replaceChildren());
 let pools=roots.map(()=>[]),section='',last='';
 // Each photograph decodes before its first reveal. During loading the
 // original middle ocean remains visible instead of an empty colour patch.
 ['open','ice'].forEach(name=>{
  const image=new Image();image.src=`assets/foreground-${name}-v24.webp`;
  image.decode().then(()=>{roots.forEach(root=>root.classList.add(`water-${name}-ready`));}).catch(()=>{});
 });
 return {paint(travel,width,height,progress){
  const nextSection=foregroundSection(progress);
  if(section!==nextSection){section=nextSection;roots.forEach(root=>{root.dataset.water=section;});}
  const key=`${travel}:${width}:${height}`;
  if(key===last)return;last=key;
  const tiles=foregroundTiles(travel,width,height);
  roots.forEach((root,k)=>{
   if(pools[k].length!==tiles.length){
    pools[k]=tiles.map(()=>{const tile=document.createElement('div');tile.className='near-water-tile';return tile;});
    root.replaceChildren(...pools[k]);
   }
   tiles.forEach((tile,i)=>{
    const node=pools[k][i];
    node.style.width=`${tile.width+.4}px`;node.style.height=`${tile.height}px`;
    node.style.transform=`translate3d(${tile.left}px,0,0) scaleX(${tile.mirrored?-1:1})`;
   });
  });
 }};
}

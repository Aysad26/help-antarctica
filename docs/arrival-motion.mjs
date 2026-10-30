// Desktop arrivals begin only after most of the story card is on the left.
// Once triggered they finish even if the reader stops scrolling to read it.
export const cardHasArrived=(card,width,kind)=>kind==='whale'?card.left+card.width*.5<=width*.56:card.left+card.width*.7<=width*.5;
export function createArrivalMotion(){
 const states=new Map();
 const durations={orca:2.25,whale:2.6,swimmer:1.35};
 return {
  update(kind,card,width,dt,{paused=false,reduced=false}={}){
   let s=states.get(kind);if(!s){s={phase:0,triggered:false};states.set(kind,s);}
   if(card.left>width){s.phase=0;s.triggered=false;return;}
   // On returning from the following scene, keep the completed encounter.
   if(card.left+card.width<0&&!s.triggered){s.phase=1;s.triggered=true;return;}
   if(!s.triggered&&cardHasArrived(card,width,kind))s.triggered=true;
   if(s.triggered){
    if(reduced)s.phase=1;
    // A stalled browser frame must not teleport a large animal through its arc.
    else if(!paused)s.phase=Math.min(1,s.phase+Math.min(.075,Math.max(0,dt))/durations[kind]);
   }
  },
  phase(kind){return states.get(kind)?.phase??0;},
  reset(){states.clear();},
  get running(){return [...states.values()].some(s=>s.triggered&&s.phase<1);}
 };
}

// Keep fractional frame deadlines. Resetting the clock to every RAF sample
// would quantize 45 fps down to 30 and sometimes drop 30 fps down to 20.
export function paintDeadline(previous,time,rate){
 const interval=1000/rate,steps=Math.floor((time-previous+.5)/interval);
 return steps>0?previous+steps*interval:null;
}
export function createPaintBudget(mobile){
 let fast=false,cheap=0,slow=0,mean=0;
 return {
  sample(cost){
   mean=mean?mean*.8+cost*.2:cost;
   cheap=mean<8?cheap+1:0;slow=mean>13?slow+1:0;
   if(cheap>=24)fast=true;
   if(slow>=3){fast=false;cheap=0;}
  },
  rate(moving){return moving&&fast?60:(mobile?30:45);},
  reset(nextMobile){mobile=nextMobile;fast=false;cheap=slow=mean=0;},
  get average(){return mean;}
 };
}

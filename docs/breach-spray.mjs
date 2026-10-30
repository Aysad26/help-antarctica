import {clamp,smooth} from './motion.mjs?v=32';

export const sprayThresholds=kind=>kind==='whale'?[.22,.29,.36,.43,.51,.59,.68]:[.38,.44,.50,.56,.63,.70];
export function makeSprayFragment(kind,index,contact,spread,travel,time){
 const count=sprayThresholds(kind).length,u=index/(count-1),side=u*2-1;
 const variant=(index*37%11)/11;
 return {
  x:contact.x+side*spread*.36,waterY:contact.y,travel,birth:time,
  width:spread*(.16+variant*.055),height:spread*(.05+variant*.015),
  flight:.85+variant*.32,gravity:75+spread*.06,side,
  sx:[.02,.21,.43,.66,.12,.52,.34][index],sw:.26,
  strength:(kind==='whale'?.68:.60)*(1-Math.abs(side)*.2)
 };
}
export function sprayFragmentPose(fragment,age,travel){
 const u=clamp(age/fragment.flight),rise=fragment.gravity*fragment.flight*.5;
 const alpha=smooth(u/.15)*(1-smooth((u-.32)/.68))*fragment.strength;
 const width=fragment.width*(1+u*.16),height=fragment.height*(1-u*.22);
 return {
  x:fragment.x-(travel-fragment.travel)+fragment.side*fragment.width*.22*age,
  y:fragment.waterY-height*.9-rise*age+fragment.gravity*.5*age*age,
  width,height,alpha:age<0||age>=fragment.flight?0:alpha
 };
}

const smooth=value=>{const x=Math.max(0,Math.min(1,value));return x*x*(3-2*x);};

// One frozen photographic splash stays on the measured sea plane. The arrival
// reveals it upwards from that plane, with no spring, opacity ramp or orbit.
export function staticSprayGeometry(contact,subjectWidth,viewportWidth,phase){
 const width=Math.min(viewportWidth*.9,Math.max(contact.width*1.85,subjectWidth*.28));
 const height=width*.40,waterline=.833;
 return {x:contact.x-width*.5,y:contact.y-height*waterline,width,height,
  clipTop:contact.y-height*waterline*smooth((phase-.28)/.42),clipBottom:contact.y+height*.015};
}

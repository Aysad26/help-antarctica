const smooth=value=>{const x=Math.max(0,Math.min(1,value));return x*x*(3-2*x);};

// Both hands are warm skin; the old water in their matte is blue or neutral.
// Test colour only inside the hand islands, never on the cap or the torso.
export function handSkinAlpha(red,green,blue){
 return smooth((red-green-3)/12)*smooth((red-blue-5)/18);
}

export function photographMatteAlpha(region,red,green,blue,alpha){
 const keyFringe=(blue>green+70&&blue>red+100)||
  (green>225&&blue>225&&red<30)||(red>220&&green<70&&blue<70);
 if(keyFringe)return 0;
 return alpha*(region==='torso'?1:handSkinAlpha(red,green,blue));
}

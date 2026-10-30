// A deliberately quiet, synthesized sound design. No claim of field recordings.
export function createSoundscape(){
 let context,master,wind,ocean,deep,motor,enabled=false,scene='penguins',depth=0,nextDetail=0,hidden=false;
 const clamp=v=>Math.max(0,Math.min(1,v));
 function noiseBuffer(){const b=context.createBuffer(1,context.sampleRate*5,context.sampleRate),d=b.getChannelData(0);let brown=0;for(let i=0;i<d.length;i++){brown=(brown+Math.random()*.035-.0175)/1.015;d[i]=brown*3;}return b;}
 function bed(buffer,type,frequency){const src=context.createBufferSource(),filter=context.createBiquadFilter(),gain=context.createGain();src.buffer=buffer;src.loop=true;filter.type=type;filter.frequency.value=frequency;gain.gain.value=0;src.connect(filter);filter.connect(gain);gain.connect(master);src.start();return {gain,filter};}
 function init(){const C=window.AudioContext||window.webkitAudioContext;if(!C)throw Error('Audio unavailable');context=new C();const compressor=context.createDynamicsCompressor();compressor.threshold.value=-20;compressor.ratio.value=4;master=context.createGain();master.gain.value=.65;master.connect(compressor);compressor.connect(context.destination);const buffer=noiseBuffer();wind=bed(buffer,'bandpass',850);ocean=bed(buffer,'lowpass',550);deep=bed(buffer,'lowpass',155);motor=context.createGain();motor.gain.value=0;motor.connect(master);for(const f of [43,64.5,86]){const o=context.createOscillator(),g=context.createGain();o.type='sine';o.frequency.value=f;g.gain.value=.19;o.connect(g);g.connect(motor);o.start();}}
 function tone(from,to,duration,volume=.035,type='sine',delay=0){if(!enabled||hidden||context?.state!=='running')return;const t=context.currentTime+delay,o=context.createOscillator(),g=context.createGain();o.type=type;o.frequency.setValueAtTime(from,t);o.frequency.exponentialRampToValueAtTime(Math.max(25,to),t+duration);g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(volume,t+.08);g.gain.exponentialRampToValueAtTime(.0001,t+duration);o.connect(g);g.connect(master);o.start(t);o.stop(t+duration+.1);o.onended=()=>{o.disconnect();g.disconnect();};}
 function rustle(duration=.3,volume=.15,frequency=900,delay=0){if(!enabled||hidden||context?.state!=='running')return;const t=context.currentTime+delay,src=context.createBufferSource(),filter=context.createBiquadFilter(),g=context.createGain();src.buffer=noiseBuffer();filter.type='bandpass';filter.frequency.value=frequency;filter.Q.value=.5;g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(volume,t+.02);g.gain.exponentialRampToValueAtTime(.0001,t+duration);src.connect(filter);filter.connect(g);g.connect(master);src.start(t);src.stop(t+duration+.05);src.onended=()=>{src.disconnect();filter.disconnect();g.disconnect();};}
 function detail(){
  if(scene==='penguins'){tone(420,330,.22,.025,'triangle');tone(500,370,.3,.021,'triangle',.35);}
  else if(scene==='orca'){tone(1350,920,.65,.014);tone(950,1600,.4,.009,'sine',.7);}
  else if(scene==='whale'){tone(170,78,2.3,.025);tone(260,125,1.8,.012,'sine',.5);}
  else if(scene==='krill'||scene==='jellyfish'){tone(450,170,.15,.01);tone(650,240,.18,.008,'sine',.23);}
  else if(scene==='weddell'){tone(1650,250,1.9,.013);for(let i=0;i<4;i++)tone(820-i*70,560-i*45,.18,.012,'sine',2.1+i*.23);}
  else if(scene==='elephant'){tone(180,75,1.2,.012);rustle(.6,.10,380);}
  else if(scene==='tern'){tone(740,220,.16,.008);tone(960,340,.13,.006,'sine',.18);}
  else if(scene==='underleopard'){rustle(.8,.035,210);}
  else if(scene==='tourists'){rustle(.06,.055,1700);}
  else if(scene==='cormorant'){tone(1800,1200,.17,.015,'triangle');tone(1650,2200,.13,.012,'triangle',.22);}
  else if(scene==='swimmer'){rustle(.4,.18,1000);rustle(.6,.10,600,.7);}
  else if(scene==='icearch'){rustle(.12,.15,1100);tone(95,48,.6,.015,'sine',.08);}
  else if(scene==='ship'){rustle(.65,.15,480);}
  else if(scene==='station'){rustle(.16,.08,1400);}
  else if(scene==='workers'){rustle(.22,.17,1700);rustle(.22,.12,1300,.55);}
 }
 return {
  async setEnabled(value){if(!context)init();enabled=value;hidden=false;if(value){await context.resume();master.gain.setTargetAtTime(.65,context.currentTime,.4);nextDetail=0;}else{master.gain.setTargetAtTime(0,context.currentTime,.2);setTimeout(()=>{if(!enabled)context.suspend();},1200);}return enabled;},
  setScene(kind,amount){if(scene!==kind){scene=kind;nextDetail=0;}depth=amount;},
  tick(dt,time){if(!context||!enabled||hidden||context.state!=='running')return;const t=context.currentTime,surface=1-depth,wave=.78+Math.sin(time*.43)*.15;wind.gain.gain.setTargetAtTime((scene==='albatross'?.12:.08)*surface,t,.8);ocean.gain.gain.setTargetAtTime(.25*surface*wave,t,.7);deep.gain.gain.setTargetAtTime(.36*depth,t,.6);motor.gain.setTargetAtTime(scene==='ship'?.035:scene==='tourists'?.014:scene==='station'?.006:0,t,1);if(time>=nextDetail){detail();nextDetail=time+4+Math.random()*5;}},
  splash(power=1){rustle(.55,.25*clamp(power),1150);},
  async suspend(value){hidden=value;if(!context)return;if(value)await context.suspend();else if(enabled)await context.resume();},
  get enabled(){return enabled;}
 };
}

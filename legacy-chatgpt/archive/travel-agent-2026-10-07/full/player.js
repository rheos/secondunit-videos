function demo(t,key){
 if(key==='demo-agency'){let z=1+t*.017;camera(960,555,z,0,()=>agency(t,{sea:smooth(4.05,CUT1,t)*.5}));}
 if(key==='demo-flood')flood(t);
 if(key==='demo-map')mapScene(t);
 if(key==='demo-destination'){let z=1+(t-CUT3)*.008;camera(960,540,z,0,()=>destination(t));}
}
function paperTurn(t,cut){let d=t-cut;if(d<=-.22||d>=.22)return;let p=(d+.22)/.44;let xx=mix(-4500,2500,p);g.save();g.translate(xx,0);path([['M',0,-100],['L',3500,-100],['L',4050,1180],['L',550,1180],['Z']],C.light);line(3500,-100,4050,1180,C.ochre,3);hatch(0,-50,4050,1200,16,C.ink,.035);g.restore();}
function fullFrame(time){let t=clamp(time,0,FILM_DURATION-1/240),n=Math.floor(t*24+.0001);T=t;
 let shot=EDIT.find(s=>n>=s.startFrame&&n<s.endFrame)||EDIT.at(-1),u=t-shot.start,d=shot.end-shot.start,o=shot.options;
 g.setTransform(1,0,0,1,0,0);g.globalAlpha=1;g.globalCompositeOperation='source-over';g.clearRect(0,0,W,H);g.lineCap='round';g.lineJoin='round';g.setLineDash([]);
 g.save();let j=Math.floor(t*8);g.translate((hash(j+55)-.5)*.6,(hash(j+81)-.5)*.6);
 if(shot.key.startsWith('demo-'))demo(t,shot.key);
 else {let p=phase(u,d),z=(o.zoom||1)*(1+.018*p),focus=o.focus||[960,540];camera(focus[0],focus[1],z,0,()=>SCENES[shot.key](t,u+(o.offset||0),o.span||d,o));}
 g.restore();finish();
 for(let c of [CUT1,CUT2,CUT3,30,90.75,160,220.375,293.75,370.833333333])paperTurn(t,c);
 // Preserve the recording's natural ending with the last visual fading into paper, not a title card.
 if(t>402.15){g.save();g.globalAlpha=smooth(402.15,403.35,t);rect(0,0,W,H,C.paper);g.restore();finish();}
 return shot.id;
}
window.__ready=true;window.__render=fullFrame;window.__frameJPEG=(t,q=.88)=>{fullFrame(t);return canvas.toDataURL('image/jpeg',q)};
window.__shotAt=t=>EDIT.find(s=>t>=s.start&&t<s.end);
const audio=document.getElementById('song'),button=document.getElementById('play'),seek=document.getElementById('seek'),clock=document.getElementById('clock');let playing=false;
const displayTime=t=>Math.floor(t/60)+':'+String(Math.floor(t%60)).padStart(2,'0');
function show(t){fullFrame(t);seek.value=t;clock.textContent=displayTime(t)+' / 6:43';}
button.onclick=async()=>{if(playing){audio.pause();playing=false;button.textContent='Play';return;}if(audio.ended)audio.currentTime=0;await audio.play();playing=true;button.textContent='Pause';requestAnimationFrame(tick);};
seek.oninput=()=>{audio.currentTime=Number(seek.value);show(Number(seek.value));};
function tick(){if(!playing)return;show(audio.currentTime);if(audio.ended){playing=false;button.textContent='Replay';return;}requestAnimationFrame(tick);}
if(new URLSearchParams(location.search).has('offline'))document.body.classList.add('offline');show(0);

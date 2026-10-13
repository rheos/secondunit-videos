window.__ready=Alchemy.load().then(()=>{Alchemy.draw(ALCHEMY_CUES.range[0]);return true});
window.__frameJPEG=(t,q=.93)=>{if(!Number.isFinite(t))throw new Error('Song time must be finite');Alchemy.draw(t);return Alchemy.c.toDataURL('image/jpeg',q)};
window.__alchemyState=t=>({songFrame:Math.round(t*24),poseFrame:Math.floor(Math.round(t*24)/2)*2,brass:Alchemy.brass(t)});
const audio=document.getElementById('a');
if(!new URLSearchParams(location.search).has('offline')){
 Alchemy.c.addEventListener('click',async()=>{await window.__ready;if(audio.paused){if(audio.currentTime<ALCHEMY_CUES.range[0]||audio.currentTime>=ALCHEMY_CUES.range[1])audio.currentTime=ALCHEMY_CUES.range[0];await audio.play()}else audio.pause()});
 function tick(){if(!audio.paused){if(audio.currentTime>=ALCHEMY_CUES.range[1]){audio.pause();audio.currentTime=ALCHEMY_CUES.range[0]}Alchemy.draw(audio.currentTime)}requestAnimationFrame(tick)}window.__ready.then(tick);
}

audio.addEventListener("ended",()=>{audio.currentTime=ALCHEMY_CUES.range[0];Alchemy.draw(audio.currentTime)});

window.__ready=Alchemy.load().then(()=>{Alchemy.draw(47);return true});
window.__frameJPEG=(t,q=.93)=>{if(!Number.isFinite(t))throw new Error('Song time must be finite');Alchemy.draw(t);return Alchemy.c.toDataURL('image/jpeg',q)};
window.__alchemyState=t=>({songFrame:Math.round(t*24),poseFrame:Math.floor(Math.round(t*24)/2)*2,brass:Alchemy.brass(t)});
const audio=document.getElementById('a');
if(!new URLSearchParams(location.search).has('offline')){
 Alchemy.c.addEventListener('click',async()=>{await window.__ready;if(audio.paused){if(audio.currentTime<47||audio.currentTime>=79.5)audio.currentTime=47;await audio.play()}else audio.pause()});
 function tick(){if(!audio.paused){if(audio.currentTime>=79.5){audio.pause();audio.currentTime=47}Alchemy.draw(audio.currentTime)}requestAnimationFrame(tick)}window.__ready.then(tick);
}

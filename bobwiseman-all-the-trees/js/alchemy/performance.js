/* A score for acting: actions have an onset, a consequence and a recovery. */
(() => {
 const A=Alchemy,{smooth,clamp}=A,c=ALCHEMY_CUES.performance;
 const bump=(a,b,d,f)=>smooth(a,b,f)*(1-smooth(b,d,f));
 function horn(t){const f=t*24,visible=f>=c.firstReveal;
  let last=-Infinity,next=Infinity;for(const a of c.attacks){if(a<=f)last=a;else {next=a;break}}
  const age=f-last,playing=visible&&age<c.playFrames;
  const recovery=visible&&!playing?1-smooth(c.playFrames,c.playFrames+c.recoverFrames,age):0;
  return {visible,state:!visible?(f>=c.prepare?'prepare':'concealed'):playing?'play':recovery>0?'recover':'rest',
   play:playing?1:recovery,lift:Math.max(playing?1:recovery,Number.isFinite(next)?smooth(next-7,next,f):0),uncover:visible?.25+.75*smooth(c.firstReveal,c.firstReveal+4,f):0,attack:visible&&age<c.attackDecayFrames?1-age/c.attackDecayFrames:0,
   prepare:!visible?smooth(c.prepare,c.firstReveal,f):0,frame:Math.round(f)};
 }
 function reaction(t,at,amount=1){const f=t*24,d=f-at;if(d<0||d>32)return 0;return amount*Math.sin(Math.min(1,d/9)*Math.PI/2)*Math.exp(-Math.max(0,d-9)/9)}
 function actor(which,t,role=''){const f=t*24,moon=which==='luna',exchange=c.rootExchange;
  const contact=c.birdContact[moon?1:0],resident=smooth(contact,contact+3,f)*(1-smooth(1807,1833,f));
  const reply=c.reply,late=role==='caretaker'?.50*reaction(t,reply.birdContact)+.14*smooth(reply.birdContact,reply.birdContact+6,f):0;
  const birdLoad=.28*resident+.72*reaction(t,contact)+(!moon?.72*reaction(t,1886):0)+late;
  const replyReaction=role?0:reaction(t,reply[which],1.3),shelterReply=role?0:smooth(reply[which]+6,reply[which]+22,f);
  const wind=bump(...c.wind,f),warmth=bump(...c.warmth,f),shelter=smooth(c.shelter[0],c.shelter[1],f)*(1-smooth(c.shelter[2],c.shelter[2]+28,f));
  const receive=moon?reaction(t,exchange[1],1):reaction(t,exchange[0],.65);
  const extra=0;
  return {birdLoad,wind,warmth,shelter,receive,extra,
   dance:(1-.70*birdLoad-.35*shelter)*(1-.45*replyReaction-.25*shelterReply),
   lean:(moon?.19:-.19)*replyReaction+(moon?.12:-.12)*receive+.15*wind+(moon?-.085:.085)*shelter+(moon?-.12:.12)*extra,
   stretch:1-.055*replyReaction-.045*birdLoad-.075*shelter+.04*warmth-.05*extra,
   head:(moon?-.20:.20)*replyReaction+(moon?-.12:.10)*receive-.08*wind+(moon?.09:-.09)*shelter,
   arms:(moon?-.22:.22)*shelter+(moon?-.16:.16)*shelterReply,
   shelterReply,caretakerLift:role==='caretaker'?smooth(reply.junction,reply.settle,f):0,
   headScale:role==='listener'?1.28:1,canopy:(role==='caretaker'?1.28:role==='carrier'?1.16:1)+shelter*.16+shelterReply*.10};
 }
 function flow(t){const f=t*24,[start,end]=c.rootExchange;return {active:f>=start&&f<=end,u:clamp((f-start)/(end-start)),from:'sol',to:'luna'}}
 function rootCamera(t){const f=t*24,keys=c.rootCamera;if(f<=keys[0].f||f>=keys.at(-1).f)return {z:1,x:960,y:540};
  const i=keys.findIndex(k=>k.f>=f),a=keys[i-1],b=keys[i],u=smooth(a.f,b.f,f);
  return Object.fromEntries(['z','x','y'].map(key=>[key,a[key]+(b[key]-a[key])*u]));
 }
 A.performance={horn,actor,flow,reaction,bump,rootCamera};
 // Sparse attacks drive rays; sustained performance state drives the instrument pose.
 A.brass=t=>horn(t).attack;
})();

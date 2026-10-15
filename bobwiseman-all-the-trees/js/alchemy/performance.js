/* A score for acting: actions have an onset, a consequence and a recovery. */
(() => {
 const A=Alchemy,{smooth,clamp}=A,c=ALCHEMY_CUES.performance;
 const bump=(a,b,d,f)=>smooth(a,b,f)*(1-smooth(b,d,f));
 function fallbackHorn(t){const f=t*24,visible=f>=c.firstReveal;
  let last=-Infinity,next=Infinity;for(const a of c.attacks){if(a<=f)last=a;else {next=a;break}}
  const age=f-last,playing=visible&&age<c.playFrames;
  const recovery=visible&&!playing?1-smooth(c.playFrames,c.playFrames+c.recoverFrames,age):0;
  return {visible,state:!visible?(f>=c.prepare?'prepare':'concealed'):playing?'play':recovery>0?'recover':'rest',
   play:playing?1:0,lift:Math.max(playing?1:recovery,Number.isFinite(next)?smooth(next-7,next,f):0),uncover:visible?.25+.75*smooth(c.firstReveal,c.firstReveal+4,f):0,attack:visible&&age<c.attackDecayFrames?1-age/c.attackDecayFrames:0,
   prepare:!visible?smooth(c.prepare,c.firstReveal,f):0,frame:Math.round(f)};
 }
 // Exact half-open intervals can replace the legacy draft accents after listening review.
 function horn(t){const score=window.ALCHEMY_TRUMPET_SCORE;
  if(!score?.verified||!score.intervals.length)return fallbackHorn(t);
  const f=t*24,first=score.intervals[0][0],visible=f>=first;
  const current=score.intervals.find(([on,off])=>f>=on&&f<off),next=score.intervals.find(([on])=>on>f);
  const prior=score.intervals.filter(([,off])=>off<=f).at(-1),recover=prior?1-smooth(prior[1],prior[1]+6,f):0;
  const prep=next?smooth(next[0]-6,next[0],f):0,play=current?1:0;
  // Each note inside a held passage re-strikes the bell; the passage start is always a note.
  const notes=score.notes||[],note=current?notes.filter(n=>n>=current[0]&&n<=f).at(-1)??current[0]:null;
  return {visible,state:current?'play':recover>0?'recover':visible?'rest':f>=first-6?'prepare':'concealed',play,lift:Math.max(play,recover,prep),uncover:visible?1:0,attack:current?Math.max(.22,1-(f-note)/7):0,prepare:visible?0:prep,frame:Math.round(f)};
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
 // Branches are a phrase-sized transformation; hands are free between declarations.
 function branchPresence(which,t){const f=t*24,moon=which==='luna';
  const initial=1-smooth(1908,1937,f);
  const second=smooth(moon?2194:2132,moon?2210:2148,f)*(1-smooth(2258,2282,f));
  const third=smooth(moon?2952:2890,moon?2972:2908,f)*(1-smooth(3012,3036,f));
  const finale=smooth(3212,3240,f);
  return Math.max(initial,second,third,finale);
 }
 function choreography(which,t){const moon=which==='luna',side=moon?1:-1,free=1-branchPresence(which,t);
  const q=(t-80)*(145/60)*Math.PI,duet=bump(80,82,95,t),offer=bump(95,98,110,t),reprise=bump(123.8,127,134,t);
  const turn=moon?smooth(83.2,84,t)*(1-smooth(85,85.7,t)):smooth(81.4,82.1,t)*(1-smooth(83.2,83.9,t));
  const bow=moon?bump(86,86.6,87.4,t):bump(84.4,85,85.8,t);
  const active=Math.max(duet,reprise)*free,step=24*Math.sin(q*.5+side*.8)*active;
  return {x:step+side*38*offer*free,hop:Math.max(0,Math.sin(q))*10*active,
   left:free*(.52*Math.sin(q*.5+side)*active-side*.45*offer),
   right:free*(-.58*Math.sin(q*.5+side+.9)*active-side*.38*offer),
   elbow:free*(.34*Math.sin(q+.5)*active+.30*offer),
   lean:side*.23*bow*free+.06*Math.sin(q*.5)*active,
   head:-side*.14*turn*free,stretch:1-.09*bow*free,turn:free*turn};
 }
 function flow(t){const f=t*24,[start,end]=c.rootExchange;return {active:f>=start&&f<=end,u:clamp((f-start)/(end-start)),from:'sol',to:'luna'}}
 function rootCamera(t){const f=t*24,keys=c.rootCamera;if(f<=keys[0].f||f>=keys.at(-1).f)return {z:1,x:960,y:540};
  const i=keys.findIndex(k=>k.f>=f),a=keys[i-1],b=keys[i],u=smooth(a.f,b.f,f);
  return Object.fromEntries(['z','x','y'].map(key=>[key,a[key]+(b[key]-a[key])*u]));
 }
 A.performance={horn,actor,flow,reaction,bump,rootCamera,branchPresence,choreography};
 // Sparse attacks drive rays; sustained performance state drives the instrument pose.
 A.brass=t=>horn(t).attack;
})();

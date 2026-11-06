import {chromium} from 'playwright';
import fs from 'node:fs';import path from 'node:path';import crypto from 'node:crypto';import {spawn,execFileSync} from 'node:child_process';import {once} from 'node:events';
const dir=path.dirname(new URL(import.meta.url).pathname),root=path.dirname(dir),out=path.join(root,'out/full'),review=path.join(root,'out/full-review');
fs.mkdirSync(out,{recursive:true});fs.mkdirSync(review,{recursive:true});
const check=process.argv.includes('--check'),fps=24,workers=2,chunkSize=720;
const sources=['index.html','base.js','kit.js','journey.js','traps.js','release.js','timeline.js','player.js','audio-features.js'];
const signature=crypto.createHash('sha256').update(sources.map(f=>fs.readFileSync(path.join(dir,f))).join('\n')).digest('hex');
const browser=await chromium.launch({channel:'chrome',headless:true,args:['--disable-gpu','--no-sandbox']});let errors=[];
async function page(){let p=await browser.newPage({viewport:{width:1920,height:1080}});p.on('pageerror',e=>errors.push(String(e)));await p.goto('file://'+path.join(dir,'index.html')+'?offline=1');await p.waitForFunction(()=>window.__ready,{timeout:20000});return p;}
const initial=await page(),edit=await initial.evaluate(()=>window.EDIT),frames=edit.at(-1).endFrame;
fs.writeFileSync(path.join(dir,'edit.json'),JSON.stringify(edit,null,2));
const manifest={title:'Travel Agent: An Escape Brochure',artist:'Bob Wiseman',version:'full-length untitled first cut',fps,frames,duration:frames/fps,width:1920,height:1080,source_sha256:'78c9f34dc2bb94801693ed5ce4349733c0be25bfb610a1b061dbc9e10923f77d',source_url:'https://www.bobwiseman.ca/wp-content/uploads/2014/02/Bob_Wiseman_-_11_-_Travel_Agent.mp3',audio:'Complete original recording; no added music, effects, time stretching or editorial audio fades. AAC encoding.',picture:'Original deterministic Canvas2D animation. No song/artist titles or credit cards.',filename:`travel-agent_escape-brochure_f00000-f${String(frames).padStart(5,'0')}_24fps_full-notitles.mp4`,signature,shots:edit};
fs.writeFileSync(path.join(dir,'manifest.json'),JSON.stringify(manifest,null,2));
if(check){
 let rows=[];
 for(let s of edit){for(let [tag,t] of [['start',s.start+.125],['mid',(s.start+s.end)/2],['end',s.end-.125]]){
  const result=await initial.evaluate(({t,small})=>{window.__render(t);let src=document.getElementById('film');if(!small)return src.toDataURL('image/jpeg',.91);let c=document.createElement('canvas');c.width=480;c.height=270;c.getContext('2d').drawImage(src,0,0,480,270);return c.toDataURL('image/jpeg',.91);},{t,small:tag!=='mid'});
  const name=`shot-${String(s.id).padStart(2,'0')}-${tag}.jpg`;fs.writeFileSync(path.join(review,name),Buffer.from(result.split(',')[1],'base64'));rows.push({id:s.id,key:s.key,tag,t,path:name});
 }
 console.log(`Reviewed frames ${s.id}/${edit.length}: ${s.key}`);
 }
 fs.writeFileSync(path.join(review,'frames.json'),JSON.stringify(rows,null,2));await browser.close();if(errors.length)throw Error([...new Set(errors)].join('\n'));console.log('REVIEW COMPLETE');process.exit(0);
}
await initial.close();
const chunkDir=path.join(out,'chunks',signature.slice(0,12));fs.mkdirSync(chunkDir,{recursive:true});const count=Math.ceil(frames/chunkSize);let next=0,finished=0,rendered=0;const start=Date.now();
const state={signature,started:new Date().toISOString(),status:'rendering',frames,completed:[]};const stateFile=path.join(out,'state.json');
function save(){fs.writeFileSync(stateFile,JSON.stringify(state,null,2));}save();
const chunks=Array.from({length:count},(_,i)=>({i,a:i*chunkSize,b:Math.min(frames,(i+1)*chunkSize),file:path.join(chunkDir,`part-${String(i).padStart(3,'0')}.mp4`)}));
async function worker(id){let p=await page();for(;;){let i=next++;if(i>=count)break;let c=chunks[i],done=c.file+'.done';if(fs.existsSync(done)&&fs.existsSync(c.file)){finished++;state.completed.push(i);save();console.log(`REUSE ${i+1}/${count}`);continue;}
 let stderr='';const enc=spawn('/usr/local/bin/ffmpeg',['-y','-v','error','-f','image2pipe','-vcodec','mjpeg','-framerate',String(fps),'-i','pipe:0','-an','-vf','scale=in_range=pc:out_range=tv,format=yuv420p','-c:v','libx264','-preset','veryfast','-crf','20','-threads','2','-color_range','tv','-movflags','+faststart',c.file],{stdio:['pipe','ignore','pipe']});enc.stderr.on('data',d=>stderr+=d.toString());let encodingError=null;enc.stdin.on('error',e=>encodingError=e);const closed=new Promise((resolve,reject)=>{enc.on('error',reject);enc.on('close',code=>code===0?resolve():reject(Error(`Encode ${i}: ${stderr}`)));});
 for(let n=c.a;n<c.b;n++){
  if(encodingError)throw encodingError;
  let data=await p.evaluate(t=>window.__frameJPEG(t,.88),n/fps);
  if(!enc.stdin.write(Buffer.from(data.split(',')[1],'base64')))await once(enc.stdin,'drain');
  rendered++;if(rendered%240===0)console.log(`PROGRESS ${rendered}/${frames} new frames, ${finished}/${count} chunks, ${Math.round((Date.now()-start)/1000)}s`);
 }
 enc.stdin.end();await closed;if(errors.length)throw Error([...new Set(errors)].join('\n'));fs.writeFileSync(done,JSON.stringify({a:c.a,b:c.b,signature}));finished++;state.completed.push(i);save();console.log(`CHUNK ${i+1}/${count} done (${c.a}-${c.b})`);
 }await p.close();}
try{await Promise.all(Array.from({length:workers},(_,i)=>worker(i)));await browser.close();state.status='assembling';save();
 const list=path.join(chunkDir,'concat.txt');fs.writeFileSync(list,chunks.map(c=>`file '${c.file.replaceAll("'","'\\''")}'`).join('\n')+'\n');
 const final=path.join(out,manifest.filename);execFileSync('/usr/local/bin/ffmpeg',['-y','-v','error','-f','concat','-safe','0','-i',list,'-i',path.join(root,'source/travel-agent.mp3'),'-map','0:v:0','-map','1:a:0','-c:v','copy','-c:a','aac','-b:a','256k','-t',String(frames/fps),'-movflags','+faststart',final],{stdio:'inherit'});
 state.status='complete';state.output=final;state.finished=new Date().toISOString();save();console.log('COMPLETE '+final);
}catch(e){state.status='failed';state.error=String(e);save();await browser.close();throw e;}

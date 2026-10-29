import {chromium} from 'playwright';
import fs from 'node:fs';import path from 'node:path';import crypto from 'node:crypto';import {spawn,execFileSync} from 'node:child_process';import {once} from 'node:events';
const dir=path.dirname(new URL(import.meta.url).pathname),out=path.join(dir,'out');fs.mkdirSync(out,{recursive:true});
const check=process.argv.includes('--check'),bench=process.argv.includes('--bench'),frames=3120,startFrame=2160,fps=24;
const supplied=process.argv.filter(x=>/^\d+(\.\d+)?$/.test(x)).map(Number);let errs=[];
const b=await chromium.launch({channel:'chrome',headless:true,args:['--use-angle=metal','--ignore-gpu-blocklist','--enable-gpu','--no-sandbox','--disable-background-timer-throttling','--disable-renderer-backgrounding']});
try{
 const p=await b.newPage({viewport:{width:1920,height:1080}});p.on('pageerror',e=>errs.push(String(e)));
 await p.goto('file://'+path.join(dir,'index.html')+'?offline=1');await p.waitForFunction(()=>window.__ready&&typeof renderExtension==='function');
 const edit=await p.evaluate(()=>window.EDIT);fs.writeFileSync(path.join(dir,'edit.json'),JSON.stringify(edit,null,2));
 const gpu=await p.evaluate(()=>{const gl=document.getElementById('c').getContext('webgl2'),d=gl.getExtension('WEBGL_debug_renderer_info');return d?gl.getParameter(d.UNMASKED_RENDERER_WEBGL):gl.getParameter(gl.RENDERER)});console.log('GPU',gpu);
 if(check){
  const times=supplied.length?supplied:[90,95.99,96,99,103,109,116,118,125,133,140,147,157,162,167,175,182.2,187,192,197,204,211,217,219];
  for(const t of times){const v=await p.evaluate(t=>window.__frameJPEG(t),t);fs.writeFileSync(path.join(out,`review-${t.toFixed(2)}.jpg`),Buffer.from(v.split(',')[1],'base64'));console.log('frame',t);}
  // Exact repeated output after a different seek is a meaningful offline check.
  const a=await p.evaluate(()=>window.__frameJPEG(167));await p.evaluate(()=>window.__render(211));const c=await p.evaluate(()=>window.__frameJPEG(167));if(a!==c)throw Error('Non-deterministic out-of-order seek');
  if(errs.length)throw Error(errs.join('\n'));console.log('CHECK COMPLETE; deterministic seek passed');
 }else if(bench){
  const t=Date.now();let size=0;for(let i=0;i<20;i++){const v=await p.evaluate(t=>window.__frameJPEG(t),96+i/24);size+=v.length;}console.log('BENCH',((Date.now()-t)/20).toFixed(1),'ms/frame',size,'base64 bytes');
 }else{
  const tail=path.join(out,'extension-picture.mp4'),picture=path.join(out,'picture.mp4'),final=path.join(out,'travel-agent_journey_f00000-f05280_24fps_study-v8-development.mp4');
  let stderr='',failure;const enc=spawn('/usr/local/bin/ffmpeg',['-y','-v','error','-f','image2pipe','-vcodec','mjpeg','-framerate',String(fps),'-i','pipe:0','-an','-vf','scale=in_range=pc:out_range=tv,format=yuv420p','-c:v','libx264','-preset','medium','-crf','18','-threads','2','-movflags','+faststart',tail]);
  enc.stderr.on('data',d=>stderr+=d);enc.stdin.on('error',e=>failure=e);const finish=new Promise((res,rej)=>enc.on('close',c=>c?rej(Error(stderr)):res()));const began=Date.now();
  for(let i=0;i<frames;i+=4){if(failure)throw failure;
   const urls=await p.evaluate(({first,count,fps})=>Array.from({length:count},(_,j)=>window.__frameJPEG((first+j)/fps)),{first:startFrame+i,count:Math.min(4,frames-i),fps});
   for(const url of urls)if(!enc.stdin.write(Buffer.from(url.split(',')[1],'base64')))await once(enc.stdin,'drain');
   if(i%96===0)console.log('EXTENSION',i,'/',frames,Math.round((Date.now()-began)/1000)+'s');
  }
  enc.stdin.end();await finish;if(errs.length)throw Error(errs.join('\n'));
  const existing=path.resolve(dir,'../retry-v7-departure/out/picture.mp4');
  const list=path.join(out,'concat.txt');fs.writeFileSync(list,`file '${existing}'\nfile '${tail}'\n`);
  execFileSync('/usr/local/bin/ffmpeg',['-y','-v','error','-f','concat','-safe','0','-i',list,'-map','0:v:0','-c:v','copy','-movflags','+faststart',picture]);
  execFileSync('/usr/local/bin/ffmpeg',['-y','-v','error','-i',picture,'-i',path.resolve(dir,'../source/travel-agent.mp3'),'-map','0:v:0','-map','1:a:0','-c:v','copy','-c:a','aac','-b:a','256k','-t','220','-movflags','+faststart',final]);
  fs.writeFileSync(path.join(out,'manifest.json'),JSON.stringify({file:final,frames:5280,fps,startFrame:0,endFrame:5280,durationSeconds:220,openingPicture:existing,openingFrames:[0,2160],extensionFrames:[2160,5280],audioSHA256:'78c9f34dc2bb94801693ed5ce4349733c0be25bfb610a1b061dbc9e10923f77d',sourceHashes:Object.fromEntries(['js/scene.js','js/development.js','js/paint.js','js/depth.js','music.js'].map(f=>[f,crypto.createHash('sha256').update(fs.readFileSync(path.join(dir,f))).digest('hex')])),gpu,notes:'Original 90-second picture reused without re-encoding. One continuous source soundtrack. No titles, lyrics, visible traveller or additional sound.'},null,2));console.log('COMPLETE',final);
 }
}finally{await b.close();}

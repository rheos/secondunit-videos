import { chromium } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
const root=path.dirname(new URL(import.meta.url).pathname), check=process.argv.includes('--check'), transitionsOnly=process.argv.includes('--transitions');
const out=path.join(root,'out');fs.mkdirSync(out,{recursive:true});
const b=await chromium.launch({channel:'chrome',headless:true,args:['--disable-gpu','--no-sandbox']});
const p=await b.newPage({viewport:{width:1920,height:1080}});const errors=[];
p.on('pageerror',e=>errors.push(String(e)));
await p.goto('file://'+root+'/index.html?offline=1');await p.waitForFunction(()=>window.__ready);
if(check){for(const t of [0,2.5,4.6,6.8,9.3,11.2,13.3,15.7,19]){const data=await p.evaluate(t=>window.__frameJPEG(t),t);fs.writeFileSync(path.join(out,`still-${t}.jpg`),Buffer.from(data.split(',')[1],'base64'));}console.log('Contact frames written');}
else {fs.mkdirSync(path.join(out,'frames'),{recursive:true});for(let n=0;n<480;n++){if(transitionsOnly && ![127,246,346].some(c=>Math.abs(n-c)<=6))continue;const data=await p.evaluate(t=>window.__frameJPEG(t),n/24);fs.writeFileSync(path.join(out,'frames',`f-${String(n).padStart(4,'0')}.jpg`),Buffer.from(data.split(',')[1],'base64'));if(n%96===0)console.log(`${n}/480 frames`);} }
await b.close();if(errors.length)throw Error(errors.join('\n'));
if(!check){const manifest=JSON.parse(fs.readFileSync(path.join(root,'manifest.json'),'utf8'));const audioStart=manifest.song_start_frame/24;
execFileSync('/usr/local/bin/ffmpeg',['-y','-v','error','-framerate','24','-i',path.join(out,'frames/f-%04d.jpg'),'-ss',String(audioStart),'-t','20','-i',path.join(root,'source/travel-agent.mp3'),'-map','0:v:0','-map','1:a:0','-c:v','libx264','-preset','medium','-crf','19','-threads','2','-pix_fmt','yuv420p','-c:a','aac','-b:a','256k','-af','afade=t=in:st=0:d=0.06,afade=t=out:st=19.65:d=0.35','-t','20','-movflags','+faststart',path.join(out,manifest.filename)],{stdio:'inherit'});console.log('Rendered '+manifest.filename);}

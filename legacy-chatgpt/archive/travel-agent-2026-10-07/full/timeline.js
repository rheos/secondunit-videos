// Recording-aligned shot boundaries. Lyrics stay in source/full-timing.json, outside git.
// End points are exclusive. All timings are quantized to 24 fps when loaded.
const EDIT=[
 [0,5.291666667,'demo-agency'],[5.291666667,10.25,'demo-flood'],[10.25,14.416666667,'demo-map'],[14.416666667,20,'demo-destination'],
 [20,25.5,'arrival'],[25.5,30,'threshold'],
 [30,38.25,'counter'],[38.25,44.708333333,'mail'],
 [44.708333333,53.291666667,'blues'],[53.291666667,59.125,'distance'],
 [59.125,65.75,'sunorgan'],[65.75,70.708333333,'sunclose'],[70.708333333,73.708333333,'flight'],
 [73.708333333,84.166666667,'carfree'],[84.166666667,90.75,'compass'],
 [90.75,99.5,'counter',{flood:true}], [99.5,108.958333333,'stamp'],[108.958333333,116.916666667,'hall'],
 [116.916666667,125.791666667,'loop'],[125.791666667,131.625,'loopclose'],
 [131.625,138.5,'mule',{span:11.75}],[138.5,143.375,'mule',{zoom:1.22,focus:[940,579],offset:6.875,span:11.75}],
 [143.375,146.416666667,'thread'],[146.416666667,155.166666667,'carrot'],[155.166666667,160,'thread',{zoom:1.3,focus:[1050,523]}],
 [160,168.75,'dining'],[168.75,174.958333333,'place'],[174.958333333,181.625,'cork',{span:13.833333333}],
 [181.625,188.791666667,'cork',{zoom:1.16,focus:[999,473],offset:6.666666667,span:13.833333333}],
 [188.791666667,196,'officials'],[196,201.666666667,'filing'],[201.666666667,203.416666667,'fileclose'],
 [203.416666667,210.125,'circuit'],[210.125,216.125,'pills'],[216.125,220.375,'window'],
 [220.375,230.875,'hall'],[230.875,241.583333333,'window',{zoom:1.075,focus:[969,542]}],
 [241.583333333,247.333333333,'reels'],[247.333333333,256.583333333,'cinema'],
 [256.583333333,262.083333333,'reels',{zoom:1.13,focus:[984,528]}],
 [262.083333333,267.875,'hero'],[267.875,273.583333333,'crooks'],[273.583333333,276.041666667,'reels'],
 [276.041666667,283.125,'heart',{span:11.875}],[283.125,287.916666667,'heart',{zoom:1.13,focus:[1013,524],offset:7.083333333,span:11.875}],
 [287.916666667,293.75,'compass',{zoom:1.04}],
 [293.75,302.5,'tour'],[302.5,311.916666667,'train'],[311.916666667,319.625,'railwindow'],
 [319.625,329.166666667,'moving'],[329.166666667,338.25,'cage'],[338.25,347.625,'cageclose',{span:11.541666667}],
 [347.625,349.791666667,'cageclose',{zoom:1.12,focus:[1040,598],offset:9.375,span:11.541666667}],
 [349.791666667,355.708333333,'wings'],[355.708333333,363.5,'flight'],[363.5,370.833333333,'garden'],
 [370.833333333,378.5,'return'],[378.5,385.416666667,'unfold'],[385.416666667,392.166666667,'loose'],
 [392.166666667,400.583333333,'snow'],[400.583333333,403.375,'blank']
].map(([a,b,key,options={}],i)=>({id:i+1,startFrame:Math.round(a*24),endFrame:Math.round(b*24),start:Math.round(a*24)/24,end:Math.round(b*24)/24,key,options}));
window.EDIT=EDIT;
window.FILM_DURATION=EDIT.at(-1).end;
for(let i=0;i<EDIT.length;i++){if(i&&EDIT[i-1].endFrame!==EDIT[i].startFrame)throw Error('Noncontiguous edit at '+i);if(EDIT[i].endFrame<=EDIT[i].startFrame)throw Error('Empty shot '+i);if(!EDIT[i].key.startsWith('demo-')&&!SCENES[EDIT[i].key])throw Error('Missing scene '+EDIT[i].key);}

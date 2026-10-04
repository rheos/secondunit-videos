import subprocess, json, os
P='seams/p/'
W=[ # name, file, window start frame, window end frame
 ('AB',P+'morph_AB.mp4',1680,1728),('BC',P+'morph_BC.mp4',2160,2208),('CD',P+'morph_CD.mp4',2375,2423),
 ('DE',P+'morph_DE.mp4',2834,2864),('EF',P+'morph_EF.mp4',3094,3142),('SAX','seams/morph_sax.mp4',3440,3482),
 ('FG',P+'morph_FG.mp4',4073,4104),('GH',P+'morph_GH.mp4',4512,4548),('CRT','seams/morph_crt.mp4',5250,5370),
 ('IJ',P+'morph_IJ.mp4',6666,6714),('J286',P+'morph_J286.mp4',6840,6888),('J298',P+'morph_J298.mp4',7128,7176),
 ('J310',P+'morph_J310.mp4',7416,7464),('J329',P+'morph_J329.mp4',7887,7935),('JK',P+'morph_JK.mp4',8167,8215)]
def frames(f):
    d=subprocess.run(['ffmpeg','-v','error','-i',f,'-vf','scale=160:90,format=gray','-f','rawvideo','-'],capture_output=True).stdout
    n=160*90; return [d[i*n:(i+1)*n] for i in range(len(d)//n)]
def df(a,b): return sum(abs(x-y) for x,y in zip(a,b))/len(a)
plan=[]
for name,f,a,b in W:
    fr=frames(f); D=max(df(fr[0],fr[-1]),1); t=0.08*D
    s=next(i for i in range(len(fr)) if df(fr[i],fr[0])>t)
    e=next(i for i in range(len(fr)-1,0,-1) if df(fr[i],fr[-1])>t)
    s=max(0,s-2); e=min(len(fr)-1,e+2)
    plan.append(dict(name=name,file=f,a=a,b=b,s=s,e=e))
    print(name,'active',s,e,'of',len(fr),'-> window',b-a)
json.dump(plan,open('v3_plan.json','w'),indent=1)

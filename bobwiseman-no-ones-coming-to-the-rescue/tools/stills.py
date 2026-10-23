# Key stills for the portrait-hall look. Code-drawn, 0 credits.
import math, random, sys
from PIL import Image, ImageDraw, ImageFilter, ImageFont, ImageChops
W,H=1280,720
OX=(92,22,28); GILT=(196,152,72); INK=(24,18,20); CREAM=(236,224,196)
TEAL=(38,112,116); MUST=(206,152,40); VIO=(98,64,128); RED=(206,36,30)
FONT="/System/Library/Fonts/Supplemental/Copperplate.ttc"
def font(s):
    try: return ImageFont.truetype(FONT,s)
    except: return ImageFont.load_default()

def wall(light=1.0):
    im=Image.new("RGB",(W,H),OX); d=ImageDraw.Draw(im)
    for y in range(-40,H+40,60):
        for x in range(-40,W+40,60):
            ox=30 if (y//60)%2 else 0
            cx,cy=x+ox,y
            d.polygon([(cx,cy-18),(cx+10,cy),(cx,cy+18),(cx-10,cy)],fill=(78,16,22))
            d.ellipse([cx-3,cy-3,cx+3,cy+3],fill=(104,30,34))
    d.rectangle([0,H-110,W,H],fill=(40,10,14))   # dado / floor
    d.rectangle([0,H-114,W,H-108],fill=(120,88,44))
    return dark(im,light)

def dark(im,k):
    return Image.blend(Image.new("RGB",im.size,(6,2,4)),im,k)

def halftone(gray,ink,paper=CREAM,cell=7):
    # gray: L image, 0=ink full, 255=paper
    w,h=gray.size; out=Image.new("RGB",(w,h),paper); d=ImageDraw.Draw(out)
    g=gray.load()
    for y in range(0,h,cell):
        for x in range(0,w,cell):
            v=1-g[min(x+cell//2,w-1),min(y+cell//2,h-1)]/255
            r=cell*0.72*math.sqrt(v)
            if r>0.4: d.ellipse([x+cell/2-r,y+cell/2-r,x+cell/2+r,y+cell/2+r],fill=ink)
    return out

def duo(key,tint,ink2,cell=7):
    # key: L image drawn in ink (black lines/shapes), tint: L image for colour ink
    base=halftone(tint,ink2,cell=cell)
    k=key.point(lambda v:255 if v>128 else 0)
    base.paste(INK,mask=ImageChops.invert(k))
    return base

def frame(im,box,photo,lit=True,crack=False,plaque=None,tilt=0):
    x0,y0,x1,y1=box; d=ImageDraw.Draw(im)
    if lit:
        glow=Image.new("L",(W,H),0); gd=ImageDraw.Draw(glow)
        cx=(x0+x1)//2
        gd.polygon([(cx-30,y0-40),(cx+30,y0-40),(x1+40,y1+30),(x0-40,y1+30)],fill=90)
        glow=glow.filter(ImageFilter.GaussianBlur(40))
        im.paste((255,214,150),mask=glow.point(lambda v:int(v*0.55)))
    b=26
    for i in range(b):
        t=i/b; c=tuple(int(GILT[j]*(0.55+0.6*math.sin(t*math.pi))) for j in range(3))
        d.rectangle([x0+i,y0+i,x1-i,y1-i],outline=tuple(min(255,v) for v in c))
    d.rectangle([x0+b-3,y0+b-3,x1-b+3,y1-b+3],outline=(90,62,24),width=3)
    pw,ph=x1-x0-2*b,y1-y0-2*b
    p=photo.resize((pw,ph))
    if not lit: p=dark(p,0.35)
    im.paste(p,(x0+b,y0+b))
    if crack:
        cx,cy=x0+b+int(pw*0.62),y0+b+int(ph*0.35); rnd=random.Random(3)
        for a in range(7):
            ang=a*0.9+rnd.random()*0.4; L=rnd.randint(60,160); px,py=cx,cy
            for s in range(5):
                nx=px+math.cos(ang)*L/5+rnd.randint(-6,6); ny=py+math.sin(ang)*L/5+rnd.randint(-6,6)
                d.line([px,py,nx,ny],fill=(250,246,236),width=2); px,py=nx,ny
    if lit:  # picture light
        cx=(x0+x1)//2; d.rectangle([cx-50,y0-46,cx+50,y0-36],fill=GILT); d.line([cx,y0-36,cx,y0-6],fill=GILT,width=4)
    if plaque is not None:
        pw2=180; py=y1+18
        d.rectangle([(x0+x1)//2-pw2//2,py,(x0+x1)//2+pw2//2,py+34],fill=(150,112,52) if not plaque else (232,190,96),outline=(80,56,20),width=2)
        if plaque:
            f=font(20); tw=d.textlength(plaque,font=f)
            d.text(((x0+x1)/2-tw/2,py+7),plaque,font=f,fill=INK)

def canvas(w,h,bg=255): return Image.new("L",(w,h),bg)

def woman(d,x,y,s,stride=0.6,back=True,fill=0):
    # back view, running; x,y = feet centre
    hy=y-s*1.0
    d.ellipse([x-s*.09,hy-s*.02,x+s*.09,hy+s*.16],fill=fill)            # head
    d.ellipse([x-s*.05,hy-s*.07,x+s*.05,hy+s*.03],fill=fill)            # bun
    d.polygon([(x-s*.11,hy+s*.2),(x+s*.11,hy+s*.2),(x+s*.24,y-s*.3),(x-s*.24,y-s*.3)],fill=fill)  # dress
    d.line([x-s*.1,hy+s*.24,x-s*.28,hy+s*.42+stride*s*.1],fill=fill,width=int(s*.05))
    d.line([x+s*.1,hy+s*.24,x+s*.3,hy+s*.36-stride*s*.12],fill=fill,width=int(s*.05))
    d.line([x-s*.07,y-s*.3,x-s*.07-stride*s*.18,y],fill=fill,width=int(s*.05))
    d.line([x+s*.07,y-s*.3,x+s*.07+stride*s*.2,y-s*.08],fill=fill,width=int(s*.05))

def soft(w,h,cx,cy,r,lo=60):
    t=canvas(w,h); td=ImageDraw.Draw(t); td.ellipse([cx-r,cy-r,cx+r,cy+r],fill=lo)
    return t.filter(ImageFilter.GaussianBlur(r*0.5))

def photo_cape(w=360,h=440):
    k=canvas(w,h); d=ImageDraw.Draw(k)
    d.ellipse([w*.47,h*.12,w*.53,h*.16],fill=0)                          # hook
    d.polygon([(w*.5,h*.15),(w*.28,h*.8),(w*.72,h*.8)],fill=0)           # cape
    d.line([w*.5,h*.16,w*.36,h*.24],fill=255,width=3)
    d.line([w*.82,h*.05,w*.78,h*.55],fill=0,width=3)                      # mic cable
    d.ellipse([w*.73,h*.55,w*.83,h*.66],fill=0)
    t=soft(w,h,w*.5,h*.45,w*.38,lo=70)
    return duo(k,t,TEAL)

def photo_run(w=360,h=440):
    k=canvas(w,h); d=ImageDraw.Draw(k)
    woman(d,w*.78,h*.9,h*.62,stride=0.9)
    d.line([0,h*.9,w,h*.9],fill=0,width=3)
    for i in range(5): d.line([w*.1+i*14,h*.55+i*12,w*.42+i*14,h*.55+i*12],fill=0,width=2)  # speed lines
    t=soft(w,h,w*.6,h*.5,w*.45,lo=40)
    return duo(k,t,MUST)

def photo_phone(w=360,h=440):
    k=canvas(w,h); d=ImageDraw.Draw(k)
    d.rounded_rectangle([w*.38,h*.12,w*.62,h*.42],radius=10,fill=0)
    d.ellipse([w*.44,h*.2,w*.56,h*.32],outline=255,width=4)
    pts=[(w*.5,h*.42)]+[(w*.5+math.sin(i*1.3)*14,h*.42+i*h*.035) for i in range(1,12)]
    d.line(pts,fill=0,width=3)
    d.rounded_rectangle([w*.42,h*.82,w*.58,h*.9],radius=8,fill=0)       # hanging receiver
    t=soft(w,h,w*.5,h*.3,w*.3,lo=90)
    return duo(k,t,VIO)

def still1():
    im=wall(0.85)
    boxes=[(70,150,410,560),(470,130,810,580),(870,150,1210,560)]
    frame(im,boxes[0],photo_cape(),crack=True,plaque="")
    frame(im,boxes[1],photo_run(),plaque="")
    frame(im,boxes[2],photo_phone(),plaque="")
    return im

def icon(kind,w,h):
    k=canvas(w,h); d=ImageDraw.Draw(k)
    if kind=="truck":
        d.rectangle([w*.12,h*.45,w*.82,h*.7],fill=0); d.rectangle([w*.62,h*.32,w*.82,h*.5],fill=0)
        for cx in (.28,.7): d.ellipse([w*cx-18,h*.64,w*cx+18,h*.64+36],fill=0)
        d.line([w*.16,h*.4,w*.58,h*.3],fill=0,width=5)
    if kind=="amb":
        d.rectangle([w*.15,h*.38,w*.8,h*.7],fill=0)
        d.rectangle([w*.4,h*.45,w*.48,h*.63],fill=255); d.rectangle([w*.35,h*.51,w*.53,h*.57],fill=255)
        for cx in (.3,.68): d.ellipse([w*cx-18,h*.64,w*cx+18,h*.64+36],fill=0)
    if kind=="dog":
        d.ellipse([w*.25,h*.45,w*.65,h*.62],fill=0); d.ellipse([w*.6,h*.32,w*.78,h*.5],fill=0)
        for lx in (.3,.38,.52,.6): d.line([w*lx,h*.58,w*lx,h*.75],fill=0,width=7)
        d.line([w*.25,h*.5,w*.12,h*.36],fill=0,width=6)
    if kind=="rats":
        rnd=random.Random(5)
        for i in range(14):
            x,y=rnd.uniform(.15,.85)*w,rnd.uniform(.25,.8)*h; d.ellipse([x-6,y-4,x+6,y+4],fill=0)
            d.line([x+5,y-4,x+12,y-10],fill=0,width=2); d.line([x-5,y-4,x-12,y-10],fill=0,width=2)
    if kind=="phone": return photo_phone(w,h)
    t=soft(w,h,w*.5,h*.5,w*.35,lo=80)
    return duo(k,t,RED)

def still2():
    im=wall(0.6); d=ImageDraw.Draw(im)
    for kind,x in (("dog",50),("rats",360),("phone",670),("amb",980)):
        frame(im,(x,40,x+250,270),icon(kind,198,178),lit=False)
    frame(im,(380,330,900,660),photo_run(468,278),lit=True)
    frame(im,(960,360,1230,620),icon("truck",218,208),lit=False)
    frame(im,(50,360,320,620),Image.new("RGB",(218,208),(200,190,170)),lit=False)
    # the truck has just driven out of the left frame, past hers, into the right one
    for i in range(7): d.line([960-i*6,450+i*16,1000,450+i*16],fill=(236,120,100),width=3)
    for i in range(7): d.line([270,450+i*16,330+i*6,450+i*16],fill=(236,120,100),width=3)
    return im

def still3():
    im=wall(0.22); d=ImageDraw.Draw(im)
    for x in (60,1000): frame(im,(x,170,x+220,470),Image.new("RGB",(168,248),(40,30,30)),lit=False)
    emp=duo(canvas(388,388),soft(388,388,194,194,150,lo=130),MUST)
    frame(im,(420,70,860,500),emp,lit=True,plaque="THE RESCUE")
    # light spill on the floor and her long shadow
    spill=Image.new("L",(W,H),0); sd=ImageDraw.Draw(spill); sd.polygon([(430,610),(850,610),(1100,H),(180,H)],fill=120)
    im.paste((240,200,140),mask=spill.filter(ImageFilter.GaussianBlur(30)))
    sh=Image.new("L",(W,H),0); woman(ImageDraw.Draw(sh),900,H-8,200,stride=0.2,fill=255)
    sh=sh.transform((W,H),Image.AFFINE,(1,0.9,-630,0,1.6,-430)).filter(ImageFilter.GaussianBlur(4))
    im.paste((30,14,12),mask=sh.point(lambda v:int(v*0.7)))
    f=Image.new("L",(W,H),0); woman(ImageDraw.Draw(f),900,H-20,230,stride=0.5,fill=255)
    im.paste(INK,mask=f)
    return im

out=sys.argv[1]
for n,fn in ((1,still1),(2,still2),(3,still3)):
    fn().save(f"{out}/nocr_look_still{n}.png")

/* ---- palette: sampled live from Base Rooms (see ART_BIBLE.md) ---- */
const P={grass:'#A5C88A',grassHi:'#C5DAAB',grassDk:'#8CA97A',grassSh:'#659274',foliage:'#2F6E4C',foliageDk:'#295444',
pcb:'#356B4E',path:'#E0D6BF',stone:'#BDB4A6',wood:'#7A5A3E',woodDk:'#58493D',woodHi:'#8F6640',
gold:'#E3C67E',goldDk:'#A0854D',blue:'#3D74F0',blueHi:'#6F96ED',blueDk:'#3358B6',white:'#EEEBE4',
ink:'#223239',red:'#EF3E3E',orange:'#FF7A1A',green:'#00B875',desk:'#F5F4EF',gr:'#DDE6F5',
panel:'#EFEEE9',border:'#D0D0D0',bar:'#F7F7F4',tbar:'#2F6DF6',menu:'#F2F1EC',grey:'#5C6470'};
/* ---- layout, logical pixels ---- */
const W=480,H=300;
const WX=6,WY=6,WW=468,WH=288;
const CELL=16,COLS=16,ROWS=10,BX=114,BY=52;
const BW=COLS*CELL,BH=ROWS*CELL;
const BINX=8,BINY=36,BINW=96;
const PANX=380,PANW=92,PANY=36;
const SBY=268;
const cv=document.getElementById('c');
cv.width=W;cv.height=H;
cv.style.width='100%';cv.style.height='auto';
const g=cv.getContext('2d');
g.imageSmoothingEnabled=false;
function r(x,y,w,h,c){g.fillStyle=c;g.fillRect(x|0,y|0,Math.max(0,w|0),Math.max(0,h|0));}
function box(x,y,w,h,c,o){r(x,y,w,h,c);g.strokeStyle=o||P.ink;g.lineWidth=1;g.strokeRect(x+.5,y+.5,w-1,h-1);}
function ink(x,y,w,h,c){g.fillStyle=c;g.fillRect(x|0,y|0,w|0,h|0);}
/* ---- 5x7 bitmap text ---- */
function ptext(x,y,s,c,sc){
  sc=sc||1;c=c||P.ink;s=(''+s).toUpperCase();
  g.fillStyle=c;
  for(let i=0;i<s.length;i++){
    const d=FONT[s[i]]||FONT['?']||FONT[' '];
    for(let ry=0;ry<GH;ry++)for(let rx=0;rx<GW;rx++){
      if(d[ry*GW+rx]==='#'){
        g.fillRect(x+(i*(GW+GAP)+rx)*sc,y+ry*sc,sc,sc);
      }
    }
  }
}
function tw(s){return (''+s).length*(GW+GAP)-GAP;}
function ptextc(x,y,w,s,c,sc){ptext(x+((w-tw(s)*1)>>1),y,s,c,sc);}
/* ---- doodads ---- */
function grassPatch(x,y,w,h,seed){
  r(x,y,w,h,P.grass);
  let s=seed||7;
  const rnd=()=>((s=(s*1103515245+12345)&0x7fffffff)/0x7fffffff);
  for(let i=0;i<w*h/26;i++){
    const px=x+rnd()*w|0,py=y+rnd()*h|0;
    r(px,py,1,1,rnd()<.55?P.grassHi:P.grassDk);
  }
}

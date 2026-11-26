/* ---- renderer ---- */
const BTNS=[];
function btn(id,x,y,w,h,c,label,tc){
  BTNS.push({id:id,x:x,y:y,w:w,h:h});
  const fill=(c==='tbar')?P.tbar:(P[c]||c);
  const edge=(c==='tbar')?P.blueDk:(P[c+'Dk']||P.border);
  box(x,y,w,h,fill,edge);
  if(label)ptextc(x,y+((h-GH)>>1),w,label,tc==='ink'?P.ink:(tc?P[tc]:P.white));
}
function wrap(s,n){const out=[];let cur='';for(const w of (''+s).split(' ')){if((cur+' '+w).trim().length>n){out.push(cur.trim());cur=w;}else cur+=' '+w;}if(cur.trim())out.push(cur.trim());return out;}
function drawPart(x,y,t,rot,powered){
  const px=x+2,py=y+2,S=12;
  const c=P[PCOL[t]]||P.stone;
  if(t==='BLOCK'){r(x+1,y+1,14,14,P.woodDk);r(x+3,y+3,10,10,P.wood);r(x+4,y+4,3,3,P.woodHi);return;}
  if(t==='SRC'){r(px,py,S,S,P.goldDk);r(px+1,py+1,S-2,S-2,P.gold);r(px+4,py+4,4,4,P.ink);r(px+8,py-1,2,3,P.red);return;}
  if(t==='SENSOR'){r(px,py,S,S,P.blueDk);r(px+1,py+1,S-2,S-2,P.blue);r(px+3,py+3,6,6,P.white);r(px+4,py+4,4,4,powered?P.green:P.ink);return;}
  r(px,py,S,S,P.ink);r(px+1,py+1,S-2,S-2,c);
  const pi=piece(t,rot);
  if(t==='WIRE'){r(px+4,py+4,4,4,P.white);}
  else if(t==='SPLIT'){r(px+4,py+4,4,4,P.ink);r(px+5,py+5,2,2,P.white);}
  else if(t==='RES'){r(px+2,py+5,8,2,P.ink);r(px+3,py+3,2,2,P.ink);r(px+7,py+7,2,2,P.ink);}
  else if(t==='FUSE'){r(px+2,py+5,3,2,P.ink);r(px+7,py+5,3,2,P.ink);r(px+5,py+3,2,6,P.white);}
  else if(t==='RELAY'){r(px+2,py+5,8,2,P.ink);r(px+4,py+2,4,2,P.white);}
  for(const d in pi.pins){
    const on=powered&&(powered&BIT[d]);
    const cc=on?P.white:P.ink;
    if(d==='W')r(x-1,y+7,3,2,cc);
    if(d==='E')r(x+14,y+7,3,2,cc);
    if(d==='N')r(x+7,y-1,2,3,cc);
    if(d==='S')r(x+7,y+14,2,3,cc);
  }
}
function buddy(x,y,body,arm){
  r(x+1,y+20,16,4,P.grassSh);
  r(x+4,y+2,10,11,P.ink);r(x+5,y+3,8,9,P[body]);
  r(x+6,y+5,6,6,P.white);r(x+7,y+6,1,2,P.ink);r(x+10,y+6,1,2,P.ink);r(x+8,y+9,3,1,P.ink);
  r(x+8,y,1,2,P.ink);r(x+8,y-1,1,1,P.gold);
  r(x+4,y+13,10,2,P.ink);r(x+5,y+15,8,5,P[body]);r(x+6,y+15,6,1,P.blueHi);
  r(x+3,y+16,1,3,P.ink);r(x+14,y+16,1,3,P.ink);
  if(arm)r(x+15,y+13,3,1,P.ink);
}
function render(){
  BTNS.length=0;
  r(0,0,W,H,P.desk);
  for(let x=0;x<W;x+=12)r(x,0,1,H,P.gr);
  for(let y=0;y<H;y+=12)r(0,y,W,1,P.gr);
  r(WX+3,WY+3,WW,WH,P.grassSh);
  box(WX,WY,WW,WH,P.white,P.border);
  const solved=last&&last.solved;
  r(WX+1,WY+1,WW-2,14,solved?P.gold:P.menu);
  r(WX+1,WY+15,WW-2,12,P.menu);
  ptext(WX+5,WY+5,'BUS.EXE  C:/BRTC/GAMES',P.ink);
  for(let i=0;i<3;i++){const bx=WX+WW-17-i*13;box(bx,WY+4,10,9,i===2?P.red:(i===0?P.green:P.panel),P.border);}
  ptext(WX+5,WY+18,'FILE   EDIT   RUN   HELP',P.ink);
  ptext(WX+200,WY+18,'TEST MODE  NO WALLET',P.grey);
  ptext(WX+WW-92,WY+18,'SOLVED '+Object.keys(store.solved||{}).length+'/8',P.green);
  /* parts bin */
  r(BINX,BINY,BINW,WH-42,P.panel);r(BINX+BINW,BINY,1,WH-42,P.border);
  ptext(BINX+4,BINY+4,'PARTS BIN',P.ink);
  PLACEABLE.forEach((t,i)=>{
    const by=BINY+18+i*24,on=(sel===t),left=remaining(t);
    if(on)box(BINX+2,by-2,BINW-4,22,P.gold,P.goldDk);
    drawPart(BINX+6,by,t,0,0);
    ptext(BINX+24,by+4,NAMES[t],left?P.ink:P.grey);
    ptext(BINX+BINW-20,by+4,'X'+(left<0?0:left),left?P.wood:P.grey);
  });
  ptext(BINX+4,BINY+146,'ROTATION',P.grey);ptext(BINX+4,BINY+156,'R KEY',P.ink);
  ptext(BINX+4,BINY+176,'PARTS USED',P.grey);ptext(BINX+4,BINY+186,''+mine.length+' / PAR '+par(),P.ink);
  /* board */
  grassPatch(BX-6,BY-6,BW+12,BH+12,11);
  const bd=gridNow(),res=(last&&last.res)?last.res:evaluate(bd);
  const pw=(res&&res.mask)?res.mask:null;
  for(let y=0;y<ROWS;y++)for(let x=0;x<COLS;x++){
    const cx=BX+x*CELL,cy=BY+y*CELL;
    if((x+y)%2)r(cx,cy,CELL,CELL,'rgba(0,0,0,0.03)');
    r(cx,cy,1,1,P.grassSh);
    const c=bd[y][x];
    if(!c&&showPar&&puzzle().sol.some(m=>m[1]===x&&m[2]===y))r(cx+6,cy+6,4,4,P.goldDk);
    if(c)drawPart(cx,cy,c.t,c.rot||0,pw?pw[y][x]:0);
  }
  /* bench strip */
  r(BX-6,BY+BH+6,BW+12,40,P.grass);
  r(BX+4,BY+BH+22,120,7,P.woodDk);r(BX+6,BY+BH+24,116,3,P.wood);
  buddy(BX+12,BY+BH+2,'blue',1);buddy(BX+40,BY+BH+4,'gold',0);
  ptext(BX+70,BY+BH+14,puzzle().name,P.ink);
  const lit=(res&&res.lit)||0,sen=(res&&res.sensors)||0;
  ptext(BX+70,BY+BH+26,'SENSORS '+lit+'/'+sen+(last&&last.solved?'  - SOLVED':'') ,last&&last.solved?P.green:P.wood);
  /* panel */
  r(PANX,PANY,PANW,WH-42,P.panel);r(PANX-1,PANY,1,WH-42,P.border);
  const statTop=SBY-58;
  let tm=null,bh=0;
  for(const wdt of [14,18,24,32]){
    const t=wrap(puzzle().teach,wdt), h=18+t.length*9;
    if(144+h<=statTop){tm=t;bh=h;break;}
  }
  if(!tm){const t=wrap(puzzle().teach,32);const n=Math.max(1,((statTop-162)/9)|0);tm=t.slice(0,n);bh=18+tm.length*9;}
  const partsTop=PANY+4+bh+6;
  box(PANX+4,PANY+4,PANW-8,bh,P.white,P.border);
  ptext(PANX+8,PANY+8,'GOAL',P.ink);
  tm.forEach((line,i)=>ptext(PANX+8,PANY+20+i*9,line,P.wood));
  let yy=partsTop;
  box(PANX+4,yy,PANW-8,26,P.white,P.border);
  ptext(PANX+8,yy+6,'PARTS '+mine.length,P.ink);
  r(PANX+8,yy+16,PANW-24,6,P.panel);
  const frac=Math.min(1,par()/Math.max(1,mine.length));
  r(PANX+8,yy+16,Math.max(2,(PANW-24)*frac|0),6,frac>=1?P.green:P.goldDk);
  yy+=34;
  btn('run',PANX+4,yy,PANW-8,22,'tbar','RUN');
  yy+=26;
  btn('hint',PANX+4,yy,(PANW-8)/2-2,18,'gold','HINT','ink');
  btn('next',PANX+4+(PANW-8)/2+2,yy,(PANW-8)/2-2,18,'panel','NEXT','ink');
  yy+=22;
  btn('reset',PANX+4,yy,PANW-8,16,'panel','CLEAR BOARD','ink');
  ptext(PANX+6,statTop,'XP '+xp,P.ink);
  ptext(PANX+6,statTop+12,'PAR '+par()+' PARTS',P.wood);
  ptext(PANX+6,statTop+24,'BENCH '+(idx+1)+' OF 8',P.wood);
  ptext(PANX+6,statTop+36,'CARE CAP 24',P.grey);
  ptext(PANX+6,statTop+48,'XP PER DAY',P.grey);
  /* status */
  r(WX+2,SBY,WW-4,22,P.panel);r(WX+2,SBY,WW-4,1,P.border);
  const line=last?last.msg:'CLICK A PART, THEN CLICK THE GRID. PRESS RUN.';
  ptext(WX+8,SBY+4,line.slice(0,74),last&&last.solved?P.green:P.ink);
  ptext(WX+8,SBY+13,sel?('HOLDING '+NAMES[sel]+' ROT '+rotSel*90+' DEG'):'NOTHING IN HAND',P.grey);
}

/* ---- input ---- */
function toLocal(ev){
  const b=cv.getBoundingClientRect();
  return {x:Math.floor((ev.clientX-b.left)*(W/b.width)),y:Math.floor((ev.clientY-b.top)*(H/b.height))};
}
function act(id){
  if(id==='run'){last=null;runRound();}
  else if(id==='hint')useHint();
  else if(id==='next')loadPuzzle(idx+1);
  else if(id==='reset'){mine=[];last=null;runRound(true);}
  render();
}
cv.addEventListener('contextmenu',e=>e.preventDefault());
cv.addEventListener('pointerdown',ev=>{
  const p=toLocal(ev);
  for(const b of BTNS)if(p.x>=b.x&&p.x<b.x+b.w&&p.y>=b.y&&p.y<b.y+b.h){act(b.id);return;}
  for(let i=0;i<PLACEABLE.length;i++){
    const by=BINY+18+i*24;
    if(p.x>=BINX&&p.x<BINX+BINW&&p.y>=by-2&&p.y<by+20){sel=PLACEABLE[i];rotSel=0;last=null;render();return;}
  }
  if(p.x>=BX&&p.x<BX+BW&&p.y>=BY&&p.y<BY+BH){
    const cx=Math.floor((p.x-BX)/CELL),cy=Math.floor((p.y-BY)/CELL);
    const i=mine.findIndex(m=>m[1]===cx&&m[2]===cy);
    if(i>=0&&(ev.button===2||!sel)){mine.splice(i,1);last=null;runRound();}
    else placeAt(cx,cy);
    render();return;
  }
  render();
});
window.addEventListener('keydown',e=>{
  const k=(e.key||'').toLowerCase();
  if(k==='r'){rotSel=(rotSel+1)%4;last=null;render();}
  else if(k==='enter'){act('run');}
  else if(k==='h'){act('hint');}
  else if(k==='n'){act('next');}
  else if(k==='c'){act('reset');}
});
/* ---- init ---- */
function fit(){
  const wrap=document.getElementById('wrap');
  const avail=Math.min((wrap&&wrap.clientWidth)||W, 960);
  const s=Math.max(1, Math.floor(avail/W));
  cv.style.width=(W*s)+'px';
  cv.style.height=(H*s)+'px';
}
window.addEventListener('resize',fit);
fit();
loadPuzzle(0);
render();

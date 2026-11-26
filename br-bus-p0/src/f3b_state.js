/* ---- bench state ---- */
let idx=0,mine=[],sel='WIRE',rotSel=0,last=null,hint=false,xp=0,showPar=false,flash=0;
const SAVE='busexe.bench.p0';
let store={xp:0,solved:{}};
try{const s=localStorage.getItem(SAVE);if(s)store=JSON.parse(s);}catch(e){}
xp=store.xp||0;
function save(){try{localStorage.setItem(SAVE,JSON.stringify(store));}catch(e){}}
function puzzle(){return PUZZLES[idx];}
function par(){return PUZZLES[idx].sol.length;}
function loadPuzzle(i){
  idx=((i%PUZZLES.length)+PUZZLES.length)%PUZZLES.length;
  mine=[];last=null;hint=false;showPar=false;flash=0;
  runRound(true);
}
function gridNow(){
  const bd=emptyGrid(),p=puzzle();
  for(const f of p.fixed)bd[f[2]][f[1]]={t:f[0],rot:f[3]||0,fixed:true};
  for(const m of mine)if(!bd[m[2]][m[1]])bd[m[2]][m[1]]={t:m[0],rot:m[3]||0,mine:true};
  return bd;
}
function remaining(t){let n=puzzle().bin[t]||0;for(const m of mine)if(m[0]===t)n--;return n;}
function msg(s){last={msg:s,res:null,solved:false,par:par(),gained:0};}
function placeAt(cx,cy){
  const p=puzzle();
  for(const f of p.fixed)if(f[1]===cx&&f[2]===cy)return msg('THAT CELL IS PART OF THE BOARD');
  const ex=mine.findIndex(m=>m[1]===cx&&m[2]===cy);
  if(ex>=0){mine.splice(ex,1);return runRound();}
  if(!sel)return msg('PICK A PART FROM THE BIN');
  if(remaining(sel)<=0)return msg('OUT OF '+NAMES[sel]+' - CLICK A PLACED ONE TO REMOVE');
  mine.push([sel,cx,cy,rotSel]);
  runRound();
}
function cycles(){
  const bd=gridNow(),res=evaluate(bd),p=puzzle();
  let m='';
  if(res.blown.length)m='FUSE AT '+res.blown[0][0]+','+res.blown[0][1]+' BLEW - DOUBLE FEED. FEED IT FROM ONE SIDE';
  else if(res.reversed.length)m='RESISTOR AT '+res.reversed[0][0]+','+res.reversed[0][1]+' REVERSED - PRESS R';
  else if(res.noCtl.length)m='RELAY AT '+res.noCtl[0][0]+','+res.noCtl[0][1]+' OPEN - NO CONTROL INPUT';
  else if(res.sensors>0&&res.lit>=res.sensors)m='ALL '+res.sensors+' SENSORS LIT - BOARD SOLVED';
  else if(res.powered<=1)m='NO CURRENT LEAVING THE SOURCE';
  else m='POWERED '+res.powered+' CELLS - '+res.lit+'/'+res.sensors+' SENSORS LIT';
  if(c.solved===false&&res.blown.length>0&&res.lit>=res.sensors)m+=' - NOT COUNTED: FUSE BLOWN';
  return {res:res,text:m,solved:(res.sensors>0&&res.lit>=res.sensors&&res.blown.length===0)};
}
function stars(){const d=Math.max(0,mine.length-par());return d===0?3:d<=2?2:1;}
function runRound(quiet){
  const c=cycles(),p=puzzle();let gained=0,txt=c.text;
  if(c.solved&&!quiet){
    const st=stars();
    gained=Math.min(mine.length,24)+(10+5*st);
    if(!hint)gained=Math.round(gained*1.5);
    const key='p'+idx;
    if(store.solved[key]){gained=Math.max(1,Math.round(gained*0.25));txt+=' - REPEAT: 25% XP';}
    else if(mine.length===p.sol.length&&!hint)txt+=' - PAR EXACT, NO HINT: 1.5X';
    else if(hint)txt+=' - HINT USED';
    store.solved[key]=1;store.xp=(store.xp||0)+gained;xp=store.xp;save();
    txt+=' +'+gained+' XP';flash=Date.now();
  }
  last={msg:txt,res:c.res,solved:c.solved,par:p.sol.length,gained:gained};
  return last;
}
function useHint(){hint=true;showPar=true;last=null;}

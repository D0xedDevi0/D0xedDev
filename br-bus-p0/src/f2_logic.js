//<LOGIC>
/* ---- circuit model. deterministic: same board in => same verdict out, no RNG ---- */
const NV={W:[-1,0],E:[1,0],N:[0,-1],S:[0,1]};
const OPP={W:'E',E:'W',N:'S',S:'N'};
const CW={N:'E',E:'S',S:'W',W:'N'};
const BIT={W:1,E:2,N:4,S:8};
const BASE={WIRE:['W','E','N','S'],SPLIT:['W','E','S'],RES:['W','E'],FUSE:['W','E'],RELAY:['W','E','N'],SENSOR:['W','E','N','S'],SRC:['E'],BLOCK:[]};
const PLACEABLE=['WIRE','SPLIT','RES','FUSE','RELAY'];
const NAMES={WIRE:'WIRE',SPLIT:'SPLITTER',RES:'RESISTOR',FUSE:'FUSE',RELAY:'RELAY',SENSOR:'SENSOR',SRC:'SOURCE',BLOCK:'ROCK'};
const PCOL={WIRE:'stone',SPLIT:'orange',RES:'gold',FUSE:'red',RELAY:'green',SENSOR:'blue',SRC:'gold',BLOCK:'woodDk'};
function piece(t,rot){
  rot=(((rot|0)%4)+4)%4;
  const order=[],pins={};
  for(const d of (BASE[t]||[])){let q=d;for(let i=0;i<rot;i++)q=CW[q];order.push(q);pins[q]=1;}
  return {order:order,pins:pins};
}
function emptyGrid(){const bd=[];for(let y=0;y<ROWS;y++)bd.push(new Array(COLS).fill(null));return bd;}
function cellAt(bd,x,y){return (x>=0&&y>=0&&x<COLS&&y<ROWS)?bd[y][x]:null;}
/* monotone relaxation. kind: 0=conduct, 1=RESISTOR (one way), 2=RELAY (needs control) */
function fixpoint(bd,pieces,fuse){
  const mask=[];for(let y=0;y<ROWS;y++)mask.push(new Array(COLS).fill(0));
  const ext=[];
  for(let y=0;y<ROWS;y++){ext.push(new Array(COLS).fill(null));}
  const cap=ROWS*COLS+16;
  for(let pass=0;pass<cap;pass++){
    let changed=false;
    for(let y=0;y<ROWS;y++)for(let x=0;x<COLS;x++){
      const c=bd[y][x],pi=pieces[y][x];if(!pi){ext[y][x]=null;continue;}
      const ex=[];
      for(const d in pi.pins){
        const nx=x+NV[d][0],ny=y+NV[d][1],n=cellAt(bd,nx,ny);
        if(!n||!n.t||n.t==='BLOCK')continue;
        const np=pieces[ny][nx];
        if(!np||!np.pins[OPP[d]])continue;
        if(mask[ny][nx]&BIT[OPP[d]])ex.push(d);
      }
      ext[y][x]=ex;
      const o=pi.order,t=c.t;let add=0;
      if(t==='SRC')add|=BIT[o[0]];
      else if(t==='WIRE'||t==='SPLIT'){if(ex.length)for(const d in pi.pins)add|=BIT[d];}
      else if(t==='SENSOR'){if(ex.length)add|=BIT[ex[0]];}
      else if(t==='RES'){if(ex.indexOf(o[0])>=0)add|=BIT[o[1]];}
      else if(t==='FUSE'){const st=fuse[y+','+x];if(st===1&&ex.indexOf(o[0])>=0)add|=BIT[o[1]];else if(st===-1&&ex.indexOf(o[1])>=0)add|=BIT[o[0]];}
      else if(t==='RELAY'){if(ex.indexOf(o[0])>=0&&ex.indexOf(o[2])>=0)add|=BIT[o[1]];}
      if((mask[y][x]|add)!==mask[y][x]){mask[y][x]|=add;changed=true;}
    }
    if(!changed)break;
  }
  return {mask:mask,ext:ext};
}
/* evaluate(bd) -> {mask,lit,sensors,powered,blown,reversed,noCtl} */
function evaluate(bd){
  const pieces=[],fuse={},blown=[],reversed=[],noCtl=[];
  for(let y=0;y<ROWS;y++){pieces.push([]);for(let x=0;x<COLS;x++){const c=bd[y][x];pieces[y].push((c&&c.t&&c.t!=='BLOCK')?piece(c.t,c.rot):null);}}
  /* pass 1: fuses do not conduct. any side powered now is powered from OUTSIDE the fuse */
  const pre=fixpoint(bd,pieces,{});
  for(let y=0;y<ROWS;y++)for(let x=0;x<COLS;x++){
    const c=bd[y][x];if(!c||c.t!=='FUSE')continue;
    const o=pieces[y][x].order,ex=pre.ext[y][x]||[];
    const a=ex.indexOf(o[0])>=0,b=ex.indexOf(o[1])>=0;
    if(a&&b){fuse[y+','+x]=0;blown.push([x,y]);}
    else if(a)fuse[y+','+x]=1;
    else if(b)fuse[y+','+x]=-1;
    else fuse[y+','+x]=0;
  }
  /* pass 2: a fuse that was fed from exactly one side now conducts that way */
  const fin=fixpoint(bd,pieces,fuse),mask=fin.mask;
  for(let y=0;y<ROWS;y++)for(let x=0;x<COLS;x++){
    const c=bd[y][x];if(!c||!c.t)continue;
    const pi=pieces[y][x];if(!pi)continue;
    const ex=fin.ext[y][x]||[],o=pi.order;
    if(c.t==='RES'&&ex.indexOf(o[1])>=0&&ex.indexOf(o[0])<0)reversed.push([x,y]);
    if(c.t==='RELAY'&&ex.indexOf(o[0])>=0&&ex.indexOf(o[2])<0)noCtl.push([x,y]);
  }
  let sensors=0,lit=0,powered=0;
  for(let y=0;y<ROWS;y++)for(let x=0;x<COLS;x++){
    const c=bd[y][x];if(!c||!c.t)continue;
    if(mask[y][x])powered++;
    if(c.t==='SENSOR'){sensors++;if(mask[y][x])lit++;}
  }
  return {mask:mask,lit:lit,sensors:sensors,powered:powered,blown:blown,reversed:reversed,noCtl:noCtl};
}
//</LOGIC>

/* ---- selftest: every authored solution must solve, inside its bin ---- */
function selftest(){
  const out=[];
  for(let i=0;i<PUZZLES.length;i++){
    const p=PUZZLES[i];
    const bd=emptyGrid();
    for(const f of p.fixed)bd[f[2]][f[1]]={t:f[0],rot:f[3]||0,fixed:true};
    for(const m of p.sol)bd[m[2]][m[1]]={t:m[0],rot:m[3]||0,mine:true};
    const res=evaluate(bd);
    const used={};for(const m of p.sol)used[m[0]]=(used[m[0]]||0)+1;
    const over=[];for(const k in used)if(used[k]>(p.bin[k]||0))over.push(k+':'+used[k]+'>'+(p.bin[k]||0));
    const dup=[];const seen={};
    for(const m of p.sol){const k=m[1]+','+m[2];if(seen[k])dup.push(k);seen[k]=1;}
    const ok=(res.sensors>0&&res.lit>=res.sensors)&&over.length===0&&dup.length===0;
    out.push({i:i+1,name:p.name,par:p.sol.length,lit:res.lit,sensors:res.sensors,powered:res.powered,blown:res.blown.length,over:over,dup:dup,ok:ok});
  }
  return out;
}

/* harness: runs the SHIPPED logic (f2 + f3a + f5a) under node */
const R=selftest();
R.forEach(r=>console.log((r.ok?'OK  ':'FAIL')+' bench '+r.i+' '+r.name.padEnd(26)+' parts='+String(r.par).padStart(2)+'  lit='+r.lit+'/'+r.sensors+'  powered='+String(r.powered).padStart(3)+'  blown='+r.blown+(r.over.length?'  OVER-BIN='+r.over.join(','):'')+(r.dup.length?'  DUPCELL='+r.dup.join(','):'')));
console.log(R.every(x=>x.ok)?'RESULT: ALL 8 AUTHORED SOLUTIONS SOLVE':'RESULT: FAILURES PRESENT');
const DIRS=[['E',1,0],['S',0,1],['W',-1,0],['N',0,-1]];
function bfsMin(p){
  const off=new Set();
  p.fixed.forEach(f=>{if(f[0]==='BLOCK'||f[0]==='SENSOR'||f[0]==='SRC')off.add(f[1]+','+f[2]);});
  const src=p.fixed.find(f=>f[0]==='SRC'),sen=p.fixed.find(f=>f[0]==='SENSOR');
  const [dd,dx,dy]=DIRS[src[3]];
  const sx=src[1]+dx,sy=src[2]+dy;
  const q=[[sx,sy]],dist={};
  dist[sx+','+sy]=1;
  while(q.length){
    const [x,y]=q.shift(),d=dist[x+','+y];
    if(DIRS.some(a=>sen[1]===x+a[1]&&sen[2]===y+a[2]))return d;
    for(const a of DIRS){
      const nx=x+a[1],ny=y+a[2];
      if(nx<0||ny<0||nx>=COLS||ny>=ROWS)continue;
      const k=nx+','+ny;
      if(off.has(k)||dist[k])continue;
      dist[k]=d+1;q.push([nx,ny]);
    }
  }
  return -1;
}
console.log('\nsingle-path optimality check (BFS, unit cost per part):');
[0,1,2,3].forEach(i=>{
  const p=PUZZLES[i],m=bfsMin(p);
  console.log('  bench '+(i+1)+' '+p.name.padEnd(26)+' authored par='+p.sol.length+'  bfs min='+m+'  '+(m===p.sol.length?'MINIMAL (proven)':'MISMATCH'));
});
console.log('\nbenches 5-8 are multi-branch (splitter/relay trees) - pars are authored and verified solvable, minimality not proven.');

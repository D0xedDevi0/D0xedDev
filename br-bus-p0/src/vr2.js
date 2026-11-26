/* negative tests: a wrong board must FAIL, with the right diagnostic */
const ROWS=10,COLS=16,CELL=16;/*injected before f2 in the real run*/
function build(p,sol){
  const bd=emptyGrid();
  for(const f of p.fixed)bd[f[2]][f[1]]={t:f[0],rot:f[3]||0,fixed:true};
  for(const m of sol){if(bd[m[2]][m[1]])continue;bd[m[2]][m[1]]={t:m[0],rot:m[3]||0,mine:true};}
  return bd;
}
function variant(i,mut){const p=PUZZLES[i];const s=p.sol.map(a=>a.slice());mut(s);return evaluate(build(p,s));}
const T=[];
T.push(['bench 3 resistor turned around (the point of the puzzle)',
  ()=>{const r=variant(2,s=>{s[s.findIndex(m=>m[0]==='RES')][3]=2;});return {lit:r.lit,rev:r.reversed.length};},r=>r.lit===0&&r.rev>0]);
T.push(['bench 6 wire wrapped around the fuse (fuse is bypassed, so it blows)',
  ()=>{const r=variant(5,s=>{s[s.findIndex(m=>m[0]==='FUSE')][3]=0;s.push(['WIRE',4,3,0]);s.push(['WIRE',5,3,0]);});return {lit:r.lit,blown:r.blown.length,why:'fuse destroyed, current still reaches the sensor the other way'};},r=>r.blown>0]);
T.push(['bench 7 relay control line cut (no second feed)',
  ()=>{const p=PUZZLES[6];const s=p.sol.filter(m=>!(m[1]===8&&(m[2]===2||m[2]===3)));const r=evaluate(build(p,s));return {lit:r.lit,nc:r.noCtl.length};},r=>r.lit===0&&r.nc>0]);
T.push(['bench 5 splitter left at 0 deg (feeds east, not north+south)',
  ()=>{const r=variant(4,s=>{s[s.findIndex(m=>m[0]==='SPLIT')][3]=0;});return {lit:r.lit};},r=>r.lit<2]);
T.push(['bench 1 one wire pulled out (open circuit)',
  ()=>{const p=PUZZLES[0];const s=p.sol.filter((m,i)=>i!==4);const r=evaluate(build(p,s));return {lit:r.lit};},r=>r.lit===0]);
T.push(['bench 8 control line cut (relay holds the south sensor dark)',
  ()=>{const p=PUZZLES[7];const s=p.sol.filter(m=>!(m[1]===11&&m[2]===3));const r=evaluate(build(p,s));return {lit:r.lit,sen:r.sensors,nc:r.noCtl.length};},r=>r.lit<2&&r.nc>0]);
let pass=0;
for(const [name,fn,check] of T){
  const got=fn(),ok=check(got);if(ok)pass++;
  console.log((ok?'OK  ':'FAIL')+' '+name+'\n        -> '+JSON.stringify(got));
}
console.log('\nRESULT: '+pass+'/'+T.length+' negative cases behave correctly');

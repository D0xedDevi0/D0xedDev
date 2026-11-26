import json, re
src = open('/opt/data/projects/br-bus/mock/m0.py').read()
ns = {}
exec(src, ns)
F = ns['FONT']
order = [chr(c) for c in range(65, 91)] + [str(d) for d in range(10)] + [' ', '.', ',', ':', '-', '/', '%', '$', '+', '>', '(', ')', '!', '#', '=', 'X', 'Z', 'Y']
seen, keys = set(), []
for k in order:
    if k in F and k not in seen:
        seen.add(k); keys.append(k)
data = []
for k in keys:
    rows = list(F[k])
    assert len(rows) == 7, k
    for r in rows:
        assert len(r) == 5, (k, r)
    data.append(''.join(rows))
assert all(len(d) == 35 for d in data)
js = []
js.append('/* 5x7 uppercase bitmap font - hand-built, no TTF, no anti-aliasing */')
js.append('const KEY=' + json.dumps(''.join(keys)) + ';')
js.append('const DATA=' + json.dumps(''.join(data)) + ';')
js.append('const FONT={};')
js.append('for(let i=0;i<KEY.length;i++)FONT[KEY[i]]=DATA.substr(i*35,35);')
js.append('const GW=5,GH=7,GAP=1;')
open('/opt/data/projects/br-bus/p0/f0_font.js', 'w').write('\n'.join(js) + '\n')
print('glyphs', len(keys), 'bytes', len('\n'.join(js)))
print('charset', ''.join(keys))

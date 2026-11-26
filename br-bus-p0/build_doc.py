#!/usr/bin/env python3
"""Assemble HANDOVER_*.md parts -> HANDOVER_TO_SLAVA.md + HANDOVER.html (self-contained).
Run after editing any part: python3 build_doc.py"""
import re, collections

PARTS = ['HANDOVER_1.md','HANDOVER_2a.md','HANDOVER_2b.md','HANDOVER_2c.md',
         'HANDOVER_3a.md','HANDOVER_3b.md','HANDOVER_3c.md']
CSS = """html,body{margin:0;background:#223239;color:#DADEDC}
.w{max-width:820px;margin:0 auto;padding:26px 18px 60px}
body{font:16px/1.62 -apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Helvetica,Arial,sans-serif}
h1{color:#EFEEEA;font:700 26px/1.25 ui-monospace,SFMono-Regular,Menlo,monospace;margin:0 0 6px}
h2{color:#E3C67E;font:700 20px/1.3 ui-monospace,Menlo,monospace;margin:34px 0 10px;border-bottom:1px solid #3a4d55;padding-bottom:6px}
h3{color:#8FC7DE;font:700 17px/1.3 ui-monospace,Menlo,monospace;margin:24px 0 8px}
a{color:#5FC8E8}
strong{color:#EFEEEA}
code{background:#1b282d;color:#BEE3C0;padding:2px 5px;border-radius:3px;font:13px ui-monospace,Menlo,monospace}
pre{background:#1b282d;border-left:3px solid #E3C67E;padding:12px 14px;overflow-x:auto;border-radius:4px}
pre code{background:none;padding:0;color:#CFE6D2;font-size:12.5px}
table{border-collapse:collapse;width:100%;margin:14px 0;font-size:14px}
th,td{border:1px solid #3a4d55;padding:7px 9px;text-align:left;vertical-align:top}
th{background:#1b282d;color:#E3C67E;font:700 13px ui-monospace,Menlo,monospace}
blockquote{border-left:3px solid #5FC8E8;margin:14px 0;padding:2px 14px;color:#AFC3C9}
ul,ol{padding-left:22px}li{margin:5px 0}
hr{border:0;border-top:1px solid #3a4d55;margin:30px 0}
.f{color:#7E939A;font:12px ui-monospace,Menlo,monospace;margin-top:36px}"""

doc = '\n\n'.join(open(p).read().strip() for p in PARTS) + '\n'
open('HANDOVER_TO_SLAVA.md','w').write(doc)
secs = [l for l in doc.split('\n') if l.startswith('## ')]
dups = [s for s,c in collections.Counter(secs).items() if c > 1]
print(f'assembled {len(doc)} bytes / {doc.count(chr(10))+1} lines / {len(secs)} sections / dups: {dups or "none"}')

try:
    import markdown
except ImportError:
    print('no markdown lib -> md only'); raise SystemExit
body = markdown.markdown(doc, extensions=['tables','fenced_code','sane_lists'])
head = ('<!doctype html><html lang="en"><head><meta charset="utf-8">'
        '<meta name="viewport" content="width=device-width,initial-scale=1">'
        '<title>BUS.EXE BENCH - module handover for Base Rooms OS</title>'
        f'<style>{CSS}</style></head><body><div class="w">')
foot = ('<div class="f">BUS.EXE BENCH - module handover - D0xedDev @D0xedDevi0 - rev 26 Nov 2026</div>'
        '</div></body></html>')
open('HANDOVER.html','w').write(head+body+foot)
print(f'rendered HANDOVER.html, h2={body.count("<h2")}, tables={body.count("<table")}')

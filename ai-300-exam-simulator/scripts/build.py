#!/usr/bin/env python3
"""Builds the single-file app: src/template.html + data/*.json -> dist/index.html (and ./index.html with --root)."""
import json, pathlib, sys
root = pathlib.Path(__file__).resolve().parent.parent
def blob(name):
    data = json.loads((root / 'data' / name).read_text(encoding='utf-8'))  # fails early on invalid JSON
    return json.dumps(data, ensure_ascii=False).replace('</', '<\\/')
html = (root / 'src' / 'template.html').read_text(encoding='utf-8')
assert '__DATA__' in html and '__SYN__' in html, 'placeholders missing in template'
html = html.replace('__DATA__', blob('questions.json')).replace('__SYN__', blob('synthetic.json'))
targets = [root / 'dist' / 'index.html'] + ([root / 'index.html'] if '--root' in sys.argv else [])
for t in targets:
    t.parent.mkdir(exist_ok=True); t.write_text(html, encoding='utf-8'); print('wrote', t.relative_to(root), len(html), 'bytes')

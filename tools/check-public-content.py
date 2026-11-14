#!/usr/bin/env python3
"""Read-only release-content checks. A Pandoc/Hugo build is still required."""
from pathlib import Path
import hashlib
import json
import re
import sys
import tomllib
try:
    import yaml
except ImportError:
    sys.exit('PyYAML required')

ROOT=Path.cwd()
KEYS={'colqyVale2025','colqyElian2024','colqyAster2026'}
EXPECTED_URLS={
 'content/sources/colqy-public-about/index.md':'/about/',
 'content/sources/colqy-public-field-atlas/index.md':'/field-atlas/',
 'content/sources/colqy-public-journal-observation/index.md':'/journal/field-walk/',
 'content/sources/colqy-public-journal-studio/index.md':'/journal/studio-fragments/',
 'content/sources/colqy-public-journal-undated/index.md':'/journal/undated/',
 'content/sources/colqy-public-mapping-relations/_index.md':'/mapping-relations/',
 'content/sources/colqy-public-markdown-guide/index.md':'/markdown/',
 'content/sources/colqy-public-material-protocols/index.md':'/material-protocols/',
 'content/sources/colqy-public-research-note/index.md':'/research-note/',
 'content/sources/colqy-public-teaching/index.md':'/teaching/',
 'content/indexes/colqy-public-journal/index.md':'/journal/',
 'content/indexes/colqy-public-practice/index.md':'/practice/',
 'content/indexes/colqy-public-research/index.md':'/research/',
}
errors=[]
def check(ok,msg):
    if not ok: errors.append(msg)
def fm(path):
    raw=(ROOT/path).read_text(encoding='utf-8')
    if not raw.startswith('---\n'):raise ValueError('Missing front matter: '+path)
    return yaml.safe_load(raw.split('---',2)[1]) or {},raw
try:
    config=tomllib.loads((ROOT/'hugo.toml').read_text())
    check(config['theme']=='colqy-spatial','Hugo default theme is not spatial')
    check(config['title']=='Mira Vale','Hugo site title is not Mira Vale')
    check('unsw.edu.au' not in (ROOT/'hugo.toml').read_text(),'Personal email remains in Hugo config')
    home,body=fm('content/_index.md')
    check(home['title']=='Mira Vale' and 'A practice in public' in body,'Mira Vale homepage not promoted')
    check(not (ROOT/'content/sources/colqy-public-landing/index.md').exists(),'Old landing still exists')
    for name,url in EXPECTED_URLS.items():
        meta,raw=fm(name)
        check(meta.get('url')==url,'Unexpected URL: '+name)
        check('/colqy-public-demo/' not in raw,'Old demo URL remains: '+name)
        check(meta.get('draft') is False,'Public source is draft: '+name)
    nav=yaml.safe_load((ROOT/'data/navigation.yaml').read_text())['main']
    check([(n['label'],n['url']) for n in nav]==[(a,b) for a,b in
      [('Home','/'),('Practice','/practice/'),('Research','/research/'),('Journal','/journal/'),('About','/about/')]],'Navigation mismatch')
    statuses=yaml.safe_load((ROOT/'data/global_statuses.yaml').read_text())['statuses']
    check(len(statuses)==1 and statuses[0]['appearance']=='neutral','Global announcement not neutral')
    refs=json.loads((ROOT/'data/references.json').read_text())
    check({r['id'] for r in refs}==KEYS and len(refs)==3,'Reference library not curated')
    check(all('_graph' not in r for r in refs),'Reference import provenance remains')
    idx=json.loads((ROOT/'static/admin/references-index.json').read_text())
    check(idx.get('source_sha256')==hashlib.sha256((ROOT/'data/references.json').read_bytes()).hexdigest(), 'Reference index stale')
    check({x['id'] for x in idx['entries']}==KEYS,'Reference index contains non-demo keys')
    check(yaml.safe_load((ROOT/'static/admin/config.yml').read_text())['backend']['repo']=='YOUR_ACCOUNT/YOUR_REPOSITORY','CMS not fork-safe')
    cap=yaml.safe_load((ROOT/'themes/colqy-spatial/colqy-capabilities.yaml').read_text())['capabilities']
    check(cap['index_gallery'] is False and cap['gallery_lightbox'] is True and cap['csl_citations'] is True,'Capability flags stale')
    check(not (ROOT/'data/shared_statuses/lala.yaml').exists(),'Experimental shared status remains')
    check(not (ROOT/'data/organisation/tags/wriiting.yaml').exists(),'Misspelled test tag remains')
    teaching,_=fm('content/sources/colqy-public-teaching/index.md')
    check(any(x.get('shared')=='teaching-enquiries' for x in teaching.get('statuses',[])),'Shared status demo not linked')
    check((ROOT/'data/shared_statuses/teaching-enquiries.yaml').exists(),'Shared status demo missing')
    for p in (ROOT/'content').rglob('*.md'):
        if 'colqy-demo-' in str(p):
            m,_=fm(str(p.relative_to(ROOT)))
            check(m.get('draft') is True,'Regression fixture is published: '+str(p))
    for p in (ROOT/'content').rglob('*.md'):
        m,raw=fm(str(p.relative_to(ROOT)))
        if m.get('draft') is True:continue
        keys=set(re.findall(r'@([A-Za-z0-9._:/+\-]+)',raw.split('---',2)[2]))
        check(keys <= KEYS,'Unresolved citation in published content: '+str(p))
except (OSError,ValueError,KeyError,TypeError,IndexError) as e:
    errors.append('Read/parse error: '+str(e))
for error in errors:print('ERROR:',error)
print('Public release content check:', 'PASS' if not errors else 'FAIL', f'({len(errors)} errors)')
print('NOTE: Citation cache must be regenerated using tools/build-colqy.py before publishing.')
sys.exit(1 if errors else 0)

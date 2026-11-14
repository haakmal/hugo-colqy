#!/usr/bin/env python3
"""Import BibTeX into one canonical CSL JSON array. No intelligent merging."""
import argparse
import json
import os
from pathlib import Path
import re
import sys
import tempfile

try:
    import bibtexparser
    from bibtexparser.customization import convert_to_unicode, author as split_authors, splitname
except ImportError:
    sys.exit('Missing bibtexparser 1.x. Install into a venv: pip install "bibtexparser>=1.4,<2"')

TYPE_MAP = {
    'article':'article-journal', 'book':'book', 'booklet':'pamphlet',
    'inbook':'chapter', 'incollection':'chapter', 'inproceedings':'paper-conference',
    'conference':'paper-conference', 'proceedings':'book', 'phdthesis':'thesis',
    'mastersthesis':'thesis', 'techreport':'report', 'manual':'book',
    'misc':'document', 'online':'webpage', 'unpublished':'manuscript',
}
KEY_RE = re.compile(r'^[A-Za-z0-9][A-Za-z0-9._:/+\-]*$')


def person(name):
    name=name.strip()
    if name.startswith('{') and name.endswith('}'):
        return {'literal':name[1:-1]}
    try:
        parts=splitname(name)
        family=' '.join(parts['von']+parts['last']).strip()
        given=' '.join(parts['first']).strip()
        result={'family':family} if family else {'literal':name}
        if given: result['given']=given
        if parts['jr']: result['suffix']=' '.join(parts['jr'])
        return result
    except Exception:
        return {'literal':name}


def convert(record):
    record=convert_to_unicode(dict(record))
    key=record.get('ID','').strip()
    if not KEY_RE.fullmatch(key):
        raise ValueError(f'Invalid citation key: {key!r}')
    title=record.get('title','').strip()
    if not title:
        raise ValueError(f'{key}: title is required')
    item={'id':key,'type':TYPE_MAP.get(record.get('ENTRYTYPE','').lower(),'document'),'title':title}
    for field in ('author','editor'):
        if record.get(field):
            names=split_authors({field:record[field]})[field]
            item[field]=[person(n) for n in names]
    year=record.get('year','').strip()
    month=record.get('month','').strip()
    if year:
        if not re.fullmatch(r'\d{4}',year):
            raise ValueError(f'{key}: invalid year {year!r}')
        parts=[int(year)]
        months={'jan':1,'feb':2,'mar':3,'apr':4,'may':5,'jun':6,'jul':7,'aug':8,'sep':9,'oct':10,'nov':11,'dec':12}
        if month:
            value=months.get(month[:3].lower())
            if value:parts.append(value)
        item['issued']={'date-parts':[parts]}
    mapping={'journal':'container-title','booktitle':'container-title','publisher':'publisher',
             'address':'publisher-place','volume':'volume','number':'issue','pages':'page',
             'doi':'DOI','url':'URL','isbn':'ISBN','issn':'ISSN','abstract':'abstract'}
    for old,new in mapping.items():
        if record.get(old):item[new]=record[old].strip().replace('--','-') if old=='pages' else record[old].strip()
    if record.get('edition'):item['edition']=record['edition'].strip()
    return item


def parse_bibtex(text):
    parser=bibtexparser.bparser.BibTexParser(common_strings=True)
    parser.ignore_nonstandard_types=False
    parser.homogenize_fields=False
    parsed=bibtexparser.loads(text,parser=parser)
    items=[]; problems=[]; seen=set()
    for record in parsed.entries:
        try:
            item=convert(record)
            if item['id'] in seen:
                problems.append(f"Duplicate key in paste: {item['id']}")
                continue
            seen.add(item['id']);items.append(item)
        except Exception as exc:
            problems.append(str(exc))
    # Detect records the parser could not recover, without trying to fix them.
    announced=len(re.findall(r'@(?:article|book|booklet|inbook|incollection|inproceedings|conference|proceedings|phdthesis|mastersthesis|techreport|manual|misc|online|unpublished)\s*\{',text,re.I))
    if announced>len(parsed.entries):
        problems.append(f'{announced-len(parsed.entries)} entry/entries could not be parsed')
    if not parsed.entries and not problems:
        problems.append('No BibTeX records found')
    return items,problems


def import_items(items, library):
    ids={x['id'] for x in library}
    imported=[];skipped=[]
    for item in items:
        if item['id'] in ids:
            skipped.append(f"Duplicate existing key: {item['id']}")
            continue
        ids.add(item['id']);imported.append(item)
    return library+imported,imported,skipped


def main():
    p=argparse.ArgumentParser(description='Import BibTeX into data/references.json (CSL JSON array)')
    source=p.add_mutually_exclusive_group(required=True)
    source.add_argument('--file',type=Path,help='Read a .bib file')
    source.add_argument('--paste',action='store_true',help='Read pasted BibTeX from stdin')
    p.add_argument('--library',type=Path,default=Path('data/references.json'))
    p.add_argument('--apply',action='store_true',help='Write imported entries; default is preview')
    args=p.parse_args()
    try:
        raw=args.file.read_text(encoding='utf-8-sig') if args.file else sys.stdin.read()
        if args.library.exists():
            library=json.loads(args.library.read_text(encoding='utf-8'))
        else:
            library=[]
        if not isinstance(library,list) or any(not isinstance(x,dict) or not isinstance(x.get('id'),str) for x in library):
            raise ValueError('Reference library must be a CSL JSON array of records with IDs')
        ids=[x['id'] for x in library]
        if len(ids)!=len(set(ids)):
            raise ValueError('Reference library already has duplicate IDs; refusing to write')
        candidates,issues=parse_bibtex(raw)
        combined,added,skipped=import_items(candidates,library)
    except (ValueError,OSError,json.JSONDecodeError) as exc:
        sys.exit('Import stopped; no files changed: '+str(exc))
    for x in added:print('NEW',x['id'], '-',x['title'])
    for issue in issues+skipped:print('SKIPPED',issue)
    print(f'{len(added)} new; {len(issues)+len(skipped)} skipped; {len(library)} existing')
    if not args.apply:
        print('Preview only. Add --apply to save.')
        return
    if not added:
        print('No new references; library unchanged.')
        return
    args.library.parent.mkdir(parents=True,exist_ok=True)
    # Atomic replace so a failed write does not truncate the library.
    fd,tmp=tempfile.mkstemp(prefix='.references-',suffix='.json',dir=args.library.parent)
    try:
        with os.fdopen(fd,'w',encoding='utf-8') as handle:
            json.dump(combined,handle,ensure_ascii=False,indent=2)
            handle.write('\n')
        os.replace(tmp,args.library)
    finally:
        if os.path.exists(tmp):os.unlink(tmp)
    print('Saved',args.library)
    # A6.3r.2: keep the CMS citation picker in sync with successful imports.
    if args.library.resolve() == Path('data/references.json').resolve():
        import subprocess
        sync = subprocess.run([sys.executable, str(Path(__file__).with_name('sync-reference-index-a6-3r2.py'))],
                              check=False)
        if sync.returncode:
            sys.exit('Reference import saved, but the CMS index did not update. Run the sync script manually.')

if __name__=='__main__':main()

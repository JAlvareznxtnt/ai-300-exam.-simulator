import json,collections,re,statistics
d=json.load(open(__import__('os').path.join(__import__('os').path.dirname(__file__),'..','data','synthetic.json')))
allq=list(d['normal'])
for s in d['series']: allq+=s['qs']
for c in d['cases']: allq+=c['qs']
issues=[]; pos=collections.Counter(); longest=0; mcn=0
for q in allq:
    n=q['n']
    if q['type'] in('mc','multi'):
        o=[t for _,t in q['opts']]
        if len(set(o))!=len(o): issues.append((n,'duplicate options'))
        if len(o)<2: issues.append((n,'few options'))
        for L in q['correct']:
            if L not in [l for l,_ in q['opts']]: issues.append((n,'bad key'))
        if q['type']=='mc' and len(q['correct'])!=1: issues.append((n,'mc needs 1 key'))
        if q['type']=='multi' and len(q['correct'])!=2: issues.append((n,'multi should be 2 keys here'))
        if any(re.search(r'all of the above|none of the above|both a and b',t,re.I) for t in o): issues.append((n,'all/none of the above'))
        if len(o)>2 and q['type']=='mc':
            mcn+=1; pos[q['correct'][0]]+=1
            lens=[len(t) for t in o]; ci=[l for l,_ in q['opts']].index(q['correct'][0])
            if lens[ci]==max(lens): longest+=1
            if lens[ci]>2.2*statistics.median(lens): issues.append((n,f'correct much longer ({lens})'))
    else:
        for s in q['slots']:
            if s['correct'] not in s['choices']: issues.append((n,'slot key missing'))
            if len(set(s['choices']))!=len(s['choices']): issues.append((n,'dup slot choices'))
    for k in ('rationale','hint','stem'):
        if not q.get(k): issues.append((n,'missing '+k))
    if re.search(r'\bis (always|never)\b',q['stem']): issues.append((n,'absolute in stem'))
    if any(ch in q['rationale'] for ch in '—'): issues.append((n,'em dash in rationale'))
print('questions',len(allq),'mc 3+ options',mcn,'correct-is-longest',longest,'position',dict(pos))
print('issues:'); [print(' ',i) for i in issues]
E=json.load(open(__import__('os').path.join(__import__('os').path.dirname(__file__),'..','data','synthetic.json')))

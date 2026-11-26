const { chromium } = require('playwright');
const path = require('path');
const assert = require('assert');
const URL = require('url').pathToFileURL(path.join(__dirname, '..', 'dist', 'index.html')).href; // run `python3 scripts/build.py` first
(async()=>{
  const b=await chromium.launch(); const p=await b.newPage({viewport:{width:420,height:900}});
  const errs=[], crashes=[]; p.on('pageerror',e=>{errs.push(e.message);crashes.push(e.message)}); p.on('console',m=>{if(m.type()==='error')errs.push(m.text())});
  const fill=async()=>{ const sels=await p.$$('select'); if(sels.length){ for(const s of sels) await s.selectOption({index:1}); } else { const i=await p.$$('input[name=ans]'); const t=await i[0].getAttribute('type'); await i[0].check({force:true}); if(t==='checkbox') await i[1].check({force:true}); } };
  // answers the current question right or wrong on purpose
  const answer=async(right)=>{
    const q=await p.evaluate(()=>S.qs[S.i]);
    if(q.type==='slots'){ for(let k=0;k<q.slots.length;k++){ const s=q.slots[k]; await p.selectOption('#s'+k,right?s.correct:s.choices.find(c=>c!==s.correct)); } }
    else { const picks=right?q.correct:[q.opts.map(o=>o[0]).find(L=>!q.correct.includes(L))]; for(const L of picks) await p.check('#i'+L,{force:true}); }
  };
  const count=sel=>p.locator(sel).count();
  const where=async()=>Number((await p.textContent('.qcount')).match(/Question (\d+)/)[1]);
  const picks=()=>p.evaluate(()=>[...document.querySelectorAll('input[name=ans]:checked, select')].map(x=>x.value));
  const wide=()=>p.evaluate(()=>document.documentElement.scrollWidth>document.documentElement.clientWidth);
  // answers every question from the current one with Next, until the review screen opens
  const walk=async(skip=[],each)=>{ for(let k=1;;k++){ if(each) await each(k); if(!skip.includes(k)) await fill(); await p.click('#next'); if(await p.$('#finish')) return k; } };
  const assertHidden=async()=>assert.strictEqual(await count('.feedback, .opt.right, .opt.wrong'),0,'nothing is revealed');
  const assertLocked=async(verdict)=>{
    assert.strictEqual((await p.textContent('.verdict')).trim(),verdict);
    assert.ok(await p.evaluate(()=>[...document.querySelectorAll('input[name=ans], select')].every(x=>x.disabled)),'answers are locked');
    assert.ok(await p.isDisabled('#check')); assert.strictEqual(await count('#hintBtn'),0);
  };
  const review=async()=>{
    const r=await p.evaluate(()=>{ const btns=[...document.querySelectorAll('.qgrid button')]; return {
      labels:btns.map(x=>x.getAttribute('aria-label')), marks:btns.map(x=>x.lastElementChild.textContent),
      smallest:Math.min(...btns.map(x=>Math.min(x.offsetWidth,x.offsetHeight))),
      legend:[...document.querySelectorAll('.legend li')].map(x=>x.lastChild.textContent),
      counts:document.getElementById('counts').textContent, left:document.getElementById('left')?.textContent??null,
      resume:document.getElementById('resume').textContent
    }; });
    assert.ok(r.smallest>=44,'tap targets are at least 44px: '+r.smallest); assert.strictEqual(await wide(),false,'no horizontal scroll on review');
    return r;
  };
  const results=()=>p.evaluate(()=>({
    score:document.querySelector('.score').textContent.trim().replace(/\s+/g,' '),
    top:document.querySelector('.res-top').textContent.replace(/\s+/g,' '),
    heads:[...document.querySelectorAll('h2.section-title')].map(h=>h.textContent),
    rev:[...document.querySelectorAll('details.rev')].map(d=>({s:d.dataset.status,open:d.open})),
    dom:[...document.querySelectorAll('.dom .vl')].map(v=>v.textContent),
    retry:document.getElementById('retry').textContent, retryOff:document.getElementById('retry').disabled,
    wide:document.documentElement.scrollWidth>document.documentElement.clientWidth
  }));
  // checks a results screen; every mode scores the same way, only the simulation adds the estimate
  const checkResults=async(total,answered,sim)=>{
    const r=await results(); const n=s=>r.rev.filter(x=>x.s===s).length;
    const right=n('correct'), wrong=n('incorrect'), skip=n('unanswered');
    assert.strictEqual(right+wrong,answered,'answered count'); assert.strictEqual(skip,total-answered,'not answered count');
    assert.ok(r.score.startsWith(`${right} / ${answered} `),'headline score: '+r.score);
    assert.deepStrictEqual(r.heads,['By domain',`Answered incorrectly (${wrong})`,`Not answered (${skip})`,`Answered correctly (${right})`]);
    assert.deepStrictEqual(r.rev.map(x=>x.s),[...Array(wrong).fill('incorrect'),...Array(skip).fill('unanswered'),...Array(right).fill('correct')],'review order');
    r.rev.forEach((x,i)=>assert.strictEqual(x.open,i===0&&x.s==='incorrect','only the first incorrect item starts open'));
    assert.strictEqual(r.dom.reduce((a,t)=>a+Number(t.match(/^(\d+) answered/)[1]),0),answered,'domain bars count answered only');
    if(sim) assert.ok(r.top.includes(`Full-exam estimate: ${right} / ${total} (${Math.round(right/total*100)}%)`),'estimate: '+r.top);
    else assert.ok(!r.top.includes('Full-exam estimate'));
    assert.strictEqual(r.retry,`Retry the ${wrong} incorrect`); assert.strictEqual(r.retryOff,wrong===0);
    assert.ok(!/NaN|undefined/.test(r.top)); assert.strictEqual(r.wide,false,'no horizontal scroll');
    return {right,wrong,skip};
  };
  // setup
  await p.goto(URL);
  console.log('avail off:',await p.textContent('#avail'));
  await p.check('#syn'); console.log('avail on:',await p.textContent('#avail'), '| cnt1:',(await p.textContent('#cnt1')).trim());
  // original + synthetic, exam mode, all questions, with back
  await p.fill('#n','999'); await p.check('#m2'); await p.uncheck('#sh'); await p.click('#start');
  let syn=0;
  const all=await walk([],async k=>{
    assert.strictEqual(await count('#clock'),0,'no clock outside the simulation');
    if(await p.$('.meta .syn-badge')) syn++;
    if(k===1) assert.strictEqual(await count('#back'),0);
    if(k===3){
      assert.strictEqual(await count('#check'),0); assert.strictEqual(await count('#review'),1);
      await fill(); const was=await picks(); await p.click('#next'); await p.click('#back');
      assert.strictEqual(await where(),3); assert.deepStrictEqual(await picks(),was,'Back keeps the pick');
    }
  });
  let g=await review();
  assert.strictEqual(g.labels.length,all); assert.strictEqual(g.left,null); assert.strictEqual(g.counts,`${all} answered · 0 not answered`);
  await p.click('#finish');
  console.log('orig+syn exam questions seen',all,'synthetic seen',syn,'|',(await p.textContent('.score')).trim());
  await checkResults(all,all,false);
  // simulation, leaving question 5 unanswered
  await p.goto(URL); await p.click('#sim');
  const kinds={series:0,casestudy:0,synthetic:0};
  console.log('sim meta:',(await p.textContent('.meta')).trim().slice(0,80));
  const total=await walk([5],async k=>{
    const meta=await p.textContent('.meta');
    if(/Yes\/No series/.test(meta)) kinds.series++; if(/Case study/.test(meta)) kinds.casestudy++; if(/Synthetic/.test(meta)) kinds.synthetic++;
    if(k!==10) return;
    assert.strictEqual(await count('#hintBtn, #check'),0,'no hint or Check answer in the simulation'); await assertHidden();
    await p.click('#review');
    const before=await p.textContent('#clock'); await p.waitForTimeout(1200);
    assert.notStrictEqual(await p.textContent('#clock'),before,'clock keeps running on the review screen');
    const r=await review();
    assert.strictEqual(r.labels[0],'Question 1, answered'); assert.strictEqual(r.labels[4],'Question 5, not answered');
    assert.strictEqual(r.labels[9],'Question 10, not answered, current');
    assert.deepStrictEqual(r.legend,['Answered','Not answered','Current']);
    assert.strictEqual(r.counts,'8 answered · 50 not answered'); assert.strictEqual(r.left,'50 not answered');
    assert.strictEqual(r.resume,'Back to question 10');
    await p.click('#resume'); assert.strictEqual(await where(),10);
  });
  console.log('sim total',total,kinds);
  assert.strictEqual(total,58); assert.deepStrictEqual(kinds,{series:3,casestudy:5,synthetic:58});
  g=await review(); assert.strictEqual(g.left,'1 not answered');
  await p.click('.qgrid button[data-i="4"]'); assert.strictEqual(await where(),5); assert.deepStrictEqual((await picks()).filter(v=>v),[]);
  await p.click('#review'); await p.click('#finish');
  console.log((await p.textContent('.card')).trim().replace(/\s+/g,' ').slice(0,300));
  await checkResults(total,total-1,true);
  // practice navigation: Check answer, Next, Back and the review screen
  await p.goto(URL); await p.fill('#n','5'); await p.check('#m1'); await p.click('#start');
  assert.ok(await p.isDisabled('#check'),'Check answer waits for a pick'); assert.strictEqual(await count('#back'),0);
  await answer(false); assert.ok(await p.isEnabled('#check')); const first=await picks();
  await p.click('#next'); await assertHidden(); await p.click('#back');
  assert.deepStrictEqual(await picks(),first,'Next keeps the pick'); await assertHidden(); assert.ok(await p.isEnabled('#check'));
  await p.click('#check'); await assertLocked('Not quite');
  await p.click('#next'); await assertHidden();
  await answer(true); await p.click('#check'); await assertLocked('Correct');
  await p.click('#back'); await assertLocked('Not quite'); assert.deepStrictEqual(await picks(),first,'a checked question keeps its pick');
  await p.click('#next'); await assertLocked('Correct'); await p.click('#next');
  await answer(true); await p.click('#next'); /* Q3 answered, not checked */
  await p.click('#next'); /* Q4 skipped */
  await answer(false); await p.click('#next'); /* last question: Next opens the review screen */
  g=await review();
  assert.deepStrictEqual(g.labels,['Question 1, checked, incorrect','Question 2, checked, correct','Question 3, answered','Question 4, not answered','Question 5, answered, current']);
  assert.deepStrictEqual(g.marks,['✕','✓','●','–','●']);
  assert.deepStrictEqual(g.legend,['Answered','Not answered','Checked, correct','Checked, incorrect','Current']);
  assert.strictEqual(g.counts,'4 answered · 1 not answered'); assert.strictEqual(g.left,'1 not answered');
  await p.click('.qgrid button[data-i="1"]'); assert.strictEqual(await where(),2); await assertLocked('Correct');
  await p.click('#review'); g=await review();
  assert.strictEqual(g.labels[1],'Question 2, checked, correct, current'); assert.strictEqual(g.resume,'Back to question 2');
  await p.click('.qgrid button[data-i="3"]'); await p.click('#hintBtn'); assert.strictEqual(await count('#hintBox .hint'),1);
  assert.strictEqual(await wide(),false,'no horizontal scroll on a question');
  await p.click('#review'); await p.click('#finish');
  assert.deepStrictEqual(await checkResults(5,4,false),{right:2,wrong:2,skip:1});
  await p.click('#retry');
  assert.match(await p.textContent('.qcount'),/^Question 1of 2$/); assert.strictEqual(await count('#check'),1);
  console.log('practice navigation ok');
  // dropdown and choose-2 questions
  await p.goto(URL); await p.evaluate(()=>startSession([DATA.find(q=>q.type==='slots'&&q.slots.length>1),DATA.find(q=>q.type==='multi')],{doms:[1,2,3,4,5],n:2,mode:'practice',shuffle:false,withSyn:false}));
  await p.selectOption('#s0',{index:1}); assert.ok(await p.isDisabled('#check'),'every dropdown must be filled before checking');
  const part=await picks(); await p.click('#next'); await p.click('#review'); g=await review();
  assert.deepStrictEqual(g.labels,['Question 1, answered','Question 2, not answered, current']);
  await p.click('.qgrid button[data-i="0"]'); assert.deepStrictEqual(await picks(),part);
  await answer(true); await p.click('#check'); await assertLocked('Correct');
  await p.click('#next'); const box=(await p.$$('input[name=ans]'))[0];
  await box.check({force:true}); assert.ok(await p.isEnabled('#check')); await box.uncheck({force:true}); assert.ok(await p.isDisabled('#check'));
  await p.click('#review'); assert.strictEqual((await review()).labels[1],'Question 2, not answered, current');
  console.log('dropdown and choose-2 ok');
  // series + cases + synthetic only (practice)
  for(const sel of ['.serbtn[data-ser="1"]','.serbtn[data-ser="2"]','.casebtn[data-case="3"]']){
    await p.goto(URL); await p.check('#m1'); await p.click('#syndrop summary'); await p.click(sel);
    const cnt=sel.includes('ser')?3:5;
    for(let k=0;k<cnt;k++){ await fill(); await p.click('#check'); await p.click('#next'); }
    await p.click('#finish'); await checkResults(cnt,cnt,false);
    console.log(sel,'->',(await p.textContent('.score')).trim());
  }
  await p.goto(URL); await p.click('#syndrop summary'); await p.fill('#synn','7'); await p.click('#synonly');
  console.log('synonly first meta:',(await p.textContent('.meta')).trim().slice(0,60));
  console.log('width',await p.evaluate(()=>[document.documentElement.scrollWidth,document.documentElement.clientWidth]));
  // sim with synthetic off
  await p.goto(URL); await p.uncheck('#simsyn'); console.log('sim btn off:',await p.textContent('#sim'));
  await p.click('#sim'); let synSeen=0;
  const c2=await walk([],async()=>{ if(/Synthetic|Yes\/No|Case study/.test(await p.textContent('.meta'))) synSeen++; });
  await p.click('#finish');
  console.log('sim off total',c2,'synthetic/series/case seen',synSeen,'|',(await p.textContent('.score')).trim());
  assert.strictEqual(c2,50); assert.strictEqual(synSeen,0);
  await checkResults(c2,c2,true);
  // exam mode ended early: one right, one skipped, one wrong (not followed by Next), the rest never reached
  await p.goto(URL); await p.fill('#n','10'); await p.check('#m2'); await p.click('#start');
  assert.strictEqual(await count('#hintBtn'),1); assert.strictEqual(await count('#check'),0);
  await answer(true); await p.click('#next'); await p.click('#next'); await answer(false); await p.click('#quit');
  assert.deepStrictEqual(await checkResults(10,2,false),{right:1,wrong:1,skip:8});
  await p.click('#retry');
  assert.match(await p.textContent('.qcount'),/^Question 1of 1$/); assert.strictEqual(await count('#check'),0);
  // sim ended early, then the retry of the incorrect one runs in practice mode
  await p.goto(URL); await p.click('#sim'); const simN=await p.evaluate(()=>S.qs.length);
  await answer(true); await p.click('#next'); await answer(false); await p.click('#quit');
  assert.deepStrictEqual(await checkResults(simN,2,true),{right:1,wrong:1,skip:simN-2});
  await p.click('#retry');
  assert.match(await p.textContent('.qcount'),/^Question 1of 1$/); assert.strictEqual(await count('#check'),1);
  // sim ended from the review screen with nothing answered
  await p.goto(URL); await p.click('#sim'); await p.click('#review'); await p.click('#quit');
  await checkResults(simN,0,true); await p.waitForTimeout(1200);
  assert.strictEqual(await p.textContent('#ringn'),'–'); assert.match(await p.textContent('.card'),/No questions answered/);
  // practice ended with nothing answered shows empty results
  await p.goto(URL); await p.fill('#n','5'); await p.check('#m1'); await p.click('#start'); await p.click('#quit');
  await checkResults(5,0,false);
  console.log('early-end results ok');
  // dropdown checks
  await p.goto(URL);
  console.log('domains open?',await p.evaluate(()=>document.getElementById('domdrop').open),'| summary:',(await p.textContent('#domsum')));
  await p.click('#domdrop summary'); await p.uncheck('#d3'); console.log('summary after:',await p.textContent('#domsum'),'| avail:',await p.textContent('#avail'));
  console.log('syn drop open?',await p.evaluate(()=>document.getElementById('syndrop').open),'| serbtn visible:',await p.isVisible('.serbtn'));
  console.log('errors',errs); await b.close();
  assert.deepStrictEqual(crashes,[],'page errors');
})();

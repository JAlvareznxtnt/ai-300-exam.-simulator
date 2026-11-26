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
  const results=()=>p.evaluate(()=>({
    score:document.querySelector('.score').textContent.trim().replace(/\s+/g,' '),
    top:document.querySelector('.res-top').textContent.replace(/\s+/g,' '),
    heads:[...document.querySelectorAll('h2.section-title')].map(h=>h.textContent),
    rev:[...document.querySelectorAll('details.rev')].map(d=>({s:d.dataset.status,open:d.open})),
    dom:[...document.querySelectorAll('.dom .vl')].map(v=>v.textContent),
    retry:document.getElementById('retry').textContent, retryOff:document.getElementById('retry').disabled,
    wide:document.documentElement.scrollWidth>document.documentElement.clientWidth
  }));
  // checks the results of an Exam mode or simulation run
  const checkExam=async(total,answered,sim)=>{
    const r=await results(); const count=s=>r.rev.filter(x=>x.s===s).length;
    const right=count('correct'), wrong=count('incorrect'), skip=count('unanswered');
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
  0;
  console.log('avail off:',await p.textContent('#avail'));
  await p.check('#syn'); console.log('avail on:',await p.textContent('#avail'), '| cnt1:',(await p.textContent('#cnt1')).trim());
  // original + synthetic, exam mode, all questions, with back
  await p.fill('#n','999'); await p.check('#m2'); await p.uncheck('#sh'); await p.click('#start');
  let n=0, syn=0;
  for(;;){
    if(await p.$('#clock')) console.log('clock in non-sim?!');
    if(await p.$('.syn-badge.chip,.meta .syn-badge')) syn++;
    n++;
    if(n===3){ await fill(); await p.click('#sub'); await p.click('#back'); const checked=await p.evaluate(()=>[...document.querySelectorAll('input[name=ans]:checked,select')].length); console.log('back prefilled ok'); await p.click('#sub'); /* to q3 again */ }
    const lab=await p.textContent('#sub'); await fill(); await p.click('#sub'); if(lab.trim()==='Finish') break;
  }
  console.log('orig+syn exam questions seen',n,'synthetic seen',syn,'|',(await p.textContent('.score')).trim());
  await checkExam(n+1,n+1,false); /* the Back step covers two questions in one pass */
  console.log((await p.textContent('.card .small:nth-of-type(1)')).trim().slice(0,120));
  // sim
  await p.goto(URL); await p.click('#sim');
  const kinds={series:0,casestudy:0,synthetic:0}; const doms={}; let total=0;
  const t=await p.textContent('.meta'); console.log('sim meta:',t.trim().slice(0,80));
  for(;;){
    const meta=await p.textContent('.meta'); total++;
    if(/Yes\/No series/.test(meta)) kinds.series++; if(/Case study/.test(meta)) kinds.casestudy++; if(/Synthetic/.test(meta)) kinds.synthetic++;
    const lab=await p.textContent('#sub'); if(total===10){ await p.waitForTimeout(1200); console.log('clock',await p.textContent('#clock')); console.log('hint btn in sim:',!!(await p.$('#hintBtn'))); }
    if(total!==5) await fill(); /* leave Q5 unanswered */
    if(total===58) 0;
    await p.click('#sub'); if(lab.trim()==='Finish') break;
  }
  console.log('sim total',total,kinds);
  console.log((await p.textContent('.card')).trim().replace(/\s+/g,' ').slice(0,400));
  await checkExam(total,total-1,true);
  0;
  // series + cases + synthetic only (practice)
  for(const sel of ['.serbtn[data-ser="1"]','.serbtn[data-ser="2"]','.casebtn[data-case="3"]']){
    await p.goto(URL); await p.check('#m1'); await p.click('#syndrop summary'); await p.click(sel);
    const cnt=sel.includes('ser')?3:5;
    for(let k=0;k<cnt;k++){ await fill(); await p.click('#sub'); if(k===0&&sel.includes('case')) 0; await p.click('#next'); }
    console.log(sel,'->',(await p.textContent('.score')).trim());
  }
  await p.goto(URL); await p.click('#syndrop summary'); await p.fill('#synn','7'); await p.click('#synonly');
  console.log('synonly first meta:',(await p.textContent('.meta')).trim().slice(0,60));
  console.log('width',await p.evaluate(()=>[document.documentElement.scrollWidth,document.documentElement.clientWidth]));
  // sim with synthetic off
  await p.goto(URL); await p.uncheck('#simsyn'); console.log('sim btn off:',await p.textContent('#sim'));
  await p.click('#sim'); let c2=0, synSeen=0, ser2=0;
  for(;;){ c2++; const meta=await p.textContent('.meta'); if(/Synthetic|Yes\/No|Case study/.test(meta)) synSeen++; const lab=await p.textContent('#sub'); await fill(); await p.click('#sub'); if(lab.trim()==='Finish') break; }
  console.log('sim off total',c2,'synthetic/series/case seen',synSeen,'|',(await p.textContent('.score')).trim());
  await checkExam(c2,c2,true);
  // exam mode ended early: one right, one skipped, one wrong (read on End session), the rest never reached
  await p.goto(URL); await p.fill('#n','10'); await p.check('#m2'); await p.click('#start');
  await answer(true); await p.click('#sub'); await p.click('#sub'); await answer(false); await p.click('#quit');
  assert.deepStrictEqual(await checkExam(10,2,false),{right:1,wrong:1,skip:8});
  await p.click('#retry');
  assert.match(await p.textContent('.qcount'),/^Question 1of 1$/); assert.strictEqual(await p.textContent('#sub'),'Finish');
  // sim ended early, then the retry of the incorrect one runs in practice mode
  await p.goto(URL); await p.click('#sim'); const simN=await p.evaluate(()=>S.qs.length);
  await answer(true); await p.click('#sub'); await answer(false); await p.click('#quit');
  assert.deepStrictEqual(await checkExam(simN,2,true),{right:1,wrong:1,skip:simN-2});
  await p.click('#retry');
  assert.match(await p.textContent('.qcount'),/^Question 1of 1$/); assert.strictEqual(await p.textContent('#sub'),'Check answer');
  // sim ended with nothing answered
  await p.goto(URL); await p.click('#sim'); await p.click('#quit');
  await checkExam(simN,0,true); await p.waitForTimeout(1200);
  assert.strictEqual(await p.textContent('#ringn'),'–'); assert.match(await p.textContent('.card'),/No questions answered/);
  console.log('early-end results ok');
  // practice mode results are unchanged
  await p.goto(URL); await p.fill('#n','5'); await p.check('#m1'); await p.click('#start');
  await answer(false); await p.click('#sub'); await p.click('#next'); await p.click('#quit');
  const pr=await results();
  assert.strictEqual(pr.score,'0 / 1 (0%)'); assert.deepStrictEqual(pr.heads,['By domain','Missed questions','Answered correctly']);
  assert.deepStrictEqual(pr.rev,[{s:'missed',open:true}]); assert.deepStrictEqual(pr.dom,['0/1 (0%)']);
  assert.match(pr.top,/4 questions were not reached and not counted/); assert.ok(!pr.top.includes('Full-exam estimate'));
  assert.strictEqual(pr.retry,'Retry the 1 missed');
  console.log('practice results ok');
  // dropdown checks
  await p.goto(URL);
  console.log('domains open?',await p.evaluate(()=>document.getElementById('domdrop').open),'| summary:',(await p.textContent('#domsum')));
  await p.click('#domdrop summary'); await p.uncheck('#d3'); console.log('summary after:',await p.textContent('#domsum'),'| avail:',await p.textContent('#avail'));
  console.log('syn drop open?',await p.evaluate(()=>document.getElementById('syndrop').open),'| serbtn visible:',await p.isVisible('.serbtn'));
  console.log('errors',errs); await b.close();
  assert.deepStrictEqual(crashes,[],'page errors');
})();

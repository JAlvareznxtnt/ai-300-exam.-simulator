const { chromium } = require('playwright');
const path = require('path');
const assert = require('assert');
const URL = require('url').pathToFileURL(path.join(__dirname, '..', 'dist', 'index.html')).href; // run `python3 scripts/build.py` first
(async()=>{
  const b=await chromium.launch(); const p=await b.newPage({viewport:{width:420,height:900}});
  const errs=[], crashes=[]; p.on('pageerror',e=>{errs.push(e.message);crashes.push(e.message)}); p.on('console',m=>{if(m.type()==='error')errs.push(m.text())});
  // slot questions are answered by click-to-place: an option, then a slot
  const place=async(n,k)=>{ await p.click('#p'+n); await p.click('#s'+k); };
  const fill=async()=>{
    if(await p.$('#dnd')){ const empty=await p.$$eval('.slot',els=>els.filter(e=>!e.classList.contains('filled')).map(e=>e.dataset.k)); for(const k of empty){ await p.click('.piece:not([disabled]) >> nth=0'); await p.click('#s'+k); } }
    else { const i=await p.$$('input[name=ans]'); const t=await i[0].getAttribute('type'); await i[0].check({force:true}); if(t==='checkbox') await i[1].check({force:true}); }
  };
  // the current slot question, its pool, and one option per slot that is all right or all wrong
  const board=right=>p.evaluate(right=>{
    const q=S.qs[S.i], pool=poolOf(q), used=[];
    const values=q.slots.map(s=>{ const v=right?s.correct:pool.find(c=>c!==s.correct&&!used.includes(c)); used.push(v); return v; });
    return {pool,values,labels:q.slots.map(s=>s.label),correct:q.slots.map(s=>s.correct)};
  },right);
  // answers the current question right or wrong on purpose
  const answer=async(right)=>{
    const q=await p.evaluate(()=>S.qs[S.i]);
    if(q.type==='slots'){
      while(await p.$('.unslot:visible')) await p.click('.unslot:visible >> nth=0');
      const b=await board(right); for(let k=0;k<b.values.length;k++) await place(b.pool.indexOf(b.values[k]),k);
    }
    else { const picks=right?q.correct:[q.opts.map(o=>o[0]).find(L=>!q.correct.includes(L))]; for(const L of picks) await p.check('#i'+L,{force:true}); }
  };
  const count=sel=>p.locator(sel).count();
  const where=async()=>Number((await p.textContent('.qcount')).match(/Question (\d+)/)[1]);
  // checked letters, then the value in every slot ('' when empty)
  const picks=()=>p.evaluate(()=>[...document.querySelectorAll('input[name=ans]:checked')].map(x=>x.value).concat([...document.querySelectorAll('.slot')].map(x=>x.classList.contains('filled')?x.querySelector('.slotbtn').textContent:'')));
  const wide=()=>p.evaluate(()=>document.documentElement.scrollWidth>document.documentElement.clientWidth);
  // answers every question from the current one with Next, until the review screen opens
  const walk=async(skip=[],each)=>{ for(let k=1;;k++){ if(each) await each(k); if(!skip.includes(k)) await fill(); await p.click('#next'); if(await p.$('#finish')) return k; } };
  const assertHidden=async()=>assert.strictEqual(await count('.feedback, .opt.right, .opt.wrong, .slot.right, .slot.wrong, .fix'),0,'nothing is revealed');
  const assertLocked=async(verdict)=>{
    assert.strictEqual((await p.textContent('.verdict')).trim(),verdict);
    assert.ok(await p.evaluate(()=>[...document.querySelectorAll('input[name=ans], .piece, .slotbtn')].every(x=>x.disabled)),'answers are locked');
    assert.strictEqual(await count('.unslot:visible'),0,'no remove buttons once locked');
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
  // drag-and-drop on an ordering question, then a choose-2 question
  const startPair=()=>p.evaluate(()=>startSession([SYN.normal.find(q=>q.n===3027),DATA.find(q=>q.type==='multi')],{doms:[1,2,3,4,5],n:2,mode:'practice',shuffle:false,withSyn:false}));
  const slotsNow=async()=>(await picks());
  const ans=()=>p.evaluate(()=>S.ans[S.i]);
  const said=()=>p.textContent('#live');
  const label=k=>p.getAttribute('#s'+k,'aria-label');
  await p.setViewportSize({width:420,height:1500}); await p.goto(URL); await startPair();
  const {pool,correct,labels}=await board(true); const at=v=>pool.indexOf(v);
  const [A,B,C,D]=pool;
  assert.deepStrictEqual(labels,['Step 1','Step 2','Step 3','Step 4']); assert.strictEqual(await count('.piece'),6,'pool is larger than the slots');
  assert.deepStrictEqual(await slotsNow(),['','','','']); assert.strictEqual(await count('.unslot:visible'),0);
  assert.strictEqual(await p.$eval('#s0',e=>getComputedStyle(e).borderTopStyle),'dashed');
  const stacked=await p.evaluate(()=>document.querySelector('.pool').getBoundingClientRect().bottom<=document.querySelector('.targets').getBoundingClientRect().top);
  assert.ok(stacked,'pool sits above the slots at 420px');
  // click-to-place
  await p.click('#s0'); assert.strictEqual(await said(),'Select an option first.');
  await p.click('#p0'); assert.strictEqual(await p.getAttribute('#p0','aria-pressed'),'true');
  await p.click('#s0'); assert.strictEqual(await said(),`placed ${A} in Step 1`);
  assert.deepStrictEqual(await ans(),[A,'','','']); assert.ok(await p.isDisabled('#p0'),'a used option cannot be used again');
  assert.strictEqual(await label(0),`Step 1: ${A}`); assert.ok(await p.isDisabled('#check'));
  // keyboard only
  await p.focus('#p1'); await p.keyboard.press('Enter'); await p.focus('#s1'); await p.keyboard.press('Enter');
  assert.strictEqual(await said(),`placed ${B} in Step 2`); assert.strictEqual(await p.evaluate(()=>document.activeElement.id),'s1','focus stays on the slot');
  await p.focus('#p2'); await p.keyboard.press('Space'); await p.keyboard.press('Escape');
  assert.strictEqual(await count('.held'),0,'Escape clears the selection');
  // swap by click, then replace from the pool
  await p.click('#s0'); await p.click('#s1');
  assert.deepStrictEqual(await ans(),[B,A,'','']); assert.strictEqual(await said(),`placed ${A} in Step 2, moved ${B} to Step 1`);
  await place(2,0); assert.deepStrictEqual(await ans(),[C,A,'','']); assert.ok(await p.isEnabled('#p1'));
  assert.strictEqual(await said(),`placed ${C} in Step 1, ${B} returned to the pool`);
  // remove with the cross, and by tapping the pool while a slot is selected
  await p.click('.slot[data-k="1"] .unslot');
  assert.deepStrictEqual(await ans(),[C,'','','']); assert.strictEqual(await said(),`removed ${A} from Step 2`);
  assert.ok(await p.isEnabled('#p0')); assert.strictEqual(await p.evaluate(()=>document.activeElement.id),'s1');
  await p.click('#s0'); await p.click('.pool',{position:{x:4,y:4}});
  assert.deepStrictEqual(await ans(),['','','','']);
  // real pointer drags with the mouse
  const middle=async sel=>{ const r=await p.locator(sel).boundingBox(); return [r.x+r.width/2,r.y+r.height/2]; };
  const drag=async(from,to,during)=>{ const a=await middle(from), z=Array.isArray(to)?to:await middle(to); await p.mouse.move(...a); await p.mouse.down(); await p.mouse.move(...z,{steps:8}); if(during) await during(); await p.mouse.up(); };
  await drag('#p0','#s0',async()=>{
    assert.strictEqual(await count('.ghost-drag'),1); assert.strictEqual(await count('.slot[data-k="0"].over'),1,'drop target is highlighted');
  });
  assert.deepStrictEqual(await ans(),[A,'','','']); assert.strictEqual(await count('.ghost-drag, .over, .held, .lifted'),0,'drag leaves nothing behind');
  await drag('#p1','#s1'); await drag('#s0','#s1'); /* slot to occupied slot swaps */
  assert.deepStrictEqual(await ans(),[B,A,'','']);
  await drag('#p2','#s1'); /* pool to occupied slot: the old option goes back */
  assert.deepStrictEqual(await ans(),[B,C,'','']); assert.ok(await p.isEnabled('#p0'));
  await drag('#s0','#s3'); assert.deepStrictEqual(await ans(),['',C,'',B]);
  await drag('#s3','.pool',async()=>assert.strictEqual(await count('.pool.over'),1));
  assert.deepStrictEqual(await ans(),['',C,'',''],'dragging back to the pool empties the slot'); assert.ok(await p.isEnabled('#p1'));
  await drag('#s1',[5,5]); assert.deepStrictEqual(await ans(),['',C,'',''],'dropping elsewhere changes nothing');
  assert.strictEqual(await p.evaluate(()=>String(getSelection())),'','dragging selects no page text');
  await p.click('#p3'); assert.strictEqual(await count('.piece.held'),1,'a click still works right after a drag'); await p.click('#p3');
  // a partial answer is saved through Next, Back and Review
  assert.ok(await p.isDisabled('#check'),'every slot must be filled before checking');
  await p.click('#next'); await p.click('#back'); assert.deepStrictEqual(await slotsNow(),['',C,'','']);
  await p.click('#review'); g=await review(); assert.strictEqual(g.labels[0],'Question 1, answered, current');
  await p.click('#resume'); assert.deepStrictEqual(await slotsNow(),['',C,'','']);
  // first slot right, the others wrong: Check answer locks and marks each slot
  await p.click('.slot[data-k="1"] .unslot');
  const mine=[correct[0],correct[2],correct[3],correct[1]];
  for(let k=0;k<3;k++) await place(at(mine[k]),k);
  assert.ok(await p.isDisabled('#check')); await drag('#p'+at(mine[3]),'#s3'); assert.ok(await p.isEnabled('#check'));
  await assertHidden(); await p.click('#check'); await assertLocked('Not quite');
  const marked=async()=>{
    assert.deepStrictEqual(await p.$$eval('.slotmk',e=>e.map(x=>x.textContent)),['✓','✕','✕','✕']);
    assert.deepStrictEqual(await p.$$eval('.fix b',e=>e.map(x=>x.textContent)),correct.slice(1));
    assert.strictEqual(await label(1),`Step 2: ${mine[1]}, incorrect. Correct answer: ${correct[1]}`);
    assert.strictEqual(await count('.feedback .slotres li'),4);
  };
  await marked(); await drag('#s0','#s1'); assert.deepStrictEqual(await ans(),mine,'a locked board cannot be changed');
  await p.click('#next'); await p.click('#back'); await assertLocked('Not quite'); await marked(); assert.deepStrictEqual(await slotsNow(),mine);
  await p.click('#next'); const box=(await p.$$('input[name=ans]'))[0];
  await box.check({force:true}); assert.ok(await p.isEnabled('#check')); await box.uncheck({force:true}); assert.ok(await p.isDisabled('#check'));
  await p.click('#review'); g=await review(); assert.deepStrictEqual(g.labels,['Question 1, checked, incorrect','Question 2, not answered, current']);
  await p.click('#finish'); assert.deepStrictEqual(await checkResults(2,1,false),{right:0,wrong:1,skip:1});
  assert.deepStrictEqual(await p.$$eval('details.rev[data-status=incorrect] .slotres .pill-bad',e=>e.map(x=>x.textContent)),mine.slice(1));
  await p.setViewportSize({width:420,height:900});
  console.log('drag-and-drop ok');
  // every slot question: pool and slots render, a right answer scores right, nothing overflows
  await p.goto(URL);
  const slotTotal=await p.evaluate(()=>{ const qs=DATA.concat(SYN.normal,...SYN.series.map(s=>s.qs),...SYN.cases.map(c=>c.qs)).filter(q=>q.type==='slots');
    startSession(qs,{doms:[1,2,3,4,5],n:qs.length,mode:'practice',shuffle:false,withSyn:true}); return qs.length; });
  for(let k=0;k<slotTotal;k++){
    const q=await p.evaluate(()=>({n:S.qs[S.i].n,slots:S.qs[S.i].slots.length,order:/^Step 1$/.test(S.qs[S.i].slots[0].label)}));
    if(q.order) assert.ok(await count('.piece')>q.slots,'ordering question '+q.n+' has extra steps');
    await answer(true); await p.click('#check'); await assertLocked('Correct');
    assert.strictEqual(await count('.slot.right'),q.slots); assert.strictEqual(await wide(),false,'no horizontal scroll, question '+q.n);
    await p.click('#next');
  }
  await p.click('#finish'); assert.deepStrictEqual(await checkResults(slotTotal,slotTotal,false),{right:slotTotal,wrong:0,skip:0});
  assert.strictEqual(slotTotal,17);
  console.log('all',slotTotal,'slot questions ok');
  // touch: dragging places an option and does not scroll the page
  const touch=await b.newContext({viewport:{width:420,height:700},hasTouch:true,isMobile:true});
  const t2=await touch.newPage(); t2.on('pageerror',e=>crashes.push(e.message)); await t2.goto(URL);
  await t2.evaluate(()=>startSession([SYN.normal.find(q=>q.n===3027)],{doms:[1,2,3,4,5],n:1,mode:'practice',shuffle:false,withSyn:true}));
  const cdp=await touch.newCDPSession(t2);
  const swipe=async(a,z)=>{
    const send=(type,pt)=>cdp.send('Input.dispatchTouchEvent',{type,touchPoints:pt?[{x:pt[0],y:pt[1]}]:[]});
    await send('touchStart',a); for(let s=1;s<=10;s++) await send('touchMove',[a[0]+(z[0]-a[0])*s/10,a[1]+(z[1]-a[1])*s/10]); await send('touchEnd'); await t2.waitForTimeout(500);
  };
  await t2.evaluate(()=>window.scrollTo(0,document.querySelector('#p5').getBoundingClientRect().top+scrollY-250));
  const centre=sel=>t2.$eval(sel,e=>{ const r=e.getBoundingClientRect(); return [r.x+r.width/2,r.y+r.height/2]; });
  const y0=await t2.evaluate(()=>scrollY);
  await swipe(await centre('#p5'),await centre('#s0'));
  assert.strictEqual(await t2.evaluate(()=>S.ans[0]&&S.ans[0][0]),await t2.evaluate(()=>poolOf(S.qs[0])[5]),'touch drag places the option');
  assert.strictEqual(await t2.evaluate(()=>scrollY),y0,'touch drag does not scroll');
  await swipe(await centre('#s0'),await centre('#s1'));
  assert.strictEqual(await t2.evaluate(()=>S.ans[0].findIndex(v=>v)),1); assert.strictEqual(await t2.evaluate(()=>scrollY),y0);
  await t2.tap('#s1'); await t2.tap('#s2'); assert.strictEqual(await t2.evaluate(()=>S.ans[0].findIndex(v=>v)),2,'tap-to-place works');
  // control: a swipe that starts on the question text still scrolls
  await t2.evaluate(()=>window.scrollTo(0,0)); const [sx,sy]=await centre('.stem'); await swipe([sx,sy],[sx,sy-150]);
  assert.ok(await t2.evaluate(()=>scrollY)>0,'the rest of the page still scrolls by touch');
  await touch.close();
  console.log('touch ok');
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

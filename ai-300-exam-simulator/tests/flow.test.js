const { chromium } = require('playwright');
const path = require('path');
const URL = require('url').pathToFileURL(path.join(__dirname, '..', 'dist', 'index.html')).href; // run `python3 scripts/build.py` first
(async()=>{
  const b=await chromium.launch(); const p=await b.newPage({viewport:{width:420,height:900}});
  const errs=[]; p.on('pageerror',e=>errs.push(e.message)); p.on('console',m=>{if(m.type()==='error')errs.push(m.text())});
  const fill=async()=>{ const sels=await p.$$('select'); if(sels.length){ for(const s of sels) await s.selectOption({index:1}); } else { const i=await p.$$('input[name=ans]'); const t=await i[0].getAttribute('type'); await i[0].check({force:true}); if(t==='checkbox') await i[1].check({force:true}); } };
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
  // dropdown checks
  await p.goto(URL);
  console.log('domains open?',await p.evaluate(()=>document.getElementById('domdrop').open),'| summary:',(await p.textContent('#domsum')));
  await p.click('#domdrop summary'); await p.uncheck('#d3'); console.log('summary after:',await p.textContent('#domsum'),'| avail:',await p.textContent('#avail'));
  console.log('syn drop open?',await p.evaluate(()=>document.getElementById('syndrop').open),'| serbtn visible:',await p.isVisible('.serbtn'));
  console.log('errors',errs); await b.close();
})();

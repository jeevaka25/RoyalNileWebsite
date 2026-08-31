const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const assert=require('node:assert/strict');
const {SITE}=require('./data');
const root=path.join(__dirname,'..');
const read=file=>fs.readFileSync(path.join(root,file),'utf8');
const script=read('analytics-events.js');
const paths=[...read('sitemap.xml').matchAll(/<loc>(.*?)<\/loc>/g)].map(m=>new URL(m[1]).pathname);
let count=0;
function verifyButtons(html,pathname) {
  const listeners={},pixel=[],ga=[];
  vm.runInNewContext(script,{URL,location:{pathname,href:SITE.origin+pathname+'?private=hidden'},document:{addEventListener:(name,fn,capture)=>{listeners[name]=fn;if(name==='click')assert.equal(capture,true,'Nested button propagation must not block tracking');}},gtag:(...args)=>ga.push(args),fbq:(...args)=>pixel.push(args)});
  for(const match of html.matchAll(/<a\b([^>]*href="([^"]+)"[^>]*)>/g)) {
    const href=match[2].replaceAll('&amp;','&');
    const host=new URL(href,SITE.origin).hostname;
    const inquiry=match[1].includes('data-tour-inquiry');
    const expected=inquiry?'enquiry_start':host==='wa.me'||host==='api.whatsapp.com'?'whatsapp_click':/(^|\.)airbnb\.[a-z.]+$/.test(host)?'airbnb_click':host==='booking.com'||host.endsWith('.booking.com')?'booking_click':null;
    const before=pixel.length;
    listeners.click({target:{closest:()=>({href,hasAttribute:name=>name==='data-tour-inquiry'&&inquiry})}});
    assert.equal(pixel.length,before+(expected?1:0));
    if(expected){assert.equal(pixel.at(-1)[0],'trackCustom');assert.equal(pixel.at(-1)[1],expected);assert.equal(ga.at(-1)[1],expected);assert.equal(pixel.at(-1)[2].page_path,pathname);assert.equal(pixel.at(-1)[2].destination_host,host);assert.deepEqual(Object.keys(pixel.at(-1)[2]).sort(),['destination_host','page_path']);count++;}
  }
  listeners['royal-inquiry-outbound']();assert.equal(pixel.at(-1)[1],'whatsapp_click');
  assert.ok(!JSON.stringify(pixel).includes('private=hidden'));
}
for(const pathname of paths) {
  const html=read(pathname==='/'?'index.html':pathname.slice(1)+(pathname.endsWith('/')?'index.html':pathname.endsWith('.html')?'':'.html'));
  assert.equal((html.match(/src="\/analytics-events\.js"/g)||[]).length,1,pathname);
  assert.equal((html.match(new RegExp("fbq\\('init','"+SITE.metaPixel+"'\\)",'g'))||[]).length,1,'Pixel must initialize exactly once: '+pathname);
  assert.ok(html.includes("fbq('track','PageView')"),pathname);
  verifyButtons(html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/g,''),pathname);
}
// Check the actual dynamically rendered homepage/search-result buttons too.
const home=read('index.html'),grid={innerHTML:''};
const ctx={document:{getElementById:()=>grid},vPhoto:()=>'/test.webp',requestAnimationFrame:()=>{},Set,encodeURIComponent};
vm.runInNewContext(read('villa-data.js')+"\nconst FEATURED_VILLA_IDS=new Set(['nile-view-luxury-2','nile-view-2']);\n"+home.slice(home.indexOf('function renderVillas('),home.indexOf('// ============================================\n// VILLA MODAL'))+"\nrenderVillas(VILLAS.map(v=>({...v,available:true})),'2026-12-10','2026-12-14');",ctx);
verifyButtons(grid.innerHTML,'/');
assert.ok(home.includes("document.dispatchEvent(new Event('royal-inquiry-outbound'));"));
console.log(`Pixel checks passed: ${paths.length} pages initialize pixel ${SITE.metaPixel} once; ${count} static/dynamic booking links invoke the correct custom event, including nested targets and enquiry handoffs. No message/date/form data is sent in event parameters. This tests site-side dispatch, not Meta dashboard receipt.`);

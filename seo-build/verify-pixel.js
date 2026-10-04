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
    const host=new URL(href,SITE.origin+pathname).hostname;
    const inquiry=match[1].includes('data-tour-inquiry');
    const expected=inquiry?'enquiry_start':host==='wa.me'||host==='api.whatsapp.com'?'whatsapp_click':/(^|\.)airbnb\.[a-z.]+$/.test(host)?(new URL(href,SITE.origin+pathname).pathname.includes('/users/')?'airbnb_profile_click':'airbnb_click'):host==='booking.com'||host.endsWith('.booking.com')?'booking_click':host==='egyptvillastours.com'&&new URL(href,SITE.origin+pathname).pathname==='/tours/luxor-solar-eclipse-2027-package'&&pathname!=='/tours/luxor-solar-eclipse-2027-package'?'eclipse_package_click':null;
    const before=pixel.length;
    listeners.click({target:{closest:()=>({href,hasAttribute:name=>name==='data-tour-inquiry'&&inquiry})}});
    const isLead=['whatsapp_click','airbnb_click','booking_click'].includes(expected);
    assert.equal(pixel.length,before+(expected?1:0)+(isLead?1:0));
    if(expected){assert.equal(pixel[before][0],'trackCustom');assert.equal(pixel[before][1],expected);assert.equal(ga.at(-1)[1],expected);assert.equal(pixel[before][2].page_path,pathname);assert.equal(pixel[before][2].destination_host,host);assert.deepEqual(Object.keys(pixel[before][2]).sort(),['content_id','cta_location','destination_host','enquiry_mode','page_path']);count++;}
    if(isLead){const lead=pixel[before+1];assert.equal(lead[0],'track');assert.equal(lead[1],'Lead');assert.equal(lead[2].content_category,expected.replace('_click',''));assert.deepEqual(Object.keys(lead[2]).sort(),['content_category','destination_host','page_path']);}
  }
  const beforeHandoff=pixel.length;
  listeners['royal-inquiry-outbound']();
  assert.equal(pixel.length,beforeHandoff+2);
  assert.equal(pixel[beforeHandoff][1],'whatsapp_click');
  assert.equal(pixel[beforeHandoff+1][0],'track');
  assert.equal(pixel[beforeHandoff+1][1],'Lead');
  assert.ok(!JSON.stringify(pixel).includes('private=hidden'));
}
for(const pathname of paths) {
  const html=read(pathname==='/'?'index.html':pathname.slice(1)+(pathname.endsWith('/')?'index.html':pathname.endsWith('.html')?'':'.html'));
  assert.equal((html.match(/src="\/analytics-events\.js\?v=20261004-context"/g)||[]).length,1,pathname);
  assert.equal((html.match(new RegExp("fbq\\('init','"+SITE.metaPixel+"'\\)",'g'))||[]).length,1,'Pixel must initialize exactly once: '+pathname);
  assert.ok(html.includes("fbq('track','PageView')"),pathname);
  verifyButtons(html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/g,''),pathname);
}
// Check the actual dynamically rendered homepage/search-result buttons too.
const home=read('index.html'),grid={innerHTML:''};
const ctx={document:{getElementById:()=>grid},vPhoto:()=>'/test.webp',requestAnimationFrame:()=>{},Set,encodeURIComponent};
vm.runInNewContext(read('villa-data.js')+"\nconst FEATURED_VILLA_IDS=new Set(['nile-view-luxury-2','nile-view-2']);\n"+home.slice(home.indexOf('function renderVillas('),home.indexOf('// ============================================\n// VILLA MODAL'))+"\nrenderVillas(VILLAS.map(v=>({...v,available:true})),'2026-12-10','2026-12-14');",ctx);
verifyButtons(grid.innerHTML,'/');
assert.ok(home.includes("document.dispatchEvent(new CustomEvent('royal-inquiry-outbound', {detail: {tourName: form.dataset.tourName}}));"));
console.log(`Pixel checks passed: ${paths.length} pages initialize pixel ${SITE.metaPixel} once; ${count} static/dynamic booking links invoke the correct custom event and exactly one standard Lead for outbound booking/WhatsApp actions, including nested targets and enquiry handoffs. No message/date/form data is sent in event parameters. This tests site-side dispatch, not Meta dashboard receipt.`);

const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const {TOURS}=require('./data');
const {legacyMap}=require('./tour-routing');
const root=path.join(__dirname,'..');
const read=file=>fs.readFileSync(path.join(root,file),'utf8');
const config=JSON.parse(read('vercel.json'));
const redirects=new Map(config.redirects.filter(r=>!r.has).map(r=>[r.source,r]));
const apache=read('.htaccess');
const apacheRedirects=apache.split('\n').filter(line=>/^RewriteRule/.test(line)&&line.includes('[R=301,L]')).map(line=>{const [,pattern,target]=line.split(' ');return {pattern:new RegExp(pattern),target};});
for(const [old,destination] of legacyMap) for(const suffix of ['', '/', '.html', '.html/']) {
  const route=redirects.get(old+suffix);assert.ok(route,old+suffix);assert.equal(route.destination,destination);assert.equal(route.permanent,true);
  assert.ok(!redirects.has(destination),'Redirect chain at '+destination);
  assert.equal(apacheRedirects.find(r=>r.pattern.test((old+suffix).slice(1)))?.target,destination);
}
const pages=[...read('sitemap.xml').matchAll(/<loc>(.*?)<\/loc>/g)].map(m=>new URL(m[1]).pathname);
assert.equal(pages.length,34);
for(const tour of TOURS) {
  assert.ok(pages.includes('/'+tour.primarySlug));assert.ok(!pages.includes('/'+tour.legacySlug));
  assert.ok(!fs.existsSync(path.join(root,tour.legacySlug+'.html')),'Old duplicate file remains');
  const html=read(tour.primarySlug+'.html');
  assert.ok(html.includes(`rel="canonical" href="https://egyptvillastours.com/${tour.primarySlug}"`));
  assert.ok(html.includes(`property="og:url" content="https://egyptvillastours.com/${tour.primarySlug}"`));
  assert.ok(config.rewrites.some(r=>r.source==='/'+tour.primarySlug&&r.destination==='/'+tour.primarySlug+'.html'));
}
for(const pathname of pages) {
  const html=read(pathname==='/'?'index.html':pathname.slice(1)+(pathname.endsWith('/')?'index.html':pathname.endsWith('.html')?'':'.html'));
  for(const match of html.matchAll(/href="([^"]+)"/g)) {
    const url=new URL(match[1],'https://egyptvillastours.com'+pathname);
    if(url.hostname!=='egyptvillastours.com')continue;
    assert.ok(!legacyMap.has(url.pathname),'Old internal tour link on '+pathname+': '+url.pathname);
  }
}
// Dynamic homepage tour cards must link to the same ten canonical destinations.
const home=read('index.html'),grid={innerHTML:''};
const snippet=home.slice(home.indexOf('const TOUR_PAGE='),home.indexOf('// ============================================\n// INIT'));
vm.runInNewContext(snippet+'\nrenderTours();',{TOURS,document:{getElementById:()=>grid},optimizedImage:x=>x,requestAnimationFrame:()=>{}});
for(const t of TOURS)assert.ok(grid.innerHTML.includes(`href="/${t.primarySlug}"`));
for(const file of ['index.html','villas/index.html']) {
  const html=read(file);assert.ok(!html.includes('id="clearDates"'));assert.ok(!html.includes('id="bookingPanel"'));
  const heroEnd=file==='index.html'?html.indexOf('<!-- BOOKING DOCK START -->'):html.indexOf('</header>');
  assert.ok(html.indexOf('class="booking-dock"')>=heroEnd,'Search should follow hero');
}
console.log(`Tour migration passed: ${TOURS.length} canonical pages, ${legacyMap.size*4} legacy variants, matching server configs, metadata, sitemap and internal links.`);

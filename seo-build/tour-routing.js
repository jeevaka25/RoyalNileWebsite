// Keep Hostinger and Vercel on the same canonical tour URLs.
const fs = require('node:fs');
const path = require('node:path');
const {TOURS} = require('./data');
const ROOT = path.join(__dirname,'..');
const escapeRegex = value => value.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
const legacyMap = new Map(TOURS.flatMap(t => [t.legacySlug,...t.aliases].map(slug => ['/'+slug,'/'+t.primarySlug])));

function updateRouting() {
  const apacheFile = path.join(ROOT,'.htaccess');
  let apache = fs.readFileSync(apacheFile,'utf8');
  const rules = TOURS.map(t => {
    const old = [...new Set([t.legacySlug,...t.aliases])].map(escapeRegex).join('|');
    const current = escapeRegex(t.primarySlug);
    return `RewriteRule ^(${old})(?:\\.html)?/?$ /${t.primarySlug} [R=301,L]\nRewriteCond %{THE_REQUEST} \\s/+${current}(?:/|\\.html/?)[?\\s] [NC]\nRewriteRule ^${current}(?:/|\\.html/?)$ /${t.primarySlug} [R=301,L]\nRewriteRule ^${current}$ ${t.primarySlug}.html [L]`;
  }).join('\n\n');
  const block = `# BEGIN GENERATED TOUR ROUTES\n# Keep old links and campaign query strings; do not remove these redirects.\n${rules}\n# END GENERATED TOUR ROUTES`;
  if(apache.includes('# BEGIN GENERATED TOUR ROUTES')) apache=apache.replace(/# BEGIN GENERATED TOUR ROUTES[\s\S]*?# END GENERATED TOUR ROUTES/,block);
  else apache=apache.replace('# Public collection URLs',block+'\n\n# Public collection URLs');
  fs.writeFileSync(apacheFile,apache);

  const configFile=path.join(ROOT,'vercel.json');
  const config=JSON.parse(fs.readFileSync(configFile,'utf8'));
  const isTourPath=value=>legacyMap.has(value.replace(/(?:\.html)?\/?$/,'')) || TOURS.some(t=>value.replace(/(?:\.html)?\/?$/,'')==='/'+t.primarySlug);
  const redirects=(config.redirects || []).filter(r=>!isTourPath(r.source)).map(r=>({...r,destination:legacyMap.get(r.destination)||r.destination}));
  for(const [old,destination] of legacyMap) for(const suffix of ['', '/', '.html', '.html/']) redirects.push({source:old+suffix,destination,permanent:true});
  for(const t of TOURS) for(const suffix of ['/', '.html', '.html/']) redirects.push({source:'/'+t.primarySlug+suffix,destination:'/'+t.primarySlug,permanent:true});
  const rewrites=(config.rewrites || []).filter(r=>!isTourPath(r.source) && !TOURS.some(t=>r.destination==='/'+t.legacySlug+'.html'));
  for(const t of TOURS) rewrites.push({source:'/'+t.primarySlug,destination:'/'+t.primarySlug+'.html'});
  config.redirects=redirects;config.rewrites=rewrites;
  fs.writeFileSync(configFile,JSON.stringify(config,null,2)+'\n');
}
module.exports={updateRouting,legacyMap};

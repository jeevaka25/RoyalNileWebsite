// Reuse the live card templates so crawlers and no-JS visitors receive real links.
const fs=require('node:fs'), vm=require('node:vm'),path=require('node:path');
const root=path.resolve(__dirname,'../..'), file=path.join(root,'index.html');
let html=fs.readFileSync(file,'utf8');
const grid={innerHTML:''}, toursGrid={innerHTML:''};
const context={URL,encodeURIComponent,document:{getElementById:id=>id==='villaGrid'?grid:toursGrid},requestAnimationFrame:()=>{}};
const slice=(start,end)=>html.slice(html.indexOf(start),html.indexOf(end,html.indexOf(start)));
const code=fs.readFileSync(path.join(root,'villa-data.js'),'utf8')+'\n'+
 slice('const SITE_VILLA_PHOTOS =','// ============================================\n// TOUR DATA')+'\n'+
 slice('const TOURS = [','function tourIdFromPath')+'\n'+
 "const FEATURED_VILLA_IDS=new Set(['nile-view-luxury-2','nile-view-2']);\n"+
 slice('function renderVillas(','// ============================================\n// VILLA MODAL')+'\n'+
 slice('const TOUR_PAGE=','// ============================================\n// INIT')+'\n'+
 'renderVillas(VILLAS.filter(v=>!FEATURED_VILLA_IDS.has(v.id)).map(v=>({...v,available:null})));renderTours();';
vm.runInNewContext(code,context);
for(const [id,node] of [['villaGrid',grid],['toursGrid',toursGrid]]) {
 const marker=`<!-- seo-cards:${id} -->`, end=`<!-- /seo-cards:${id} -->`;
 const start=html.indexOf(marker), finish=html.indexOf(end);
 if(start>=0)html=html.slice(0,start)+html.slice(finish+end.length);
 const opening=new RegExp('(<div[^>]*id="'+id+'"[^>]*>)');
 html=html.replace(opening,'$1'+marker+node.innerHTML.replaceAll('fade-up','fade-up visible')+end);
}
fs.writeFileSync(file,html.replace(/[ \t]+$/gm,''));
console.log('Prerendered 6 apartment cards alongside 2 featured apartments and all 10 tour cards. Runtime shuffle remains active.');

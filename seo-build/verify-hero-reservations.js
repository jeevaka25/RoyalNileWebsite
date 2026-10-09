const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const path=require('node:path'),root=path.join(__dirname,'..');
const read=f=>fs.readFileSync(path.join(root,f),'utf8');
const source=read('redesign/redesign.js');
const rotation=source.slice(source.indexOf('const heroReservationIds='),source.indexOf('let lenis;'));
const inventory={};vm.runInNewContext(read('villa-data.js')+';this.villas=VILLAS;',inventory);
const order=['nile-view-1','nile-view-2','nile-view-luxury-1','nile-view-luxury-2'];
function harness(store=new Map(),blocked=false){
 const pending=[];
 const links=['airbnb','booking'].map(platform=>({dataset:{reserve:platform},textContent:'Reserve on '+platform,handlers:{},setAttribute(k,v){this[k]=v},addEventListener(k,v){this.handlers[k]=v}}));
 const context={VILLAS:inventory.villas,document:{querySelectorAll:()=>links},setTimeout:fn=>pending.push(fn),localStorage:{getItem:k=>{if(blocked)throw Error('Blocked');return store.get(k)??null},setItem:(k,v)=>{if(blocked)throw Error('Blocked');store.set(k,v)}}};
 vm.runInNewContext(rotation,context);
 const click=(link,event={type:'click',button:0})=>{
  const destination=link.href;
  link.handlers[event.type](event);
  assert.equal(link.href,destination,'Do not replace the destination before this click navigates');
  pending.splice(0).forEach(fn=>fn());return destination;
 };
 return {links,click,store};
}
for(const blocked of [false,true]){
 const h=harness(new Map(),blocked);
 for(const [i,platform] of ['airbnb','booking'].entries()){
  const link=h.links[i],field=platform==='airbnb'?'airbnbUrl':'bookingUrl';
  const other=h.links[1-i].href;
  for(let n=0;n<8;n++){
   const expected=inventory.villas.find(v=>v.id===order[n%4]);
   assert.equal(link.dataset.villaId,expected.id);
   assert.equal(h.click(link),expected[field]);
   assert.equal(h.links[1-i].href,other,'Platforms must rotate independently');
  }
  const unchanged=link.href;
  h.click(link,{type:'click',defaultPrevented:true});assert.equal(link.href,unchanged);
  h.click(link,{type:'auxclick',button:2});assert.equal(link.href,unchanged);
  h.click(link,{type:'auxclick',button:1});assert.notEqual(link.href,unchanged);
 }
 if(!blocked){const restored=harness(h.store);assert.equal(restored.links[0].dataset.villaId,order[1]);assert.equal(restored.links[1].dataset.villaId,order[1]);}
}
const html=read('index.html');
assert.equal((html.match(/data-reserve=/g)||[]).length,2);
assert.ok(!html.includes('data-hero-video-toggle'));
assert.ok(html.includes('class="ev-eclipse-link"'));
console.log('Hero reservation checks passed: both platforms cycle through only the four requested apartments, independently; navigation keeps the clicked href; reload persistence, blocked storage, cancelled clicks and middle clicks behave correctly.');

(()=>{
'use strict';
window.ScrollCraft?.mount(document.querySelector('main')||document.body);
const reduce=matchMedia('(prefers-reduced-motion: reduce)'),fine=matchMedia('(hover:hover) and (pointer:fine)');
const nav=document.querySelector('.nav'),menu=nav?.querySelector('.ev-menu-toggle'),links=nav?.querySelector('.nav-links');
function toggleMenu(open){nav?.classList.toggle('menu-open',open);menu?.setAttribute('aria-expanded',String(open));if(links)links.inert=!open;}
toggleMenu(false);menu?.addEventListener('click',()=>toggleMenu(!nav.classList.contains('menu-open')));
links?.addEventListener('click',e=>{if(e.target.closest('a'))toggleMenu(false)});
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&nav?.classList.contains('menu-open')){toggleMenu(false);menu.focus()}if(e.key==='Tab'&&nav?.classList.contains('menu-open')){const focus=[menu,...links.querySelectorAll('a,button')];if(e.shiftKey&&document.activeElement===focus[0]){e.preventDefault();focus.at(-1).focus()}else if(!e.shiftKey&&document.activeElement===focus.at(-1)){e.preventDefault();focus[0].focus()}}});
// The final verified number is the semantic value; only its visual text ticks.
const counts=[...document.querySelectorAll('[data-ev-count]')];
function count(el){const target=+el.dataset.evCount,places=el.dataset.evCount.includes('.')?2:0;const format=x=>x.toLocaleString('en-GB',{minimumFractionDigits:places,maximumFractionDigits:places});if(reduce.matches){el.textContent=format(target);return}const start=performance.now();function frame(now){const p=Math.min(1,(now-start)/1600),n=target*(1-(1-p)**3);el.textContent=format(places?n:Math.round(n));if(p<1)requestAnimationFrame(frame)}requestAnimationFrame(frame)}
counts.forEach(count);
function shuffleChildren(container,selector){
 const cards=[...container.querySelectorAll(`:scope > ${selector}`)];if(cards.length<2)return;
 const random=max=>{if(globalThis.crypto?.getRandomValues){const value=new Uint32Array(1);crypto.getRandomValues(value);return value[0]%max}return Math.floor(Math.random()*max)};
 for(let i=cards.length-1;i>0;i--){const j=random(i+1);[cards[i],cards[j]]=[cards[j],cards[i]]}
 cards.forEach((card,i)=>{container.append(card);const number=card.querySelector('.collection-number');if(number)number.textContent=String(i+1).padStart(2,'0')});
}
function keepHomeApartmentsRandom(){
 const grid=document.querySelector('.ev-home #villaGrid');if(!grid)return;
 const randomize=()=>{watch.disconnect();shuffleChildren(grid,'.villa-card');watch.observe(grid,{childList:true})};
 const watch=new MutationObserver(()=>requestAnimationFrame(randomize));watch.observe(grid,{childList:true});
 if(grid.children.length)randomize();else document.addEventListener('DOMContentLoaded',randomize,{once:true});
}
for(const grid of document.querySelectorAll('.ev-collection .inventory-grid'))shuffleChildren(grid,'.inventory-card');
keepHomeApartmentsRandom();
const videos=[...document.querySelectorAll('.ev-hero video')];
for(const video of videos){let visible=true;const sync=()=>{if(reduce.matches||!visible||document.hidden)video.pause();else video.play().catch(()=>{})};new IntersectionObserver(es=>{visible=es[0].isIntersecting;sync()}).observe(video);document.addEventListener('visibilitychange',sync);reduce.addEventListener('change',sync);sync()}
const heroChoice=document.querySelector('[data-reserve]');
if(heroChoice&&typeof VILLAS!=='undefined'){const pool=VILLAS.filter(v=>['nile-view-luxury-1','nile-view-luxury-2','nile-view-1','nile-view-2'].includes(v.id));const random=new Uint32Array(1);crypto.getRandomValues(random);const villa=pool[random[0]%pool.length];document.querySelector('[data-reserve="airbnb"]').href=villa.airbnbUrl;document.querySelector('[data-reserve="booking"]').href=villa.bookingUrl;document.querySelectorAll('[data-reserve]').forEach(a=>a.setAttribute('aria-label',a.textContent+' · '+villa.shortName))}
let lenis;
if(window.Lenis&&!reduce.matches){lenis=new Lenis({autoRaf:true,lerp:.11,smoothWheel:true,syncTouch:false,anchors:{offset:-110},prevent:node=>!!node.closest('.modal-overlay,.lightbox,.nav-links,.ev-review-track,input,textarea,select')});reduce.addEventListener('change',()=>{if(reduce.matches){lenis.destroy();lenis=null}})}
for(const heading of document.querySelectorAll('main h2,main h3'))if(!heading.closest('.ev-hero'))heading.classList.add('ev-illuminate');
const revealTargets=[...document.querySelectorAll('main .section-header,main .featured-heading,main .amenity-item,main .featured-card,main .villa-card,main .tour-card,main .inventory-card,main .advice-card,main .ev-detail-intro>* ,main .ev-faqs>* ,main .related-card,main .cards .card,main .article-section,main .menu-category,main .location-content>*')];
for(const [i,el] of revealTargets.entries()){el.classList.add('ev-scroll-reveal');el.style.setProperty('--reveal-delay',`${Math.min(i%4,3)*55}ms`)}
if(!reduce.matches&&'IntersectionObserver' in window){document.documentElement.classList.add('ev-motion-ready');const observer=new IntersectionObserver(entries=>{for(const entry of entries)if(entry.isIntersecting){entry.target.classList.add('is-visible');observer.unobserve(entry.target)}},{rootMargin:'0px 0px -9% 0px',threshold:.08});revealTargets.forEach(el=>observer.observe(el))}else revealTargets.forEach(el=>el.classList.add('is-visible'));

const horizontalStories=[];
const illuminate=[...document.querySelectorAll('.ev-illuminate')],hero=document.querySelector('.ev-hero'),photoCards=[...document.querySelectorAll('.ev-photo-card')];let scheduled=false;
function paint(){scheduled=false;nav?.classList.toggle('is-scrolled',scrollY>60);
for(const h of illuminate){const r=h.getBoundingClientRect(),p=Math.max(0,Math.min(1,(innerHeight*.91-r.top)/(innerHeight*.55)));h.style.setProperty('--lit',(reduce.matches?100:p*100)+'%')}
if(hero&&!reduce.matches){const r=hero.getBoundingClientRect();if(r.bottom>0){hero.style.setProperty('--media-y',Math.min(100,-r.top*.14)+'px');hero.style.setProperty('--floor-y',Math.max(-28,r.top*.035)+'px')}}
for(const story of horizontalStories){if(reduce.matches||!story.section.classList.contains('ev-horizontal-ready'))continue;const r=story.section.getBoundingClientRect(),p=Math.max(0,Math.min(1,-r.top/story.distance));const target=p*story.max;if(Math.abs(story.track.scrollLeft-target)>1)story.track.scrollLeft=target}
for(let i=0;i<photoCards.length;i++){const card=photoCards[i],next=photoCards[i+1],r=card.getBoundingClientRect();if(r.bottom<0||r.top>innerHeight)continue;const overlap=next?Math.max(0,Math.min(1,(innerHeight*.78-next.getBoundingClientRect().top)/(innerHeight*.65))):0;card.querySelector('.ev-photo-inner').style.setProperty('--stack-scale',reduce.matches?1:1-overlap*.045)}
}
function requestPaint(){if(!scheduled){scheduled=true;requestAnimationFrame(paint)}}window.addEventListener('scroll',requestPaint,{passive:true});window.addEventListener('resize',requestPaint);paint();
for(const surface of document.querySelectorAll('.ev-relief')){surface.addEventListener('pointermove',e=>{if(!fine.matches||reduce.matches)return;const r=surface.getBoundingClientRect(),x=(e.clientX-r.left)/r.width,y=(e.clientY-r.top)/r.height;surface.style.setProperty('--relief-x',((x-.5)*32)+'px');surface.style.setProperty('--relief-y',((y-.5)*24)+'px');surface.style.setProperty('--light-x',(x*100)+'%');surface.style.setProperty('--light-y',(y*100)+'%')},{passive:true})}
for(const button of document.querySelectorAll('.ev-enlarge'))button.addEventListener('click',()=>button.closest('.ev-photo-inner').querySelector('img').click());
// The original image viewers, enquiry forms, menu filters and availability logic are retained.
// A glass review ring: scroll, swipe and keyboard all share the same position.
const reviewSection=document.querySelector('#guest-reviews');
if(reviewSection&&!reduce.matches){
 const cards=[...reviewSection.querySelectorAll('.ev-review-card')],track=reviewSection.querySelector('.ev-review-track');
 const stage=document.createElement('div');stage.className='ev-ring-stage';while(reviewSection.firstChild)stage.append(reviewSection.firstChild);reviewSection.append(stage);reviewSection.classList.add('ev-ring-section');
 const scene=document.createElement('div');scene.className='ev-ring-scene';track.before(scene);scene.append(track);track.classList.add('ev-ring');
 const count=cards.length,step=360/count,turn=step*(count-1),status=stage.querySelector('.ev-review-status');let angle=0,lean=0,targetLean=0,last=0,active=-1;
 cards.forEach((c,i)=>{c.style.setProperty('--ring-angle',`${i*step}deg`);const inner=document.createElement('div');inner.className='ev-glass-review';while(c.firstChild)inner.append(c.firstChild);c.append(inner)});
 function progress(){const r=reviewSection.getBoundingClientRect();return Math.max(0,Math.min(1,-r.top/(reviewSection.offsetHeight-innerHeight)))}
 function go(i){i=Math.max(0,Math.min(count-1,i));const top=scrollY+reviewSection.getBoundingClientRect().top+i/(count-1)*(reviewSection.offsetHeight-innerHeight);if(lenis)lenis.scrollTo(top);else scrollTo({top,behavior:'smooth'})}
 stage.querySelector('[data-review-prev]').addEventListener('click',()=>go(active-1));stage.querySelector('[data-review-next]').addEventListener('click',()=>go(active+1));
 track.addEventListener('keydown',e=>{if(['ArrowRight','ArrowLeft','Home','End'].includes(e.key)){e.preventDefault();go(e.key==='Home'?0:e.key==='End'?count-1:active+(e.key==='ArrowRight'?1:-1))}});
 let startX=0;scene.addEventListener('touchstart',e=>startX=e.touches[0].clientX,{passive:true});scene.addEventListener('touchend',e=>{const delta=e.changedTouches[0].clientX-startX;if(Math.abs(delta)>40)go(active+(delta<0?1:-1))},{passive:true});
 scene.addEventListener('pointermove',e=>{if(fine.matches)targetLean=(e.clientX/innerWidth-.5)*7});scene.addEventListener('pointerleave',()=>targetLean=0);
 function tick(now){const r=reviewSection.getBoundingClientRect(),visible=r.top<innerHeight&&r.bottom>0;if(visible){const dt=Math.min((now-last)/1000,.05)||.016,f=1-Math.exp(-10*dt);angle+=(-progress()*turn-angle)*f;lean+=(targetLean-lean)*f;track.style.setProperty('--ring-turn',`${angle+lean}deg`);const next=Math.max(0,Math.min(count-1,Math.round(-angle/step)));if(next!==active){active=next;status.textContent=`${active+1} of ${count}`;stage.querySelector('[data-review-prev]').disabled=active===0;stage.querySelector('[data-review-next]').disabled=active===count-1}cards.forEach((c,i)=>{const facing=Math.cos((i*step+angle+lean)*Math.PI/180);c.style.opacity=String(.2+.8*Math.max(0,facing));c.style.visibility=facing<-.06?'hidden':'visible';c.inert=i!==active})}last=now;requestAnimationFrame(tick)}requestAnimationFrame(tick);
}else if(reviewSection){const track=reviewSection.querySelector('.ev-review-track');reviewSection.querySelector('[data-review-next]').addEventListener('click',()=>track.scrollBy({left:track.clientWidth*.85}));reviewSection.querySelector('[data-review-prev]').addEventListener('click',()=>track.scrollBy({left:-track.clientWidth*.85}))}
// Preserve inline emphasis and links while revealing words in sequence.
const flowObserver=new IntersectionObserver(entries=>{for(const e of entries)if(e.isIntersecting){e.target.classList.add('ev-flowed');flowObserver.unobserve(e.target)}},{threshold:.1,rootMargin:'0px 0px -4% 0px'});
function prepareText(root=document){
 if(reduce.matches)return;
 const selector='main h1,main h2,main .section-subtitle,main .lede,main .article-section>p,.amenities-section,.villa-card,.tour-card,.inventory-card';
 const roots=[...(root.matches?.(selector)?[root]:[]),...root.querySelectorAll(selector)];
 for(const el of roots){
  if(el.closest('#guest-reviews,.ev-flow-word,.ev-word-flow'))continue;
  const walker=document.createTreeWalker(el,NodeFilter.SHOW_TEXT),nodes=[];
  while(walker.nextNode()){const n=walker.currentNode;if(n.textContent.trim()&&!n.parentElement.closest('.ev-word-flow,.ev-flow-word,script,style,button,.emoji,[aria-hidden="true"]'))nodes.push(n)}
  for(const node of nodes){
   const wrapper=document.createElement('span');wrapper.className='ev-word-flow';let i=0;
   for(const word of node.textContent.split(/(\s+)/)){if(!word.trim()){wrapper.append(document.createTextNode(word));continue}const span=document.createElement('span');span.className='ev-flow-word';span.textContent=word;span.style.setProperty('--word-delay',`${Math.min(i++*27,650)}ms`);wrapper.append(span)}
   node.replaceWith(wrapper);flowObserver.observe(wrapper);
  }
 }
}
prepareText();
// Collection cards are rendered again when availability changes.
const collectionTextObserver=new MutationObserver(entries=>{for(const entry of entries)for(const node of entry.addedNodes)if(node.nodeType===1&&!node.matches('.ev-word-flow,.ev-flow-word'))prepareText(node)});
for(const grid of document.querySelectorAll('#villaGrid,#toursGrid,.inventory-grid'))collectionTextObserver.observe(grid,{childList:true,subtree:true});
// Subtle fluted glass, built as a lightweight local surface in the lodge palette.
const glass=document.createElement('div');glass.className='ev-glass-ground';glass.setAttribute('aria-hidden','true');document.body.prepend(glass);
let px=0,py=0,gx=0,gy=0,glassFrame=0;
function glassPaint(){gx+=(px-gx)*.14;gy+=(py-gy)*.14;glass.style.setProperty('--glass-x',gx+'px');glass.style.setProperty('--glass-y',gy+'px');glass.style.setProperty('--glass-light-x',(50+gx*.65)+'%');glass.style.setProperty('--glass-light-y',(45+gy*.75)+'%');if(Math.abs(px-gx)+Math.abs(py-gy)>.15)glassFrame=requestAnimationFrame(glassPaint);else glassFrame=0}
if(!reduce.matches){addEventListener('pointermove',e=>{if(!fine.matches)return;px=(e.clientX/innerWidth-.5)*72;py=(e.clientY/innerHeight-.5)*48;if(!glassFrame)glassFrame=requestAnimationFrame(glassPaint)},{passive:true});addEventListener('scroll',()=>{glass.style.setProperty('--glass-scroll',`${-(scrollY%4000)*.018}px`)},{passive:true})}

document.documentElement.classList.add('ev-ready');
})();

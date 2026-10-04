const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const root=require('node:path').join(__dirname,'..');
const prefs=fs.readFileSync(root+'/analytics-preferences.js','utf8');
const store=new Map();
const localStorage={getItem:k=>store.get(k),setItem:(k,v)=>store.set(k,v),removeItem:k=>store.delete(k)};
for(const [query,excluded] of [['?analytics_test=1',true],['',true],['?analytics_test=0',false],['',false]]){
 const window={};vm.runInNewContext(prefs,{URL,window,location:{href:'https://egyptvillastours.com/'+query,search:query},localStorage});
 assert.equal(window.siteAnalyticsExcluded,excluded);
 if(excluded)assert.equal(window['ga-disable-G-12JHJ887DG'],true);
}
const listeners={},events=[],window={siteAnalyticsExcluded:false};
vm.runInNewContext(fs.readFileSync(root+'/analytics-events.js','utf8'),{URL,window,location:{href:'https://egyptvillastours.com/',pathname:'/'},document:{addEventListener:(n,f)=>listeners[n]=f},gtag:(...args)=>events.push(args)});
listeners['royal-inquiry-outbound']({detail:{tourName:'Luxor Solar Eclipse 2027',private:'NEVER_SEND'}});
assert.equal(events[0][2].content_id,'eclipse-2027');assert.equal(events[0][2].enquiry_mode,'form_handoff');
assert.ok(!JSON.stringify(events).includes('NEVER_SEND'));
window.siteAnalyticsExcluded=true;listeners['royal-inquiry-outbound']();assert.equal(events.length,1);
console.log('PASS: explicit test exclusion persists and reverses; form handoff carries eclipse context without private data; excluded browser emits no event.');

const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');
const root = path.join(__dirname,'..');
const source = fs.readFileSync(path.join(root,'availability-search.js'),'utf8');
const inventory = Array.from({length:8},(_,i) => ({id:`apartment-${i}`,roomId:`room-${i}`,icalUrl:'https://www.airbnb.com/calendar/ical/test'}));
function harness(fetchImpl) {
  const elements = new Map();
  const get = id => {
    if (!elements.has(id)) elements.set(id,{value:'',textContent:'',hidden:true,disabled:false,handlers:{},style:{setProperty(){}},
      addEventListener(event,fn){this.handlers[event]=fn;},setAttribute(){},removeAttribute(){},getBoundingClientRect(){return {height:90};},
      reportValidity(){return true;},scrollIntoView(){},reset(){get('checkin').value='';get('checkout').value='';}});
    return elements.get(id);
  };
  const context={window:{},URL,Date,AbortController,setTimeout,clearTimeout,fetch:fetchImpl,ResizeObserver:class {observe(){}},document:{getElementById:get,querySelector:get,body:get('body')}};
  vm.runInNewContext(source,context);
  let rendered=null,resetCount=0;
  context.window.RoyalAvailability.mount({inventory,resultsId:'results',render:items=>{rendered=items;},reset:()=>{resetCount++;}});
  const submit=()=>get('availabilityForm').handlers.submit({preventDefault(){}});
  const dates=()=>{get('checkin').value='2099-12-10';get('checkout').value='2099-12-14';};
  return {get,dates,submit,api:context.window.RoyalAvailability,rendered:()=>rendered,resets:()=>resetCount};
}
const response=values=>({ok:true,json:async()=>({results:inventory.map((v,i)=>({id:v.id,available:values[i%values.length]}))})});
(async()=>{
  let requests=0;
  const mixed=harness(async(url,options)=>{
    requests++; assert.equal(url,'/api/availability');assert.equal(options.method,'POST');
    const body=JSON.parse(options.body);assert.equal(body.calendars.length,8);assert.equal(body.checkin,'2099-12-10');
    return response([true,false,null]);
  });
  await mixed.submit();assert.equal(requests,0,'Missing dates must not make a request');
  mixed.dates();await mixed.submit();assert.equal(mixed.rendered().length,3);assert.match(mixed.get('bookingResultsMessage').textContent,/2 could not be verified/);
  mixed.get('clearDates').handlers.click();assert.equal(mixed.get('bookingResults').hidden,true);assert.equal(mixed.get('checkin').value,'');assert.equal(mixed.resets(),1);
  mixed.dates();mixed.get('checkin').value='2000-01-01';await mixed.submit();assert.equal(requests,1,'Past dates must not request availability');
  mixed.dates();mixed.get('checkout').value='2099-12-09';await mixed.submit();assert.equal(requests,1,'Reversed dates must not request availability');
  mixed.dates();mixed.get('checkin').value='2099-12-15';mixed.get('checkin').handlers.change();assert.equal(mixed.get('checkout').value,'');assert.equal(mixed.get('checkout').min,'2099-12-16');
  for (const values of [[false],[null],['true'],[undefined]]) {
    const test=harness(async()=>response(values));test.dates();await test.submit();assert.equal(test.rendered().length,0,'Unverified or booked must never count as available');
    assert.equal(test.get('bookingResults').hidden,false);assert.equal(test.get('searchBtn').disabled,false);
  }
  for (const fetchImpl of [async()=>({ok:false}),async()=>{throw new Error('Network unavailable');},async()=>({ok:true,json:async()=>{throw new Error('Invalid JSON');}})]) {
    const test=harness(fetchImpl);test.dates();await test.submit();assert.equal(test.rendered().length,0);assert.match(test.get('bookingResultsMessage').textContent,/could not be checked/);assert.equal(test.get('searchBtn').disabled,false);
  }
  const missing=harness(async()=>({ok:true,json:async()=>({})}));missing.dates();await missing.submit();assert.equal(missing.rendered().length,0);assert.match(missing.get('bookingResultsMessage').textContent,/8 could not be verified/);
  let resolve;
  const racing=harness(()=>new Promise(done=>{resolve=done;}));racing.dates();const pending=racing.submit();assert.equal(racing.get('searchBtn').disabled,true);
  racing.get('clearDates').handlers.click();resolve(response([true]));await pending;assert.equal(racing.rendered(),null,'A response after reset must not repaint the page');assert.equal(racing.get('bookingResults').hidden,true);
  let finishOld;
  const changed=harness(()=>new Promise(done=>{finishOld=done;}));changed.dates();const old=changed.submit();changed.get('checkin').value='2099-12-11';changed.get('checkin').handlers.change();finishOld(response([true]));await old;assert.equal(changed.rendered(),null,'A response for old dates must be ignored');
  // Existing public calendar inventory was relocated, not modified or duplicated.
  const client={};vm.runInNewContext(fs.readFileSync(path.join(root,'villa-data.js'),'utf8')+'\nthis.inventory=VILLAS;',client);
  const seo=require('./data').VILLAS;assert.equal(client.inventory.length,8);
  for(const v of seo){const match=client.inventory.find(item=>item.id===v.id);assert.ok(match);assert.equal(match.airbnbUrl,v.airbnbUrl);assert.equal(match.bookingUrl,v.bookingUrl);}
  for(const file of ['index.html','villas/index.html','tours/index.html']) {
    const html=fs.readFileSync(path.join(root,file),'utf8');
    for(const match of html.matchAll(/<script(\s[^>]*)?>([\s\S]*?)<\/script>/g)) {
      if(!/application\/ld\+json/.test(match[1]||'')) new vm.Script(match[2]);
    }
  }
  console.log('Booking checks passed: all 8 inventory links, mixed/booked/unknown results, dates, network/JSON failures, reset and stale-response protection, inline JS syntax.');
})().catch(error=>{console.error(error);process.exitCode=1;});

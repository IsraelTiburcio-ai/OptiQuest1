// Requires Playwright available in the test environment and candidate served locally.
import {chromium,webkit} from 'playwright';
import assert from 'node:assert/strict';
for(const [name,engine] of [['chromium',chromium],['webkit',webkit]]){
 const browser=await engine.launch();
 try{
  const page=await browser.newPage();const mp3=[];
  page.on('request',r=>{if(/\.mp3(?:\?|$)/.test(r.url()))mp3.push(r.url());});
  await page.addInitScript(()=>{window.__oscillators=0;const proto=(window.AudioContext||window.webkitAudioContext).prototype;const original=proto.createOscillator;proto.createOscillator=function(...args){window.__oscillators++;return original.apply(this,args);};});
  await page.goto('http://127.0.0.1:5295/');await page.locator('#btn-start').click();
  await page.waitForFunction(()=>window.__oscillators>0);
  assert.equal(mp3.length,0);console.log(`${name}: procedural oscillators active; zero MP3 requests PASS`);
 }finally{await browser.close();}
}

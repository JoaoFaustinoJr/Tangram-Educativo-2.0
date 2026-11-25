(()=>{'use strict';
const script=document.currentScript,key=script.dataset.key,src=new URL(script.dataset.track,script.src);
const audio=new Audio(src);audio.loop=true;audio.preload='none';audio.volume=.18;
let wanted=false;try{wanted=localStorage.getItem(key)==='on'}catch(_){}
const button=document.createElement('button');button.type='button';button.className='app-music-button';
button.style.cssText='margin:8px;padding:9px 14px;border:1px solid #aab7c7;border-radius:24px;background:#14263b;color:#fff;font:500 13px system-ui;cursor:pointer;min-height:40px';
const host=document.querySelector(script.dataset.host)||document.querySelector('main')||document.body;host.appendChild(button);
function label(){const on=!audio.paused;button.textContent=on?'♫ Música ligada':'♫ Música';button.setAttribute('aria-pressed',String(on));button.setAttribute('aria-label',on?'Desligar música ambiente':'Ligar música ambiente')}
function sync(){if(wanted&&!document.hidden)audio.play().then(label).catch(()=>{label();button.title='Toque para ouvir a música'});else{audio.pause();label()}}
button.addEventListener('click',()=>{wanted=audio.paused;try{localStorage.setItem(key,wanted?'on':'off')}catch(_){}sync()});
document.addEventListener('pointerdown',e=>{if(wanted&&e.target!==button)sync()});document.addEventListener('visibilitychange',sync);
audio.addEventListener('error',()=>{label();button.title='Não foi possível carregar a música. Toque para tentar novamente.'});label();
})();

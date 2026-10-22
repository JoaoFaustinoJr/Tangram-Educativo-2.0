/* Tangram Educativo — navegação de aulas v2: controles únicos e sem camadas bloqueadoras. */
(()=>{
 'use strict';
 const panel=()=>document.getElementById('lessons-panel');
 function home(){
  try{if(typeof window.closeLessonsHome==='function')window.closeLessonsHome()}catch(e){console.warn(e)}
  const p=panel();if(p){p.classList.remove('show','expanded','lesson-focus');p.style.removeProperty('display');p.style.removeProperty('visibility');p.style.removeProperty('opacity')}
  document.body.classList.remove('portal-lessons','portal-tangram');document.body.classList.add('portal-home');
  const portal=document.getElementById('platform-portal');if(portal)portal.hidden=false;
  for(const id of ['portal-back','portal-lesson-back']){const b=document.getElementById(id);if(b)b.hidden=true}
  const menu=document.querySelector('.menu');if(menu){menu.hidden=false;menu.setAttribute('aria-hidden','false')}
  const appMenu=document.getElementById('app-menu');if(appMenu)appMenu.hidden=false;
  window.scrollTo({top:0,behavior:'instant'});
 }
 function catalog(){
  const p=panel();if(!p)return;
  try{if(typeof window.lessonLobby==='function')window.lessonLobby()}catch(e){console.warn(e)}
  p.classList.remove('lesson-focus');
  p.querySelectorAll('details[open]').forEach(d=>d.open=false);
  p.scrollTo({top:0,behavior:'smooth'});
  p.querySelector('.lesson-years')?.scrollIntoView({block:'nearest',behavior:'smooth'});
 }
 function ensureNav(){
  const p=panel();if(!p)return;
  const actions=p.querySelector('.lessons-actions');if(!actions)return;
  actions.querySelectorAll('[data-nav]').forEach(b=>b.remove());
  if(!actions.querySelector('.lessons-catalog')){
   const b=document.createElement('button');b.type='button';b.className='lessons-catalog';b.textContent='← Catálogo';b.setAttribute('aria-label','Voltar ao catálogo de aulas');actions.prepend(b);
  }
  const start=actions.querySelector('.lessons-home');if(start){start.textContent='⌂ Portal Tangram';start.title='Voltar ao portal principal';start.setAttribute('aria-label','Voltar ao portal principal')}
 }
 function style(){
  if(document.getElementById('lessons-unified-navigation'))document.getElementById('lessons-unified-navigation').remove();
  const el=document.createElement('style');el.id='lessons-unified-navigation';el.textContent=`
   body.portal-lessons #portal-lesson-back{display:none!important;pointer-events:none!important}
   body.portal-lessons #lessons-panel.show{position:fixed!important;inset:0!important;max-width:none!important;width:100%!important;height:100dvh!important;overflow-y:auto!important;overflow-x:hidden!important;z-index:2147483000!important;pointer-events:auto!important}
   #lessons-panel .lessons-card{box-sizing:border-box;max-width:1100px;width:min(100%,1100px);margin:0 auto!important;padding:clamp(12px,2vw,28px)!important}
   #lessons-panel .lessons-actions{position:sticky;top:0;z-index:100;display:flex;flex-wrap:wrap;gap:8px;padding:9px;background:#092b40ee;border:1px solid #bd9853;border-radius:13px}
   #lessons-panel .lessons-actions button{min-height:44px;padding:8px 12px;border:1px solid #d9b76a;border-radius:10px;background:#123e55;color:#ffe7a7;font-weight:700;cursor:pointer;pointer-events:auto}
   #lessons-panel .lessons-actions .lessons-x{margin-left:auto}
   #lessons-panel .lessons-actions button:focus-visible{outline:3px solid #fff0aa;outline-offset:2px}
   #lessons-panel .lesson-library{max-width:100%;overflow-wrap:anywhere}
   @media(max-width:550px){#lessons-panel .lessons-actions button{font-size:.85rem}#lessons-panel .lessons-card{padding:10px!important}}
  `;document.head.appendChild(el);
 }
 function init(){
  style();
  const observer=new MutationObserver(()=>{const p=panel();if(p?.classList.contains('show')&&!p.querySelector('.lessons-catalog'))ensureNav()});
  observer.observe(document.body,{childList:true,subtree:true});
  ensureNav();
  document.addEventListener('click',e=>{
   const b=e.target.closest('#lessons-panel .lessons-catalog, #lessons-panel .lessons-home, #lessons-panel .lessons-x, #portal-lesson-back');
   if(!b)return;
   e.preventDefault();e.stopImmediatePropagation();
   if(b.classList.contains('lessons-catalog'))catalog();else home();
  },true);
 }
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
 window.tangramLessonsGoHome=home;
})();
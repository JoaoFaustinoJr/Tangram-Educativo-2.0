/* Tangram Educativo — navegação unificada das aulas. */
(()=>{
 'use strict';
 const panel=()=>document.getElementById('lessons-panel');
 const portal=()=>document.getElementById('platform-portal');
 function home(){
   try{if(typeof window.closeLessonsHome==='function')window.closeLessonsHome()}catch(e){console.warn(e)}
   const p=panel();p?.classList.remove('show','expanded');
   document.body.classList.remove('portal-lessons','portal-tangram');
   document.body.classList.add('portal-home');
   if(portal())portal().hidden=false;
   for(const id of ['portal-back','portal-lesson-back']){const el=document.getElementById(id);if(el)el.hidden=true}
   document.querySelector('.menu')?.removeAttribute('hidden');
   const menu=document.querySelector('#app-menu');if(menu)menu.hidden=false;
   window.scrollTo({top:0,behavior:'instant'});
 }
 function ensureNav(){
  const p=panel();if(!p||!p.classList.contains('show'))return;
  const actions=p.querySelector('.lessons-actions');if(!actions)return;
  if(!actions.querySelector('[data-nav="portal"]')){
   const b=document.createElement('button');b.type='button';b.dataset.nav='portal';b.textContent='⌂ Portal Tangram';b.setAttribute('aria-label','Voltar ao portal principal do Tangram');b.onclick=home;actions.prepend(b);
  }
  if(!actions.querySelector('[data-nav="catalog"]')){
   const b=document.createElement('button');b.type='button';b.dataset.nav='catalog';b.textContent='← Catálogo';b.setAttribute('aria-label','Voltar ao catálogo de aulas');b.onclick=()=>{if(typeof window.lessonLobby==='function')window.lessonLobby();else p.querySelector('.lesson-years button')?.click()};actions.prepend(b);
  }
 }
 function style(){
  const el=document.createElement('style');el.id='lessons-unified-navigation';el.textContent=`
   body.portal-lessons #lessons-panel.show{position:fixed!important;inset:0!important;max-width:none!important;width:100%!important;height:100dvh!important;overflow-y:auto!important;overflow-x:hidden!important;z-index:2147483000!important}
   #lessons-panel .lessons-card{box-sizing:border-box;max-width:1100px;width:min(100%,1100px);margin:0 auto!important;padding:clamp(12px,2vw,28px)!important}
   #lessons-panel .lessons-actions{position:sticky;top:0;z-index:100;display:flex;flex-wrap:wrap;gap:8px;padding:9px;background:#092b40ee;border:1px solid #bd9853;border-radius:13px}
   #lessons-panel .lessons-actions button{min-height:44px;padding:8px 12px;border:1px solid #d9b76a;border-radius:10px;background:#123e55;color:#ffe7a7;font-weight:700;cursor:pointer}
   #lessons-panel .lessons-actions button:focus-visible{outline:3px solid #fff0aa;outline-offset:2px}
   #lessons-panel .lesson-library{max-width:100%;overflow-wrap:anywhere}
   @media(max-width:550px){#lessons-panel .lessons-actions button{font-size:.85rem}#lessons-panel .lessons-card{padding:10px!important}}
  `;document.head.appendChild(el);
 }
 document.addEventListener('DOMContentLoaded',()=>{
  style();
  const observer=new MutationObserver(ensureNav);observer.observe(document.body,{childList:true,subtree:true,attributes:true,attributeFilter:['class']});
  ensureNav();
  document.addEventListener('click',e=>{if(e.target.closest('#portal-lesson-back')){e.preventDefault();home()}},true);
 });
 window.tangramLessonsGoHome=home;
})();
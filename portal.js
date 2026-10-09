(()=>{'use strict';
function init(){
 const home=document.getElementById('platform-portal'),back=document.getElementById('platform-return');
 if(!home||!back)return;
 const open=()=>{document.body.classList.remove('portal-active');document.body.classList.add('portal-inside');home.hidden=true;back.hidden=false;};
 const goHome=()=>{document.body.classList.add('portal-active');document.body.classList.remove('portal-inside');home.hidden=false;back.hidden=true;window.scrollTo({top:0,behavior:'smooth'});};
 document.getElementById('portal-tangram')?.addEventListener('click',()=>{open();document.querySelector('.game')?.scrollIntoView({block:'start'});});
 document.getElementById('portal-lessons')?.addEventListener('click',()=>{open();document.querySelector('.modes .aulas')?.click();});
 back.addEventListener('click',goHome);
 document.querySelectorAll('[data-menu="game"],[data-menu="catalog"]').forEach(el=>el.addEventListener('click',open));
 goHome();
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
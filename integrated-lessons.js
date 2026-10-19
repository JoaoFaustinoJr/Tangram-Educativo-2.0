/* Biblioteca integrada: atalhos por série, sem duplicar bancos de aulas. */
(()=>{'use strict';
const tracks={
5:[['🧩','Tangram e geometria','Formas, composição, simetria e figuras planas.','#math'],['🤖','Laboratório: primeiras máquinas','Componentes, LEDs e comandos simples.','#robotics']],
6:[['🗼','Torre de Hanói','Sequências, decomposição e algoritmos.','#prog'],['🔷','Tangram matemático','Ângulos, figuras e raciocínio espacial.','#math'],['🔬','Laboratório de circuitos','LED, resistor, interruptor e circuitos simples.','#lab']],
7:[['🗼','Hanói: estratégias','Padrões, movimentos mínimos e planejamento.','#pc'],['⚡','Circuitos em série e paralelo','Comparar trajetos da corrente e testar hipóteses.','#lab'],['🔷','Tangram e transformações','Rotação, reflexão e simetria.','#math']],
8:[['🗼','Hanói e programação','Recursividade e construção de algoritmos.','#prog'],['💻','Laboratório: hardware e software','Sensores, controladores e lógica de programação.','#lab'],['📐','Tangram: áreas e proporções','Composição, frações e equivalências.','#math']],
9:[['🗼','Hanói: complexidade','Generalização, recursão e eficiência.','#prog'],['🔌','Laboratório de automação','Sensores, atuadores e sistemas integrados.','#lab'],['📏','Tangram e demonstração','Geometria e argumentação matemática.','#math']]
};
let last='';
function update(){
 const panel=document.getElementById('lessons-panel');if(!panel||!panel.classList.contains('show'))return;
 const year=Number(panel.querySelector('.lesson-years button.on')?.dataset.y||6);
 const lib=panel.querySelector('.lesson-library');if(!lib)return;
 const key=year+':'+(panel.querySelector('.lesson-sections button.on')?.dataset.s||'');
 let section=panel.querySelector('#integrated-tracks');
 if(!section){section=document.createElement('section');section.id='integrated-tracks';section.className='integrated-tracks';lib.before(section)}
 if(last===key&&section.dataset.ready==='1')return;last=key;section.dataset.ready='1';
 section.innerHTML='<h4>🧭 Trilhas integradas do '+year+'º ano</h4><p>Estude o conceito nas Aulas e depois experimente no aplicativo. O conteúdo original permanece disponível.</p><div class="integrated-track-grid">'+(tracks[year]||[]).map(([icon,title,desc,route])=>'<button type="button" class="integrated-track" data-track="'+route.slice(1)+'"><b>'+icon+' '+title+'</b><small>'+desc+'</small><span>Ver aulas relacionadas →</span></button>').join('')+'</div>';
 section.querySelectorAll('[data-track]').forEach(btn=>btn.addEventListener('click',()=>{const target=panel.querySelector('.lesson-sections button[data-s="'+btn.dataset.track+'"]');if(target){target.click();panel.querySelector('.lesson-library')?.scrollIntoView({block:'start',behavior:'smooth'})}}));
}
document.addEventListener('DOMContentLoaded',()=>{const obs=new MutationObserver(()=>{if(document.getElementById('lessons-panel')?.classList.contains('show'))update()});obs.observe(document.body,{childList:true,subtree:true,attributes:true,attributeFilter:['class']});document.addEventListener('click',e=>{if(e.target.closest('#lessons-panel .lesson-years,#lessons-panel .lesson-sections'))queueMicrotask(update)});update()});
})();
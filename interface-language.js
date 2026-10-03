
/* Tangram interface languages: independent of X1 and game state. */
(()=>{
'use strict';
if(document.getElementById('tangram-language'))return;
const key='tangram-interface-language-v1';
const labels={
'Continuar desafio':['Continue challenge','Continuar desafío'],
'Escolher desafio':['Choose challenge','Elegir desafío'],
'Pedir ajuda à R.A.I.':['Ask R.A.I. for help','Pedir ayuda a R.A.I.'],
'Meu progresso':['My progress','Mi progreso'],
'Recordes Gamer':['Gamer records','Récords Gamer'],
'Perfil do aluno':['Student profile','Perfil del estudiante'],
'Área do professor':['Teacher area','Área del profesor'],
'Som e narração':['Sound and narration','Sonido y narración'],
'Acessibilidade e conforto':['Accessibility and comfort','Accesibilidad y comodidad'],
'Instalar':['Install','Instalar'],
'Compartilhar':['Share','Compartir'],
'Reiniciar desafio':['Restart challenge','Reiniciar desafío'],
'Sobre o Tangram':['About Tangram','Acerca de Tangram'],
'APRENDER E JOGAR':['LEARN AND PLAY','APRENDER Y JUGAR'],
'MEU ESPAÇO':['MY SPACE','MI ESPACIO'],
'PREFERÊNCIAS':['PREFERENCES','PREFERENCIAS'],
'APLICATIVO':['APPLICATION','APLICACIÓN'],
'Desafie seus amigos':['Challenge your friends','Desafía a tus amigos'],
'Jogue e evolua':['Play and grow','Juega y progresa'],
'Sala de Aula':['Classroom','Aula'],
'Aulas padrão e adaptadas':['Standard and adapted lessons','Lecciones estándar y adaptadas'],
'Use as 7 peças para formar a figura.':['Use the 7 pieces to form the shape.','Usa las 7 piezas para formar la figura.'],
'Verificar':['Check','Verificar'],
'Girar':['Rotate','Girar'],
'Espelhar':['Mirror','Reflejar'],
'Dica':['Hint','Pista'],
'Amostra':['Example','Ejemplo'],
'Ampliar':['Zoom in','Ampliar'],
'Escolha uma peça e comece o desafio.':['Choose a piece and start the challenge.','Elige una pieza y comienza el desafío.'],
'Matemática em jogo':['Mathematics in play','Matemáticas en juego'],
'Conceitos relacionados a este desafio':['Concepts related to this challenge','Conceptos relacionados con este desafío'],
'Desafios Tangram':['Tangram challenges','Desafíos Tangram'],
'Catálogo completo de figuras':['Complete shape catalog','Catálogo completo de figuras'],
'Progresso & Conquistas':['Progress & Achievements','Progreso y logros'],
'Níveis, medalhas e estatísticas':['Levels, medals and statistics','Niveles, medallas y estadísticas'],
'Ver resposta':['Show answer','Ver respuesta'],
'Peça selecionada':['Selected piece','Pieza seleccionada'],
'Triângulo grande':['Large triangle','Triángulo grande'],
'Clássicos':['Classics','Clásicos'],
'Mosaicos':['Mosaics','Mosaicos'],
'Outros Tangrans':['Other tangrams','Otros tangrams'],
'Continuar':['Continue','Continuar'],
'Missão concluída!':['Mission completed!','¡Misión completada!'],
'TEMPO':['TIME','TIEMPO'],
'PARAR':['STOP','PARAR'],
'PARAR = VALIDAR':['STOP = CHECK','PARAR = VALIDAR'],
'Fechar':['Close','Cerrar'],
'ACESSIBILIDADE':['ACCESSIBILITY','ACCESIBILIDAD'],
'Conforto de uso':['Ease of use','Comodidad de uso'],
'Texto maior':['Larger text','Texto más grande'],
'Alto contraste':['High contrast','Alto contraste'],
'Reduzir movimentos':['Reduce motion','Reducir movimiento'],
'Interface tranquila':['Calm interface','Interfaz tranquila'],
'Restaurar padrão':['Restore defaults','Restaurar valores predeterminados'],
'Voltar ao desafio':['Back to challenge','Volver al desafío'],
'Produto digital educacional':['Educational digital product','Producto digital educativo']
};
let language='pt';
try{const saved=localStorage.getItem(key);if(['pt','en','es'].includes(saved))language=saved;}catch{}
const originals=new WeakMap(), last=new WeakMap();
const select=document.createElement('select');
select.id='tangram-language';
select.setAttribute('aria-label','Idioma / Language / Idioma');
select.innerHTML='<option value="pt">Português</option><option value="en">English</option><option value="es">Español</option>';
select.value=language;
select.style.cssText='max-width:130px;min-height:40px;border:1px solid #6b8797;border-radius:10px;background:#102b3d;color:#fff;padding:6px;font:inherit;position:relative;z-index:2';
const header=document.querySelector('main.app header');
if(!header)return;
header.insertBefore(select,header.querySelector('.menu'));
function translate(value){
 if(language==='pt')return value;
 return value.replace(/^([\s\p{Extended_Pictographic}\uFE0F↗↺↻⇆◉⌕✓⏱♿◇⬇]*)(.*?)([\s✓]*)$/u,(all,prefix,body,suffix)=>{
 const entry=labels[body];return entry?prefix+entry[language==='en'?0:1]+suffix:all;
 });
}
function apply(){
 observer.disconnect();
 const walker=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT);
 let node;
 while((node=walker.nextNode())){
  if(node.parentElement.closest('script,style,pre,code,textarea,input,select,[contenteditable],svg'))continue;
  if(!originals.has(node)||node.nodeValue!==last.get(node))originals.set(node,node.nodeValue);
  const output=translate(originals.get(node));node.nodeValue=output;last.set(node,output);
 }
 document.documentElement.lang={pt:'pt-BR',en:'en',es:'es'}[language];
 observer.observe(document.body,{subtree:true,childList:true,characterData:true});
}
let pending=false;
const observer=new MutationObserver(()=>{
 if(pending)return;pending=true;
 requestAnimationFrame(()=>{pending=false;apply();});
});
select.addEventListener('change',()=>{
 language=select.value;
 try{localStorage.setItem(key,language);}catch{}
 apply();
});
apply();
})();

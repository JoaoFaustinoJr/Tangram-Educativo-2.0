(()=>{'use strict';
function run(source,context={}) {
 const mode=context.mode||'robot',lines=String(source).normalize('NFD').replace(/[\u0300-\u036f]/g,'').toUpperCase().split(/\r?\n/).map((s,i)=>({text:s.trim().replace(/\s+/g,' '),line:i+1})).filter(x=>x.text&&!x.text.startsWith('#'));
 if(!lines.length)throw new Error('Escreva um programa antes de executar.');
 if(lines.length>80)throw new Error('Use até 80 linhas.');
 let pos=0;const features=new Set();
 const allowed=mode==='computer'?['LER BOTAO','MOSTRAR OLA']:['LER SENSOR','LIGAR LED','DESLIGAR LED','PISCAR LED','PARAR MOTOR','LIGAR MOTOR'];
 function block(depth=0){if(depth>8)throw new Error('Use até 8 blocos aninhados.');const out=[];
 while(pos<lines.length){const x=lines[pos],t=x.text;if(t==='FIM'||t==='SENAO')break;pos++;
 const loop=t.match(/^REPETIR (\d+)$/),cond=mode==='computer'?t==='SE BOTAO = PRESSIONADO':t==='SE OBSTACULO';
 if(loop||cond){features.add(loop?'loop':'if');const count=loop?Number(loop[1]):0;if(loop&&(count<1||count>20))throw new Error('Linha '+x.line+': repita entre 1 e 20 vezes.');
 const body=block(depth+1);let otherwise=[];if(cond&&lines[pos]?.text==='SENAO'){pos++;otherwise=block(depth+1);}
 if(lines[pos]?.text!=='FIM')throw new Error('Linha '+x.line+': falta FIM para encerrar o bloco.');
 pos++;out.push({type:loop?'loop':'if',count,body,otherwise,line:x.line});}
 else{if(!allowed.includes(t))throw new Error('Linha '+x.line+': comando desconhecido: '+t);features.add(t);out.push({type:'command',text:t,line:x.line});}}
 return out;}
 const ast=block();if(pos<lines.length)throw new Error('Linha '+lines[pos].line+': '+lines[pos].text+' sem bloco correspondente.');
 const state={led:false,blinks:0,motor:true,shown:0,read:false,steps:0,trace:[],features};
 function execute(nodes,inLoop=false){for(const n of nodes){if(++state.steps>400)throw new Error('Programa muito longo: simplifique as repetições.');
 if(n.type==='loop'){for(let k=0;k<n.count;k++)execute(n.body,true);continue}
 if(n.type==='if'){if(!state.read)throw new Error('Linha '+n.line+': leia '+(mode==='computer'?'o botão':'o sensor')+' antes da condição.');execute((mode==='computer'?context.pressed:context.obstacle)?n.body:n.otherwise,inLoop);continue}
 const t=n.text;if(t.includes('LED')&&!context.hardware?.led)throw new Error('Linha '+n.line+': instale o LED.');
 if(t.includes('MOTOR')&&!context.hardware?.motor)throw new Error('Linha '+n.line+': instale o motor.');
 if(t==='LER SENSOR'&&!context.hardware?.sensor)throw new Error('Linha '+n.line+': instale o sensor.');
 if(t.startsWith('LER ')){state.read=true;state.trace.push(mode==='computer'?'BOTÃO: '+(context.pressed?'PRESSIONADO':'SOLTO'):'SENSOR: '+(context.obstacle?'OBSTÁCULO':'LIVRE'))}
 else if(t==='LIGAR LED'){state.led=true;state.trace.push('LED ACESO')}
 else if(t==='DESLIGAR LED'){state.led=false;state.trace.push('LED APAGADO')}
 else if(t==='PISCAR LED'){state.blinks++;state.led=false;state.trace.push('PISCADA '+state.blinks)}
 else if(t==='PARAR MOTOR'){state.motor=false;state.trace.push('MOTOR PARADO')}
 else if(t==='LIGAR MOTOR'){state.motor=true;state.trace.push('MOTOR EM MOVIMENTO')}
 else if(t==='MOSTRAR OLA'){state.shown++;state.trace.push('OLÁ!')}
 }}
 execute(ast);return state;
}
window.LabProgram={run};
window.LabProgress={complete(area,level){try{const key='tangramLabProgressV1',all=JSON.parse(localStorage.getItem(key)||'{}');all[area+':'+level]={completed:true,date:new Date().toISOString()};localStorage.setItem(key,JSON.stringify(all));}catch(_){}},has(area,level){try{return !!JSON.parse(localStorage.getItem('tangramLabProgressV1')||'{}')[area+':'+level]?.completed}catch(_){return false}}};
})();
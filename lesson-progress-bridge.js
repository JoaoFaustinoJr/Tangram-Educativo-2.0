/* Tangram: ponte para aulas, com autenticação Supabase obrigatória.
   Instalação opcional: window.tangramSupabaseClient deve ser o cliente autenticado.
   Nenhuma resposta é enviada sem sessão válida. */
(async()=>{
 const client=window.tangramSupabaseClient;
 if(!client?.auth?.getUser)return;
 const {data:{user}={},error}=await client.auth.getUser();
 if(error||!user)return;
 const {createStudentProgress}=await import('./student-progress.js');
 const store=createStudentProgress(client);
 window.tangramStudentProgress=store;
 
 // Sincroniza os indicadores que o catálogo de aulas usa para exibir conclusão.
 // A chave de atividade é estável (ID da aula), não o título visível.
 const PREFIX='tangram:lesson:';
 const localPrefixes=['tangram2LessonOpened:','tangram2LessonCode:','tangram2LessonDone:'];
 const pending=new Map();
 let syncing=false;
 function localState(lessonId){
   return {
     opened:localStorage.getItem(localPrefixes[0]+lessonId)==='1',
     code:localStorage.getItem(localPrefixes[1]+lessonId)==='1',
     tangram:!!localStorage.getItem(localPrefixes[2]+lessonId)
   };
 }
 function lessonIds(){
   const ids=new Set();
   for(let i=0;i<localStorage.length;i++){
     const key=localStorage.key(i)||'';
     for(const prefix of localPrefixes)if(key.startsWith(prefix))ids.add(key.slice(prefix.length));
   }
   return [...ids].filter(Boolean);
 }
 function applyRemote(lessonId,remote){
   const state=remote?.state||{};
   if(state.opened||remote?.status==='completed')localStorage.setItem(localPrefixes[0]+lessonId,'1');
   if(state.code)localStorage.setItem(localPrefixes[1]+lessonId,'1');
   if(state.tangram)localStorage.setItem(localPrefixes[2]+lessonId,JSON.stringify({synced:true,at:remote.updated_at||Date.now()}));
 }
 function refreshBadges(){
   const p=document.getElementById('lessons-panel');
   p?.querySelectorAll('[data-lesson-id]').forEach(el=>{
     const id=el.dataset.lessonId;
     const status=el.querySelector('.lesson-progress');
     if(!id||!status)return;
     const st=localState(id);
     status.querySelectorAll('span').forEach((chip,i)=>{
       const complete=[st.opened,st.code,st.tangram][i];
       if(complete!==undefined){chip.classList.toggle('done',complete);if(complete)chip.textContent=chip.textContent.replace(/^○/,'✓')}
     });
   });
   // Re-render the actual catalog with its own completion requirements when available.
   if(typeof window.tangramRefreshLessonProgress==='function')window.tangramRefreshLessonProgress();
 }
 async function syncOne(lessonId){
   if(!lessonId||syncing)return;
   const key=PREFIX+lessonId,local=localState(lessonId);
   try{
     const remote=await store.load(key);
     if(remote)applyRemote(lessonId,remote);
     const merged=localState(lessonId);
     if(merged.opened||merged.code||merged.tangram){
       await store.save({activityId:key,activityType:'lesson',status:merged.opened&&merged.code&&merged.tangram?'completed':'in_progress',state:merged,answers:remote?.answers||{}});
     }
     refreshBadges();
   }catch(e){console.warn('Falha ao sincronizar aula',lessonId,e)}
 }
 async function syncAll(){
   if(syncing)return;syncing=true;
   try{
     const {data,error}=await client.from('student_activity_progress')
       .select('activity_id,status,state,updated_at')
       .eq('student_id',user.id).like('activity_id',PREFIX+'%').limit(2000);
     if(error)throw error;
     for(const record of data||[])applyRemote(record.activity_id.slice(PREFIX.length),record);
     const ids=lessonIds();
     for(const lessonId of ids){
       const local=localState(lessonId);
       const remote=(data||[]).find(x=>x.activity_id===PREFIX+lessonId);
       if(!remote||local.opened!==!!remote.state?.opened||local.code!==!!remote.state?.code||local.tangram!==!!remote.state?.tangram){
         await store.save({activityId:PREFIX+lessonId,activityType:'lesson',status:local.opened&&local.code&&local.tangram?'completed':'in_progress',state:local,answers:{}});
       }
     }
     refreshBadges();
   }catch(e){console.warn('Falha na recuperação das aulas',e)}
   finally{syncing=false}
 }
 // Observa gravações de progresso sem modificar o código existente do catálogo.
 const originalSetItem=Storage.prototype.setItem;
 Storage.prototype.setItem=function(key,value){
   const result=originalSetItem.call(this,key,value);
   if(this===localStorage&&typeof key==='string'){
     const prefix=localPrefixes.find(p=>key.startsWith(p));
     if(prefix){
       const lessonId=key.slice(prefix.length);
       clearTimeout(pending.get(lessonId));
       pending.set(lessonId,setTimeout(()=>{pending.delete(lessonId);syncOne(lessonId)},500));
     }
   }
   return result;
 };
 await syncAll();
 window.addEventListener('focus',()=>{syncAll()});
 document.addEventListener('visibilitychange',()=>{if(!document.hidden)syncAll()});
 const panel=document.getElementById('lessons-panel');
 if(!panel)return;
 const note=document.createElement('span');
 note.id='tangram-progress-status';note.setAttribute('role','status');
 note.style.cssText='display:inline-block;margin:8px;padding:5px 10px;border:1px solid #cda85d;border-radius:12px;color:#ffe0a0;font-size:.8rem';
 note.textContent='Progresso conectado';
 panel.prepend(note);
 let timer,restoring=false,activeId='';
 function id(){
   const y=panel.querySelector('.lesson-years button.on')?.dataset.y||'';
   const s=panel.querySelector('.lesson-sections button.on')?.dataset.s||'';
   const title=panel.querySelector('.lesson-content h3,.lesson-detail h3,.lesson-body h3')?.textContent?.trim()||'';
   return y&&s&&title?'aula:'+y+':'+s+':'+title.slice(0,120):'';
 }
 function fields(){return [...panel.querySelectorAll('input,textarea,select')].filter(e=>e.name||e.id)}
 function snapshot(){const a={};for(const el of fields()){const k=el.name||el.id;a[k]=el.type==='checkbox'?el.checked:el.type==='radio'?(el.checked?el.value:a[k]):el.value}return a}
 async function restore(){
   const key=id();if(!key||key===activeId)return;activeId=key;restoring=true;
   try{const saved=await store.load(key);if(key!==activeId)return;
     if(saved?.answers)for(const el of fields()){const k=el.name||el.id;if(!(k in saved.answers))continue;
       if(el.type==='checkbox')el.checked=!!saved.answers[k];
       else if(el.type==='radio')el.checked=saved.answers[k]===el.value;
       else el.value=saved.answers[k];
     }
     note.textContent=saved?'Respostas recuperadas':'Progresso conectado';
   }catch(e){note.textContent='Não foi possível recuperar: '+e.message}
   finally{restoring=false}
 }
 panel.addEventListener('input',schedule,true);panel.addEventListener('change',schedule,true);
 function schedule(e){if(restoring||!e.target.matches('input,textarea,select'))return;
   clearTimeout(timer);timer=setTimeout(async()=>{const key=id();if(!key)return;
     note.textContent='Salvando…';
     try{await store.save({activityId:key,activityType:'lesson',answers:snapshot()});note.textContent='✓ Progresso salvo'}
     catch(e){note.textContent='Não salvo: '+e.message}
   },900);
 }
 new MutationObserver(()=>{clearTimeout(window.__tangramRestoreTimer);window.__tangramRestoreTimer=setTimeout(restore,350)})
   .observe(panel,{childList:true,subtree:true});
 restore();
})().catch(e=>console.warn('Tangram progresso:',e));

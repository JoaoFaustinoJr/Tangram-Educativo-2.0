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

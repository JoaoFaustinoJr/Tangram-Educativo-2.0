/* Tangram Educativo — persistência individual v1.
   Requer cliente Supabase autenticado e tabelas student_activity_*.
   Não armazena nomes, senhas ou tokens no navegador. */
export function createStudentProgress(supabase) {
  if (!supabase?.auth || !supabase?.from) throw new Error('Cliente Supabase necessário');
  async function owner() {
    const { data, error } = await supabase.auth.getUser();
    if (error || !data?.user?.id) throw new Error('Entre na sua conta para salvar o progresso');
    return data.user.id;
  }
  function activity(value) {
    if (typeof value !== 'string' || !value.trim()) throw new Error('Identificador da atividade obrigatório');
    return value.trim();
  }
  async function load(activityId) {
    const student_id = await owner();
    const { data, error } = await supabase.from('student_activity_progress')
      .select('activity_id,activity_type,status,current_step,answers,state,score,updated_at')
      .eq('student_id', student_id).eq('activity_id',activity(activityId)).maybeSingle();
    if (error) throw error;
    return data;
  }
  async function save({activityId,activityType,status='in_progress',currentStep=null,answers={},state={},score=null}) {
    const student_id = await owner();
    if (!['in_progress','completed'].includes(status)) throw new Error('Status inválido');
    const payload={student_id,activity_id:activity(activityId),activity_type:activity(activityType),status,
      current_step:currentStep,answers,state,score,updated_at:new Date().toISOString()};
    const {data,error}=await supabase.from('student_activity_progress').upsert(payload,{onConflict:'student_id,activity_id'})
      .select('updated_at').single();
    if(error) throw error;
    return data;
  }
  async function submit({activityId,activityType,answers={},result={},score=null}) {
    const student_id=await owner();
    const {data,error}=await supabase.from('student_activity_attempts').insert({
      student_id,activity_id:activity(activityId),activity_type:activity(activityType),answers,result,score
    }).select('id,submitted_at').single();
    if(error) throw error;
    return data;
  }
  async function history(activityId) {
    const student_id=await owner();
    const {data,error}=await supabase.from('student_activity_attempts')
      .select('id,activity_id,activity_type,answers,result,score,submitted_at')
      .eq('student_id',student_id).eq('activity_id',activity(activityId))
      .order('submitted_at',{ascending:false});
    if(error) throw error;
    return data;
  }
  return {load,save,submit,history};
}

'use strict';
/* Painel escolar Lumina — demonstração e estrutura de acesso.
 * Este arquivo contém exclusivamente URL e chave PUBLICÁVEL do Supabase.
 * Não contém service_role, senha, CPF ou dados de estudantes.
 */
const PROJECT_URL = 'https://qqygivtxxuhjmexvphma.supabase.co';
const PUBLISHABLE_KEY = 'sb_publishable_dk5HEe289BtBz1M6_-RC3g_NtLX1Rhh';
const $ = id => document.getElementById(id);
const clean = x => String(x ?? '').replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;').replaceAll("'",'&#39;');
const shiftLabel = {matutino:'Matutino',vespertino:'Vespertino',integral:'Integral',outro:'Outro'};
const roleName = {teacher:'Professora',pedagogical_admin:'Coordenação pedagógica',director:'Direção'};
const plannedName = {teacher:'Professora',pedagogical_admin:'Coordenadora',director:'Diretora'};
let api=null;
let mode='guest', currentPage='visao', role='pedagogical_admin', profile=null;
let selectedRosterClass='';
let rosterReviewMessage='';
let pilotCandidate=null;
let pilotStageMessage='';
let loaded={classrooms:[],students:[],results:[],cycles:[],staff:[],staffLinks:[],batches:[],importRows:[]};
const demoClasses=[
 ['1º A','matutino'],['1º B','vespertino'],['2º A','matutino'],['2º B','matutino'],['2º C','vespertino'],
 ['3º A','matutino'],['3º B','matutino'],['3º C','vespertino'],['3º D','vespertino'],
 ['4º A','matutino'],['4º B','matutino'],['4º C','vespertino'],['4º D','vespertino'],
 ['5º A','matutino'],['5º B','vespertino'],['5º C','vespertino']
].map((x,i)=>({id:'demo-'+(i+1),label:x[0],shift:x[1],school_year:2026}));
const demoData={
 classrooms:demoClasses,
 students:[],results:[],cycles:[{title:'Avaliação diagnóstica • Exemplo',status:'draft'}],staff:[],staffLinks:[],
 batches:[{id:'demo-batch',source_filename:'Fichas fictícias — exemplo',expected_rows:7,status:'review',classroom_id:'demo-3'}],
 importRows:[]
};
function cardKpi(number,label,subtitle=''){return `<div class="kpi"><span class="num">${clean(number)}</span><span class="label">${clean(label)}</span>${subtitle?`<span class="caption">${clean(subtitle)}</span>`:''}</div>`;}
function chip(status){let t=status==='open'?'Aberta':status==='draft'?'Rascunho':status==='closed'?'Fechada':status==='review'?'Em conferência':status==='pending'?'Pendente':status==='active'?'Ativa':status||'Pendente'; return `<span class="chip ${status==='review'||status==='pending'?'warn':''}">${clean(t)}</span>`;}
function notice(msg,cls=''){return `<div class="notice ${cls}">${msg}</div>`;}
function selectedData(){return mode==='demo'?demoData:loaded;}
function render(){
 if(mode==='guest')return;
 const pageTitles={visao:['Visão geral','Acompanhamento das aprendizagens e do percurso pedagógico.'],turmas:['Turmas','Organização das classes e responsabilidades.'],avaliacoes:['Avaliações','Registros pedagógicos e indicadores por componente.'],lotes:['Leitura de fichas','Validação de QR Codes e marcações em X.'],equipe:['Equipe e acessos','Gestão de vínculos e permissões institucionais.']};
 const [title,subtitle]=pageTitles[currentPage]; $('pageTitle').textContent=title;$('pageSubtitle').textContent=subtitle;
 $('roleLabel').textContent=roleName[role]||'Acesso institucional';
 document.querySelectorAll('.nav-btn').forEach(btn=>btn.classList.toggle('current',btn.dataset.page===currentPage));
 $('modeBanner').classList.toggle('hidden',mode!=='demo');
 $('modeBanner').textContent=mode==='demo'?'MODO DEMONSTRAÇÃO · Os dados exibidos são exemplos fictícios. Não há consulta, importação nem gravação de registros reais.':'';
 $('demoRoleLabel').classList.toggle('hidden',mode!=='demo');
 const d=selectedData();
 $('content').innerHTML=({visao:()=>home(d),turmas:()=>classes(d),avaliacoes:()=>assessments(d),lotes:()=>batches(d),equipe:()=>team(d)})[currentPage]();
 const input=$('csvReview');if(input)input.addEventListener('change',e=>reviewCSV(e.target.files?.[0]));
 const classroomPicker=$('studentClassFilter'); if(classroomPicker)classroomPicker.addEventListener('change',e=>{selectedRosterClass=e.target.value;render()});
}
function home(d){
 let cycleCount=d.cycles.length, classCount=d.classrooms.length, studentCount=d.students.length, resultCount=d.results.length;
 const realWarning=mode==='live'?notice('As matrículas foram conferidas pela coordenação. Os <strong>7 registros provisórios do 2º A</strong> continuam separados e ainda não são resultados oficiais. A leitura de QR + X precisa da conferência de vínculo e da validação pedagógica antes de qualquer publicação.','info'):notice('As informações abaixo são fictícias ou estruturais para prévia de navegação. Nenhuma criança real é identificada.','info');
 const classLines=d.classrooms.slice(0,5).map(c=>`<li><span><b>${clean(c.label)}</b><br><small>${clean(shiftLabel[c.shift]||c.shift)}</small></span><span class="chip grey">${mode==='demo'?'Exemplo':'Cadastrada'}</span></li>`).join('');
 let graph='';
 if(mode==='demo'){
  const v=[1,1,2,1,2],labels=['Pré-silábica','Silábica sem valor','Silábica com valor','Silábico-alfabética','Alfabética'];
  graph=labels.map((lab,i)=>`<div class="barrow"><span>${clean(lab)}</span><div class="bartrack"><span style="width:${v[i]*38}%"></span></div><strong>${v[i]}</strong></div>`).join('');
 }else if(resultCount){
  const v=[1,2,3,4,5].map(x=>d.results.filter(r=>r.answers?.H==='H'+x).length);
  graph=['Pré-silábica','Silábica sem valor','Silábica com valor','Silábico-alfabética','Alfabética'].map((lab,i)=>`<div class="barrow"><span>${clean(lab)}</span><div class="bartrack"><span style="width:${Math.round((v[i]/Math.max(1,...v))*100)}%"></span></div><strong>${v[i]}</strong></div>`).join('');
 }else graph='<div class="empty">Ainda não existem resultados oficiais disponíveis para este perfil. Os sete registros de teste estão em validação separada.</div>';
 const counts = mode==='demo'?['16','—','—','0']: [classCount,d.students.filter(s=>s.active).length,resultCount,d.importRows.length];
 return `${realWarning}<div class="kpi-grid">${cardKpi(counts[0],'Turmas visíveis','Conforme a permissão')}${cardKpi(counts[1],mode==='live'?'Matrículas confirmadas':'Estudantes fictícios',mode==='live'?'QR individual vinculado ao cadastro':'Dados de demonstração')}${cardKpi(counts[2],'Avaliações oficiais','Resultados já validados')}${cardKpi(counts[3],'Fichas em validação','Somente coordenação pode consultar')}</div>
 <div class="twocol"><article class="card"><h2>Panorama da escrita</h2><p>${mode==='demo'?'Exemplo fictício de visualização':'Somente resultados oficiais autorizados'}</p>${graph}</article><article class="card"><h2>Turmas acompanhadas</h2><p>Organização das turmas e respectivos turnos.</p><ul class="eyelist">${classLines||'<li>Nenhuma turma liberada para este perfil.</li>'}</ul><button class="smallbtn" data-jump="turmas">Ver todas as turmas →</button></article></div>
 <div class="card"><h2>Próximas etapas do projeto</h2><p>Ativação responsável, sem misturar testes com os resultados oficiais.</p><ul class="eyelist"><li><span>Conferir nomes, e-mails e permissões restantes das professoras</span>${chip('pending')}</li><li><span>Testar com uma ficha impressa e fotografada</span>${chip('pending')}</li><li><span>Conferir QR e resultados do CSV com a matrícula autorizada</span>${chip('pending')}</li><li><span>Habilitar lançamento protegido após testes de segurança e validação pedagógica</span>${chip('pending')}</li></ul></div>`;
}
function classes(d){
 const rows=d.classrooms.map(c=>`<tr><td><strong>${clean(c.label)}</strong></td><td>${clean(shiftLabel[c.shift]||c.shift)}</td><td>${mode==='demo'?'—':d.students.filter(s=>s.classroom_id===c.id).length}</td><td>${chip(mode==='demo'?'exemplo':d.students.filter(s=>s.classroom_id===c.id).every(s=>s.active)?'active':'pending')}</td></tr>`).join('');
 return `${notice(mode==='demo'?'Simulação da lista de turmas.':'A lista respeita seu vínculo pedagógico e as regras de acesso do banco de dados.','info')}<div class="card"><h2>Turmas autorizadas</h2><p>${clean(d.classrooms.length)} turma(s) disponíveis neste perfil.</p><div class="tablewrap"><table><thead><tr><th>Turma</th><th>Turno</th><th>Estudantes no banco</th><th>Situação</th></tr></thead><tbody>${rows||'<tr><td colspan="4">Nenhuma turma disponível.</td></tr>'}</tbody></table></div></div>`;
}
function assessments(d){
 const cycles=d.cycles.map(c=>`<tr><td>${clean(c.title)}</td><td>${chip(c.status)}</td><td>${mode==='demo'?'Demonstração':'Institucional'}</td></tr>`).join('');

 let studentSection='';
 if(role==='director'){
   studentSection='<div class="card"><h2>Acompanhamento institucional</h2><p>Resultados individuais dos estudantes não são exibidos no perfil da direção.</p></div>';
 } else if(role==='pedagogical_admin' && mode==='demo'){
   studentSection='<div class="card"><h2>Pré-cadastro de estudantes</h2><p>Em modo demonstração, nenhuma matrícula real é consultada. Entre com uma conta institucional autorizada para conferir as listas da escola.</p></div>';
 } else if(role==='pedagogical_admin'){
   const pending=d.students.filter(s=>s.active===false).length;
   const verified=d.students.filter(s=>s.active===true).length;
   const opts=d.classrooms.map(c=>`<option value="${clean(c.id)}" ${selectedRosterClass===c.id?'selected':''}>${clean(c.label)} — ${clean(shiftLabel[c.shift]||c.shift)}</option>`).join('');
   const selected=d.students.filter(s=>s.classroom_id===selectedRosterClass).sort((a,b)=>a.display_name.localeCompare(b.display_name,'pt-BR'));

   const classPending=selected.filter(s=>!s.active).length;
   const printableCodes=selected.filter(s=>s.active&&/^SON-26-[A-F0-9]{12}$/.test(s.local_reference||'')).length;
   const repeated=s=>d.students.some(t=>t.id!==s.id&&t.classroom_id!==s.classroom_id&&t.display_name.trim().toLocaleUpperCase('pt-BR')===s.display_name.trim().toLocaleUpperCase('pt-BR'));
   const hasRepeatedName=selected.some(repeated);
   const tableRows=selected.map((s,i)=>{
    const duplicate=repeated(s);
    const status=duplicate?'<span class="chip warn">Nome em duas turmas</span>':s.active?'<span class="chip">Conferido</span>':'<span class="chip warn">A conferir</span>';
    const action=duplicate?'<span class="intro-note">Aguardar secretaria</span>':`<button class="smallbtn" type="button" data-verify-student="${clean(s.id)}" data-next-active="${s.active?'false':'true'}">${s.active?'Reabrir conferência':'Confirmar matrícula'}</button> ${s.active&&/^SON-26-[A-F0-9]{12}$/.test(s.local_reference||'')?`<button class="smallbtn" type="button" data-ficha-student="${clean(s.id)}">Ver fichas</button>`:''}`;
    return `<tr><td>${i+1}</td><td>${clean(s.display_name)}</td><td>${status}</td><td>${action}</td></tr>`;
   }).join('');
   studentSection=`<div class="card"><h2>Pré-cadastro de estudantes — 2026</h2>
    <p><strong>${pending} registro(s) pendentes</strong> e <strong>${verified} confirmado(s)</strong> na escola. Pendentes ficam visíveis somente à coordenação.</p>
    ${notice('Só confirme cada matrícula depois de conferir NOME E TURMA com a lista oficial ATUAL da secretaria. A confirmação permite a visualização pela professora autorizada da turma.','info')}
    ${selected.some(repeated)?notice('Há um nome repetido entre turmas nesta lista. Consulte a secretaria antes de confirmar o registro correspondente.','info'):''}
    ${pending===0&&verified===d.students.length&&verified>0?`<div class="buttonrow"><button type="button" class="smallbtn solid" data-print-qr-all>Visualizar e imprimir todos os QR Codes (${verified})</button></div><p class="intro-note">Arquivo de impressão separado por turma. Abre em nova aba apenas neste computador autenticado.</p>`:''}
    <label for="studentClassFilter"><strong>Escolha uma turma para conferir</strong></label>
    <select id="studentClassFilter" style="display:block;width:100%;max-width:360px;padding:10px;margin:10px 0 16px;border:1px solid #ceded6;border-radius:9px">
      <option value="">Selecione uma turma</option>${opts}</select>
    <p class="intro-note">Nesta turma: ${selected.length} registros; ${classPending} ainda pendentes.</p>
    ${selected.length>0 && classPending>0?
      hasRepeatedName?'<p class="intro-note">Confirmação da turma inteira bloqueada: há nome repetido em outra turma.</p>':
      `<button type="button" class="smallbtn solid" data-verify-class="${clean(selectedRosterClass)}">Conferi a lista oficial: confirmar pendentes desta turma</button>`:
      ''}
    <p class="intro-note">Use a confirmação da turma inteira somente se TODOS os nomes e a turma estiverem corretos na lista oficial atual da secretaria. Se houver dúvida, confirme individualmente.</p>
    <div id="rosterReviewFeedback" class="form-message" role="status" aria-live="polite">${clean(rosterReviewMessage)}</div>
    <div class="tablewrap"><table><thead><tr><th>Nº</th><th>Nome conforme lista recebida</th><th>Situação</th><th>Conferência</th></tr></thead><tbody>${tableRows||'<tr><td colspan="4">Selecione uma turma para consultar os registros.</td></tr>'}</tbody></table></div>
    ${printableCodes>0?`<div class="buttonrow"><button type="button" class="smallbtn solid" data-print-qr-class="${clean(selectedRosterClass)}">Visualizar e imprimir QR Codes (${printableCodes})</button> <button type="button" class="smallbtn solid" data-ficha-class="${clean(selectedRosterClass)}">Preparar atividades LP + Matemática + ficha X (${printableCodes} estudantes)</button> <button type="button" class="smallbtn" data-guide-class="${clean(selectedRosterClass)}">Roteiro da professora e gabarito</button></div>`:''}
    <p class="intro-note">Cada estudante tem 3 páginas: Língua Portuguesa, Matemática e ficha integrada de X. Faça primeiro uma prévia individual, conferindo a impressão A4 e a leitura de X. Apenas a ficha de X deve ser digitalizada no leitor V5. O envio e a publicação de resultados continuam desabilitados.</p></div>`;

 } else {
   const activeStudents=d.students.filter(s=>s.active);
   const rows=activeStudents.map(s=>`<tr><td>${clean(s.display_name)}</td><td>${clean(d.classrooms.find(c=>c.id===s.classroom_id)?.label||'')}</td><td>${d.results.filter(r=>r.student_id===s.id).length}</td></tr>`).join('');
   studentSection=`<div class="card"><h2>Estudantes autorizados</h2>${rows?`<div class="tablewrap"><table><thead><tr><th>Estudante</th><th>Turma</th><th>Avaliações oficiais</th></tr></thead><tbody>${rows}</tbody></table></div>`:'<div class="empty">Ainda não há estudantes validados e autorizados para este perfil.</div>'}</div>`;
 }
 return `<div class="card"><h2>Ciclos de avaliação</h2><p>Os instrumentos são vinculados à escola e ao ano letivo.</p><div class="tablewrap"><table><thead><tr><th>Avaliação</th><th>Situação</th><th>Tipo</th></tr></thead><tbody>${cycles||'<tr><td colspan="3">Nenhum ciclo visível.</td></tr>'}</tbody></table></div></div>
 ${notice('<strong>Organização pedagógica do fechamento de 2026:</strong> os roteiros abaixo são referências de planejamento para Língua Portuguesa e Matemática. Não constituem lançamentos oficiais nem liberam novos formulários ou envios.','info')}
 <div class="twocol">
   <article class="card"><h2>Língua Portuguesa</h2><p>Instrumento de fechamento — 1º ao 5º ano, com complexidade ajustada à turma.</p><ul class="eyelist">
   <li><span><strong>Escrita de palavras</strong><br><small>5 palavras de um mesmo campo semântico: 1 polissílaba, 1 trissílaba, 2 dissílabas e 1 monossílaba</small></span></li>
   <li><span><strong>Escrita de uma frase</strong><br><small>Produção escrita para observar as hipóteses e relações entre fala e escrita</small></span></li>
   <li><span><strong>Leitura</strong><br><small>Um texto de memória e um texto simples, observando a autonomia leitora</small></span></li>
   <li><span><strong>Registro docente</strong><br><small>Marcação com X dos conhecimentos já demonstrados e dos que precisam de acompanhamento</small></span></li>
   </ul></article>
   <article class="card"><h2>Matemática</h2><p>Instrumento breve — 1º ao 5º ano, com gradação de complexidade.</p><ul class="eyelist">
   <li><span>Contagem e quantificação</span></li>
   <li><span>Leitura e escrita de números</span></li>
   <li><span>Composição e decomposição no sistema decimal</span></li>
   <li><span>Comparação e ordenação de quantidades e números</span></li>
   <li><span>Problemas de adição e subtração</span></li>
   <li><span>Noções de multiplicação e divisão nos anos pertinentes</span></li>
   </ul></article>
 </div>
 <div class="card"><h2>Preparação para os registros</h2>
 <p><strong>Etapa atual:</strong> conferência dos instrumentos e organização das turmas. As listas recebidas estão em pré-cadastro aguardando conferência; os QR Codes e o vínculo das fichas ainda precisam ser preparados antes dos lançamentos reais.</p>
 <p class="intro-note">Fluxo previsto: aplicação e marcação da ficha → envio protegido do arquivo → conferência pedagógica → validação → visualização consolidada. A etapa de envio e publicação ainda não está habilitada nesta versão.</p></div>
 ${studentSection}`;
}

async function verifyRosterClass(classroomId,button){
 if(mode!=='live'||role!=='pedagogical_admin'||!profile||!api)return;
 const klass=loaded.classrooms.find(c=>c.id===classroomId);
 if(!klass)return;
 const all=loaded.students.filter(s=>s.classroom_id===classroomId);
 if(all.some(s=>loaded.students.some(t=>t.id!==s.id&&t.classroom_id!==s.classroom_id&&t.display_name.trim().toLocaleUpperCase('pt-BR')===s.display_name.trim().toLocaleUpperCase('pt-BR')))){
   rosterReviewMessage='Confirmação da turma bloqueada: há um nome repetido em outra turma.';render();return;
 }
 const pendentes=all.filter(s=>!s.active);
 if(!pendentes.length)return;
 const answer=window.prompt(`Para confirmar ${pendentes.length} matrícula(s) no ${klass.label}, confira TODOS os nomes e a turma com a lista oficial atual da secretaria. Se já conferiu, digite CONFERI. Caso contrário, cancele.`);
 if(answer?.trim().toUpperCase()!=='CONFERI')return;
 button.disabled=true;button.textContent='Registrando conferência...';
 try{
  const ids=pendentes.map(s=>s.id);
  const {data,error}=await api.from('students').update({active:true}).in('id',ids).eq('classroom_id',classroomId).eq('active',false).select('id,active,local_reference');
  if(error)throw error;
  const returned=new Map((data||[]).map(s=>[s.id,s]));
  for(const student of pendentes){const stored=returned.get(student.id);if(stored){student.active=stored.active;student.local_reference=stored.local_reference;}}
  if(returned.size!==ids.length){rosterReviewMessage='Algumas alterações precisam ser reconferidas. Clique em Atualizar.';}
  else{rosterReviewMessage=`Conferência registrada: ${returned.size} matrícula(s) no ${klass.label}.`;}
  render();
 }catch(e){console.warn('Falha na confirmação da turma',e?.code||e?.message);rosterReviewMessage='Não foi possível confirmar esta turma. Clique em Atualizar e confira.';render();}
}
async function updateStudentReview(studentId,nextActive,button){
 if(mode!=='live'||role!=='pedagogical_admin'||!profile||!api)return;
 const s=loaded.students.find(x=>x.id===studentId);
 if(!s||s.active===nextActive)return;
 const isDuplicate=loaded.students.some(x=>x.id!==s.id&&x.classroom_id!==s.classroom_id&&x.display_name.trim().toLocaleUpperCase('pt-BR')===s.display_name.trim().toLocaleUpperCase('pt-BR'));
 if(isDuplicate){rosterReviewMessage='Esse nome aparece em duas turmas. Solicite confirmação da secretaria.';render();return;}
 const turma=loaded.classrooms.find(c=>c.id===s.classroom_id)?.label||'turma selecionada';
 const msg=nextActive?`Confirmar que ${s.display_name} está na lista OFICIAL ATUAL do ${turma}? A matrícula ficará visível às professoras autorizadas.`:`Reabrir a conferência de ${s.display_name} (${turma})? A matrícula deixará de aparecer para as professoras.`;
 if(!window.confirm(msg))return;
 button.disabled=true;button.textContent='Salvando...';
 try{
   const {data,error}=await api.from('students').update({active:nextActive}).eq('id',studentId).eq('classroom_id',s.classroom_id).eq('active',!nextActive).select('id,active,local_reference').maybeSingle();
   if(error||!data||data.active!==nextActive)throw error||new Error('Nenhuma alteração realizada');
   s.active=data.active;s.local_reference=data.local_reference;
   rosterReviewMessage=nextActive?'Matrícula confirmada e registrada.':'Matrícula devolvida à conferência.';
   render();
 }catch(err){console.warn('Falha na validação',err?.code||err?.message);rosterReviewMessage='Não foi possível salvar. Clique em Atualizar e tente novamente.';render();}
}



function openFichas(classroomId,studentId){
 if(mode!=='live'||role!=='pedagogical_admin'||!profile||!api)return;
 const c=loaded.classrooms.find(x=>x.id===classroomId);
 const candidates=loaded.students.filter(s=>s.classroom_id===classroomId && s.active && /^SON-26-[A-F0-9]{12}$/.test(s.local_reference||''));
 const students=studentId?candidates.filter(s=>s.id===studentId):candidates;
 if(!c||!students.length){rosterReviewMessage='Não há estudantes confirmados com QR válido para preparar estas fichas.';render();return;}
 if(!window.LuminaFichas?.printSet){rosterReviewMessage='As fichas ainda não carregaram. Atualize o navegador e tente novamente.';render();return;}
 try{window.LuminaFichas.printSet(students,c)}
 catch(err){console.warn('Falha ao preparar fichas de avaliação',err?.message);rosterReviewMessage='Não foi possível abrir as fichas: '+String(err?.message||'erro de impressão');render();}
}

function printAllQrCodes(){
 if(mode!=='live'||role!=='pedagogical_admin'||!profile||!api)return;
 const students=loaded.students;
 if(!students.length||students.some(s=>!s.active||!/^SON-26-[A-F0-9]{12}$/.test(s.local_reference||''))){
  rosterReviewMessage='A impressão geral só pode ser feita quando todas as matrículas estiverem confirmadas e com códigos válidos.';render();return;
 }
 if(typeof window.qrcode!=='function'){rosterReviewMessage='O gerador QR não carregou. Atualize o painel e tente novamente.';render();return;}
 const popup=window.open('','_blank');
 if(!popup){rosterReviewMessage='O navegador bloqueou a nova aba. Autorize pop-ups para o Painel da Lumina.';render();return;}
 popup.opener=null;
 try{
  let count=0;
  const classes=loaded.classrooms.slice().sort((a,b)=>a.label.localeCompare(b.label,'pt-BR',{numeric:true}));
  const pages=classes.map(c=>{
   const classStudents=students.filter(s=>s.classroom_id===c.id)
        .sort((a,b)=>a.display_name.localeCompare(b.display_name,'pt-BR'));
   if(!classStudents.length)return '';
   const labels=classStudents.map(s=>{
    const qr=window.qrcode(0,'M');
    qr.addData(`SONIA26|${s.local_reference}|FICHA-V1`,'Byte');
    qr.make(); count++;
    return `<article class="label"><div class="label-title">${clean(c.label)} · 2026</div><div class="student-name">${clean(s.display_name)}</div><div class="qr">${qr.createSvgTag({cellSize:4,margin:16,scalable:true})}</div><div class="code">${clean(s.local_reference)}</div></article>`;
   }).join('');
   return `<section class="class-section">
    <header class="class-header"><h2>Turma ${clean(c.label)}</h2><p>${classStudents.length} estudantes • 2026</p></header>
    <div class="sheet">${labels}</div></section>`;
  }).join('');
  if(count!==students.length)throw new Error('Divergência entre estudantes e turmas. A impressão foi cancelada.');
  const doc=`<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><meta name="referrer" content="no-referrer">
   <title>Lumina • QR Codes das 16 turmas • 2026</title>
   <style>
    @page{size:A4;margin:10mm}*{box-sizing:border-box}
    body{font-family:Arial,Helvetica,sans-serif;color:#163e32;background:#fff;margin:10mm}
    .controls{margin:0 0 12mm;display:flex;gap:8px;align-items:center}
    .controls button{background:#163e32;color:white;border:0;padding:10px 18px;border-radius:6px;cursor:pointer}
    .controls p{font-size:11px;color:#485e54}
    .class-section{break-before:page;page-break-before:always}
    .class-section:first-of-type{break-before:auto;page-break-before:auto}
    .class-header{border-bottom:2px solid #b49a58;display:flex;justify-content:space-between;align-items:end;gap:8px;margin-bottom:5mm;padding-bottom:3mm}
    .class-header h2{font-size:18px;margin:0}.class-header p{font-size:12px;margin:0}
    .sheet{display:grid;grid-template-columns:repeat(2,1fr);gap:5mm}
    .label{border:1px dashed #a6b1aa;border-radius:5px;padding:4mm 3mm;text-align:center;break-inside:avoid;page-break-inside:avoid;height:76mm;display:flex;flex-direction:column;align-items:center}
    .label-title{font-size:11px;color:#415e52;font-weight:700}
    .student-name{font-size:12px;font-weight:700;margin:3mm 0;min-height:9mm}
    .qr{width:44mm;height:44mm;margin:auto;display:flex;align-items:center;justify-content:center}
    .qr svg{width:100%;height:100%}
    .code{font-family:monospace;font-size:11px;letter-spacing:.3px;margin-top:3mm;color:#273a32}
    @media print{.controls{display:none}body{margin:0}}
   </style></head><body>
   <div class="controls"><button type="button" onclick="window.print()">Imprimir ou salvar em PDF</button>
    <p>Uso interno. ${count} QR Codes divididos por turma. Os símbolos codificam apenas identificadores.</p></div>
   ${pages}</body></html>`;
  popup.document.open();popup.document.write(doc);popup.document.close();popup.focus();
 }catch(err){
  popup.close();console.warn('Falha ao montar etiquetas',err?.message);
  rosterReviewMessage='Falha ao preparar a impressão geral. Nenhum cadastro foi alterado. Use impressão por turma ou atualize o painel.';render();
 }
}

function printQrCodes(classroomId){
 if(mode!=='live'||role!=='pedagogical_admin'||!profile||!api)return;
 const klass=loaded.classrooms.find(c=>c.id===classroomId);
 const list=loaded.students.filter(s=>s.classroom_id===classroomId&&s.active&&/^SON-26-[A-F0-9]{12}$/.test(s.local_reference||''))
  .sort((a,b)=>a.display_name.localeCompare(b.display_name,'pt-BR'));
 if(!klass||!list.length){rosterReviewMessage='Nenhum QR Code de matrícula confirmada nesta turma.';render();return;}
 if(typeof window.qrcode!=='function'){rosterReviewMessage='O gerador QR não carregou. Atualize a página e tente novamente.';render();return;}
 // Tudo é montado localmente no navegador autorizado, sem serviço externo de QR.
 let labels;
 try{
  labels=list.map(s=>{
   const qr=window.qrcode(0,'M');
   qr.addData(`SONIA26|${s.local_reference}|FICHA-V1`,'Byte');
   qr.make();
   return `<article class="label"><div class="label-title">${clean(klass.label)} · 2026</div><div class="student-name">${clean(s.display_name)}</div><div class="qr">${qr.createSvgTag({cellSize:5,margin:20,scalable:true})}</div><div class="code">${clean(s.local_reference)}</div></article>`;
  }).join('');
 }catch(err){console.warn('Falha ao gerar QR local',err?.message);rosterReviewMessage='Não foi possível gerar as etiquetas. Atualize a página.';render();return;}
 const popup=window.open('','_blank');
 if(!popup){rosterReviewMessage='O navegador bloqueou a nova aba. Autorize pop-ups para este site.';render();return;}
 popup.opener=null;
 const doc=`<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><meta name="referrer" content="no-referrer"><title>Lumina • QR Codes ${clean(klass.label)}</title>
 <style>@page{size:A4;margin:10mm}*{box-sizing:border-box}
 body{font-family:Arial,Helvetica,sans-serif;color:#163e32;background:#fff;margin:10mm}
 .header{margin-bottom:9mm;border-bottom:2px solid #b9a061;padding-bottom:4mm}
 h1{font-size:18px;margin:0 0 4px}.note{font-size:11px;color:#56645c;margin:5px 0}
 .sheet{display:grid;grid-template-columns:repeat(2,1fr);gap:5mm}
 .label{border:1px dashed #a6b1aa;border-radius:5px;padding:5mm 3mm;text-align:center;break-inside:avoid;height:76mm;display:flex;flex-direction:column;align-items:center}
 .label-title{font-size:11px;color:#415e52;font-weight:700}
 .student-name{font-size:12px;font-weight:700;margin:3mm 0;min-height:9mm}
 .qr{width:44mm;height:44mm;margin:auto;display:flex;align-items:center;justify-content:center}
 .qr svg{width:100%;height:100%}
 .code{font-family:monospace;font-size:11px;letter-spacing:.3px;margin-top:3mm;color:#273a32}
 .controls{margin:0 0 15px}.controls button{background:#163e32;border:0;color:white;padding:11px 18px;border-radius:6px;cursor:pointer}
 @media print{.controls{display:none}body{margin:0}}</style></head><body>
 <div class="controls"><button type="button" onclick="window.print()">Imprimir etiquetas</button></div>
 <div class="header"><h1>Lumina | QR Codes da turma ${clean(klass.label)}</h1>
 <p class="note">${list.length} matrícula(s) confirmada(s). Uso interno da escola. Os QR Codes não contêm nomes ou CPF.</p>
 <p class="note">Os códigos identificam fichas para o leitor V5. Não são links de envio de documentos.</p></div>
 <main class="sheet">${labels}</main></body></html>`;
 popup.document.open();
 popup.document.write(doc);
 popup.document.close();
 popup.focus();
}

function batches(d){
 const admin=role==='pedagogical_admin';
 const savedPilot=pilotStageMessage?notice(clean(pilotStageMessage),'info'):'';
 const batchList=d.batches.map(b=>`<tr><td>${clean(b.source_filename||'Lote de leitura')}</td><td>${clean(d.classrooms.find(c=>c.id===b.classroom_id)?.label||'—')}</td><td>${clean(b.expected_rows??'—')}</td><td>${chip(b.status)}</td></tr>`).join('');
 return `${savedPilot}${notice('O leitor V5 funciona localmente. As imagens e os PDFs selecionados não são enviados automaticamente ao Supabase. A importação oficial continua bloqueada até concluir os testes de reconhecimento, vinculação e permissões.','info')}
 <div class="card"><h2>Leitor automático de fichas</h2><p>QR Code por estudante, reconhecimento dos X, processamento em lote e revisão das exceções.</p><div class="buttonrow">${admin&&mode==='live'?'<button type="button" class="smallbtn solid" data-embed-reader>Abrir leitor dentro do painel</button>':''}<button type="button" class="smallbtn solid" data-test-x>Gerar ficha fictícia para teste</button> <a href="leitor-v5.html?v=20261108-grade-quadradinhos-v7b" target="_blank" rel="noopener noreferrer" class="smallbtn solid">Abrir leitor V5 →</a><button class="smallbtn" type="button" data-jump="avaliacoes">Ver resultados oficiais</button></div><p class="intro-note">O leitor local continua em testes com PDFs e imagens de diferentes turmas. Não compartilhe fichas com dados de crianças fora dos canais autorizados.</p><div id="pilotReaderContainer"></div></div>
 ${admin?`<div class="card"><h2>Lotes provisórios da escola</h2><p>Somente a coordenação vê registros de importação em validação.</p><div class="tablewrap"><table><thead><tr><th>Arquivo</th><th>Turma</th><th>Fichas</th><th>Situação</th></tr></thead><tbody>${batchList||'<tr><td colspan="4">Nenhum lote de teste cadastrado.</td></tr>'}</tbody></table></div>${mode==='live'?`<p class="intro-note">Linhas provisórias acessíveis neste perfil: ${d.importRows.length}. Não representam avaliações publicadas.</p>`:''}</div>`:''}
 <div class="card"><h2>Conferência do vínculo QR → matrícula</h2><p>Depois de analisar e consolidar o lote no leitor V5, exporte o CSV. Selecione o arquivo aqui: a coordenação verá se cada código corresponde a uma matrícula autorizada e se existem exceções. Tudo é conferido no próprio navegador, sem upload do arquivo.</p><input id="csvReview" class="filecontrol" type="file" accept=".csv,text/csv"><div id="csvReport" class="report" role="status">Aguardando arquivo CSV.</div><p class="intro-note">Teste agora com o CSV fictício do leitor. Esse QR de teste não pertence a uma criança real e deverá aparecer como “não localizado” — é o comportamento esperado. Para testar fichas reais, faça primeiro um piloto de impressão e fotografia com autorização institucional. Nenhum botão publica resultados. A coordenação poderá registrar um piloto com até dez fichas da mesma turma após a conferência, aguardando validação pedagógica.</p></div>`;
}
function team(d){
 if(role==='teacher') return `<div class="card"><h2>Minha autorização</h2><p>Você pode consultar as turmas vinculadas ao seu perfil. A coordenação confirma vínculos e altera permissões.</p>${notice('Se alguma turma não aparecer, procure a coordenação pedagógica. Não compartilhe senha nem CPF.','info')}</div>`;
 if(role==='director')return `<div class="card"><h2>Visão institucional</h2><p>A direção acompanha informações coletivas. A atribuição de turmas e o lançamento de resultados dependem da coordenação.</p>${notice('Os dados individuais das crianças não estão disponíveis neste perfil.','info')}</div>`;
 const rows=d.staff.map(s=>{const turmas=(d.staffLinks||[]).filter(x=>x.staff_id===s.id).map(x=>d.classrooms.find(c=>c.id===x.classroom_id)?.label).filter(Boolean).sort((a,b)=>a.localeCompare(b,'pt-BR')).join(', ')||'A definir';return `<tr><td>${clean(s.full_name)}<div class="intro-note">Turmas: ${clean(turmas)}</div></td><td>${clean(plannedName[s.planned_role]||s.planned_role)}</td><td>${s.email?clean(s.email):'<span class="chip warn">Pendente</span>'}</td><td>${chip(s.status)}</td></tr>`;}).join('');
 return `<div class="card"><h2>Pré-cadastro de profissionais</h2><p>A equipe está em conferência. Os nomes e e-mails exibidos dependem da versão aprovada pela escola.</p><div class="tablewrap"><table><thead><tr><th>Profissional</th><th>Função</th><th>E-mail</th><th>Acesso</th></tr></thead><tbody>${rows||'<tr><td colspan="4">O cadastro da equipe ainda não foi liberado.</td></tr>'}</tbody></table></div></div>${notice('<strong>Priscila já tem acesso ativo.</strong> Os convites das professoras e da direção ainda não foram enviados. A ativação exige e-mails confirmados, aprovação dos vínculos e testes com contas reais. CPF não é senha; a futura entrada por CPF precisa de serviço protegido, sem revelar dados pessoais.','info')}`;
}
function checkReaderCSV(csvText, authorizedStudents=[], classrooms=[], checkRoster=false){
 const lines=parseDelimited(String(csvText||'').replace(/^\uFEFF/,''),';');
 if(!lines.length)throw new Error('O CSV está vazio.');
 const columns=lines[0].map(h=>h.trim().toLowerCase());const ix={};
 columns.forEach((h,i)=>{if(!(h in ix))ix[h]=i;});
 const needed=['codigo','hipotese','leitura','memoria','narrativo',...Array.from({length:7},(_,i)=>'m'+(i+1))];
 if(!needed.every(h=>h in ix))throw new Error('Este CSV não contém todas as colunas esperadas pelo leitor V5.');
 const codeMap=new Map();
 for(const s of authorizedStudents){
   const code=String(s.local_reference||'').trim().toUpperCase();
   if(!code)continue;
   if(!codeMap.has(code))codeMap.set(code,[]);
   codeMap.get(code).push(s);
 }
 const classroomMap=new Map(classrooms.map(c=>[c.id,c.label]));
 const seen=new Set();const rows=[];const tallies={total:0,ready:0,review:0,repeated:0,unknown:0};
 for(const source of lines.slice(1)){
   if(!source.some(v=>String(v).trim()))continue;
   tallies.total++;
   const get=k=>String(source[ix[k]]||'').trim();
   const code=get('codigo').toUpperCase();
   const reading=get('leitura').split('|').map(s=>s.trim()).filter(Boolean);
   const invalidReading=reading.some(s=>!/^L[1-7]$/.test(s))||new Set(reading).size!==reading.length;
   const formatOK=source.length===columns.length&&/^SON-26-[A-F0-9]{12}$/.test(code)&&
     /^H[1-5]$/.test(get('hipotese'))&&/^T1[012]$/.test(get('memoria'))&&
     /^T2[012]$/.test(get('narrativo'))&&!invalidReading&&
     [1,2,3,4,5,6,7].every(i=>new RegExp('^M'+i+'_(?:A|P|N|NO)$').test(get('m'+i)));
   const repeated=seen.has(code);seen.add(code);
   const matches=checkRoster?codeMap.get(code)||[]:[];
   let status='';
   if(repeated){status='Código repetido no CSV';tallies.repeated++;}
   else if(!formatOK)status='Código ou marcações inválidos';
   else if(checkRoster&&matches.length===0){status='QR não localizado nas matrículas autorizadas';tallies.unknown++;}
   else if(checkRoster&&matches.length!==1)status='QR vinculado a mais de uma matrícula';
   else if(checkRoster&&!matches[0].active)status='Matrícula sem confirmação ativa';
   else status=checkRoster?'Apta para conferência pedagógica':'Formato válido, sem vínculo consultado';
   const ok=checkRoster?status==='Apta para conferência pedagógica':status==='Formato válido, sem vínculo consultado';
   if(ok)tallies.ready++;else tallies.review++;
   rows.push({code,status,ok,name:checkRoster&&matches.length===1?String(matches[0].display_name||''):'',
     classroom:checkRoster&&matches.length===1?String(classroomMap.get(matches[0].classroom_id)||'—'):'',
     source:get('arquivo')});
 }
 return {tallies,rows,checkedRoster:checkRoster};
}
function reviewCSV(file){
 const area=$('csvReport');pilotCandidate=null;if(!area||!file)return;
 if(file.size>2_000_000){area.textContent='Arquivo muito grande. Separe o lote em arquivos CSV menores.';return;}
 const startedMode=mode,startedUser=profile?.user_id;
 area.textContent='Conferindo o CSV no navegador...';
 const reader=new FileReader();
 reader.onload=()=>{
   if(mode!==startedMode||profile?.user_id!==startedUser)return; // Evita expor conferência de sessão anterior.
   const liveAdmin=mode==='live'&&role==='pedagogical_admin'&&!!profile;
   const students=liveAdmin?loaded.students:[];
   if(liveAdmin&&(!students.length||!loaded.classrooms.length)){
     area.textContent='Não foi possível conferir o cadastro protegido. Clique em Atualizar e selecione o CSV novamente.';return;
   }
   try{
     const outcome=checkReaderCSV(String(reader.result||''),students,liveAdmin?loaded.classrooms:[],liveAdmin);
     const {tallies,rows}=outcome;
     area.replaceChildren();
     const heading=document.createElement('p');heading.style.fontWeight='700';
     heading.textContent=liveAdmin?'Conferência QR × matrícula (acesso da coordenação)':'Conferência do formato do CSV (demonstração/sem vínculo)';
     area.appendChild(heading);
     const stats=document.createElement('p');
     stats.textContent='Fichas examinadas: '+tallies.total+' | '+(liveAdmin?'Correspondências válidas: ':'Formato válido: ')+tallies.ready+' | Para revisar: '+tallies.review+' | Códigos repetidos: '+tallies.repeated;
     area.appendChild(stats);
     if(liveAdmin){
       const banner=document.createElement('p');
       banner.textContent='O cruzamento usa as matrículas autorizadas do banco. Não envia o CSV nem publica resultados. “Apta” significa apenas que QR e campos técnicos foram encontrados: a professora ainda deve validar o conteúdo pedagógico.';
       area.appendChild(banner);
     }else{
       const info=document.createElement('p');info.textContent='Entre com a conta da coordenação para conferir a matrícula ligada a cada QR. Nenhum cadastro real é mostrado aqui.';area.appendChild(info);
     }
     const subset=rows.filter(r=>!r.ok);
     const shown=subset.length?subset.slice(0,70):rows.slice(0,12);
     if(shown.length){
       const wrap=document.createElement('div');wrap.className='tablewrap';
       const table=document.createElement('table');const thead=document.createElement('thead');const tr=document.createElement('tr');
       for(const column of ['Código QR','Turma','Estudante','Situação']){const cell=document.createElement('th');cell.textContent=column;tr.appendChild(cell);}
       thead.appendChild(tr);table.appendChild(thead);
       const body=document.createElement('tbody');
       for(const item of shown){
         const row=document.createElement('tr');
         for(const value of [item.code||'—',liveAdmin?item.classroom:'—',liveAdmin?item.name:'—',item.status]){
           const cell=document.createElement('td');cell.textContent=value;row.appendChild(cell);
         }
         body.appendChild(row);
       }
       table.appendChild(body);wrap.appendChild(table);area.appendChild(wrap);
       if(subset.length>shown.length){const note=document.createElement('p');note.textContent='Exibindo as primeiras '+shown.length+' pendências. Divida o lote e reconfira as demais.';area.appendChild(note);}
     }
     const footer=document.createElement('p');footer.textContent='Esta conferência inicial é local. O registro provisório não substitui a validação pedagógica nem armazena as fotografias originais.';area.appendChild(footer);
     if(liveAdmin){
       const activeCycle=loaded.cycles.find(c=>c.school_year===2026&&c.status==='draft');
       const classroomByCode=new Map(students.map(s=>[String(s.local_reference||'').toUpperCase(),s.classroom_id]));
       const classes=new Set(rows.filter(r=>r.ok).map(r=>classroomByCode.get(r.code)));
       const existing=new Set(loaded.importRows.filter(r=>['awaiting_pedagogical_review','ready_for_commit','committed'].includes(r.validation_status)).map(r=>r.student_id));
       const conflict=rows.some(r=>existing.has(students.find(s=>s.local_reference===r.code)?.id));
       const canStage=!!activeCycle&&tallies.total>=1&&tallies.total<=10&&tallies.review===0&&classes.size===1&&!conflict;
       if(canStage){
         pilotCandidate={csv:String(reader.result||''),cycleId:activeCycle.id,ownerId:profile.user_id};
         const save=document.createElement('button');save.type='button';save.className='smallbtn solid';
         save.textContent='Guardar este lote piloto para conferência pedagógica';
         save.onclick=()=>void stagePilotCSV(save,area);
         area.appendChild(save);
         const note=document.createElement('p');note.textContent='Este comando grava apenas respostas provisórias vinculadas às matrículas. Nenhuma fotografia é enviada e nenhuma avaliação oficial é publicada.';area.appendChild(note);
       }else if(tallies.total>0){
         const why=[];
         if(!activeCycle)why.push('ciclo de 2026 indisponível');
         if(tallies.total>10)why.push('piloto limitado a 10 fichas');
         if(tallies.review)why.push('fichas com pendências');
         if(classes.size>1)why.push('mistura de turmas');
         if(conflict)why.push('matrícula com registro provisório anterior');
         const msg=document.createElement('p');msg.textContent='Gravação provisória bloqueada: '+(why.join('; ')||'lote não elegível')+'. A conferência local permanece disponível.';area.appendChild(msg);
       }
     }
   }catch(err){area.textContent=err?.message||'Não foi possível interpretar o CSV.';}
 };
 reader.onerror=()=>area.textContent='Não foi possível ler o arquivo local.';
 reader.readAsText(file,'utf-8');
}

function pilotRecords(csvText,authorizedStudents){
 const status=checkReaderCSV(csvText,authorizedStudents,loaded.classrooms,true);
 if(!status.tallies.total||status.tallies.total>10||status.tallies.review)
  throw new Error('CSV não elegível para o piloto: é necessário resolver as pendências.');
 const lines=parseDelimited(String(csvText||'').replace(/^\uFEFF/,''),';');
 const cols=lines[0].map(x=>x.trim().toLowerCase());
 const ix=Object.fromEntries(cols.map((c,i)=>[c,i]));
 const matching=new Map(authorizedStudents.map(s=>[String(s.local_reference||'').toUpperCase(),s]));
 const output=[],classrooms=new Set();
 for(const line of lines.slice(1)){
  if(!line.some(v=>String(v).trim()))continue;
  const get=c=>String(line[ix[c]]||'').trim();
  const code=get('codigo').toUpperCase(),student=matching.get(code);
  if(!student||!student.active)throw new Error('Código de matrícula não autorizado.');
  classrooms.add(student.classroom_id);
  output.push({student_id:student.id,qr_code:code,
   answers:{H:get('hipotese'),L:get('leitura').split('|').map(x=>x.trim()).filter(Boolean),
    T1:get('memoria'),T2:get('narrativo'),
    ...Object.fromEntries(Array.from({length:7},(_,i)=>['M'+(i+1),get('m'+(i+1))]))}});
 }
 if(classrooms.size!==1)throw new Error('Separe o piloto por turma.');
 return output;
}
async function stagePilotCSV(button,area){
 if(mode!=='live'||role!=='pedagogical_admin'||!profile||!api||!pilotCandidate)return;
 const candidate=pilotCandidate;
 if(candidate.ownerId!==profile.user_id)return;
 if(!window.confirm('Guardar este lote PILOTO na área protegida para conferência pedagógica? Nenhum resultado oficial será publicado e nenhuma foto será enviada.'))return;
 button.disabled=true;button.textContent='Registrando lote provisório...';
 try{
  const {data:auth,error:authErr}=await api.auth.getUser();
  if(authErr||auth?.user?.id!==profile.user_id)
   throw new Error('Sessão institucional não confirmada. Entre novamente.');
  const rows=pilotRecords(candidate.csv,loaded.students);
  if(!window.crypto?.subtle)throw new Error('O navegador não permite confirmar a integridade do CSV.');
  const data=new TextEncoder().encode(candidate.csv);
  const digest=await window.crypto.subtle.digest('SHA-256',data);
  const hash=Array.from(new Uint8Array(digest),n=>n.toString(16).padStart(2,'0')).join('');
  const result=await api.rpc('lumina_stage_csv_pilot',{
   p_cycle_id:candidate.cycleId,p_source_hash:hash,p_rows:rows
  });
  if(result.error)throw new Error(result.error.message||'O banco recusou o lote.');
  if(mode!=='live'||profile?.user_id!==candidate.ownerId)return;
  pilotCandidate=null;
  pilotStageMessage='Lote piloto registrado em área protegida: '+Number(result.data?.rows_staged||0)+' ficha(s) em revisão pedagógica. Nenhuma avaliação oficial foi publicada.';
  area.replaceChildren();
  const success=document.createElement('p');
  success.textContent='Lote piloto guardado na área protegida. Fichas recebidas: '+Number(result.data?.rows_staged||0)+'. Situação: EM CONFERÊNCIA PEDAGÓGICA. Nenhum resultado oficial foi publicado.';
  area.appendChild(success);
  const hint=document.createElement('p');
  hint.textContent='As fotografias originais não foram armazenadas nesta etapa. Preserve-as em local institucional protegido até ativarmos a área de imagens.';
  area.appendChild(hint);
  await refreshLive();
 }catch(error){
  if(mode==='live'&&profile?.user_id===candidate.ownerId){
   const warning=document.createElement('p');
   warning.textContent='Não foi possível registrar o lote: '+(error?.message||'falha não identificada')+'. Nenhuma avaliação oficial foi alterada.';
   area.appendChild(warning);
  }
  button.disabled=false;button.textContent='Tentar registrar lote provisório';
 }
}


function readerRowsToCSV(rows){
 if(!Array.isArray(rows)||!rows.length||rows.length>10)
  throw new Error('No piloto, carregue até dez fichas da mesma turma.');
 const cols=['codigo','arquivo','hipotese','leitura','memoria','narrativo',...Array.from({length:7},(_,i)=>'M'+(i+1))];
 const escapeCSV=v=>'"'+String(v??'').replaceAll('"','""')+'"';
 const lines=[cols.join(';')];
 const known=new Set();
 for(const r of rows){
  if(!r||typeof r!=='object'||typeof r.codigo!=='string'||known.has(r.codigo))
   throw new Error('O lote contém código inválido ou repetido.');
  known.add(r.codigo);
  lines.push(cols.map(c=>escapeCSV(r[c])).join(';'));
 }
 return '\uFEFF'+lines.join('\r\n');
}
window.addEventListener('message',event=>{
 if(event.origin!==window.location.origin||mode!=='live'||role!=='pedagogical_admin'||currentPage!=='lotes')return;
 const frame=$('pilotReaderIframe');
 if(!frame||event.source!==frame.contentWindow||event.data?.type!=='lumina:reader-pilot:v1')return;
 try{
  const csv=readerRowsToCSV(event.data.rows);
  reviewCSV(new File([csv],'lote_piloto_validacao.csv',{type:'text/csv'}));
  const area=$('csvReport');if(area)area.scrollIntoView({behavior:'smooth',block:'start'});
 }catch(err){const area=$('csvReport');if(area)area.textContent='Lote não recebido: '+(err?.message||'erro de validação');}
});

function parseDelimited(text,delimiter){
 const rows=[];let row=[],field='',quoted=false;
 for(let i=0;i<text.length;i++){const ch=text[i];if(ch==='"'){if(quoted&&text[i+1]==='"'){field+='"';i++}else quoted=!quoted}
 else if(ch===delimiter&&!quoted){row.push(field);field=''}
 else if((ch==='\n'||ch==='\r')&&!quoted){if(ch==='\r'&&text[i+1]==='\n')i++;row.push(field);if(row.some(v=>v.trim()))rows.push(row);row=[];field=''}else field+=ch;}
 row.push(field);if(row.some(v=>v.trim()))rows.push(row);return rows;
}
async function enterLive(){
 if(!api)throw new Error('O serviço de autenticação não carregou. Verifique a conexão com a internet.');
 const {data:{user},error:userErr}=await api.auth.getUser();if(userErr||!user)throw new Error('Sessão não autorizada.');
 const {data:p,error:pErr}=await api.from('staff_profiles').select('user_id,school_id,display_name,role,active').eq('user_id',user.id).eq('active',true).maybeSingle();
 if(pErr)throw new Error('Não foi possível conferir as permissões do usuário.');
 if(!p||!['teacher','pedagogical_admin','director'].includes(p.role)){
  await api.auth.signOut();throw new Error('Sua conta ainda não foi liberada pela coordenação. Nenhum dado escolar foi exibido.');
 }
 profile=p;role=p.role;mode='live';currentPage='visao';pilotCandidate=null;pilotStageMessage='';
 $('loginView').classList.add('hidden');$('appView').classList.remove('hidden');$('btnLogout').classList.remove('hidden');
 // Exibe imediatamente a estrutura protegida, mesmo se alguma consulta do banco demorar.
 render();
 $('content').insertAdjacentHTML('afterbegin','<div id="loadNotice" class="notice info" role="status">Carregando informações autorizadas da escola...</div>');
 void refreshLive().catch(err=>{
   console.error('Falha ao carregar painel autorizado',err);
   const card=$('loadNotice')||$('content');
   if(card)card.textContent='Não foi possível carregar os dados agora. Clique em Atualizar. Sua conta permanece protegida.';
 });
}
async function refreshLive(){
 if(!api||!profile||mode!=='live')return;
 const currentUser=profile.user_id;
 const get=async(tab,fields,filter='school_id')=>{
   try{
     let q=api.from(tab).select(fields);if(filter==='school_id')q=q.eq('school_id',profile.school_id);
     // Um endpoint indisponível não pode deixar a interface inteira em branco.
     const response=await Promise.race([
       Promise.resolve(q),
       new Promise((_,reject)=>setTimeout(()=>reject(new Error('Tempo de consulta esgotado')),14000))
     ]);
     if(response.error)throw response.error;
     return response.data||[];
   }catch(err){
     console.warn('Consulta restrita ou indisponível',tab,err?.code||err?.message);
     return [];
   }
 };
 const results=await Promise.all([
   get('classrooms','id,label,shift,school_year'),
   get('assessment_cycles','id,title,status,school_year'),
   profile.role==='director'?Promise.resolve([]):get('students','id,display_name,classroom_id,active,local_reference','none'),
   profile.role==='director'?Promise.resolve([]):get('assessment_results','student_id,cycle_id,answers','none'),
   profile.role==='pedagogical_admin'?get('staff_directory','id,full_name,planned_role,email,status'):Promise.resolve([]),
   profile.role==='pedagogical_admin'?get('staff_directory_classrooms','staff_id,classroom_id','none'):Promise.resolve([]),
   profile.role==='pedagogical_admin'?get('import_batches','id,classroom_id,expected_rows,status,source_filename'):Promise.resolve([]),
   profile.role==='pedagogical_admin'?get('assessment_import_rows','id,batch_id,validation_status,student_id,qr_code','none'):Promise.resolve([])
 ]);
 if(mode!=='live'||profile?.user_id!==currentUser)return;
 const [classrooms,cycles,students,official,staff,staffLinks,batches,importRows]=results;
 loaded={classrooms,cycles,students,results:official,staff,staffLinks,batches,importRows};
 render();
}
function enterDemo(){pilotCandidate=null;pilotStageMessage='';mode='demo';role=$('demoRole').value;profile=null;currentPage='visao';$('loginView').classList.add('hidden');$('appView').classList.remove('hidden');$('btnLogout').classList.remove('hidden');render();}
function exitDemo(){pilotCandidate=null;pilotStageMessage='';loaded={classrooms:[],students:[],results:[],cycles:[],staff:[],staffLinks:[],batches:[],importRows:[]};mode='guest';profile=null;currentPage='visao';$('appView').classList.add('hidden');$('loginView').classList.remove('hidden');$('btnLogout').classList.add('hidden');$('loginMessage').textContent='';showAuthPanel('login');}
// A pessoa convidada configura sua própria senha após a confirmação do Supabase.
const invitationFlow = new URLSearchParams(window.location.hash.replace(/^#/, '')).get('type');
let changingPassword = invitationFlow === 'invite' || invitationFlow === 'recovery';
function showAuthPanel(section){
  $('loginForm').classList.toggle('hidden',section!=='login');
  $('btnForgotPassword').classList.toggle('hidden',section!=='login');
  $('passwordRecoveryForm').classList.toggle('hidden',section!=='recovery');
  $('passwordSetupForm').classList.toggle('hidden',section!=='setup');
  $('btnDemo').classList.toggle('hidden',section==='setup');
}
function showPasswordSetup(){
  changingPassword=true;
  $('loginView').classList.remove('hidden');
  $('appView').classList.add('hidden');
  $('btnLogout').classList.add('hidden');
  showAuthPanel('setup');
}
function bind(){
 $('loginForm').addEventListener('submit',async(e)=>{e.preventDefault();const btn=$('btnLogin'),msg=$('loginMessage');btn.disabled=true;msg.textContent='Verificando credenciais...';try{
  if(!api)throw new Error('Serviço temporariamente indisponível. Abra este arquivo com conexão à internet.');
  const email=$('email').value.trim(),password=$('password').value;
  const {error}=await api.auth.signInWithPassword({email,password});if(error)throw new Error('Não foi possível entrar. Confira seu e-mail, sua senha e a liberação do acesso.');
  $('password').value='';await enterLive();msg.textContent='';
 }catch(err){msg.textContent=err.message||'Erro ao entrar.'}finally{btn.disabled=false}});
 $('btnForgotPassword').addEventListener('click',()=>{
    $('recoveryEmail').value=$('email').value.trim();
    $('recoveryMessage').textContent='';
    showAuthPanel('recovery');
  });
  $('btnBackFromRecovery').addEventListener('click',()=>showAuthPanel('login'));
  $('passwordRecoveryForm').addEventListener('submit',async e=>{
    e.preventDefault();
    const btn=$('btnSendRecovery'),msg=$('recoveryMessage');
    btn.disabled=true;msg.textContent='Enviando solicitação...';
    try{
      if(!api)throw new Error('Serviço indisponível. Confira sua internet.');
      const email=$('recoveryEmail').value.trim();
      const {error}=await api.auth.resetPasswordForEmail(email,{redirectTo:location.origin+location.pathname});
      if(error)throw error;
      msg.textContent='Se o e-mail estiver cadastrado, receberá instruções para redefinir a senha.';
    }catch(e){msg.textContent='Não foi possível enviar o e-mail agora. Tente novamente.'}
    finally{btn.disabled=false}
  });
  $('passwordSetupForm').addEventListener('submit',async e=>{
    e.preventDefault();
    const btn=$('btnSavePassword'),msg=$('setupPasswordMessage');
    const password=$('newPassword').value,confirm=$('newPasswordConfirm').value;
    if(password.length<12||password!==confirm){msg.textContent='Use ao menos 12 caracteres e confirme a mesma senha.';return}
    btn.disabled=true;msg.textContent='Salvando sua senha...';
    try{
      if(!api)throw new Error('Serviço indisponível.');
      const {data:{user},error:userError}=await api.auth.getUser();
      if(userError||!user)throw new Error('Este convite expirou. Solicite um novo acesso.');
      const {error}=await api.auth.updateUser({password});
      if(error)throw error;
      $('newPassword').value='';$('newPasswordConfirm').value='';
      changingPassword=false;
      history.replaceState(null,'',location.pathname);
      try{
        await enterLive();
      }catch(err){
        showAuthPanel('login');
        $('loginMessage').textContent='Senha criada. Seu perfil ainda aguarda autorização da coordenação. Entre novamente quando for liberado.';
      }
    }catch(err){msg.textContent=err.message||'Não foi possível salvar. Solicite novo convite.'}
    finally{btn.disabled=false}
  });
  $('btnDemo').addEventListener('click',enterDemo);
 $('btnLogout').addEventListener('click',async()=>{if(mode==='live'&&api)await api.auth.signOut();exitDemo()});
 $('btnRefresh').addEventListener('click',async()=>{if(mode==='live')await refreshLive();else render()});
 $('demoRole').addEventListener('change',()=>{if(mode==='demo'){role=$('demoRole').value;render()}});
 document.querySelectorAll('.nav-btn').forEach(btn=>btn.addEventListener('click',()=>{currentPage=btn.dataset.page;render()}));
 $('content').addEventListener('click',e=>{const embedded=e.target.closest('[data-embed-reader]');if(embedded&&mode==='live'&&role==='pedagogical_admin'){const holder=$('pilotReaderContainer');if(holder&&!holder.querySelector('iframe')){const iframe=document.createElement('iframe');iframe.id='pilotReaderIframe';iframe.title='Leitor V5 protegido para piloto';iframe.src='leitor-v5.html?v=20261108-direto-painel-r1';iframe.style.width='100%';iframe.style.height='940px';iframe.style.border='1px solid #d6e5d9';iframe.style.borderRadius='10px';holder.appendChild(iframe);embedded.textContent='Leitor aberto abaixo';embedded.disabled=true;}return;}const testX=e.target.closest('[data-test-x]');if(testX){try{window.LuminaFichas.printTestSheet();}catch(err){window.alert(err.message||'Não foi possível abrir o teste.');}return;}const guide=e.target.closest('[data-guide-class]');if(guide&&mode==='live'&&role==='pedagogical_admin'){const klass=loaded.classrooms.find(c=>c.id===guide.dataset.guideClass);if(klass){try{window.LuminaFichas.printGuide(Number(klass.label[0]));}catch(err){rosterReviewMessage='Não foi possível gerar o roteiro. Atualize a página.';render();}}return;}const printOne=e.target.closest('[data-ficha-student]');if(printOne){const s=loaded.students.find(x=>x.id===printOne.dataset.fichaStudent);if(s)openFichas(s.classroom_id,s.id);return;}const printClass=e.target.closest('[data-ficha-class]');if(printClass){openFichas(printClass.dataset.fichaClass,null);return;}const allQR=e.target.closest('[data-print-qr-all]');if(allQR){printAllQrCodes();return;}const qrPrint=e.target.closest('[data-print-qr-class]');if(qrPrint){printQrCodes(qrPrint.dataset.printQrClass);return;}const classroomReview=e.target.closest('[data-verify-class]');if(classroomReview){void verifyRosterClass(classroomReview.dataset.verifyClass,classroomReview);return;}const review=e.target.closest('[data-verify-student]');if(review){void updateStudentReview(review.dataset.verifyStudent,review.dataset.nextActive==='true',review);return;}const btn=e.target.closest('[data-jump]');if(btn){currentPage=btn.dataset.jump;render()}});
}
(async()=>{
 bind();
 if(window.supabase?.createClient){try{api=window.supabase.createClient(PROJECT_URL,PUBLISHABLE_KEY,{auth:{autoRefreshToken:true,persistSession:true,detectSessionInUrl:true}});
  api.auth.onAuthStateChange((event,session)=>{
     if(event==='PASSWORD_RECOVERY'&&session)showPasswordSetup();
     if(event==='SIGNED_IN'&&session&&changingPassword)showPasswordSetup();
   });
   const {data:{session}}=await api.auth.getSession();
   if(session){
     if(changingPassword)showPasswordSetup();
     else{try{await enterLive()}catch(e){$('loginMessage').textContent=e.message}}
   }
 }catch(e){
   console.warn('Autenticação não inicializada',e?.message);
   $('loginView').classList.remove('hidden');
   $('appView').classList.add('hidden');
   $('loginMessage').textContent='A conexão com a conta não foi concluída. Abra o endereço direto do painel e tente entrar com e-mail e senha.';
 }}
})();
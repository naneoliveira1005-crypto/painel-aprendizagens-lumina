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
}
function home(d){
 let cycleCount=d.cycles.length, classCount=d.classrooms.length, studentCount=d.students.length, resultCount=d.results.length;
 const realWarning=mode==='live'?notice('Os <strong>7 registros reais do 2º A</strong> permanecem em conferência separada; ainda não estão lançados como resultados oficiais. As matrículas e os acessos precisam de aprovação antes da publicação dos resultados.','info'):notice('As informações abaixo são fictícias ou estruturais para prévia de navegação. Nenhuma criança real é identificada.','info');
 const classLines=d.classrooms.slice(0,5).map(c=>`<li><span><b>${clean(c.label)}</b><br><small>${clean(shiftLabel[c.shift]||c.shift)}</small></span><span class="chip grey">${mode==='demo'?'Exemplo':'Cadastrada'}</span></li>`).join('');
 let graph='';
 if(mode==='demo'){
  const v=[1,1,2,1,2],labels=['Pré-silábica','Silábica sem valor','Silábica com valor','Silábico-alfabética','Alfabética'];
  graph=labels.map((lab,i)=>`<div class="barrow"><span>${clean(lab)}</span><div class="bartrack"><span style="width:${v[i]*38}%"></span></div><strong>${v[i]}</strong></div>`).join('');
 }else if(resultCount){
  const v=[1,2,3,4,5].map(x=>d.results.filter(r=>r.answers?.H==='H'+x).length);
  graph=['Pré-silábica','Silábica sem valor','Silábica com valor','Silábico-alfabética','Alfabética'].map((lab,i)=>`<div class="barrow"><span>${clean(lab)}</span><div class="bartrack"><span style="width:${Math.round((v[i]/Math.max(1,...v))*100)}%"></span></div><strong>${v[i]}</strong></div>`).join('');
 }else graph='<div class="empty">Ainda não existem resultados oficiais disponíveis para este perfil. Os sete registros de teste estão em validação separada.</div>';
 const counts = mode==='demo'?['16','—','—','0']: [classCount,studentCount,resultCount,d.importRows.length];
 return `${realWarning}<div class="kpi-grid">${cardKpi(counts[0],'Turmas visíveis','Conforme a permissão')}${cardKpi(counts[1],'Estudantes cadastrados','Não confundir com fichas provisórias')}${cardKpi(counts[2],'Avaliações oficiais','Resultados já validados')}${cardKpi(counts[3],'Fichas em validação','Somente coordenação pode consultar')}</div>
 <div class="twocol"><article class="card"><h2>Panorama da escrita</h2><p>${mode==='demo'?'Exemplo fictício de visualização':'Somente resultados oficiais autorizados'}</p>${graph}</article><article class="card"><h2>Turmas acompanhadas</h2><p>Organização das turmas e respectivos turnos.</p><ul class="eyelist">${classLines||'<li>Nenhuma turma liberada para este perfil.</li>'}</ul><button class="smallbtn" data-jump="turmas">Ver todas as turmas →</button></article></div>
 <div class="card"><h2>Próximas etapas do projeto</h2><p>Ativação responsável, sem misturar testes com os resultados oficiais.</p><ul class="eyelist"><li><span>Conferir nomes, e-mails, turnos e vínculos da equipe</span>${chip('pending')}</li><li><span>Convidar profissionais e testar perfis de acesso</span>${chip('pending')}</li><li><span>Vincular os QR Codes aos cadastros autorizados</span>${chip('pending')}</li><li><span>Publicar depois dos testes de segurança</span>${chip('pending')}</li></ul></div>`;
}
function classes(d){
 const rows=d.classrooms.map(c=>`<tr><td><strong>${clean(c.label)}</strong></td><td>${clean(shiftLabel[c.shift]||c.shift)}</td><td>${mode==='demo'?'—':d.students.filter(s=>s.classroom_id===c.id).length}</td><td>${chip(mode==='demo'?'exemplo':'pending')}</td></tr>`).join('');
 return `${notice(mode==='demo'?'Simulação da lista de turmas.':'A lista respeita seu vínculo pedagógico e as regras de acesso do banco de dados.','info')}<div class="card"><h2>Turmas autorizadas</h2><p>${clean(d.classrooms.length)} turma(s) disponíveis neste perfil.</p><div class="tablewrap"><table><thead><tr><th>Turma</th><th>Turno</th><th>Estudantes no banco</th><th>Situação</th></tr></thead><tbody>${rows||'<tr><td colspan="4">Nenhuma turma disponível.</td></tr>'}</tbody></table></div></div>`;
}
function assessments(d){
 const cycles=d.cycles.map(c=>`<tr><td>${clean(c.title)}</td><td>${chip(c.status)}</td><td>${mode==='demo'?'Demonstração':'Institucional'}</td></tr>`).join('');
 const studentRows=role==='director'?'<p class="intro-note">A direção tem acesso a informações institucionais; resultados individuais não são disponibilizados neste perfil.</p>': d.students.length?`<div class="tablewrap"><table><thead><tr><th>Estudante</th><th>Turma</th><th>Avaliações oficiais</th></tr></thead><tbody>${d.students.slice(0,50).map(s=>`<tr><td>${clean(s.display_name)}</td><td>${clean(d.classrooms.find(c=>c.id===s.classroom_id)?.label||'')}</td><td>${d.results.filter(r=>r.student_id===s.id).length}</td></tr>`).join('')}</tbody></table></div>`:'<div class="empty">Não existem estudantes e resultados oficiais liberados neste perfil. As sete fichas do piloto estão em validação e não aparecem aqui.</div>';
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
 <p><strong>Etapa atual:</strong> conferência dos instrumentos e organização das turmas. A identificação dos estudantes e o vínculo de cada ficha ainda precisam ser preparados antes dos lançamentos reais.</p>
 <p class="intro-note">Fluxo previsto: aplicação e marcação da ficha → envio protegido do arquivo → conferência pedagógica → validação → visualização consolidada. A etapa de envio e publicação ainda não está habilitada nesta versão.</p></div>
 <div class="card"><h2>Acompanhamento individual autorizado</h2>${studentRows}</div>`;
}
function batches(d){
 const admin=role==='pedagogical_admin';
 const batchList=d.batches.map(b=>`<tr><td>${clean(b.source_filename||'Lote de leitura')}</td><td>${clean(d.classrooms.find(c=>c.id===b.classroom_id)?.label||'—')}</td><td>${clean(b.expected_rows??'—')}</td><td>${chip(b.status)}</td></tr>`).join('');
 return `${notice('O leitor V5 funciona localmente. As imagens e os PDFs selecionados não são enviados automaticamente ao Supabase. A importação oficial continua bloqueada até a validação das matrículas e da equipe.','info')}
 <div class="card"><h2>Leitor automático de fichas</h2><p>QR Code por estudante, reconhecimento dos X, processamento em lote e revisão das exceções.</p><div class="buttonrow"><a href="leitor-v5.html" target="_blank" rel="noopener noreferrer" class="smallbtn solid">Abrir leitor V5 →</a><button class="smallbtn" type="button" data-jump="avaliacoes">Ver resultados oficiais</button></div><p class="intro-note">O leitor local continua em testes com PDFs e imagens de diferentes turmas. Não compartilhe fichas com dados de crianças fora dos canais autorizados.</p></div>
 ${admin?`<div class="card"><h2>Lotes provisórios da escola</h2><p>Somente a coordenação vê registros de importação em validação.</p><div class="tablewrap"><table><thead><tr><th>Arquivo</th><th>Turma</th><th>Fichas</th><th>Situação</th></tr></thead><tbody>${batchList||'<tr><td colspan="4">Nenhum lote de teste cadastrado.</td></tr>'}</tbody></table></div>${mode==='live'?`<p class="intro-note">Linhas provisórias acessíveis neste perfil: ${d.importRows.length}. Não representam avaliações publicadas.</p>`:''}</div>`:''}
 <div class="card"><h2>Conferência de CSV local</h2><p>Selecione um CSV exportado pelo leitor. O arquivo será analisado somente no seu navegador, sem upload.</p><input id="csvReview" class="filecontrol" type="file" accept=".csv,text/csv"><div id="csvReport" class="report" role="status">Aguardando arquivo CSV.</div><p class="intro-note">A gravação definitiva no banco não está habilitada nesta prévia. Nenhum botão aqui publica resultados.</p></div>`;
}
function team(d){
 if(role==='teacher') return `<div class="card"><h2>Minha autorização</h2><p>Você pode consultar as turmas vinculadas ao seu perfil. A coordenação confirma vínculos e altera permissões.</p>${notice('Se alguma turma não aparecer, procure a coordenação pedagógica. Não compartilhe senha nem CPF.','info')}</div>`;
 if(role==='director')return `<div class="card"><h2>Visão institucional</h2><p>A direção acompanha informações coletivas. A atribuição de turmas e o lançamento de resultados dependem da coordenação.</p>${notice('Os dados individuais das crianças não estão disponíveis neste perfil.','info')}</div>`;
 const rows=d.staff.map(s=>{const turmas=(d.staffLinks||[]).filter(x=>x.staff_id===s.id).map(x=>d.classrooms.find(c=>c.id===x.classroom_id)?.label).filter(Boolean).sort((a,b)=>a.localeCompare(b,'pt-BR')).join(', ')||'A definir';return `<tr><td>${clean(s.full_name)}<div class="intro-note">Turmas: ${clean(turmas)}</div></td><td>${clean(plannedName[s.planned_role]||s.planned_role)}</td><td>${s.email?clean(s.email):'<span class="chip warn">Pendente</span>'}</td><td>${chip(s.status)}</td></tr>`;}).join('');
 return `<div class="card"><h2>Pré-cadastro de profissionais</h2><p>A equipe está em conferência. Os nomes e e-mails exibidos dependem da versão aprovada pela escola.</p><div class="tablewrap"><table><thead><tr><th>Profissional</th><th>Função</th><th>E-mail</th><th>Acesso</th></tr></thead><tbody>${rows||'<tr><td colspan="4">O cadastro da equipe ainda não foi liberado.</td></tr>'}</tbody></table></div></div>${notice('<strong>Priscila já tem acesso ativo.</strong> Os convites das professoras e da direção ainda não foram enviados. A ativação exige e-mails confirmados, aprovação dos vínculos e testes com contas reais. CPF não é senha; a futura entrada por CPF precisa de serviço protegido, sem revelar dados pessoais.','info')}`;
}
function reviewCSV(file){
 const area=$('csvReport');if(!area||!file)return;
 if(file.size>2_000_000){area.textContent='Arquivo muito grande para esta prévia. Use um CSV de teste menor.';return}
 const reader=new FileReader();reader.onload=()=>{
  const str=String(reader.result||'').replace(/^\uFEFF/,'');
  const lines=parseDelimited(str,';');if(!lines.length){area.textContent='CSV vazio.';return}
  const headers=lines[0].map(h=>h.trim().toLowerCase());const ix={};headers.forEach((h,i)=>ix[h]=i);
  if(!['codigo','hipotese','leitura','memoria','narrativo','m1','m2','m3','m4','m5','m6','m7'].every(h=>h in ix)){
   area.textContent='Este CSV não possui todas as colunas esperadas pelo leitor Lumina V5.';return;
  }
  let valid=0,invalid=0,duplicates=0;const seen=new Set();
  for(const row of lines.slice(1)){if(!row.some(v=>v.trim()))continue;const code=String(row[ix.codigo]||'').trim().toUpperCase();const unique=!seen.has(code);seen.add(code);
   const complete=/^SON-26-[A-F0-9]{12}$/.test(code)&&/^H[1-5]$/.test(row[ix.hipotese]||'')&&/^T1[012]$/.test(row[ix.memoria]||'')&&/^T2[012]$/.test(row[ix.narrativo]||'')&&[1,2,3,4,5,6,7].every(i=>new RegExp('^M'+i+'_(A|P|N|NO)$').test(row[ix['m'+i]]||''));
   if(!unique)duplicates++;
   if(complete&&unique)valid++;else invalid++;
  }
  area.textContent=`Análise local concluída.\nFichas com formato válido: ${valid}\nFichas com pendências: ${invalid}\nQR Codes repetidos: ${duplicates}\nNenhuma informação foi enviada ao Supabase.`;
 };reader.onerror=()=>area.textContent='Não foi possível ler o arquivo local.';reader.readAsText(file,'utf-8');
}
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
 profile=p;role=p.role;mode='live';currentPage='visao';
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
   profile.role==='director'?Promise.resolve([]):get('students','id,display_name,classroom_id','none'),
   profile.role==='director'?Promise.resolve([]):get('assessment_results','student_id,cycle_id,answers','none'),
   profile.role==='pedagogical_admin'?get('staff_directory','id,full_name,planned_role,email,status'):Promise.resolve([]),
   profile.role==='pedagogical_admin'?get('staff_directory_classrooms','staff_id,classroom_id','none'):Promise.resolve([]),
   profile.role==='pedagogical_admin'?get('import_batches','id,classroom_id,expected_rows,status,source_filename'):Promise.resolve([]),
   profile.role==='pedagogical_admin'?get('assessment_import_rows','id,batch_id,validation_status','none'):Promise.resolve([])
 ]);
 if(mode!=='live'||profile?.user_id!==currentUser)return;
 const [classrooms,cycles,students,official,staff,staffLinks,batches,importRows]=results;
 loaded={classrooms,cycles,students,results:official,staff,staffLinks,batches,importRows};
 render();
}
function enterDemo(){mode='demo';role=$('demoRole').value;profile=null;currentPage='visao';$('loginView').classList.add('hidden');$('appView').classList.remove('hidden');$('btnLogout').classList.remove('hidden');render();}
function exitDemo(){mode='guest';profile=null;currentPage='visao';$('appView').classList.add('hidden');$('loginView').classList.remove('hidden');$('btnLogout').classList.add('hidden');$('loginMessage').textContent='';showAuthPanel('login');}
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
 $('content').addEventListener('click',e=>{const btn=e.target.closest('[data-jump]');if(btn){currentPage=btn.dataset.jump;render()}});
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
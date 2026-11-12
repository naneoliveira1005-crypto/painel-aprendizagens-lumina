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
let transferDraft=null; // apenas memória da sessão da coordenação; nunca armazenar dados dos alunos no navegador permanentemente
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
function chip(status){let t=status==='open'?'Aberta':status==='draft'?'Rascunho':status==='closed'?'Fechada':status==='review'?'Em conferência':status==='completed'?'Concluído':status==='pending'?'Pendente':status==='active'?'Ativa':status||'Pendente'; return `<span class="chip ${status==='review'||status==='pending'?'warn':''}">${clean(t)}</span>`;}
function notice(msg,cls=''){return `<div class="notice ${cls}">${msg}</div>`;}
function selectedData(){return mode==='demo'?demoData:loaded;}
function render(){
 if(mode==='guest')return;
 const pageTitles={visao:['Visão geral','Acompanhamento das aprendizagens e do percurso pedagógico.'],turmas:['Turmas','Organização das classes e responsabilidades.'],avaliacoes:['Avaliações','Registros pedagógicos e indicadores por componente.'],lotes:['Leitura de fichas','Envio de PDF ou foto da ficha preenchida.'],equipe:['Equipe e acessos','Gestão de vínculos e permissões institucionais.']};
 const [title,subtitle]=pageTitles[currentPage]; $('pageTitle').textContent=title;$('pageSubtitle').textContent=subtitle;
 $('roleLabel').textContent=roleName[role]||'Acesso institucional';
 document.querySelectorAll('.nav-btn').forEach(btn=>btn.classList.toggle('current',btn.dataset.page===currentPage));
 $('modeBanner').classList.toggle('hidden',mode!=='demo');
 $('modeBanner').textContent=mode==='demo'?'MODO DEMONSTRAÇÃO · Os dados exibidos são exemplos fictícios. Não há consulta, importação nem gravação de registros reais.':'';
 $('demoRoleLabel').classList.toggle('hidden',mode!=='demo');
 const d=selectedData();
 let pageMarkup='';
 try{
  pageMarkup=({visao:()=>home(d),turmas:()=>classes(d),avaliacoes:()=>assessments(d),lotes:()=>batches(d),equipe:()=>team(d)})[currentPage]();
 }catch(err){
  console.error('Falha ao abrir a seção',currentPage,err);
  pageMarkup='<div class="card"><h2>Não foi possível carregar esta seção</h2>'+
   '<p>O conteúdo anterior foi ocultado para evitar confusão. Atualize a página.</p>'+
   '<p>Para analisar uma ficha sem alterar resultados, <a href="leitor-v5.html?v=20261111-resumo-conferencia-v21" target="_blank" rel="noopener noreferrer">abrir o leitor de PDF ou foto</a>.</p></div>';
 }
 $('content').innerHTML=pageMarkup;
 const input=$('csvReview');if(input)input.addEventListener('change',e=>reviewCSV(e.target.files?.[0]));
 // Se o salvamento falhar, voltar à aba mantém a conferência na memória da sessão.
 if(currentPage==='lotes'&&mode==='live'&&['pedagogical_admin','teacher'].includes(role)&&
    transferDraft?.ownerId===profile?.user_id&&transferDraft.csv){
  reviewCSV(new File([transferDraft.csv],'lote_recuperado_da_sessao.csv',{type:'text/csv'}));
 }
 const classroomPicker=$('studentClassFilter'); if(classroomPicker)classroomPicker.addEventListener('change',e=>{selectedRosterClass=e.target.value;render()});
 const resultPicker=$('resultsClassFilter');if(resultPicker)resultPicker.addEventListener('change',e=>{selectedResultsClass=e.target.value;render()});
}
function home(d){
 let cycleCount=d.cycles.length, classCount=d.classrooms.length, studentCount=d.students.length, resultCount=d.results.length;
 const pendingValidation=d.importRows.filter(r=>r.validation_status!=='committed').length;
 const realWarning=mode==='live'?notice('Existem <strong>'+pendingValidation+' ficha(s) aguardando conferência</strong> e <strong>'+d.results.length+' avaliação(ões) oficiais</strong> disponíveis neste perfil. A publicação exige conferência pedagógica e autorização da coordenação.','info'):notice('As informações abaixo são fictícias ou estruturais para prévia de navegação. Nenhuma criança real é identificada.','info');
 const classLines=d.classrooms.slice(0,5).map(c=>`<li><span><b>${clean(c.label)}</b><br><small>${clean(shiftLabel[c.shift]||c.shift)}</small></span><span class="chip grey">${mode==='demo'?'Exemplo':'Cadastrada'}</span></li>`).join('');
 let graph='';
 if(mode==='demo'){
  const v=[1,1,2,1,2],labels=['Pré-silábica','Silábica sem valor','Silábica com valor','Silábico-alfabética','Alfabética'];
  graph=labels.map((lab,i)=>`<div class="barrow"><span>${clean(lab)}</span><div class="bartrack"><span style="width:${v[i]*38}%"></span></div><strong>${v[i]}</strong></div>`).join('');
 }else if(resultCount){
  const v=[1,2,3,4,5].map(x=>d.results.filter(r=>r.answers?.H==='H'+x).length);
  graph=['Pré-silábica','Silábica sem valor','Silábica com valor','Silábico-alfabética','Alfabética'].map((lab,i)=>`<div class="barrow"><span>${clean(lab)}</span><div class="bartrack"><span style="width:${Math.round((v[i]/Math.max(1,...v))*100)}%"></span></div><strong>${v[i]}</strong></div>`).join('');
 }else graph='<div class="empty">Ainda não existem resultados oficiais disponíveis para este perfil. Os registros provisórios estão em validação separada.</div>';
 const counts = mode==='demo'?['16','—','—','0']: [classCount,d.students.filter(s=>s.active).length,resultCount,pendingValidation];
 return `${realWarning}<div class="kpi-grid">${cardKpi(counts[0],'Turmas visíveis','Conforme a permissão')}${cardKpi(counts[1],mode==='live'?'Matrículas confirmadas':'Estudantes fictícios',mode==='live'?'QR individual vinculado ao cadastro':'Dados de demonstração')}${cardKpi(counts[2],'Avaliações oficiais','Resultados já validados')}${cardKpi(counts[3],'Fichas em validação','Somente coordenação pode consultar')}</div>
 <div class="twocol"><article class="card"><h2>Panorama da escrita</h2><p>${mode==='demo'?'Exemplo fictício de visualização':'Distribuição parcial entre as avaliações oficiais registradas. Não representa necessariamente toda a escola.'}</p>${graph}</article><article class="card"><h2>Turmas acompanhadas</h2><p>Organização das turmas e respectivos turnos.</p><ul class="eyelist">${classLines||'<li>Nenhuma turma liberada para este perfil.</li>'}</ul><button class="smallbtn" data-jump="turmas">Ver todas as turmas →</button></article></div>
 <div class="card"><h2>Próximas etapas do projeto</h2><p>Ativação responsável, sem misturar testes com os resultados oficiais.</p><ul class="eyelist"><li><span>Conferir nomes, e-mails e permissões restantes das professoras</span>${chip('pending')}</li><li><span>Testar com uma ficha impressa e fotografada</span>${chip('pending')}</li><li><span>Conferir QR e resultados do CSV com a matrícula autorizada</span>${chip('pending')}</li><li><span>Habilitar lançamento protegido após testes de segurança e validação pedagógica</span>${chip('pending')}</li></ul></div>`;
}
function classes(d){
 const rows=d.classrooms.map(c=>`<tr><td><strong>${clean(c.label)}</strong></td><td>${clean(shiftLabel[c.shift]||c.shift)}</td><td>${mode==='demo'?'—':d.students.filter(s=>s.classroom_id===c.id).length}</td><td>${chip(mode==='demo'?'exemplo':d.students.filter(s=>s.classroom_id===c.id).every(s=>s.active)?'active':'pending')}</td></tr>`).join('');
 return `${notice(mode==='demo'?'Simulação da lista de turmas.':'A lista respeita seu vínculo pedagógico e as regras de acesso do banco de dados.','info')}<div class="card"><h2>Turmas autorizadas</h2><p>${clean(d.classrooms.length)} turma(s) disponíveis neste perfil.</p><div class="tablewrap"><table><thead><tr><th>Turma</th><th>Turno</th><th>Estudantes no banco</th><th>Situação</th></tr></thead><tbody>${rows||'<tr><td colspan="4">Nenhuma turma disponível.</td></tr>'}</tbody></table></div></div>`;
}

let selectedResultsClass='';

function learningBars(items,denominator){
 const size=Math.max(1,Number(denominator)||1);
 return '<div class="learning-chart"><div class="chart-rows">'+items.map((item,i)=>{
  const label=String(item[0]),count=Math.max(0,Number(item[1])||0);
  const width=Math.min(100,100*count/size);
  const styles=['chart-fill--green','chart-fill--gold','chart-fill--light','chart-fill--deep','chart-fill--sand'];
  return '<div class="chart-line">'+
    '<span class="chart-label">'+clean(label)+'</span>'+
    '<div class="chart-track" role="img" aria-label="'+clean(label+': '+count+' de '+denominator)+'">'+
    '<span class="chart-fill '+styles[i%styles.length]+'" style="width:'+width.toFixed(2)+'%"></span></div>'+
    '<span class="chart-count">'+count+'</span></div>';
 }).join('')+'</div></div>';
}
function learningMathChart(records,mathLabels){
 const n=records.length;
 if(!n)return '';
 const legend=[['level-a','Alcançou'],['level-p','Parcialmente'],['level-n','Não alcançou'],['level-no','Não observado']]
  .map(([theme,label])=>'<span class="chart-legend-item"><span class="chart-legend-swatch '+theme+'"></span>'+label+'</span>').join('');
 const bar=mathLabels.map((label,i)=>{
  const key='M'+(i+1);
  const marks=['A','P','N','NO'];
  const counts=marks.map(mark=>records.filter(r=>r.answers?.[key]===key+'_'+mark).length);
  const themes=['level-a','level-p','level-n','level-no'];
  const segments=counts.map((count,j)=>'<span class="chart-math-segment '+themes[j]+'" style="width:'+((100*count/n).toFixed(2))+'%"></span>').join('');
  const textCounts=counts.map((qty,j)=>['A','P','N','NO'][j]+': '+qty).join(' · ');
  return '<div class="chart-math-item">'+
   '<div class="chart-math-label"><strong>'+clean(key)+'</strong> <span>'+clean(label)+'</span></div>'+
   '<div class="chart-math-track" role="img" aria-label="'+clean(key+' '+label+': '+textCounts)+'">'+segments+'</div>'+
   '<div class="chart-math-tallies">'+clean(textCounts)+'</div></div>';
 }).join('');
 return '<div class="learning-chart"><p class="chart-subtitle">Cada barra representa somente as '+n+' avaliações oficiais desta turma.</p>'+
  '<div class="chart-math-legend">'+legend+'</div>'+
  '<div class="chart-math-rows">'+bar+'</div>'+
  '<p class="chart-note">Os segmentos indicam quantidades, não notas. Os estudantes sem ficha publicada não entram no gráfico.</p></div>';
}

function officialResultsDashboard(d){
 if(mode==='demo')return '<div class="card"><h2>Panorama das aprendizagens</h2><p>Disponível apenas para usuários autorizados, a partir de resultados oficiais.</p></div>';
 if(role==='director')return '<div class="card"><h2>Panorama das aprendizagens</h2><p>O acesso da direção não exibe dados individuais nesta etapa. Indicadores agregados poderão ser disponibilizados após a configuração específica desse perfil.</p></div>';
 const authorized=d.students.filter(s=>s.active&&d.classrooms.some(c=>c.id===s.classroom_id));
 const studentById=new Map(authorized.map(s=>[s.id,s]));
 const results=d.results.filter(r=>studentById.has(r.student_id)&&r.answers&&typeof r.answers==='object');
 const byClass=klass=>results.filter(r=>studentById.get(r.student_id).classroom_id===klass);
 const available=d.classrooms.filter(c=>authorized.some(s=>s.classroom_id===c.id))
   .slice().sort((a,b)=>a.label.localeCompare(b.label,'pt-BR',{numeric:true}));
 if(!available.length)return '<div class="card"><h2>Panorama das aprendizagens</h2><p>Ainda não há turmas vinculadas a este acesso.</p></div>';
 const chosen=available.some(c=>c.id===selectedResultsClass)?selectedResultsClass:
   (available.find(c=>byClass(c.id).length>0)||available[0]).id;
 selectedResultsClass=chosen;
 const klass=available.find(c=>c.id===chosen);
 const enrolled=authorized.filter(s=>s.classroom_id===chosen).length;
 const records=byClass(chosen);
 const n=records.length;
 const percent=enrolled?Math.round(n*100/enrolled):0;
 const hLabels=['Pré-silábica','Silábica sem valor','Silábica com valor','Silábico-alfabética','Alfabética'];
 const mathLabels=['Contagem e quantificação','Leitura e escrita de números','Sistema decimal','Adição e subtração','Grupos iguais e repartição','Sequências e regularidades','Tabelas e gráficos'];
 const mathValues={A:'Alcançou',P:'Parcialmente',N:'Não alcançou',NO:'Não observado'};
 const memories={T10:'Lê',T11:'Recita',T12:'Não lê'};
 const narratives={T20:'Lê com fluência',T21:'Lê sem fluência',T22:'Não lê'};
 const readValues={L1:'Reconhece letras',L2:'Lê letras isoladas',L3:'Lê sílabas simples',L4:'Lê sílabas complexas',L5:'Lê palavras',L6:'Lê frases simples',L7:'Lê frases complexas'};
 const options=available.map(c=>'<option value="'+clean(c.id)+'"'+(c.id===chosen?' selected':'')+'>'+clean(c.label)+' — '+byClass(c.id).length+' avaliação(ões)</option>').join('');
 const summary='<div class="kpi-grid">'+
   cardKpi(n,'Avaliações oficiais','Com conferência concluída')+
   cardKpi(enrolled,'Estudantes da turma','Matrículas ativas')+
   cardKpi(Math.max(0,enrolled-n),'Ainda sem avaliação oficial','Não significa ausência de aprendizagem')+
   cardKpi(percent+'%','Cobertura da avaliação','Amostra parcial até completar a turma')+'</div>';
 let body='<div class="notice info">Ainda não há resultados oficiais nesta turma. Selecione outra turma ou continue a leitura das fichas.</div>';
 if(n){
  const distribution=hLabels.map((label,i)=>{
    const count=records.filter(r=>r.answers.H==='H'+(i+1)).length;
    return '<tr><td>'+clean(label)+'</td><td>'+count+'</td></tr>';
  }).join('');
  const math=mathLabels.map((label,i)=>{
   const key='M'+(i+1);
   const count=mark=>records.filter(r=>r.answers[key]===key+'_'+mark).length;
   return '<tr><td><strong>'+clean(key)+'</strong> — '+clean(label)+'</td>'+
    '<td>'+count('A')+'</td><td>'+count('P')+'</td><td>'+count('N')+'</td><td>'+count('NO')+'</td></tr>';
  }).join('');
  const writeChart=learningBars(hLabels.map((lab,i)=>[lab,records.filter(r=>r.answers?.H==='H'+(i+1)).length]),n);
  const readingChart=learningBars(Object.entries(readValues).map(([key,label])=>
    [label,records.filter(r=>Array.isArray(r.answers?.L)&&r.answers.L.includes(key)).length]),n);
  const mathChart=learningMathChart(records,mathLabels);
  const students=records.slice().sort((a,b)=>studentById.get(a.student_id).display_name.localeCompare(studentById.get(b.student_id).display_name,'pt-BR'))
    .map(r=>{
      const student=studentById.get(r.student_id),a=r.answers;
      const h=hLabels[Number(String(a.H||'').replace('H',''))-1]||'A conferir';
      const reading=Array.isArray(a.L)?a.L.map(x=>readValues[x]).filter(Boolean).join('; '):'';
      const indicator=mathLabels.map((lab,i)=>{
       const k='M'+(i+1),mark=String(a[k]||'').slice(k.length+1);
       return '<tr><td>'+clean(k+' — '+lab)+'</td><td>'+clean(mathValues[mark]||'Não informado')+'</td></tr>';
      }).join('');
      return '<details style="border:1px solid #dce6de;border-radius:10px;padding:13px;margin:10px 0;background:#fff">'+
       '<summary style="cursor:pointer"><strong>'+clean(student.display_name)+'</strong> · '+clean(h)+'</summary>'+
       '<p class="intro-note" style="margin-top:10px">Registro oficial do ciclo de 2026, conforme a ficha conferida.</p>'+
       '<div class="tablewrap"><table><tbody>'+
       '<tr><th style="width:43%">Hipótese de escrita</th><td>'+clean(h)+'</td></tr>'+
       '<tr><th>Habilidades de leitura</th><td>'+clean(reading||'Nenhuma habilidade marcada')+'</td></tr>'+
       '<tr><th>Leitura de texto de memória</th><td>'+clean(memories[a.T1]||'A conferir')+'</td></tr>'+
       '<tr><th>Leitura de texto narrativo</th><td>'+clean(narratives[a.T2]||'A conferir')+'</td></tr>'+
       indicator+'</tbody></table></div></details>';
    }).join('');
  body='<div class="twocol"><article class="card"><h2>Hipóteses de escrita</h2>'+
   '<p>Quantidade de estudantes entre as '+n+' avaliações publicadas.</p>'+
   writeChart+'<hr class="chart-divider"/><div class="tablewrap"><table><thead><tr><th>Hipótese</th><th>Alunos</th></tr></thead><tbody>'+distribution+'</tbody></table></div></article>'+
   '<article class="card"><h2>Leitura dos resultados</h2>'+
   '<p>Estes dados mostram o que já foi registrado nas fichas da turma. Não substituem a análise das produções e observações da professora.</p>'+
   '<p><strong>'+n+' de '+enrolled+' estudantes</strong> possuem avaliações publicadas ('+percent+'%).</p>'+
   '<p>Para construir um panorama representativo da turma, ainda é necessário registrar os demais estudantes. Os que não possuem avaliação não devem ser classificados como “não alcançou”.</p></article></div>'+
   '<div class="card"><h2>Habilidades de leitura — gráfico</h2>'+
   '<p>Quantidade de estudantes que demonstraram cada habilidade nas fichas publicadas. Uma criança pode aparecer em várias habilidades.</p>'+
   readingChart+'</div>'+
   '<div class="card"><h2>Matemática — indicadores M1 a M7</h2><p>Quantidade de estudantes por situação, considerando somente as '+n+' avaliações publicadas.</p>'+
   mathChart+'<hr class="chart-divider"/><div class="tablewrap"><table><thead><tr><th>Indicador</th><th>Alcançou</th><th>Parcialmente</th><th>Não alcançou</th><th>Não observado</th></tr></thead><tbody>'+math+'</tbody></table></div></div>'+
   '<div class="card"><h2>Registros individuais da turma</h2><p>Abra um estudante para consultar os conhecimentos e habilidades registrados. Visível somente no acesso autorizado.</p>'+students+'</div>';
 }
 return '<div class="card"><h2>Painel de resultados por turma</h2>'+
  '<p><strong>Somente avaliações oficialmente publicadas.</strong> Os dados acompanham os lançamentos e são separados por turma.</p>'+
  '<label for="resultsClassFilter"><strong>Escolha a turma</strong></label>'+
  '<select id="resultsClassFilter" style="display:block;width:100%;max-width:430px;padding:11px;margin:10px 0 16px;border:1px solid #ceded6;border-radius:9px">'+options+'</select>'+
  '<p class="intro-note">Turma '+clean(klass.label)+'. Cobertura parcial: '+n+' de '+enrolled+' estudantes avaliados.</p>'+
  summary+'<div class="learning-chart"><p class="chart-subtitle">Cobertura da turma: '+n+' de '+enrolled+' estudantes com avaliação oficial.</p>'+
  '<div class="chart-track chart-coverage" role="img" aria-label="'+clean(percent+'% da turma avaliada')+'"><span class="chart-fill chart-fill--green" style="width:'+Math.max(0,Math.min(100,(enrolled?100*n/enrolled:0))).toFixed(2)+'%"></span></div>'+
  '<p class="chart-note">A parte ainda não preenchida corresponde a estudantes sem avaliação publicada, não a dificuldades de aprendizagem.</p></div></div>'+body;
}

function assessments(d){
 const packetClasses=d.classrooms.filter(c=>d.students.some(s=>s.classroom_id===c.id&&s.active&&/^SON-26-[A-F0-9]{12}$/.test(s.local_reference||'')))
   .slice().sort((a,b)=>a.label.localeCompare(b.label,'pt-BR',{numeric:true}));
 const initialPacketClass=packetClasses.find(c=>c.label==='3º B')||packetClasses[0];
 const packetOptions=packetClasses.map(c=>{
  const n=d.students.filter(s=>s.classroom_id===c.id&&s.active&&/^SON-26-[A-F0-9]{12}$/.test(s.local_reference||'')).length;
  return '<option value="'+clean(c.id)+'"'+(c.id===initialPacketClass?.id?' selected':'')+'>'+clean(c.label)+' — '+n+' estudantes</option>';
 }).join('');
 const alreadyPublished=new Set(d.results.map(r=>r.student_id));
 const packetStudentOptions=d.students.filter(s=>s.classroom_id===initialPacketClass?.id&&s.active&&/^SON-26-[A-F0-9]{12}$/.test(s.local_reference||'')&&!alreadyPublished.has(s.id))
  .sort((a,b)=>a.display_name.localeCompare(b.display_name,'pt-BR'))
  .map(s=>'<option value="'+clean(s.id)+'">'+clean(s.display_name)+'</option>').join('');
 const standardPrinting=mode==='live'&&role==='pedagogical_admin'?
  '<div class="card"><h2>Fichas de correção — modelo único OMR V2</h2>'+
  '<p><strong>A escola imprime e entrega prontas.</strong> A professora preenche completamente os quadradinhos, digitaliza pelo Drive e envia o PDF ao painel. Não precisa cadastrar novamente os estudantes.</p>'+
  '<label for="schoolPacketClassSelect"><strong>Turma</strong></label>'+
  '<select id="schoolPacketClassSelect" style="display:block;width:100%;max-width:360px;padding:11px;margin:10px 0 16px;border:1px solid #ceded6;border-radius:9px">'+packetOptions+'</select>'+
  '<label for="schoolPacketStudentSelect" style="display:block;margin-top:12px"><strong>Estudante — para impressão individual</strong></label>'+
  '<select id="schoolPacketStudentSelect" style="display:block;width:100%;max-width:420px;padding:11px;margin:10px 0 16px;border:1px solid #ceded6;border-radius:9px">'+
    (packetStudentOptions||'<option value="">Nenhum estudante disponível</option>')+'</select>'+
  '<div class="buttonrow"><button type="button" class="smallbtn solid" data-school-packet="individual" '+(packetClasses.length?'':'disabled')+'>Imprimir ficha individual do estudante</button>'+
  '<button type="button" class="smallbtn" data-school-packet="correction" '+(packetClasses.length?'':'disabled')+'>Imprimir todas as fichas de correção da turma</button>'+
  '<button type="button" class="smallbtn" data-school-packet="full" '+(packetClasses.length?'':'disabled')+'>Imprimir avaliação completa da turma</button></div>'+
  '<p class="intro-note"><strong>Modelo único OMR V2:</strong> nome, turma e QR individual já impressos. Pinte o quadradinho, digitalize em PDF ou foto e confira o resultado. Impressão A4, escala real (100%).</p>'+
  '<label style="display:flex;align-items:center;gap:8px;margin:14px 0"><input id="skipPublishedSchoolPacket" type="checkbox" checked> Excluir estudantes que já têm avaliação oficial</label>'+
  '</div>':'';
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
    const action=duplicate?'<span class="intro-note">Aguardar secretaria</span>':`<button class="smallbtn" type="button" data-verify-student="${clean(s.id)}" data-next-active="${s.active?'false':'true'}">${s.active?'Reabrir conferência':'Confirmar matrícula'}</button>`;
    return `<tr><td>${i+1}</td><td>${clean(s.display_name)}</td><td>${status}</td><td>${action}</td></tr>`;
   }).join('');
   studentSection=`<div class="card"><h2>Pré-cadastro de estudantes — 2026</h2>
    <p><strong>${pending} registro(s) pendentes</strong> e <strong>${verified} confirmado(s)</strong> na escola. Pendentes ficam visíveis somente à coordenação.</p>
    ${notice('Só confirme cada matrícula depois de conferir NOME E TURMA com a lista oficial ATUAL da secretaria. A confirmação permite a visualização pela professora autorizada da turma.','info')}
    ${selected.some(repeated)?notice('Há um nome repetido entre turmas nesta lista. Consulte a secretaria antes de confirmar o registro correspondente.','info'):''}
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
    ${printableCodes>0?`<div class="buttonrow"><button type="button" class="smallbtn" data-guide-class="${clean(selectedRosterClass)}">Roteiro da professora e gabarito</button></div>`:''}
    <p class="intro-note">As fichas de correção são entregues prontas pela escola. A professora preenche os quadradinhos e digitaliza a folha de correção; os resultados exigem conferência antes da publicação.</p></div>`;

 } else {
   const activeStudents=d.students.filter(s=>s.active);
   const rows=activeStudents.map(s=>`<tr><td>${clean(s.display_name)}</td><td>${clean(d.classrooms.find(c=>c.id===s.classroom_id)?.label||'')}</td><td>${d.results.filter(r=>r.student_id===s.id).length}</td></tr>`).join('');
   studentSection=`<div class="card"><h2>Estudantes autorizados</h2>${rows?`<div class="tablewrap"><table><thead><tr><th>Estudante</th><th>Turma</th><th>Avaliações oficiais</th></tr></thead><tbody>${rows}</tbody></table></div>`:'<div class="empty">Ainda não há estudantes validados e autorizados para este perfil.</div>'}</div>`;
 }
 return `${standardPrinting}${officialResultsDashboard(d)}<div class="card"><h2>Ciclos de avaliação</h2><p>Os instrumentos são vinculados à escola e ao ano letivo.</p><div class="tablewrap"><table><thead><tr><th>Avaliação</th><th>Situação</th><th>Tipo</th></tr></thead><tbody>${cycles||'<tr><td colspan="3">Nenhum ciclo visível.</td></tr>'}</tbody></table></div></div>
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
 <p><strong>Etapa atual:</strong> aplicação e digitalização das fichas, conferência pedagógica e publicação controlada. Os resultados oficiais aparecem no painel por turma acima.</p>
 <p class="intro-note">Fluxo atual: preencher a ficha → leitura local dos X → conferência da matrícula e dos registros → autorização da coordenação → visualização por turma. As fotografias originais não são armazenadas neste piloto.</p></div>
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



function updatePacketStudents(){
 const klassId=$('schoolPacketClassSelect')?.value;
 const select=$('schoolPacketStudentSelect');
 if(!select||!klassId||mode!=='live'||role!=='pedagogical_admin')return;
 const excludePublished=$('skipPublishedSchoolPacket')?.checked!==false;
 const published=new Set(loaded.results.map(r=>r.student_id));
 const students=loaded.students.filter(s=>s.classroom_id===klassId&&s.active&&
    /^SON-26-[A-F0-9]{12}$/.test(s.local_reference||'')&&
    (!excludePublished||!published.has(s.id))).sort((a,b)=>a.display_name.localeCompare(b.display_name,'pt-BR'));
 const oldId=select.value;
 select.replaceChildren();
 if(!students.length){
  const opt=document.createElement('option');opt.value='';opt.textContent='Nenhum estudante disponível';
  select.append(opt);return;
 }
 for(const s of students){
  const opt=document.createElement('option');opt.value=s.id;opt.textContent=s.display_name;
  select.append(opt);
 }
 if(students.some(s=>s.id===oldId))select.value=oldId;
}
function printSchoolReadyPacket(kind){
 if(mode!=='live'||role!=='pedagogical_admin'||!profile||!api)return;
 if(!['individual','correction','full'].includes(kind))return;
 const classId=$('schoolPacketClassSelect')?.value||'';
 const klass=loaded.classrooms.find(c=>c.id===classId);
 const students=loaded.students.filter(s=>s.classroom_id===classId&&s.active&&/^SON-26-[A-F0-9]{12}$/.test(s.local_reference||''));
 if(!klass||!students.length){window.alert('Selecione uma turma com estudantes confirmados.');return;}
 try{
  if(!window.LuminaFichas?.printSchoolPacket)throw new Error('Atualize a página para carregar o modelo OMR V2.');
  const published=new Set(loaded.results.map(r=>r.student_id));
  const onlyPending=$('skipPublishedSchoolPacket')?.checked!==false;
  const eligible=onlyPending?students.filter(s=>!published.has(s.id)):students;
  if(!eligible.length){window.alert('Nenhum estudante elegível nesta turma. Desmarque o filtro para reimprimir.');return;}
  let chosen=eligible;
  if(kind==='individual'){
   const studentId=$('schoolPacketStudentSelect')?.value||'';
   const student=eligible.find(s=>s.id===studentId);
   if(!student){window.alert('Selecione o estudante correto para imprimir a ficha individual.');return;}
   chosen=[student];
  }
  const pages=chosen.length*(kind==='full'?3:1);
  if(kind!=='individual'){
   const label=kind==='full'?'avaliação completa':'fichas de correção';
   if(!window.confirm('Preparar '+pages+' página(s) A4 de '+label+' para '+chosen.length+
    ' estudantes do '+klass.label+'? Faça a conferência dos resultados digitalizados antes de publicar os dados.'))return;
  }
  const result=window.LuminaFichas.printSchoolPacket(chosen,klass,kind==='full'?'full':'correction');
  if(Number(result.students)!==chosen.length||Number(result.pages)!==pages)
    throw new Error('O total de folhas geradas não coincidiu com a turma.');
 }catch(error){
  window.alert('Não foi possível preparar as fichas: '+String(error?.message||'erro de impressão'));
 }
}

function formatImportedRow(row,view){
 const student=view.students.find(s=>s.id===row.student_id);
 if(!student||!student.active||student.local_reference!==row.qr_code)return '';
 const klass=view.classrooms.find(c=>c.id===student.classroom_id);
 const answer=row.answers&&typeof row.answers==='object'?row.answers:{};
 const H={H1:'Pré-silábica',H2:'Silábica sem valor',H3:'Silábica com valor',H4:'Silábico-alfabética',H5:'Alfabética'};
 const L={L1:'Reconhece letras',L2:'Lê letras isoladas',L3:'Lê sílabas simples',L4:'Lê sílabas complexas',L5:'Lê palavras',L6:'Lê frases simples',L7:'Lê frases complexas'};
 const T1={T10:'Lê o texto de memória',T11:'Recita o texto de memória',T12:'Não lê o texto de memória'};
 const T2={T20:'Leitura fluente',T21:'Leitura sem fluência',T22:'Não lê o texto narrativo'};
 const math=['Contagem e quantificação','Leitura e escrita de números','Sistema decimal','Adição e subtração','Grupos iguais e repartição','Sequências e regularidades','Tabelas e gráficos'];
 const results={A:'Alcançou',P:'Parcialmente',N:'Não alcançou',NO:'Não observado'};
 const line=(label,value)=>'<tr><th style="width:45%">'+clean(label)+'</th><td>'+clean(value||'Sem marcação — verificar')+'</td></tr>';
 const reading=Array.isArray(answer.L)?answer.L.map(key=>L[key]||'').filter(Boolean).join('; '):'';
 const language=line('Hipótese de escrita',H[answer.H])+line('Habilidades de leitura',reading)+
  line('Texto de memória',T1[answer.T1])+line('Texto narrativo',T2[answer.T2]);
 const mathematics=math.map((label,i)=>{
  const key='M'+(i+1),value=String(answer[key]||'');
  const mark=value.startsWith(key+'_')?value.slice(key.length+1):'';
  return line(key+' — '+label,results[mark]);
 }).join('');
 const published=row.validation_status==='committed';
 const ready=row.validation_status==='ready_for_commit';
 const button=!ready&&row.validation_status==='awaiting_pedagogical_review'?
  '<button type="button" class="smallbtn solid" data-review-ready="'+clean(row.id)+'">Concluir conferência desta ficha (não publica)</button>':'';
 const status=published?'Publicado oficialmente':ready?'Conferência concluída · ainda não publicada':'Aguardando conferência pedagógica';
 return '<details style="border:1px solid #dce6de;border-radius:10px;padding:13px;margin:12px 0;background:white">'+
  '<summary style="cursor:pointer"><strong>'+clean(student.display_name)+'</strong> · '+clean(klass?.label||'Turma')+' · '+clean(status)+'</summary>'+
  '<p class="intro-note" style="margin-top:12px"><strong>Código da ficha:</strong> '+clean(row.qr_code)+
  '. Compare estes dados com a ficha original; a fotografia não foi armazenada no painel.</p>'+
  '<h3 style="font-size:14px">Língua Portuguesa</h3>'+
  '<div class="tablewrap"><table><tbody>'+language+'</tbody></table></div>'+
  '<h3 style="font-size:14px;margin-top:18px">Matemática</h3>'+
  '<div class="tablewrap"><table><tbody>'+mathematics+'</tbody></table></div>'+
  (published?'<p class="intro-note"><strong>Publicado oficialmente.</strong> O registro integra os resultados da turma.</p>':
   ready?'<p class="intro-note"><strong>Conferência registrada.</strong> A publicação oficial só ocorre por autorização da coordenação.</p>':
  '<p class="intro-note">Só conclua a conferência se nome, turma, QR e todas as marcações corresponderem à ficha original.</p>')+
  '<div class="buttonrow">'+button+'</div></details>';
}
function importedReviewPanel(view){
 if(mode!=='live'||role!=='pedagogical_admin')return '';
 const items=view.importRows.filter(r=>['awaiting_pedagogical_review','ready_for_commit','committed'].includes(r.validation_status));
 const linked=items.filter(r=>view.students.some(s=>s.id===r.student_id&&s.active&&s.local_reference===r.qr_code));
 const missing=view.importRows.filter(r=>!r.student_id).length;
 const grouped=view.batches.map(b=>{
  const rows=linked.filter(r=>r.batch_id===b.id);
  if(!rows.length)return '';
  const klass=view.classrooms.find(c=>c.id===b.classroom_id);
  const complete=b.status==='review'&&rows.length===Number(b.expected_rows)&&rows.length>0&&
    rows.every(r=>r.validation_status==='ready_for_commit');
  const publication=complete?
    '<div class="notice info"><strong>Todas as '+rows.length+' fichas estão conferidas.</strong> A publicação oficial é opcional e exige autorização da coordenação. Após publicar, os resultados entram nos indicadores oficiais.</div>'+
    '<div class="buttonrow"><button type="button" class="smallbtn solid" data-publish-reviewed-batch="'+clean(b.id)+'">Publicar oficialmente '+rows.length+' ficha(s) de '+clean(klass?.label||'turma')+'</button></div>':
    b.status==='completed'?'<p class="intro-note"><strong>Lote publicado oficialmente.</strong> As avaliações estão no painel de resultados.</p>':'';
  return '<h3 style="margin-top:20px">'+clean(klass?.label||'Turma')+' — '+rows.length+' ficha(s)</h3>'+
   rows.map(r=>formatImportedRow(r,view)).join('')+publication;
 }).join('');
 return '<div class="card"><h2>Conferência pedagógica — fichas armazenadas</h2>'+
  '<p>Acesse cada estudante, confira o que o leitor registrou e, somente depois de comparar com a ficha original, conclua a conferência. <strong>Nada será publicado automaticamente.</strong></p>'+
  (pedagogicalReviewMessage?notice(clean(pedagogicalReviewMessage),'info'):'')+
  (grouped||'<p class="intro-note">Nenhuma ficha com matrícula vinculada aguardando revisão.</p>')+
  (missing?notice('<strong>'+missing+' ficha(s) de lote anterior</strong> ainda sem vínculo de matrícula. Não podem ser validadas nesta etapa.','info'):'')+
  '</div>';
}

async function publishReviewedBatch(id,button){
 if(mode!=='live'||role!=='pedagogical_admin'||!profile||!api)return;
 const batch=loaded.batches.find(b=>b.id===id&&b.status==='review');
 const entries=loaded.importRows.filter(r=>r.batch_id===id);
 if(!batch||!entries.length||entries.length!==Number(batch.expected_rows)||
    entries.some(r=>r.validation_status!=='ready_for_commit'))return;
 const klass=loaded.classrooms.find(c=>c.id===batch.classroom_id);
 const message='PUBLICAÇÃO OFICIAL: você revisou as '+entries.length+' fichas da turma '+
  (klass?.label||'selecionada')+' e autoriza que seus resultados passem a integrar os indicadores da escola? '+
  'Esta ação não altera as marcações pedagógicas e não deve ser feita com dados de teste.';
 if(!window.confirm(message))return;
 const owner=profile.user_id;
 button.disabled=true;button.textContent='Publicando com segurança...';
 try{
  const {data:auth,error:authError}=await api.auth.getUser();
  if(authError||auth?.user?.id!==owner)throw new Error('A sessão institucional precisa ser renovada.');
  const {data,error}=await api.rpc('lumina_publish_reviewed_batch',{p_batch_id:id});
  if(error)throw new Error(error.message||'O banco recusou a publicação.');
  if(!data||data.status!=='completed'||Number(data.published)!==entries.length)
   throw new Error('O banco não confirmou a publicação integral. Atualize e confira antes de repetir.');
  if(mode!=='live'||profile?.user_id!==owner)return;
  pedagogicalReviewMessage='Publicação confirmada: '+data.published+' ficha(s) de '+(klass?.label||'turma')+
   ' incluídas nos resultados oficiais.';
  await refreshLive();
 }catch(err){
  if(mode==='live'&&profile?.user_id===owner){
   pedagogicalReviewMessage='Não foi possível publicar o lote: '+(err?.message||'erro não identificado')+
     '. Confira o estado do lote antes de tentar novamente.';
   button.disabled=false;button.textContent='Tentar publicação oficial';
   const panel=$('pedagogicalReviewFeedback');
   if(panel)panel.textContent=pedagogicalReviewMessage;
   else window.alert(pedagogicalReviewMessage);
  }
 }
}
async function confirmImportedReview(id,button){
 if(mode!=='live'||role!=='pedagogical_admin'||!profile||!api)return;
 const row=loaded.importRows.find(r=>r.id===id);
 if(!row||row.validation_status!=='awaiting_pedagogical_review')return;
 const student=loaded.students.find(s=>s.id===row.student_id&&s.active&&s.local_reference===row.qr_code);
 if(!student)return;
 if(!window.confirm('Você comparou a ficha ORIGINAL de '+student.display_name+' com os resultados exibidos, incluindo todos os X? Esta ação registra apenas a CONFERÊNCIA PEDAGÓGICA, sem publicar resultados.'))return;
 button.disabled=true;button.textContent='Registrando conferência...';
 const previousUser=profile.user_id;
 try{
  const {data:auth,error:authError}=await api.auth.getUser();
  if(authError||auth?.user?.id!==previousUser)throw new Error('A sessão institucional precisa ser renovada.');
  const {data,error}=await api.from('assessment_import_rows')
   .update({validation_status:'ready_for_commit',validation_note:'Conferência pedagógica concluída pela coordenação. Aguardando etapa de publicação oficial.'})
   .eq('id',id).eq('validation_status','awaiting_pedagogical_review')
   .select('id,validation_status');
  if(error)throw new Error(error.message||'O banco recusou a conferência.');
  if(!Array.isArray(data)||data.length!==1||data[0].validation_status!=='ready_for_commit')
   throw new Error('O banco não confirmou a atualização. Atualize a página antes de tentar novamente.');
  if(mode!=='live'||profile?.user_id!==previousUser)return;
  pedagogicalReviewMessage='Conferência de '+student.display_name+' registrada, sem publicação de resultados.';
  await refreshLive();
 }catch(err){
  if(mode==='live'&&profile?.user_id===previousUser){
   pedagogicalReviewMessage='Não foi possível concluir a conferência: '+(err?.message||'erro não identificado');
   const area=$('pedagogicalReviewFeedback');if(area)area.textContent=pedagogicalReviewMessage;
   else {button.disabled=false;button.textContent='Concluir conferência desta ficha (não publica)';}
  }
 }
}

function batches(d){
 // O envio deve ser a primeira ação na aba de leitura, sem botão escondido.
 const readerUrl='leitor-v5.html?v=20261111-resumo-conferencia-v21';
 const reader=mode==='live'&&['pedagogical_admin','teacher'].includes(role)?
  '<div class="card" id="readerTop"><h2>1. Enviar ficha preenchida</h2>'+
  '<div id="stageSavedBanner" class="notice info" role="status">'+
    (pilotStageMessage?clean(pilotStageMessage):
      transferDraft?.ownerId===profile?.user_id?
       '<strong>Resultado ainda não salvo:</strong> confira a mensagem da área protegida abaixo e tente gravar novamente.':
       'O leitor começa do zero quando você troca de página. <strong>Os lotes salvos no banco permanecem registrados</strong> e podem ser consultados no histórico.')+
  '</div>'+
  '<p>Selecione o PDF digitalizado no Drive ou uma fotografia JPG/PNG. O leitor identifica o QR Code e os quadradinhos pintados.</p>'+
  '<iframe id="pilotReaderIframe" title="Envio e leitura de fichas OMR V2" src="'+readerUrl+'" loading="eager" style="width:100%;height:1100px;border:1px solid #d6e5d9;border-radius:10px;background:white" referrerpolicy="same-origin"></iframe>'+
  '<p class="intro-note">Se precisar de mais espaço, <a href="'+readerUrl+'" target="_blank" rel="noopener noreferrer">abra o leitor em uma nova aba</a>. A leitura da ficha não publica dados automaticamente.</p></div>':
  '<div class="card"><h2>Leitura de fichas</h2><p>O envio institucional está disponível somente para a coordenação autorizada.</p></div>';
 if(mode!=='live'||!['pedagogical_admin','teacher'].includes(role))return reader;
 if(role==='teacher'){
  const ownBatches=(d.batches||[]).slice().reverse();
  const rows=ownBatches.map(b=>
    '<tr><td>'+clean((d.classrooms||[]).find(c=>c.id===b.classroom_id)?.label||'Turma')+
    '</td><td>'+clean(b.expected_rows||0)+'</td><td>'+chip(b.status)+'</td></tr>').join('');
  return reader+
   '<div class="card"><h2>2. Confirmação do envio</h2>'+
   '<p>Depois de conferir a leitura, clique em <strong>Consolidar fichas válidas</strong> e em <strong>Enviar e salvar lote para conferência</strong>. Aguarde a mensagem <strong>LOTE SALVO</strong>. A coordenação fará a conferência pedagógica e autorizará a publicação.</p>'+
   '<div id="csvReport" class="report" role="status">Aguardando envio da ficha.</div></div>'+
   '<div class="card"><h2>Meus lotes recebidos</h2>'+
   '<div class="tablewrap"><table><thead><tr><th>Turma</th><th>Fichas</th><th>Situação</th></tr></thead><tbody>'+
    (rows||'<tr><td colspan="3">Nenhum lote enviado.</td></tr>')+'</tbody></table></div></div>';
 }
 let extras='';
 try{
  const batchList=(d.batches||[]).map(b=>
   '<tr><td>'+clean(b.source_filename||'Lote de leitura')+'</td><td>'+
   clean((d.classrooms||[]).find(c=>c.id===b.classroom_id)?.label||'—')+'</td><td>'+
   clean(b.expected_rows??'—')+'</td><td>'+chip(b.status)+'</td></tr>').join('');
  extras=
   '<div class="card"><h2>2. Conferir vínculo com a matrícula</h2>'+
   '<p>Confira as marcações, clique em <strong>Consolidar fichas válidas</strong> e depois <strong>Enviar e salvar lote para conferência</strong>. Aguarde a mensagem <strong>LOTE SALVO</strong> antes de mudar de página. Nada será publicado oficialmente.</p>'+
   '<input id="csvReview" class="filecontrol" type="file" accept=".csv,text/csv" aria-label="Importar CSV de conferência, somente se necessário">'+
   '<div id="csvReport" class="report" role="status">Aguardando leitura e conferência da ficha.</div></div>'+
   importedReviewPanel(d)+
   '<details class="card"><summary><strong>Histórico de lotes da escola</strong></summary>'+
   '<div class="tablewrap"><table><thead><tr><th>Arquivo</th><th>Turma</th><th>Fichas</th><th>Situação</th></tr></thead><tbody>'+
   (batchList||'<tr><td colspan="4">Nenhum lote cadastrado.</td></tr>')+'</tbody></table></div>'+
   '<p class="intro-note">As avaliações anteriores permanecem preservadas e não são alteradas pelo novo modelo OMR V2.</p></details>';
 }catch(error){
  console.error('A conferência de registros não pôde ser apresentada:',error);
  extras='<div class="card"><h2>Conferência de dados</h2>'+
   '<p>A leitura continua disponível acima. O histórico não foi carregado; nenhuma ficha foi alterada. Atualize a página antes de publicar resultados.</p>'+
   '<div id="csvReport" class="report" role="status">Conferência institucional indisponível.</div></div>';
 }
 return reader+extras;
}

function team(d){
 if(role==='teacher') return `<div class="card"><h2>Minha área de trabalho</h2><p>Para enviar as fichas da sua turma, abra <strong>Leitura de fichas</strong>. Digitalize em PDF ou fotografe, confira as respostas e aguarde a mensagem <strong>LOTE SALVO</strong>.</p>${notice('A coordenação mantém a conferência pedagógica e a autorização de publicação. Se sua turma não aparecer, solicite a conferência do vínculo.','info')}</div>`;
 if(role==='director')return `<div class="card"><h2>Visão institucional</h2><p>A direção acompanha informações coletivas. A atribuição de turmas e o lançamento de resultados dependem da coordenação.</p>${notice('Os dados individuais das crianças não estão disponíveis neste perfil.','info')}</div>`;
 const rows=d.staff.map(s=>{const turmas=(d.staffLinks||[]).filter(x=>x.staff_id===s.id).map(x=>d.classrooms.find(c=>c.id===x.classroom_id)?.label).filter(Boolean).sort((a,b)=>a.localeCompare(b,'pt-BR')).join(', ')||'A definir';return `<tr><td>${clean(s.full_name)}<div class="intro-note">Turmas: ${clean(turmas)}</div></td><td>${clean(plannedName[s.planned_role]||s.planned_role)}</td><td>${s.email?clean(s.email):'<span class="chip warn">Pendente</span>'}</td><td>${chip(s.status)}</td></tr>`;}).join('');
 return `<div class="card"><h2>Pré-cadastro de profissionais</h2><p>A equipe está em conferência. Os nomes e e-mails exibidos dependem da versão aprovada pela escola.</p><div class="tablewrap"><table><thead><tr><th>Profissional</th><th>Função</th><th>E-mail</th><th>Acesso</th></tr></thead><tbody>${rows||'<tr><td colspan="4">O cadastro da equipe ainda não foi liberado.</td></tr>'}</tbody></table></div></div>${notice('<strong>Priscila já tem acesso ativo.</strong> As oito professoras estão vinculadas às suas turmas. Cinco possuem e-mail cadastrado e podem usar o botão "Receber link de acesso por e-mail". Faltam os e-mails de Ana Rita, Joselita e Roseli. A conta docente é ativada quando a própria professora confirma seu e-mail e entra no painel.','info')}`;
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
function reviewCSV(file,options={}){
 const area=$('csvReport');pilotCandidate=null;
 if(!area||!file){
  if(options.autoStage)notifyPilotTransfer(options.replyTo,{saved:false,reason:'Arquivo não recebido pela conferência'});
  return;
 }
 if(file.size>2_000_000){
  area.textContent='Arquivo muito grande. Separe o lote em arquivos CSV menores. NÃO SALVO.';
  if(options.autoStage)notifyPilotTransfer(options.replyTo,{saved:false,reason:'Arquivo muito grande'});
  return;
 }
 const startedMode=mode,startedUser=profile?.user_id;
 area.textContent='Conferindo o CSV no navegador...';
 const reader=new FileReader();
 reader.onload=()=>{
   if(mode!==startedMode||profile?.user_id!==startedUser){
     if(options.autoStage)notifyPilotTransfer(options.replyTo,{saved:false,reason:'Sessão institucional alterada'});
     return;
   } // Evita expor conferência de sessão anterior.
   const liveAuthorized=mode==='live'&&['pedagogical_admin','teacher'].includes(role)&&!!profile;
   const students=liveAuthorized?loaded.students:[];
   if(liveAuthorized&&(!students.length||!loaded.classrooms.length)){
     area.textContent='Não foi possível conferir o cadastro protegido. O lote NÃO FOI SALVO. Clique em Atualizar e tente novamente.';
     if(options.autoStage)notifyPilotTransfer(options.replyTo,{saved:false,reason:'Cadastro institucional não disponível'});
     return;
   }
   try{
     const outcome=checkReaderCSV(String(reader.result||''),students,liveAuthorized?loaded.classrooms:[],liveAuthorized);
     const {tallies,rows}=outcome;
     area.replaceChildren();
     const heading=document.createElement('p');heading.style.fontWeight='700';
     heading.textContent=liveAuthorized?'Conferência QR × matrícula (acesso autorizado)':'Conferência do formato do CSV (demonstração/sem vínculo)';
     area.appendChild(heading);
     const stats=document.createElement('p');
     stats.textContent='Fichas examinadas: '+tallies.total+' | '+(liveAuthorized?'Correspondências válidas: ':'Formato válido: ')+tallies.ready+' | Para revisar: '+tallies.review+' | Códigos repetidos: '+tallies.repeated;
     area.appendChild(stats);
     if(liveAuthorized){
       const banner=document.createElement('p');
       banner.textContent='O cruzamento usa as matrículas autorizadas do banco. O lote só é considerado salvo após confirmação de gravação. Nenhuma avaliação é publicada automaticamente. “Apta” significa apenas que QR e campos técnicos foram encontrados: a professora ainda deve validar o conteúdo pedagógico.';
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
         for(const value of [item.code||'—',liveAuthorized?item.classroom:'—',liveAuthorized?item.name:'—',item.status]){
           const cell=document.createElement('td');cell.textContent=value;row.appendChild(cell);
         }
         body.appendChild(row);
       }
       table.appendChild(body);wrap.appendChild(table);area.appendChild(wrap);
       if(subset.length>shown.length){const note=document.createElement('p');note.textContent='Exibindo as primeiras '+shown.length+' pendências. Divida o lote e reconfira as demais.';area.appendChild(note);}
     }
     const footer=document.createElement('p');footer.textContent='Esta conferência inicial é local. O registro provisório não substitui a validação pedagógica nem armazena as fotografias originais.';area.appendChild(footer);
     if(liveAuthorized){
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
         const note=document.createElement('p');
         note.textContent=options.autoStage?'Conferência concluída. Salvando lote na área protegida da coordenação. Aguarde a confirmação de gravação antes de sair. Nenhuma avaliação oficial será publicada.':
          'Ainda não foi salvo: clique em Guardar este lote piloto. Somente as respostas provisórias serão armazenadas; nenhuma foto ou avaliação oficial será publicada.';
         area.appendChild(note);
         if(options.autoStage){
           save.disabled=true;save.textContent='Salvando lote provisório na área protegida...';
           void stagePilotCSV(save,area,{skipConfirmation:true,replyTo:options.replyTo});
         }
       }else if(tallies.total>0){
         const why=[];
         if(!activeCycle)why.push('ciclo de 2026 indisponível');
         if(tallies.total>10)why.push('piloto limitado a 10 fichas');
         if(tallies.review)why.push('fichas com pendências');
         if(classes.size>1)why.push('mistura de turmas');
         if(conflict)why.push('matrícula com registro provisório anterior');
         const reason=why.join('; ')||'lote não elegível';
         const msg=document.createElement('p');
         msg.textContent='O lote NÃO FOI SALVO: '+reason+'. Corrija a pendência antes de sair desta tela.';area.appendChild(msg);
         if(options.autoStage)notifyPilotTransfer(options.replyTo,{saved:false,reason});
       }
     }
   }catch(err){
     area.textContent=err?.message||'Não foi possível interpretar o CSV.';
     if(options.autoStage)notifyPilotTransfer(options.replyTo,{saved:false,reason:err?.message||'falha na conferência'});
   }
 };
 reader.onerror=()=>{
   area.textContent='Não foi possível ler o arquivo local. O lote não foi salvo.';
   if(options.autoStage)notifyPilotTransfer(options.replyTo,{saved:false,reason:'Arquivo não pôde ser lido'});
 };
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
function notifyPilotTransfer(target,payload){
 try{
  if(target&&window.location.origin)
   target.postMessage({type:'lumina:stage-status:v1',...payload},window.location.origin);
 }catch(error){console.warn('A janela do leitor já foi fechada.',error?.message);}
}
async function stagePilotCSV(button,area,options={}){
 if(mode!=='live'||!['pedagogical_admin','teacher'].includes(role)||!profile||!api||!pilotCandidate)return;
 const candidate=pilotCandidate;
 if(candidate.ownerId!==profile.user_id)return;
 if(!options.skipConfirmation&&!window.confirm('Salvar este lote em área protegida para conferência pedagógica? Nenhum resultado oficial será publicado e nenhuma foto será enviada.'))return;
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
  const written=Number(result.data?.rows_staged||0);
  if(written!==rows.length)throw new Error('O banco não confirmou a gravação integral do lote.');
  pilotCandidate=null;
  transferDraft=null;
  notifyPilotTransfer(options.replyTo,{saved:true,count:written});
  pilotStageMessage='Lote piloto SALVO em área protegida: '+written+' ficha(s) em conferência pedagógica. Pode mudar de página; nenhum resultado oficial foi publicado.';
  const savedBanner=$('stageSavedBanner');
  if(savedBanner)savedBanner.textContent=pilotStageMessage;
  area.replaceChildren();
  const success=document.createElement('p');
  success.textContent='Lote piloto guardado na área protegida. Fichas recebidas: '+Number(result.data?.rows_staged||0)+'. Situação: EM CONFERÊNCIA PEDAGÓGICA. Nenhum resultado oficial foi publicado.';
  area.appendChild(success);
  const hint=document.createElement('p');
  hint.textContent='Pode mudar de página: os resultados provisórios ficaram armazenados no banco. As fotografias originais não foram armazenadas. Preserve-as em local institucional protegido.';
  area.appendChild(hint);
  await refreshLive({skipRender:true});
 }catch(error){
  if(mode==='live'&&profile?.user_id===candidate.ownerId){
   const warning=document.createElement('p');
   warning.textContent='Não foi possível registrar o lote: '+(error?.message||'falha não identificada')+'. Nenhuma avaliação oficial foi alterada.';
   area.appendChild(warning);
  }
  button.disabled=false;button.textContent='Tentar salvar lote provisório';
  notifyPilotTransfer(options.replyTo,{saved:false,reason:error?.message||'erro ao salvar no banco'});
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
 if(event.origin!==window.location.origin||mode!=='live'||!['pedagogical_admin','teacher'].includes(role)||currentPage!=='lotes')return;
 const frame=$('pilotReaderIframe');
 if(!frame||event.source!==frame.contentWindow||event.data?.type!=='lumina:reader-pilot:v1')return;
 try{
  const csv=readerRowsToCSV(event.data.rows);
  transferDraft={csv,ownerId:profile.user_id};
  reviewCSV(new File([csv],'lote_piloto_validacao.csv',{type:'text/csv'}),{autoStage:true,replyTo:event.source});
  const area=$('csvReport');if(area)area.scrollIntoView({behavior:'smooth',block:'start'});
 }catch(err){
   const area=$('csvReport');
   if(area)area.textContent='O lote NÃO FOI SALVO: '+(err?.message||'erro de validação');
   notifyPilotTransfer(event.source,{saved:false,reason:err?.message||'falha de validação'});
 }
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
 let {data:p,error:pErr}=await api.from('staff_profiles').select('user_id,school_id,display_name,role,active').eq('user_id',user.id).eq('active',true).maybeSingle();
 if(pErr)throw new Error('Não foi possível conferir as permissões do usuário.');
 // Primeiro acesso por link: a professora confirma seu próprio e-mail e o
 // banco vincula automaticamente apenas as turmas previamente cadastradas.
 if(!p){
  const {error:activationError}=await api.rpc('lumina_activate_registered_teacher');
  if(activationError){
   await api.auth.signOut();
   throw new Error('Não foi possível liberar seu acesso. Confira se informou o e-mail cadastrado na escola ou procure a coordenação.');
  }
  const {data:activatedProfile,error:profileError}=await api.from('staff_profiles')
    .select('user_id,school_id,display_name,role,active')
    .eq('user_id',user.id).eq('active',true).maybeSingle();
  if(profileError||!activatedProfile)throw new Error('O acesso foi confirmado, mas não foi possível carregar suas turmas. Atualize a página.');
  p=activatedProfile;
 }
 if(!['teacher','pedagogical_admin','director'].includes(p.role)){
  await api.auth.signOut();throw new Error('Sua conta ainda não foi liberada pela coordenação. Nenhum dado escolar foi exibido.');
 }
 profile=p;role=p.role;mode='live';currentPage=p.role==='teacher'?'lotes':'visao';pilotCandidate=null;transferDraft=null;pilotStageMessage='';
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
async function refreshLive(options={}){
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
   ['pedagogical_admin','teacher'].includes(profile.role)?get('import_batches','id,classroom_id,expected_rows,status,source_filename'):Promise.resolve([]),
   ['pedagogical_admin','teacher'].includes(profile.role)?get('assessment_import_rows','id,batch_id,validation_status,student_id,qr_code,answers,validation_note','none'):Promise.resolve([])
 ]);
 if(mode!=='live'||profile?.user_id!==currentUser)return;
 const [classrooms,cycles,students,official,staff,staffLinks,batches,importRows]=results;
 loaded={classrooms,cycles,students,results:official,staff,staffLinks,batches,importRows};
 if(options.skipRender!==true)render();
}
function enterDemo(){pilotCandidate=null;pilotStageMessage='';mode='demo';role=$('demoRole').value;profile=null;currentPage='visao';$('loginView').classList.add('hidden');$('appView').classList.remove('hidden');$('btnLogout').classList.remove('hidden');render();}
function exitDemo(){pilotCandidate=null;transferDraft=null;pilotStageMessage='';loaded={classrooms:[],students:[],results:[],cycles:[],staff:[],staffLinks:[],batches:[],importRows:[]};mode='guest';profile=null;currentPage='visao';$('appView').classList.add('hidden');$('loginView').classList.remove('hidden');$('btnLogout').classList.add('hidden');$('loginMessage').textContent='';showAuthPanel('login');}
// A pessoa convidada configura sua própria senha após a confirmação do Supabase.
const invitationFlow = new URLSearchParams(window.location.hash.replace(/^#/, '')).get('type');
const authReturnError = (() => {const q=new URLSearchParams(window.location.hash.replace(/^#/,''));return q.get('error_description')||q.get('error_code')||'';})();
let changingPassword = invitationFlow === 'invite' || invitationFlow === 'recovery';
function showAuthPanel(section){
  $('teacherAccessPanel').classList.toggle('hidden',section!=='login');
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
 document.addEventListener('change',e=>{
 if(e.target?.id==='schoolPacketClassSelect'||e.target?.id==='skipPublishedSchoolPacket')
  updatePacketStudents();
});
 $('teacherMagicForm').addEventListener('submit',async e=>{
  e.preventDefault();
  const button=$('btnTeacherMagic'),msg=$('teacherMagicMessage');
  button.disabled=true;msg.textContent='Solicitando link de acesso...';
  try{
    if(!api)throw new Error('Conexão indisponível. Tente novamente.');
    const email=$('teacherMagicEmail').value.trim().toLowerCase();
    if(!email||!email.includes('@'))throw new Error('Digite seu e-mail corretamente.');
    const {error}=await api.auth.signInWithOtp({
      email,
      options:{
        emailRedirectTo:new URL('./',window.location.href).href,
        shouldCreateUser:true
      }
    });
    if(error)throw error;
    msg.textContent='Link solicitado. Abra o e-mail recebido e toque em Entrar. No celular, use Abrir no Chrome se o Gmail abrir numa janela interna. O link pode ser usado uma vez.';
  }catch(error){
    console.warn('Não foi possível solicitar o link docente',error?.message);
    msg.textContent='Não foi possível enviar o link agora. Confira o e-mail e tente novamente mais tarde. Se continuar, avise a coordenação.';
  }finally{button.disabled=false;}
 });
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
 document.querySelectorAll('.nav-btn').forEach(btn=>btn.addEventListener('click',()=>{currentPage=btn.dataset.page;render();window.scrollTo({top:0,behavior:'instant'});}));
 $('content').addEventListener('click',e=>{const publish=e.target.closest('[data-publish-reviewed-batch]');if(publish){void publishReviewedBatch(publish.dataset.publishReviewedBatch,publish);return;}const approval=e.target.closest('[data-review-ready]');if(approval){void confirmImportedReview(approval.dataset.reviewReady,approval);return;}const testX=e.target.closest('[data-test-x]');if(testX){try{window.LuminaFichas.printTestSheet();}catch(err){window.alert(err.message||'Não foi possível abrir o teste.');}return;}const guide=e.target.closest('[data-guide-class]');if(guide&&mode==='live'&&role==='pedagogical_admin'){const klass=loaded.classrooms.find(c=>c.id===guide.dataset.guideClass);if(klass){try{window.LuminaFichas.printGuide(Number(klass.label[0]));}catch(err){rosterReviewMessage='Não foi possível gerar o roteiro. Atualize a página.';render();}}return;}const schoolPacket=e.target.closest('[data-school-packet]');if(schoolPacket){printSchoolReadyPacket(schoolPacket.dataset.schoolPacket);return;}const classroomReview=e.target.closest('[data-verify-class]');if(classroomReview){void verifyRosterClass(classroomReview.dataset.verifyClass,classroomReview);return;}const review=e.target.closest('[data-verify-student]');if(review){void updateStudentReview(review.dataset.verifyStudent,review.dataset.nextActive==='true',review);return;}const btn=e.target.closest('[data-jump]');if(btn){currentPage=btn.dataset.jump;render();window.scrollTo({top:0,behavior:'instant'});}});
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
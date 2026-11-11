/* Instrumentos aprovados pela escola. Arquivo público sem nomes, matrículas ou chaves privadas. */
(function(){
"use strict";
const SCHOOL="ESCOLA MUNICIPAL SÔNIA MARIA PEREIRA DO NASCIMENTO";
const poems=["BATATINHA QUANDO NASCE","ESPALHA A RAMA PELO CHÃO.","MENININHA QUANDO DORME","PÕE A MÃO NO CORAÇÃO."];
const lp={
 1:{story:["A LEBRE CORRIA MUITO.","A TARTARUGA ANDAVA DEVAGAR.","ELAS FIZERAM UMA CORRIDA.","A LEBRE PAROU PARA DESCANSAR.","A TARTARUGA CONTINUOU E CHEGOU PRIMEIRO."],q:["QUEM CORRIA MUITO?","QUEM CHEGOU PRIMEIRO?"]},
 2:{story:["A LEBRE ERA MUITO RÁPIDA E GOSTAVA DE SE GABAR. A TARTARUGA A CONVIDOU PARA UMA CORRIDA.","A LEBRE SAIU NA FRENTE, MAS RESOLVEU DORMIR. A TARTARUGA SEGUIU SEM PARAR. QUANDO A LEBRE ACORDOU, VIU QUE A TARTARUGA HAVIA VENCIDO."],q:["POR QUE A LEBRE NÃO VENCEU?","O QUE A TARTARUGA FEZ DURANTE A CORRIDA?"]},
 3:{story:["A LEBRE ZOMBAVA DA TARTARUGA PORQUE ELA ANDAVA LENTAMENTE. CANSADA DAS BRINCADEIRAS, A TARTARUGA A DESAFIOU PARA UMA CORRIDA.","A LEBRE PARTIU VELOZ E, CONFIANTE NA VITÓRIA, DEITOU-SE À SOMBRA DE UMA ÁRVORE. ENQUANTO ISSO, A TARTARUGA SEGUIU, PASSO A PASSO. AO DESPERTAR, A LEBRE CORREU, MAS A TARTARUGA JÁ HAVIA CRUZADO A LINHA DE CHEGADA."],q:["QUE ATITUDE DA LEBRE CONTRIBUIU PARA SUA DERROTA?","QUAL É A PRINCIPAL MENSAGEM DA HISTÓRIA?"]},
 4:{story:["A LEBRE SE CONSIDERAVA A MAIS VELOZ DOS ANIMAIS DA FLORESTA E COSTUMAVA RIDICULARIZAR A TARTARUGA. CERTO DIA, CANSADA DAS PROVOCAÇÕES, A TARTARUGA PROPÔS UMA CORRIDA.","LOGO APÓS A LARGADA, A LEBRE ABRIU GRANDE VANTAGEM. ACREDITANDO QUE NADA PODERIA AMEAÇAR SUA VITÓRIA, DECIDIU DESCANSAR E ADORMECEU. A TARTARUGA, EMBORA CAMINHASSE DEVAGAR, NÃO INTERROMPEU O PERCURSO.","QUANDO A LEBRE DESPERTOU, CORREU DESESPERADAMENTE, MAS ERA TARDE: SUA ADVERSÁRIA JÁ TINHA VENCIDO."],q:["EXPLIQUE COMO A CONFIANÇA EXCESSIVA INFLUENCIOU O RESULTADO.","IDENTIFIQUE NO TEXTO UMA ATITUDE QUE REVELE PERSISTÊNCIA."]},
 5:{story:["NA FLORESTA, A LEBRE VIVIA EXIBINDO SUA VELOCIDADE E DESPREZANDO OS ANIMAIS MAIS LENTOS. A TARTARUGA, INCOMODADA COM AS PROVOCAÇÕES, DESAFIOU-A PARA UMA CORRIDA. OS DEMAIS ANIMAIS REUNIRAM-SE PARA ASSISTIR À DISPUTA.","ASSIM QUE FOI DADA A LARGADA, A LEBRE DISPAROU E LOGO DEIXOU A ADVERSÁRIA PARA TRÁS. CONVENCIDA DE QUE SUA VITÓRIA ERA INEVITÁVEL, RESOLVEU TIRAR UMA SONECA À SOMBRA DE UMA ÁRVORE. A TARTARUGA, POR SUA VEZ, MANTEVE UM RITMO CONSTANTE, SEM SE DEIXAR DISTRAIR.","QUANDO A LEBRE ACORDOU, PERCEBEU QUE HAVIA SUBESTIMADO A ADVERSÁRIA. CORREU O MAIS RÁPIDO QUE PÔDE, MAS A TARTARUGA JÁ TINHA CRUZADO A LINHA DE CHEGADA. A CORRIDA MOSTROU QUE RAPIDEZ, SEM RESPONSABILIDADE, NÃO GARANTE O SUCESSO."],q:["O QUE A EXPRESSÃO “VITÓRIA INEVITÁVEL” REVELA SOBRE A LEBRE?","COMPARE AS ATITUDES DAS DUAS PERSONAGENS E JUSTIFIQUE O DESFECHO."]}
};
const mat={
1:[["CONTAR E QUANTIFICAR","Conte os desenhos e escreva quantos há ao todo: ● ● ● ● ● ●"],["LER E ESCREVER NÚMEROS","Leia para a professora o número 14. Depois escreva o número que ela ditar: NOVE."],["SISTEMA DECIMAL","Observe 12 tampinhas: separamos 10 e sobraram 2. Complete: 12 = ____ dezena e ____ unidades."],["ADIÇÃO E SUBTRAÇÃO","Lia tinha 5 figurinhas e ganhou mais 3. Com quantas figurinhas ficou?"],["GRUPOS IGUAIS","Há 2 pratos, com 3 biscoitos em cada. Quantos biscoitos há ao todo? Desenhe se quiser."],["SEQUÊNCIA","Complete: 2, 4, 6, ____, ____."],["TABELA","Frutas escolhidas: BANANA = 4; MAÇÃ = 2; UVA = 3. Qual fruta foi mais escolhida?"]],
2:[["QUANTIDADE EM AGRUPAMENTOS","Há 3 grupos com 10 palitos e 4 palitos soltos. Quantos palitos há no total?"],["LER E ESCREVER NÚMEROS","Leia 86 para a professora. Escreva em algarismos: CENTO E VINTE."],["SISTEMA DECIMAL","Complete: 47 = ____ dezenas e ____ unidades."],["ADIÇÃO E SUBTRAÇÃO","Havia 26 livros na sala. Chegaram mais 13. Quantos livros há agora?"],["GRUPOS IGUAIS","Há 4 caixas com 3 lápis em cada. Quantos lápis há no total?"],["SEQUÊNCIA","Complete: 15, 20, 25, ____, ____."],["TABELA","Livros lidos: ANA = 5; BIA = 3; CAIO = 4. Quem leu menos livros?"]],
3:[["QUANTIDADE EM AGRUPAMENTOS","Há 4 pacotes com 100 folhas, 3 grupos de 10 folhas e 6 soltas. Quantas folhas há?"],["LER E ESCREVER NÚMEROS","Leia 1.205. Escreva em algarismos: NOVECENTOS E QUATORZE."],["SISTEMA DECIMAL","Decomponha 358 em centenas, dezenas e unidades."],["ADIÇÃO E SUBTRAÇÃO","A biblioteca tinha 245 livros e recebeu mais 128. Quantos livros tem agora?"],["GRUPOS IGUAIS","24 lápis serão repartidos igualmente entre 4 estudantes. Quantos lápis cada um receberá?"],["SEQUÊNCIA","Complete: 120, 130, 140, ____, ____."],["TABELA","Brinquedos: BOLA = 12; CORDA = 8; PETECA = 15. Qual brinquedo teve mais escolhas?"]],
4:[["QUANTIDADE EM AGRUPAMENTOS","Um depósito tem 5 caixas com 1.000 peças, 3 pacotes de 100 e 7 peças soltas. Quantas peças são?"],["LER E ESCREVER NÚMEROS","Leia 14.206. Escreva em algarismos: OITO MIL E QUARENTA."],["SISTEMA DECIMAL","Qual é o valor do algarismo 6 no número 4.628?"],["ADIÇÃO E SUBTRAÇÃO","Uma escola tinha 1.250 livros e doou 375. Quantos livros restaram?"],["GRUPOS IGUAIS","Há 6 mesas com 8 lugares em cada. Quantos lugares existem ao todo?"],["SEQUÊNCIA","Complete: 250, 275, 300, ____, ____."],["TABELA","Visitas à biblioteca: SEG = 36; TER = 42; QUA = 29. Em qual dia houve mais visitas?"]],
5:[["QUANTIDADE EM AGRUPAMENTOS","Há 7 caixas com 1.000 unidades, 4 pacotes de 100 e 9 unidades soltas. Quantas unidades são?"],["LER E ESCREVER NÚMEROS","Leia 305.018. Escreva em algarismos: QUARENTA E DOIS MIL E SEIS."],["SISTEMA DECIMAL","Decomponha 35.407 em valores posicionais (use adições)."],["ADIÇÃO E SUBTRAÇÃO","Uma campanha arrecadou 2.450 livros. Foram distribuídos 1.785. Quantos livros sobraram?"],["GRUPOS IGUAIS","156 cadernos serão distribuídos igualmente em 12 turmas. Quantos cadernos cada turma receberá?"],["SEQUÊNCIA","Complete: 1.200, 1.150, 1.100, ____, ____."],["TABELA","Arrecadação: TURMA A = 125; B = 150; C = 135. Quantos itens B arrecadou a mais que A?"]]
};
const esc=x=>String(x??"").replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;").replaceAll('"',"&quot;").replaceAll("'","&#39;");
function QR(code,type){
 const x=window.qrcode(0,"M");x.addData("SONIA26|"+code+"|"+type,"Byte");x.make();
 return x.createSvgTag({cellSize:3,margin:6,scalable:true});
}
function header(title,s,c,type,standard=false){
 return '<header class="head"><div class="headtext"><small>LUMINA · ACOMPANHAMENTO DAS APRENDIZAGENS</small><h1>'+esc(title)+'</h1><p>'+SCHOOL+'</p><p><b>ESTUDANTE:</b> '+esc(s.display_name)+'</p><p><b>TURMA:</b> '+esc(c.label)+' &nbsp; <b>DATA:</b> ____/____/2026</p></div>'+
 (standard?'':'<div class="qr-wrap"><div class="qr-small">'+QR(s.local_reference,type)+'</div><span class="qr-readable">'+esc(s.local_reference)+'</span></div>')+'</header>';
}
function language(s,c,year,standard=false){
 const part=lp[year];
 return '<section class="page activity">'+header('LÍNGUA PORTUGUESA — '+year+'º ANO',s,c,"LP-V1",standard)+
 '<div class="instruction">A professora ditará cinco palavras e uma frase. Escreva sem copiar. Depois, faça a leitura.</div>'+
 '<h2>1. ESCRITA DE CINCO PALAVRAS</h2>'+Array.from({length:5},(_,i)=>'<div class="write">'+(i+1)+'.</div>').join("")+
 '<h2>2. ESCRITA DE UMA FRASE</h2><div class="write"></div><div class="write"></div>'+
 '<h2>3. LEITURA DE TEXTO DE MEMÓRIA</h2><div class="poem">'+poems.map(x=>'<div>'+esc(x)+'</div>').join("")+'</div>'+
 '<h2>4. LEITURA DE TEXTO NARRATIVO</h2><strong class="storytitle">A LEBRE E A TARTARUGA</strong><div class="story">'+part.story.map(x=>'<p>'+esc(x)+'</p>').join("")+'</div>'+
 '<h2>5. COMPREENSÃO ORAL DO TEXTO</h2>'+part.q.map((q,i)=>'<div class="question">'+(i+1)+'. '+esc(q)+'<div class="write"></div></div>').join("")+
 '<footer>Guarde as produções originais. Para leitura óptica, use apenas a FICHA ÚNICA de X.</footer></section>';
}
function mathematics(s,c,year,standard=false){
 return '<section class="page activity">'+header('MATEMÁTICA — '+year+'º ANO',s,c,"MAT-V1",standard)+
 '<div class="instruction">A professora pode ler os enunciados. Resolva do seu jeito; use desenhos ou cálculos.</div>'+
 mat[year].map((q,i)=>'<div class="math-item"><h3>'+(i+1)+'. M'+(i+1)+' · '+esc(q[0])+'</h3><div>'+esc(q[1])+'</div><p class="answer">RESPOSTA / ESTRATÉGIA: ___________________________________________________</p></div>').join("")+
 '<footer>Registro de observação pedagógica, não prova padronizada. A ficha única de X é separada.</footer></section>';
}
const W=595.2755905511812,H=841.8897637795277;
const rect=(x,y,w,h,fill,stroke)=>'<rect x="'+x+'" y="'+y+'" width="'+w+'" height="'+h+'" fill="'+(fill||"none")+'" stroke="'+(stroke||"none")+'"/>';
const txt=(x,y,t,size,weight,color)=>'<text x="'+x+'" y="'+y+'" font-family="Arial,Helvetica,sans-serif" font-size="'+(size||9.5)+'" font-weight="'+(weight||"normal")+'" fill="'+(color||"#23342e")+'">'+esc(t)+'</text>';
const mark=(x,y,t,tx,filled=false)=>rect(x,y,10,10,"white","#0e2018")+(filled?'<path d="M '+(x+2)+' '+(y+2)+' L '+(x+8)+' '+(y+8)+' M '+(x+8)+' '+(y+2)+' L '+(x+2)+' '+(y+8)+'" fill="none" stroke="#111" stroke-width="2.2" stroke-linecap="round"/>':'')+txt(tx??x+14,y+9,t,9.6);
function marking(s,c,test=false,standard=false){
 const o=[];
 const testPositions=new Set(['320:191','40:255','40:273','40:291','320:255','320:273','245:360','245:380','350:445','405:464','350:483','460:502','350:521','350:540','405:559']);
 const box=(x,y,label)=>mark(x,y,label,undefined,test&&testPositions.has(x+':'+y));
 const band=(y,title)=>{o.push(rect(33,y,528,17,"#e8f1ed"));o.push(txt(41,y+12,title,10,"bold","#20483a"));};
 o.push(rect(0,0,W,82,"#173e33"));
 o.push(txt(34,32,"FICHA DIAGNÓSTICA INTEGRADA",17,"bold","white"));
 o.push(txt(34,52,standard?("LÍNGUA PORTUGUESA + MATEMÁTICA | "+c.label+" | 2026"):"LÍNGUA PORTUGUESA + MATEMÁTICA | 2026",11,"normal","white"));
 o.push(rect(474,26,105,106,"white"));
 if(standard){
   // Mesmo espaço e geometria do QR das fichas já validadas.
   o.push(rect(474,26,105,123,"white","#567a69"));
   o.push(txt(489,82,"COLE AQUI",10,"bold","#345d4b"));
   o.push(txt(485,99,"ETIQUETA QR",9,"normal","#345d4b"));
 }else{
   o.push(QR(s.local_reference,"FICHA-V1").replace(/<svg /,'<svg x="478" y="30" width="96" height="96" '));
 }
 o.push(txt(34,111,"ESCOLA: "+SCHOOL,9));
 o.push(txt(34,128,"ESTUDANTE: "+s.display_name,10,"bold"));
 o.push(txt(34,145,"TURMA: "+c.label+"     DATA: ____/____/2026",10));
 if(!standard)o.push(txt(475,143,s.local_reference,8,"bold","#325343"));
 band(152,"A. HIPÓTESE DE ESCRITA — MARQUE UMA");
 [["Pré-silábica",40,173],["Silábica sem valor",40,191],["Silábica com valor",40,209],["Silábico-alfabética",320,173],["Alfabética",320,191]].forEach(x=>o.push(box(x[1],x[2],x[0])));
 band(233,"B. LEITURA — MARQUE X NAS HABILIDADES OBSERVADAS");
 [["Reconhece letras",40,255],["Lê letras isoladas",40,273],["Lê sílabas simples",40,291],["Lê sílabas complexas",40,309],["Lê palavras",320,255],["Lê frases simples",320,273],["Lê frases complexas",320,291]].forEach(x=>o.push(box(x[1],x[2],x[0])));
 band(335,"C. LEITURA DE TEXTOS — UMA OPÇÃO POR LINHA");
 o.push(txt(40,369,"Texto de memória",10));o.push(txt(40,389,"Texto narrativo",10));
 [["Lê",245,360],["Recita",340,360],["Não lê",445,360],["Fluente",245,380],["Sem fluência",340,380],["Não lê",445,380]].forEach(x=>o.push(box(x[1],x[2],x[0])));
 band(408,"D. MATEMÁTICA — UMA OPÇÃO POR INDICADOR");
 o.push(txt(40,438,"A=sozinho | P=parcial/ajuda | N=não demonstrou | NO=não observado",9));
 const labs=["Contagem e quantificação","Leitura e escrita de números","Sistema decimal","Adição e subtração","Grupos iguais e repartição","Sequências e regularidades","Leitura de dados"];
 labs.forEach((lab,i)=>{const y=445+i*19;o.push(txt(40,y+9,"M"+(i+1)+" "+lab,9.6));[["A",350],["P",405],["N",460],["NO",515]].forEach(v=>o.push(box(v[1],y,v[0])))});
 band(594,"OBSERVAÇÕES PEDAGÓGICAS COMPLEMENTARES — MANUAIS");
 o.push(txt(40,634,"Memória: leitura com apoio/autonomia e fluência:",9.8));
 o.push(rect(40,642,510,1,"#afc1b6"));
 o.push(txt(40,667,"Narrativa: leitura com apoio/autonomia e fluência:",9.8));
 o.push(rect(40,675,510,1,"#afc1b6"));
 o.push(txt(40,700,"Compreensão: autônoma/com mediação/não demonstrada:",9.8));
 o.push(rect(40,708,510,1,"#afc1b6"));
 o.push(txt(40,738,"Observações adicionais:",9.8));
 o.push(rect(40,745,510,1,"#afc1b6"));o.push(rect(40,773,510,1,"#afc1b6"));
 o.push(txt(34,806,"Marque X dentro do quadrado, sem pintar o fundo. A câmera lê apenas QR e X.",8.2,"normal","#596b61"));
 if(test)o.push(txt(34,831,"FICHA FICTÍCIA DE TESTE. NÃO REGISTRAR NO PAINEL.",8.4,"bold","#a13434"));
 return '<section class="page marking"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 '+W+' '+H+'" width="100%" height="100%">'+o.join("")+'</svg></section>';
}const markOMR=(x,y,t,filled=false)=>rect(x,y,12,12,"white","#102018")+
 (filled?rect(x+1.5,y+1.5,9,9,"#101713"):'')+txt(x+16,y+10,t,9.6);

function markingOMR(s,c,test=false){
 const o=[];
 const testPositions=new Set(['320:191','40:255','40:273','40:291','320:255','320:273','245:360','245:380','350:445','405:464','350:483','460:502','350:521','350:540','405:559']);
 const box=(x,y,label)=>markOMR(x,y,label,test&&testPositions.has(x+':'+y));
 const band=(y,title)=>{o.push(rect(33,y,528,17,"#e8f1ed"));o.push(txt(41,y+12,title,10,"bold","#20483a"));};
 o.push(rect(0,0,W,82,"#173e33"));
 o.push(txt(34,32,"FICHA DIAGNÓSTICA INTEGRADA",17,"bold","white"));
 o.push(txt(34,52,"LÍNGUA PORTUGUESA + MATEMÁTICA | 2026 • OMR V2",11,"normal","white"));
 o.push(rect(474,26,105,106,"white"));
 o.push(QR(s.local_reference,"FICHA-V2").replace(/<svg /,'<svg x="478" y="30" width="96" height="96" '));
 o.push(txt(34,111,"ESCOLA: "+SCHOOL,9));
 o.push(txt(34,128,"ESTUDANTE: "+s.display_name,10,"bold"));
 o.push(txt(34,145,"TURMA: "+c.label+"     DATA: ____/____/2026",10));
 o.push(txt(475,143,s.local_reference,8,"bold","#325343"));
 band(152,"A. HIPÓTESE DE ESCRITA — PINTE UMA");
 [["Pré-silábica",40,173],["Silábica sem valor",40,191],["Silábica com valor",40,209],["Silábico-alfabética",320,173],["Alfabética",320,191]].forEach(x=>o.push(box(x[1],x[2],x[0])));
 band(233,"B. LEITURA — PINTE OS QUADRADOS OBSERVADOS");
 [["Reconhece letras",40,255],["Lê letras isoladas",40,273],["Lê sílabas simples",40,291],["Lê sílabas complexas",40,309],["Lê palavras",320,255],["Lê frases simples",320,273],["Lê frases complexas",320,291]].forEach(x=>o.push(box(x[1],x[2],x[0])));
 band(335,"C. LEITURA DE TEXTOS — UMA OPÇÃO POR LINHA");
 o.push(txt(40,369,"Texto de memória",10));o.push(txt(40,389,"Texto narrativo",10));
 [["Lê",245,360],["Recita",340,360],["Não lê",445,360],["Fluente",245,380],["Sem fluência",340,380],["Não lê",445,380]].forEach(x=>o.push(box(x[1],x[2],x[0])));
 band(408,"D. MATEMÁTICA — UMA OPÇÃO POR INDICADOR");
 o.push(txt(40,438,"A=sozinho | P=parcial/ajuda | N=não demonstrou | NO=não observado",9));
 const labs=["Contagem e quantificação","Leitura e escrita de números","Sistema decimal","Adição e subtração","Grupos iguais e repartição","Sequências e regularidades","Leitura de dados"];
 labs.forEach((lab,i)=>{const y=445+i*19;o.push(txt(40,y+9,"M"+(i+1)+" "+lab,9.6));[["A",350],["P",405],["N",460],["NO",515]].forEach(v=>o.push(box(v[1],y,v[0])))});
 band(594,"OBSERVAÇÕES PEDAGÓGICAS COMPLEMENTARES — MANUAIS");
 o.push(txt(40,634,"Memória: leitura com apoio/autonomia e fluência:",9.8));
 o.push(rect(40,642,510,1,"#afc1b6"));
 o.push(txt(40,667,"Narrativa: leitura com apoio/autonomia e fluência:",9.8));
 o.push(rect(40,675,510,1,"#afc1b6"));
 o.push(txt(40,700,"Compreensão: autônoma/com mediação/não demonstrada:",9.8));
 o.push(rect(40,708,510,1,"#afc1b6"));
 o.push(txt(40,738,"Observações adicionais:",9.8));
 o.push(rect(40,745,510,1,"#afc1b6"));o.push(rect(40,773,510,1,"#afc1b6"));
 o.push(txt(34,807,"PREENCHA COMPLETAMENTE o quadrado escolhido. Use caneta preta ou azul-escura. Não use X.",8.3,"bold","#345b49"));
 o.push(txt(34,822,"Somente a ficha de correção preenchida deve ser digitalizada. Não rasurar nem dobrar.",8.0,"normal","#53695d"));
 // Quatro referências de registro óptico. Nenhuma altera a resposta.
 // Devem ser totalmente visíveis no PDF ou na fotografia.
 [[26,88],[445,88],[26,782],[550,782]].forEach(([x,y])=>o.push(rect(x,y,18,18,"#101713")));
 if(test)o.push(txt(34,835,"TESTE FICTÍCIO • NÃO PUBLICAR",8.3,"bold","#a13434"));
 return '<section class="page marking" data-template="FICHA-V2"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 '+W+' '+H+'" width="100%" height="100%">'+o.join("")+'</svg></section>';
}

const css="@page{size:A4;margin:0}*{box-sizing:border-box}body{font-family:Arial,sans-serif;margin:0;background:#eef1ee;color:#23392f}.toolbar{margin:12px auto;max-width:950px;background:#173e33;color:white;padding:12px 16px;border-radius:9px;display:flex;gap:15px;align-items:center;font-size:12px}.toolbar button{background:#f4ead3;color:#173e33;border:none;border-radius:6px;font-weight:bold;padding:10px 16px;cursor:pointer}.page{width:210mm;height:297mm;background:white;margin:15px auto;position:relative;overflow:hidden;break-after:page;page-break-after:always;box-shadow:0 3px 9px #0002}.page:last-child{break-after:auto;page-break-after:auto}.activity{padding:12mm 14mm 10mm}.head{display:flex;gap:7mm;justify-content:space-between;align-items:start;border-bottom:2px solid #b59d65;padding-bottom:4mm;margin-bottom:5mm;min-height:34mm}.headtext{flex:1;min-width:0}.head small{font-size:8.5px;color:#28634e;font-weight:bold}.head h1{font-size:17px;margin:3mm 0 2mm}.head p{font-size:9.7px;margin:1.6mm 0}.qr-wrap{width:30mm;min-width:30mm;text-align:center}.qr-small{width:26mm;height:26mm;margin:0 auto}.qr-small svg{width:100%;height:100%}.qr-readable{font:7.7px monospace;color:#425d4e;white-space:nowrap}.instruction{font-size:10.5px;padding:7px 9px;background:#edf4ef;margin-bottom:5mm}.activity h2{font-size:11px;background:#edf4ef;padding:5px 7px;margin:4mm 0 2.5mm}.write{height:6.7mm;border-bottom:1px solid #85998e;margin:1mm 0;font-size:11px}.poem{font-size:11.7px;line-height:1.4;margin-left:4mm}.storytitle{font-size:12px}.story{font-size:11.2px;line-height:1.26}.story p{margin:0 0 6px}.question{font-size:10.4px;margin:2mm 0}.math-item{padding:3.2mm 0;border-bottom:1px solid #dae2da;font-size:11.4px}.math-item h3{font-size:10.8px;color:#21483b;margin:0 0 2mm}.answer{font-size:9.2px;color:#6c7a70;white-space:nowrap;margin:3mm 0 0}.activity footer{position:absolute;bottom:7mm;left:14mm;right:14mm;font-size:8.3px;color:#66786d;border-top:1px solid #d8e2d8;padding-top:2mm}.marking svg{display:block}@media print{body{background:white}.toolbar{display:none}.page{box-shadow:none;margin:0}}";
function printSet(rows,klass){
 if(!window.qrcode)throw new Error("Biblioteca QR indisponível");
 if(!Array.isArray(rows)||!rows.length||!klass?.id)throw new Error("Selecione uma turma e seus estudantes.");
 const grade=Number((klass.label.match(/^[1-5]/)||[])[0]);
 if(!lp[grade]||!mat[grade])throw new Error("Instrumento indisponível para o ano.");
 const ids=new Set();
 rows.forEach(s=>{if(s.classroom_id!==klass.id||!s.active||!/^SON-26-[A-F0-9]{12}$/.test(s.local_reference||""))throw new Error("As fichas exigem matrícula confirmada e código válido.");if(ids.has(s.id))throw new Error("Estudante repetido");ids.add(s.id)});
 const p=window.open("","_blank");
 if(!p)throw new Error("O navegador bloqueou a nova aba de impressão.");
 p.opener=null;
 try{
  const pages=rows.slice().sort((a,b)=>a.display_name.localeCompare(b.display_name,"pt-BR")).map(s=>language(s,klass,grade)+mathematics(s,klass,grade)+markingOMR(s,klass)).join("");
  const html='<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><meta name="robots" content="noindex,nofollow"><meta name="referrer" content="no-referrer"><title>Lumina | Fichas '+esc(klass.label)+'</title><style>'+css+'</style></head><body><div class="toolbar"><button onclick="window.print()">Imprimir ou salvar em PDF</button><span>'+rows.length+' estudante(s) • '+(rows.length*3)+' páginas • LP + Matemática + Ficha Óptica de Preenchimento V2 • Uso interno</span></div>'+pages+'</body></html>';
  p.document.open();p.document.write(html);p.document.close();p.focus();
  return {students:rows.length,pages:rows.length*3};
 }catch(err){p.close();throw err;}
}



/* Pacotes entregues impressos pela escola. Um QR já integrado por matrícula.
 * Os campos X e a posição original do QR continuam exatamente os mesmos do V5.
 */
function printSchoolPacket(rows,klass,kind="correction"){
 if(!window.qrcode)throw new Error("A biblioteca de QR Code não carregou.");
 if(!["correction","full","activities"].includes(kind))throw new Error("Tipo de impressão não reconhecido.");
 if(!Array.isArray(rows)||!rows.length||!klass?.id)throw new Error("Selecione uma turma com matrículas confirmadas.");
 const grade=Number((klass.label.match(/^[1-5]/)||[])[0]);
 if(!lp[grade]||!mat[grade])throw new Error("Ano escolar não reconhecido.");
 const ids=new Set(),codes=new Set();
 for(const s of rows){
  if(s.classroom_id!==klass.id||s.active!==true||!/^SON-26-[A-F0-9]{12}$/.test(s.local_reference||""))
    throw new Error("Impressão bloqueada: confira matrícula, turma e QR do estudante.");
  if(ids.has(s.id)||codes.has(s.local_reference))throw new Error("Há matrícula ou QR Code duplicado nesta turma.");
  ids.add(s.id);codes.add(s.local_reference);
 }
 const sorted=rows.slice().sort((a,b)=>a.display_name.localeCompare(b.display_name,"pt-BR"));
 const popup=window.open("","_blank");
 if(!popup)throw new Error("Permita a abertura de novas abas para impressão.");
 popup.opener=null;
 try{
  const pages=sorted.map(s=>{
   if(kind==="correction")return markingOMR(s,klass);
   if(kind==="activities")return language(s,klass,grade)+mathematics(s,klass,grade);
   return language(s,klass,grade)+mathematics(s,klass,grade)+markingOMR(s,klass);
  }).join("");
  const pagesPerStudent=kind==="correction"?1:kind==="activities"?2:3;
  const title=kind==="correction"?"Fichas de correção OMR V2 prontas":kind==="activities"?"Atividades para aplicar":"Avaliação completa";
  const banner=title+" · "+klass.label+" · "+sorted.length+" estudantes · "+(sorted.length*pagesPerStudent)+" páginas A4"+
   " · QR FICHA-V2 integrado · Sem etiquetas";
  const html='<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><meta name="robots" content="noindex,nofollow"><meta name="referrer" content="no-referrer"><title>'+esc(banner)+'</title><style>'+css+'</style></head><body>'+
   '<div class="toolbar"><button type="button" onclick="window.print()">Imprimir / salvar em PDF</button>'+
   '<span>'+esc(banner)+'. Impressão centralizada pela escola. A4, tamanho real (100%).</span></div>'+
   pages+'</body></html>';
  popup.document.open();popup.document.write(html);popup.document.close();popup.focus();
  return {students:sorted.length,grade,pages:sorted.length*pagesPerStudent,kind};
 }catch(error){popup.close();throw error;}
}

/* Impressão padronizada e QR individual, compatíveis com FICHA-V1. */
function standardGrade(grade){
 const y=Number(grade);
 if(!Number.isInteger(y)||y<1||y>5||!lp[y]||!mat[y])throw new Error("Selecione um ano do 1º ao 5º.");
 return y;
}
function printStandardSheet(grade,kind="integrated"){
 grade=standardGrade(grade);
 if(!["integrated","activities"].includes(kind))throw new Error("Modelo não disponível.");
 const s={display_name:"____________________________________",local_reference:"",active:true};
 const c={id:"MODELO",label:grade+"º ANO  /  _____"};
 const pages=kind==="integrated"?marking(s,c,false,true):language(s,c,grade,true)+mathematics(s,c,grade,true);
 const popup=window.open("","_blank");
 if(!popup)throw new Error("Autorize a abertura de novas abas para imprimir.");
 popup.opener=null;
 try{
  const label=kind==="integrated"?"Ficha integrada de X, padrão do "+grade+"º ano, com espaço para QR individual":"Atividades padronizadas de LP e Matemática — "+grade+"º ano";
  const html='<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><meta name="robots" content="noindex,nofollow"><meta name="referrer" content="no-referrer"><title>Lumina · '+esc(label)+'</title><style>'+css+'</style></head><body>'+
    '<div class="toolbar"><button onclick="window.print()">Imprimir / salvar em PDF</button><span>'+esc(label)+' · A4, tamanho real / 100%. Imprima quantas cópias precisar.</span></div>'+
    pages+'</body></html>';
  popup.document.open();popup.document.write(html);popup.document.close();popup.focus();
  return {grade,pages:kind==="integrated"?1:2};
 }catch(e){popup.close();throw e;}
}
function printQrLabels(students,klass){
 if(typeof window.qrcode!=="function")throw new Error("Gerador de QR Code indisponível.");
 if(!Array.isArray(students)||!students.length||!klass?.id)throw new Error("Selecione uma turma.");
 const grade=standardGrade((klass.label||"").match(/^[1-5]/)?.[0]);
 const sorted=students.slice().sort((a,b)=>a.display_name.localeCompare(b.display_name,"pt-BR"));
 const seen=new Set();
 sorted.forEach(s=>{
  if(!s||s.classroom_id!==klass.id||s.active!==true||!/^SON-26-[A-F0-9]{12}$/.test(s.local_reference||""))
   throw new Error("Matrícula sem confirmação ou QR inválido.");
  if(seen.has(s.local_reference))throw new Error("QR repetido.");
  seen.add(s.local_reference);
 });
 const popup=window.open("","_blank");
 if(!popup)throw new Error("Autorize a abertura de novas abas para imprimir.");
 popup.opener=null;
 try{
  const cards=sorted.map(s=>
   '<article class="label-card"><div class="sticker"><div class="sticker-qr">'+QR(s.local_reference,"FICHA-V1")+'</div>'+
   '<div class="sticker-code">'+esc(s.local_reference)+'</div></div>'+
   '<div class="label-name">'+esc(s.display_name)+'</div></article>');
  const pages=[];
  for(let i=0;i<cards.length;i+=20){
   pages.push('<section class="label-page"><div class="label-header"><strong>ETIQUETAS QR · '+esc(klass.label)+' · 2026</strong>'+
    '<small>Recorte apenas dentro da borda pontilhada (37 × 43 mm). O nome do estudante fica FORA da etiqueta para orientar a distribuição.</small></div>'+
    '<div class="label-grid">'+cards.slice(i,i+20).join("")+'</div></section>');
  }
  const labelCss='@page{size:A4;margin:0}*{box-sizing:border-box}body{margin:0;font-family:Arial,Helvetica,sans-serif;color:#173e33;background:#eef1ed}'+
   '.label-page{width:210mm;height:297mm;padding:9mm 14mm 8mm;background:white;break-after:page;page-break-after:always;margin:12px auto;box-shadow:0 2px 8px #0002}'+
   '.label-page:last-child{break-after:auto;page-break-after:auto}'+
   '.label-header{height:30mm;font-size:13px;display:flex;flex-direction:column;gap:2mm}'+
   '.label-header small{font-size:9px;line-height:1.4;color:#546c5e}'+
   '.label-grid{display:grid;grid-template-columns:repeat(4,40mm);grid-template-rows:repeat(5,50mm);justify-content:center}'+
   '.label-card{width:40mm;height:50mm;break-inside:avoid;display:flex;flex-direction:column;align-items:center}'+
   '.sticker{width:37mm;height:43mm;border:1px dashed #728e7e;display:flex;flex-direction:column;align-items:center;overflow:hidden;background:white}'+
   '.sticker-qr{width:34mm;height:34mm;flex:0 0 34mm;margin-top:1mm}.sticker-qr svg{display:block;width:100%;height:100%}'+
   '.sticker-code{font-size:7.5px;line-height:1.2;font-weight:bold;white-space:nowrap;margin-top:2mm}'+
   '.label-name{font-size:8px;font-weight:bold;line-height:1.15;text-align:center;width:39mm;max-height:6mm;overflow:hidden;padding-top:.6mm}'+
   '.toolbar-label{background:#173e33;color:white;padding:12px;display:flex;gap:14px;align-items:center;justify-content:center}'+
   '.toolbar-label button{background:#e8dcb9;border:0;border-radius:5px;padding:10px 14px;font-weight:bold;cursor:pointer}'+
   '@media print{body{background:white}.toolbar-label{display:none}.label-page{margin:0;box-shadow:none}}';
  const html='<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><meta name="robots" content="noindex,nofollow"><meta name="referrer" content="no-referrer"><title>Lumina · Etiquetas QR · '+esc(klass.label)+'</title><style>'+labelCss+'</style></head><body>'+
   '<div class="toolbar-label"><button onclick="window.print()">Imprimir / salvar PDF</button><span>'+sorted.length+' etiqueta(s), '+pages.length+' folha(s) A4 · escala 100%. Recortar e colar no espaço indicado.</span></div>'+
   pages.join("")+'</body></html>';
  popup.document.open();popup.document.write(html);popup.document.close();popup.focus();
  return {grade,students:sorted.length,pages:pages.length};
 }catch(e){popup.close();throw e;}
}

const keys={
 1:["6","Lê 14; escreve 9","1 dezena e 2 unidades","8","6","8, 10","Banana"],
 2:["34","Lê 86; escreve 120","4 dezenas e 7 unidades","39","12","30, 35","Bia"],
 3:["436","Lê 1.205; escreve 914","300 + 50 + 8","373","6","150, 160","Peteca"],
 4:["5.307","Lê 14.206; escreve 8.040","600","875","48","325, 350","Terça-feira"],
 5:["7.409","Lê 305.018; escreve 42.006","30.000 + 5.000 + 400 + 7","665","13","1.050, 1.000","25"]
};
function printGuide(grade){
 grade=Number(grade);
 if(!keys[grade])throw new Error("Selecione um ano do 1º ao 5º.");
 const printWindow=window.open("","_blank");
 if(!printWindow)throw new Error("O navegador bloqueou a janela.");
 printWindow.opener=null;
 const s='<section class="guide"><h1>ROTEIRO DA PROFESSORA — '+grade+'º ANO</h1><p><b>'+SCHOOL+'</b> · Diagnóstico de fechamento 2026</p>'+
 '<h2>Ditado e frase (somente para a professora)</h2>'+
 '<p><b>1.</b> BORBOLETA (polissílaba) &nbsp; <b>2.</b> CAVALO (trissílaba) &nbsp; <b>3.</b> GATO (dissílaba) &nbsp; <b>4.</b> PATO (dissílaba) &nbsp; <b>5.</b> BOI (monossílaba).</p>'+
 '<p><b>Frase:</b> O GATO VIU O PATO.</p>'+
 '<p>Não mostrar as palavras durante o ditado, nem corrigir a escrita durante a produção. Observar a leitura individualmente quando possível; distinguir recitação de leitura efetiva.</p>'+
 '<h2>Gabarito orientador de Matemática</h2><table><thead><tr><th>Indicador</th><th>Resposta esperada</th></tr></thead><tbody>'+
 keys[grade].map((v,i)=>'<tr><td>M'+(i+1)+'</td><td>'+esc(v)+'</td></tr>').join("")+'</tbody></table>'+
 '<h2>Marcação na ficha única</h2><p>Escrita: marque uma hipótese. Leitura: marque as habilidades observadas. Texto de memória e narrativa: uma opção por linha; registre apoio e autonomia nas observações complementares. Matemática: A = sozinho; P = parcial/com ajuda; N = não demonstrou; NO = não observado.</p>'+
 '<p><b>Importante:</b> o registro é resultado da interpretação pedagógica da professora. Para o leitor V5, digitalize somente a ficha única de X, nunca as páginas de atividades. O código do QR identifica a ficha sem conter nome ou CPF.</p>'+
 '<p><b>Comparabilidade:</b> os indicadores M1–M7 são comuns, mas a complexidade varia conforme o ano. Não comparar acertos de anos diferentes como se fossem notas equivalentes.</p>'+
 '</section>';
 const cssGuide='@page{size:A4;margin:16mm}body{font-family:Arial,sans-serif;color:#20382f;font-size:12px;line-height:1.5}h1{font-size:19px;border-bottom:3px solid #b59d65;padding-bottom:10px}h2{font-size:14px;background:#edf4ef;margin-top:18px;padding:6px}table{border-collapse:collapse;width:100%;font-size:11px}th,td{padding:7px;border:1px solid #b9cbbf;text-align:left}th{background:#edf4ef}.toolbar{margin-bottom:15px}.toolbar button{background:#173e33;border:0;border-radius:5px;padding:10px 15px;color:white;cursor:pointer}@media print{.toolbar{display:none}}';
 const doc='<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><meta name="robots" content="noindex,nofollow"><title>Lumina | Roteiro da professora '+grade+'º ano</title><style>'+cssGuide+'</style></head><body><div class="toolbar"><button onclick="window.print()">Imprimir ou salvar em PDF</button></div>'+s+'</body></html>';
 printWindow.document.open();printWindow.document.write(doc);printWindow.document.close();printWindow.focus();
}


function printTestSheet(){
 if(typeof window.qrcode!=='function')throw new Error('O gerador de QR não carregou. Atualize o navegador.');
 const popup=window.open('','_blank');
 if(!popup)throw new Error('Permita a abertura de uma nova aba para imprimir a ficha.');
 popup.opener=null;
 try{
   const student={id:'TESTE-FICTICIO',display_name:'ESTUDANTE FICTÍCIO — NÃO É MATRÍCULA',classroom_id:'TURMA-TESTE',active:true,local_reference:'SON-26-ABCDEF123456'};
   const klass={id:'TURMA-TESTE',label:'1º A (TESTE)'};
   const page=markingOMR(student,klass,true);
   const documentHtml='<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><meta name="robots" content="noindex,nofollow"><meta name="referrer" content="no-referrer"><title>Lumina | Ficha fictícia para testar QR + X</title><style>'+css+'</style></head><body><div class="toolbar"><button type="button" onclick="window.print()">Imprimir ou salvar em PDF</button><span>1 página A4 • FICHA FICTÍCIA • 15 quadradinhos marcados em X • não cadastrar como avaliação real</span></div>'+page+'</body></html>';
   popup.document.open();popup.document.write(documentHtml);popup.document.close();popup.focus();
 }catch(err){popup.close();throw err;}
}

function testFixtureMarkup(){
 const student={id:'TESTE-FICTICIO',display_name:'ESTUDANTE FICTÍCIO — NÃO É MATRÍCULA',classroom_id:'TURMA-TESTE',active:true,local_reference:'SON-26-ABCDEF123456'};
 return markingOMR(student,{id:'TURMA-TESTE',label:'1º A (TESTE)'},true);
}
window.LuminaFichas={printSet,printGuide,printTestSheet,testFixtureMarkup,printStandardSheet,printQrLabels,printSchoolPacket,version:"2026-ficha-omr-v2-piloto",pagesPerStudent:3};
})();

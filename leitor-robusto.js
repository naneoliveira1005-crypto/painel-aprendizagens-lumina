/* Lumina 2026 — reforço do leitor documental V5.
   Processamento 100% no navegador. Não modifica gravações do banco. */
(function(){
'use strict';
const originalReadQr=readQr;
const originalAnalyzeOne=analyzeOne;
const originalCollectErrors=collectErrors;
const toCode=qrPayloadToId;

function rotatePage(src,degrees){
 if(degrees===0)return src;
 const result=document.createElement('canvas');
 result.width=degrees%180===0?src.width:src.height;
 result.height=degrees%180===0?src.height:src.width;
 const ctx=result.getContext('2d',{willReadFrequently:true});
 ctx.translate(result.width/2,result.height/2);
 ctx.rotate(degrees*Math.PI/180);
 ctx.drawImage(src,-src.width/2,-src.height/2);
 return result;
}
function regionCanvas(source,spec){
 const [rx,ry,rw,rh,target]=spec;
 const x=Math.round(source.width*rx),y=Math.round(source.height*ry);
 const w=Math.max(1,Math.min(source.width-x,Math.round(source.width*rw)));
 const h=Math.max(1,Math.min(source.height-y,Math.round(source.height*rh)));
 const scale=Math.min(3,Math.max(.65,target/Math.max(w,h)));
 const output=document.createElement('canvas');
 output.width=Math.max(1,Math.round(w*scale));
 output.height=Math.max(1,Math.round(h*scale));
 output.getContext('2d',{willReadFrequently:true})
   .drawImage(source,x,y,w,h,0,0,output.width,output.height);
 return output;
}
async function scanPart(part,detector,highContrast){
 if(detector){
  try{
   const codes=[...new Set((await detector.detect(part))
     .map(item=>toCode(item.rawValue)).filter(Boolean))];
   if(codes.length>1)return {conflict:true};
   if(codes.length===1)return {code:codes[0]};
  }catch(_){}
 }
 if(typeof window.jsQR!=='function')return {};
 try{
  const context=part.getContext('2d',{willReadFrequently:true});
  const image=context.getImageData(0,0,part.width,part.height);
  if(highContrast){
   const p=image.data;
   for(let i=0;i<p.length;i+=4){
    const light=p[i]*.299+p[i+1]*.587+p[i+2]*.114;
    const value=Math.max(0,Math.min(255,(light-110)*2.25));
    p[i]=p[i+1]=p[i+2]=value;
   }
  }
  const qr=window.jsQR(image.data,part.width,part.height,
    {inversionAttempts:'attemptBoth'});
  return {code:qr?toCode(qr.data):null};
 }catch(_){return {};}
}
readQr=async function(canvas){
 const fast=await originalReadQr(canvas);
 if(fast)return fast;
 let detector=null;
 if(typeof window.BarcodeDetector==='function'){
  try{detector=new window.BarcodeDetector({formats:['qr_code']});}catch(_){}
 }
 // Reduzir somente a área de busca do QR, nunca a folha/grade de respostas.
 // Orientações alternativas cobrem fotos giradas e margens largas do celular.
 const specs=[
  [0,0,.58,.45,850],[.42,0,.58,.45,850],
  [0,.40,.58,.60,900],[.42,.40,.58,.60,900],
  [0,0,1,1,1300]
 ];
 for(const degrees of [0,180,90,270]){
  const page=rotatePage(canvas,degrees);
  if(detector){
   const full=await scanPart(regionCanvas(page,[0,0,1,1,1250]),detector,false);
   if(full.conflict)return ''; // Várias fichas na mesma fotografia: não adivinhar aluno.
   if(full.code)return full.code;
  }
  for(const spec of specs){
   const crop=regionCanvas(page,spec);
   let hit=await scanPart(crop,null,false);
   if(hit.code)return hit.code;
   // Um segundo contraste só para QR, não para os X.
   if(degrees===0){
    hit=await scanPart(crop,null,true);
    if(hit.code)return hit.code;
   }
  }
 }
 return '';
};
// Uma fotografia 4:3, 9:16 ou 1:1 não significa que a folha física não seja A4.
// Mantém obrigatória a confirmação do QR, dos X e do alinhamento óptico.
collectErrors=function(entry){
 return originalCollectErrors({...entry,shapeWarning:false});
};
analyzeOne=async function(entry){
 await originalAnalyzeOne(entry);
 const initialCode=entry.code;
 if(entry.kind==='img'&&entry.alignmentWarning){
  const raw=await renderEntry(entry,true);
  let best=null;
  for(const degrees of [180,90,270]){
   try{
    const page=rotatePage(raw,degrees);
    const reading=getAnswers(page);
    if(!reading.aligned)continue;
    const code=initialCode||await readQr(page);
    const quality=readingQuality(reading,code,false);
    if(!best||quality>best.quality)best={page,reading,code,quality,degrees};
   }catch(err){console.warn('Orientação adicional não utilizada.',err?.message);}
  }
  if(best){
   entry.correctedCanvas=best.page;
   entry.answers=best.reading.answers;
   entry.scores=best.reading.scores;
   entry.thresholds=best.reading.thresholds;
   entry.align=best.reading.align;
   entry.alignmentWarning=false;
   entry.code=best.code;
   entry.autoCropStatus='Foto girada para leitura ('+best.degrees+'°);';
  }
 }
 entry.shapeWarning=false;
 recalcState(entry);
 if(entry.state==='review'&&!entry.code){
  entry.autoCropStatus=(entry.autoCropStatus||'')+
   ' Se o QR não for legível, confira o código impresso abaixo dele e confirme a matrícula.';
 }
};
// Útil para testes sem acesso a nomes de alunos ou imagens reais.
window.LuminaReaderEnhancement={version:'2026-scan-qr-v11'};
})();

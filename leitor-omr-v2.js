/* Escola Sônia Maria — OMR V2: preenchimento sólido com 4 marcas de registro.
 * Não faz OCR nem adivinha respostas. Reprova imagem sem âncoras e campos claros.
 * Coordenadas na folha SVG (595.2756 × 841.8898 pontos).
 */
(function(){
'use strict';
const PW=595.2755905511812,PH=841.8897637795277;
const marks=[[26,88],[445,88],[26,782],[550,782]].map(([x,y])=>({x:x+9,y:y+9}));
const fields={};
function add(k,x,y){fields[k]=[x+5,y+5];}
[[40,173],[40,191],[40,209],[320,173],[320,191]].forEach(([x,y],i)=>add('H'+(i+1),x,y));
[[40,255],[40,273],[40,291],[40,309],[320,255],[320,273],[320,291]].forEach(([x,y],i)=>add('L'+(i+1),x,y));
[[245,360],[340,360],[445,360],[245,380],[340,380],[445,380]].forEach(([x,y],i)=>add(['T10','T11','T12','T20','T21','T22'][i],x,y));
for(let i=0;i<7;i++)for(let j=0;j<4;j++)add('M'+(i+1)+'_'+['A','P','N','NO'][j],350+55*j,445+19*i);
function solve8(A,z){
 const rows=A.map((r,i)=>r.concat(z[i]));
 for(let i=0;i<8;i++){
  let best=i;for(let j=i+1;j<8;j++)if(Math.abs(rows[j][i])>Math.abs(rows[best][i]))best=j;
  if(Math.abs(rows[best][i])<1e-9)return null;
  [rows[i],rows[best]]=[rows[best],rows[i]];
  const div=rows[i][i];for(let j=i;j<=8;j++)rows[i][j]/=div;
  for(let j=0;j<8;j++)if(j!==i){
   const val=rows[j][i];for(let k=i;k<=8;k++)rows[j][k]-=val*rows[i][k];
  }
 }
 return rows.map(r=>r[8]);
}
function homography(pts){
 const A=[],z=[];
 for(let i=0;i<4;i++){
  const x=marks[i].x,y=marks[i].y,X=pts[i].x,Y=pts[i].y;
  A.push([x,y,1,0,0,0,-x*X,-y*X]);z.push(X);
  A.push([0,0,0,x,y,1,-x*Y,-y*Y]);z.push(Y);
 }
 const coeff=solve8(A,z);if(!coeff)return null;
 return (x,y)=>{const d=coeff[6]*x+coeff[7]*y+1;
  return {x:(coeff[0]*x+coeff[1]*y+coeff[2])/d,y:(coeff[3]*x+coeff[4]*y+coeff[5])/d};};
}
function measure(gray,W,H){
 const bw=new Uint8Array(W*H);
 for(let i=0;i<bw.length;i++)bw[i]=gray[i]<135?1:0;
 const checked=new Uint8Array(W*H),q=new Int32Array(W*H),components=[];
 const maxArea=W*H*.09;
 for(let y=0;y<H;y++)for(let x=0;x<W;x++){
  const p=y*W+x;if(!bw[p]||checked[p])continue;
  let head=0,tail=0,x1=x,x2=x,y1=y,y2=y;
  checked[p]=1;q[tail++]=p;
  while(head<tail){
   const n=q[head++],xx=n%W,yy=(n-xx)/W;
   if(xx<x1)x1=xx;if(xx>x2)x2=xx;if(yy<y1)y1=yy;if(yy>y2)y2=yy;
   for(const m of [xx>0?n-1:-1,xx<W-1?n+1:-1,yy>0?n-W:-1,yy<H-1?n+W:-1]){
    if(m<0||!bw[m]||checked[m])continue;
    checked[m]=1;q[tail++]=m;
   }
   if(tail>maxArea)break;
  }
  const width=x2-x1+1,height=y2-y1+1,density=tail/(width*height);
  if(tail<=maxArea&&width>=W*.016&&width<=W*.075&&height>=W*.015&&height<=W*.075&&
      width/height>.68&&width/height<1.40&&density>=.73)
    components.push({x:x1,y:y1,w:width,h:height,cx:(x1+x2)/2,cy:(y1+y2)/2,density});
 }
 return {bw,components};
}
function chooseAnchors(parts,W,H,gray){
 // V2: localizar primeiro os três marcos que ficam isolados (superior
 // direito e os dois inferiores). O superior esquerdo pode se unir à
 // primeira letra de "ESCOLA" em digitalizações reais.
 const candidates=parts.filter(q=>q.w>=W*.019&&q.w<=W*.060&&q.h>=W*.019&&q.h<=W*.060);
 if(candidates.length<3)return null;
 const zones=[
  q=>q.cx<W*.24&&q.cy<H*.29,
  q=>q.cx>W*.56&&q.cx<W*.91&&q.cy<H*.29,
  q=>q.cx<W*.24&&q.cy>H*.73,
  q=>q.cx>W*.72&&q.cy>H*.73
 ];
 const target=[[.059,.115],[.760,.115],[.059,.940],[.940,.940]];
 const chosen=Array(4).fill(null);
 for(const i of [1,2,3]){
  const ranked=candidates.filter(zones[i]).map(q=>({
   q,score:Math.abs(q.cx/W-target[i][0])*2+Math.abs(q.cy/H-target[i][1])*1.3+
     Math.abs(q.w/W-.027)*5
  })).sort((a,b)=>a.score-b.score);
  if(!ranked.length||ranked[0].score>.20)return null;
  chosen[i]=ranked[0].q;
 }
 if(new Set(chosen.slice(1)).size!==3)return null;
 const [tr,bl,br]=[chosen[1],chosen[2],chosen[3]];
 // Transformação afim determinada pelos 3 marcos íntegros.
 // A previsão é verificada contra a mancha ESCURA REAL do quarto marco.
 const widthRatio=(454-35)/(559-35);
 const predicted={cx:tr.cx+(bl.cx-br.cx)*widthRatio,
  cy:tr.cy+(bl.cy-br.cy)*widthRatio};
 const near=candidates.filter(q=>zones[0](q)&&
  Math.abs(q.cx-predicted.cx)<W*.035&&Math.abs(q.cy-predicted.cy)<H*.035)
  .sort((a,b)=>Math.hypot(a.cx-predicted.cx,a.cy-predicted.cy)-
                     Math.hypot(b.cx-predicted.cx,b.cy-predicted.cy));
 if(near.length)chosen[0]=near[0];
 else{
  // O marco não apareceu como componente porque ficou ligado ao texto.
  // Só aceita a posição inferida se o núcleo 10×10 estiver bem escuro.
  let count=0,dark=0;
  const radius=Math.max(3,Math.round(W*.005));
  for(let dy=-radius;dy<=radius;dy++)for(let dx=-radius;dx<=radius;dx++){
   const x=Math.round(predicted.cx+dx),y=Math.round(predicted.cy+dy);
   if(x>=0&&x<W&&y>=0&&y<H){count++;if(gray[y*W+x]<150)dark++;}
  }
  if(!count||dark/count<.75)return null;
  chosen[0]={cx:predicted.cx,cy:predicted.cy};
 }
 const [tl]=chosen;
 const top=Math.hypot(tr.cx-tl.cx,tr.cy-tl.cy);
 const bottom=Math.hypot(br.cx-bl.cx,br.cy-bl.cy);
 const left=Math.hypot(bl.cx-tl.cx,bl.cy-tl.cy);
 const right=Math.hypot(br.cx-tr.cx,br.cy-tr.cy);
 if(top<W*.40||bottom<W*.54||left<H*.55||right<H*.55||
    tr.cx<=tl.cx||br.cx<=bl.cx||bl.cy<=tl.cy||br.cy<=tr.cy||
    top/bottom<.60||top/bottom>1.17||left/right<.78||left/right>1.28)return null;
 return chosen.map(q=>({x:q.cx,y:q.cy}));
}

function scanGray(gray,W,H){
 if(!gray||gray.length!==W*H||W<350||H<480)return {aligned:false,reason:'resolution'};
 const {components}=measure(gray,W,H);
 const corners=chooseAnchors(components,W,H,gray);
 if(!corners)return {aligned:false,reason:'registration_markers',found:components.length};
 const map=homography(corners);
 if(!map)return {aligned:false,reason:'perspective'};
 const dot=(x,y)=>{const p=map(x,y);return Math.hypot(p.x,p.y);};
 const measured={},conflicts=[];
 for(const [key,[x,y]] of Object.entries(fields)){
  // Amostra concentrada no centro: a borda impressa fica fora da medida.
  let dark=0,n=0;
  for(let dy=-2.5;dy<=2.5;dy+=1)for(let dx=-2.5;dx<=2.5;dx+=1){
   const pt=map(x+dx,y+dy),xx=Math.round(pt.x),yy=Math.round(pt.y);
   if(xx>=0&&xx<W&&yy>=0&&yy<H){n++;dark+=gray[yy*W+xx]<150?1:0;}
  }
  if(n<26)return {aligned:false,reason:'field_outside_page'};
  measured[key]=dark/n;
 }
 const choose=keys=>{
  const ordered=keys.map(key=>({key,value:measured[key]})).sort((a,b)=>b.value-a.value);
  if(ordered[0].value<.58||ordered[0].value-ordered[1].value<.36||ordered[1].value>.28)return '';
  return ordered[0].key;
 };
 const answers={
  H:choose(['H1','H2','H3','H4','H5']),
  L:['L1','L2','L3','L4','L5','L6','L7'].filter(k=>measured[k]>=.58),
  T1:choose(['T10','T11','T12']),T2:choose(['T20','T21','T22'])
 };
 for(let i=1;i<=7;i++)answers['M'+i]=choose(['A','P','N','NO'].map(c=>'M'+i+'_'+c));
 const valid=!!answers.H&&!!answers.T1&&!!answers.T2&&Array.from({length:7},(_,i)=>!!answers['M'+(i+1)]).every(Boolean);
 const unsure=Object.keys(answers).filter(k=>k!=='L'&&!answers[k]);
 // "aligned" indica geometria da ficha, não que todas as respostas foram pintadas.
 // Uma opção incerta deve gerar SOMENTE a pendência daquela opção.
 // "complete" fica separado para não transformar uma dúvida em falha de enquadramento.
 return {aligned:true,complete:valid,answers,scores:measured,anchors:corners,
  reason:valid?'':'uncertain_marks',uncertain:unsure,
  template:'FICHA-V2',fieldCount:Object.keys(fields).length};
}
function scan(canvas){
 if(!canvas||!canvas.width||!canvas.height)return {aligned:false,reason:'no_canvas'};
 const W=Math.min(900,canvas.width),H=Math.round(canvas.height*W/canvas.width);
 const tmp=document.createElement('canvas');tmp.width=W;tmp.height=H;
 const ctx=tmp.getContext('2d',{willReadFrequently:true});
 ctx.drawImage(canvas,0,0,W,H);
 const pixels=ctx.getImageData(0,0,W,H).data;
 const gray=new Uint8Array(W*H);
 for(let p=0,j=0;p<pixels.length;p+=4,j++)
  gray[j]=Math.round(pixels[p]*.299+pixels[p+1]*.587+pixels[p+2]*.114);
 return scanGray(gray,W,H);
}
window.LuminaOMRv2={scan,scanGray,version:'2026-omr-v2',markers:marks,fields};
})();
/* Lumina 2026 — enquadramento automático A4 de fotografias, sem upload.
 * Não lê nem transmite dados pessoais. O leitor mantém fichas incertas em revisão.
 */
(function(){
"use strict";
const clamp=(v,lo,hi)=>Math.min(hi,Math.max(lo,v));
function median(values){if(!values.length)return 0;const a=values.slice().sort((x,y)=>x-y),m=a.length>>1;return a.length%2?a[m]:(a[m-1]+a[m])/2;}
function fitLine(points,axis){
 if(points.length<5)return null;
 const solve=list=>{
  const n=list.length,sx=list.reduce((a,p)=>a+p[0],0),sy=list.reduce((a,p)=>a+p[1],0);
  const sxx=list.reduce((a,p)=>a+p[0]*p[0],0),sxy=list.reduce((a,p)=>a+p[0]*p[1],0);
  const denominator=n*sxx-sx*sx;
  if(Math.abs(denominator)<.00001)return null;
  const slope=(n*sxy-sx*sy)/denominator;
  return {a:slope,b:(sy-slope*sx)/n};
 };
 let fit=solve(points);if(!fit)return null;
 const residuals=points.map(p=>Math.abs(p[1]-fit.a*p[0]-fit.b));
 const limit=Math.max(axis===0?7:9,median(residuals)*3.1);
 const filtered=points.filter((p,i)=>residuals[i]<=limit);
 if(filtered.length<Math.max(5,Math.ceil(points.length*.55)))return null;
 fit=solve(filtered);if(!fit)return null;
 return {...fit,n:filtered.length,dispersion:median(filtered.map(p=>Math.abs(p[1]-fit.a*p[0]-fit.b)))};
}

function headerCorners(canvas,W,H,rgba){
 // Estratégia complementar para fundo claro: localiza a faixa extensa verde-escura
 // no topo do modelo Lumina, depois estima os limites A4. Mantém falha fechada.
 const green=(x,y)=>{
  if(x<0||x>=W||y<0||y>=H)return false;
  const k=(y*W+x)*4,r=rgba[k],g=rgba[k+1],b=rgba[k+2];
  return r<155&&g<185&&b<160&&g-r>11&&g-b>-12&&g-b<65;
 };
 let yStart=-1,bestWidth=0,xL=0,xR=0;
 for(let y=2;y<Math.ceil(H*.37);y+=2){
  let count=0,first=W,last=0;
  for(let x=2;x<W-2;x+=2){
   if(green(x,y)){count++;if(x<first)first=x;last=x;}
  }
  if(count<W*.21)continue;
  if(last-first>bestWidth){bestWidth=last-first;xL=first;xR=last;yStart=y;}
 }
 if(yStart<0||bestWidth<W*.45)return null;
 let minY=H;
 for(let y=2;y<Math.min(H*.35,yStart+17);y+=2){
  let n=0;for(let x=xL+5;x<xR-5;x+=3)if(green(x,y))n++;
  if(n>(xR-xL)/3*.28)minY=Math.min(minY,y);
 }
 if(minY===H)minY=yStart;
 const topSamples=[];
 for(let x=Math.round(xL+bestWidth*.06);x<xR-bestWidth*.06;x+=Math.max(6,Math.round(bestWidth/18))){
  for(let y=Math.max(2,minY-20);y<Math.min(H*.34,minY+30);y++){
   if(green(x,y)&&green(x,Math.min(H-1,y+2))){
    topSamples.push([x,y]);break;
   }
  }
 }
 if(topSamples.length<8)return null;
 const line=fitLine(topSamples,1);
 if(!line||line.n<7||Math.abs(line.a)>.28)return null;
 const width=xR-xL,pageHeight=width*(841.8897637795277/595.2755905511812);
 const topLeft={x:xL,y:line.a*xL+line.b};
 const topRight={x:xR,y:line.a*xR+line.b};
 const driftX=-line.a*pageHeight;
 const bottomRight={x:xR+driftX,y:topRight.y+pageHeight};
 const bottomLeft={x:xL+driftX,y:topLeft.y+pageHeight};
 const corners=[topLeft,topRight,bottomRight,bottomLeft];
 if(width<W*.38||width>W*1.03||pageHeight<H*.38||
   corners.some(p=>p.x<-W*.12||p.x>W*1.12||p.y<-H*.10||p.y>H*1.12))return null;
 return {corners:corners.map(p=>({x:p.x*canvas.width/W,y:p.y*canvas.height/H})),
  method:"cabeçalho escuro",confidence:.71,metrics:{headWidth:width/W,topSlope:line.a}};
}

function documentCorners(canvas){
 if(!canvas||canvas.width<180||canvas.height<210) return null;
 const W=Math.min(480,canvas.width),H=Math.round(canvas.height*W/canvas.width);
 if(H<200||H>950)return null;
 const c=document.createElement("canvas");c.width=W;c.height=H;
 const ctx=c.getContext("2d",{willReadFrequently:true});ctx.drawImage(canvas,0,0,W,H);
 const rgba=ctx.getImageData(0,0,W,H).data;
 const headerAlternative=()=>headerCorners(canvas,W,H,rgba);
 const gray=new Float32Array(W*H);
 for(let i=0,j=0;i<rgba.length;i+=4,j++)gray[j]=rgba[i]*.299+rgba[i+1]*.587+rgba[i+2]*.114;
 // Caixa suavizada: ignora escrita e pequenas sombras sem apagar a borda da folha.
 const integral=new Float64Array((W+1)*(H+1));
 for(let y=1;y<=H;y++){
  let sum=0;
  for(let x=1;x<=W;x++){
   sum+=gray[(y-1)*W+x-1];
   integral[y*(W+1)+x]=integral[(y-1)*(W+1)+x]+sum;
  }
 }
 const blur=(x,y,r=4)=>{
  const x0=clamp(Math.round(x-r),0,W-1),x1=clamp(Math.round(x+r),0,W-1);
  const y0=clamp(Math.round(y-r),0,H-1),y1=clamp(Math.round(y+r),0,H-1);
  return (integral[(y1+1)*(W+1)+x1+1]-integral[y0*(W+1)+x1+1]-integral[(y1+1)*(W+1)+x0]+integral[y0*(W+1)+x0])/((x1-x0+1)*(y1-y0+1));
 };
 const border=[],center=[];
 for(let yy=0;yy<=9;yy++)for(let xx=0;xx<=9;xx++){
  const x=Math.round((.015+.97*xx/9)*(W-1)),y=Math.round((.015+.97*yy/9)*(H-1));
  if(xx<2||xx>7||yy<2||yy>7)border.push(blur(x,y,3));
  if(xx>=3&&xx<=6&&yy>=3&&yy<=6)center.push(blur(x,y,6));
 }
 const bg=median(border),paper=median(center);
 if(paper-bg<20||paper<155)return headerAlternative(); // Falha fechada em mesa branca de baixo contraste.
 const threshold=bg+clamp((paper-bg)*.50,11,50);
 const above=(x,y)=>blur(x,y)>=threshold;
 // Encontra a maior faixa clara que cruza o centro nas linhas de amostragem.
 function horizontal(y){
  const runs=[];let start=-1,last=-1;
  for(let x=4;x<W-4;x+=2){
   if(above(x,y)){if(start<0)start=x;last=x;}
   else if(start>=0&&x-last>12){runs.push([start,last]);start=-1;last=-1;}
  }
  if(start>=0)runs.push([start,last]);
  const plausible=runs.filter(r=>r[1]-r[0]>W*.30);
  if(!plausible.length)return null;
  plausible.sort((a,b)=>((b[1]-b[0])-Math.abs((b[0]+b[1])/2-W/2)*.3)-((a[1]-a[0])-Math.abs((a[0]+a[1])/2-W/2)*.3));
  return plausible[0];
 }
 const left=[],right=[];
 for(let y=Math.round(H*.22);y<H*.80;y+=Math.max(5,Math.round(H*.022))){
  const span=horizontal(y);if(!span)continue;
  left.push([y,span[0]]);right.push([y,span[1]]);
 }
 const leftLine=fitLine(left,0),rightLine=fitLine(right,0);
 if(!leftLine||!rightLine||Math.min(leftLine.n,rightLine.n)<9)return headerAlternative();
 const cx=H*.53;
 const xl=leftLine.a*cx+leftLine.b,xr=rightLine.a*cx+rightLine.b;
 const width=xr-xl;
 if(width<W*.33||width>W*.96)return headerAlternative();
 // Detecta o limite inferior, amostrando colunas próximas ao centro da folha.
 const bottom=[];
 for(let j=1;j<=15;j++){
  const x=Math.round(xl+(xr-xl)*j/16);
  let last=-1,gap=0,started=false;
  for(let y=Math.round(H*.43);y<H*.98;y+=2){
   const white=above(x,y);
   if(white){started=true;last=y;gap=0;}
   else if(started){gap+=2;if(gap>17)break;}
  }
  if(last>H*.6&&last<H*.98)bottom.push([x,last]);
 }
 const bottomLine=fitLine(bottom,1);
 if(!bottomLine||bottomLine.n<6)return headerAlternative();
 const centerX=(xl+xr)/2;
 const bottomCenter=bottomLine.a*centerX+bottomLine.b;
 // Estimativa física da altura A4. Cabeçalho verde pode ocultar a borda superior na máscara branca.
 const estimatedTop=bottomCenter-1.4142*width;
 if(estimatedTop<-H*.09||estimatedTop>H*.43)return headerAlternative();
 // Ajusta o topo pela borda com maior contraste perto da altura geométrica A4.
 function edgeColor(x,y){
  const xx=Math.round(x),yy=Math.round(y),ra=5;
  if(xx<ra||xx>=W-ra||yy<ra||yy>=H-ra)return 0;
  let upper=[0,0,0],lower=[0,0,0],n=0;
  for(let dx=-4;dx<=4;dx+=2){
   let i=((yy-4)*W+xx+dx)*4,j=((yy+4)*W+xx+dx)*4;
   for(let k=0;k<3;k++){upper[k]+=rgba[i+k];lower[k]+=rgba[j+k];}
   n++;
  }
  return Math.sqrt(upper.reduce((z,a,k)=>z+(a-lower[k])**2,0))/n;
 }
 const topSamples=[];
 const colorAt=(x,y)=>{
  const xx=clamp(Math.round(x),0,W-1),yy=clamp(Math.round(y),0,H-1),i=(yy*W+xx)*4;
  return [rgba[i],rgba[i+1],rgba[i+2]];
 };
 const diff=(one,two)=>Math.hypot(one[0]-two[0],one[1]-two[1],one[2]-two[2]);
 for(let j=2;j<=10;j++){
  const x=xl+(xr-xl)*j/12;
  const expected=estimatedTop+bottomLine.a*(x-centerX);
  const low=Math.max(9,Math.round(expected-H*.16));
  const high=Math.min(Math.round(H*.44),Math.round(expected+H*.11));
  const outside=colorAt(x,Math.max(1,low-7));
  let edge=null;
  // Primeiro limite de cor contínuo: borda da FOLHA, não a barra escura que termina 10% abaixo dela.
  for(let y=low;y<high;y+=2){
   const before=colorAt(x,y-5),after=colorAt(x,y+5),after2=colorAt(x,y+13);
   const jump=diff(before,after);
   if(jump>27&&diff(outside,after)>30&&diff(outside,after2)>27){
    edge=y;break;
   }
  }
  if(edge!==null)topSamples.push([x,edge]);
 }
 let topLine=topSamples.length>=5?fitLine(topSamples,1):null;
 if(!topLine){
  topLine={a:bottomLine.a,b:estimatedTop-bottomLine.a*centerX,n:0};
 }
 const intersect=(lineX,lineY)=>{
  const y=(lineY.a*lineX.b+lineY.b)/(1-lineY.a*lineX.a);
  return {x:lineX.a*y+lineX.b,y};
 };
 const points=[
  intersect(leftLine,topLine),intersect(rightLine,topLine),
  intersect(rightLine,bottomLine),intersect(leftLine,bottomLine)
 ];
 const length=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
 const topWidth=length(points[0],points[1]),bottomWidth=length(points[3],points[2]);
 const avgHeight=(length(points[0],points[3])+length(points[1],points[2]))/2;
 const ratio=(topWidth+bottomWidth)/2/avgHeight;
 const area=Math.abs(points.reduce((sum,p,i)=>{
  const q=points[(i+1)%4];return sum+p.x*q.y-q.x*p.y;
 },0)/2);
 const normalizedArea=area/(W*H);
 if(normalizedArea<.23||normalizedArea>.98||ratio<.46||ratio>1.0||avgHeight<H*.43||
    topWidth<W*.28||bottomWidth<W*.28||
    points.some(p=>p.x<-.025*W||p.y<-.025*H||p.x>W*1.025||p.y>H*1.025)){
   return headerAlternative();
 }
 // No browser do professor, 4 cantos são identificados sem cliques.
 const confidence=clamp(Math.min(leftLine.n,rightLine.n,bottomLine.n)/12,0,1);
 return {corners:points.map(p=>({x:p.x*canvas.width/W,y:p.y*canvas.height/H})),
   confidence,estimatedTop,method:"bordas A4",metrics:{area:normalizedArea,ratio,marginContrast:paper-bg}};
}
window.LuminaAutoA4={detect:documentCorners,version:"2026-auto-1"};
})();

(function(){
'use strict';
function scan(canvas) {
 const W=Math.min(714,canvas.width),H=Math.max(1,Math.round(canvas.height*W/canvas.width));
 const tmp=document.createElement('canvas');tmp.width=W;tmp.height=H;
 tmp.getContext('2d',{willReadFrequently:true}).drawImage(canvas,0,0,W,H);
 const rgba=tmp.getContext('2d',{willReadFrequently:true}).getImageData(0,0,W,H).data;
 const ink=new Uint8Array(W*H);
 for(let i=0,j=0;i<rgba.length;i+=4,j++)ink[j]=(.299*rgba[i]+.587*rgba[i+1]+.114*rgba[i+2]<170)?1:0;
 const was=new Uint8Array(W*H),fifo=new Int32Array(W*H),shapes=[];
 const minX=Math.round(.05*W),maxX=Math.round(.92*W),minY=Math.round(.16*H),maxY=Math.round(.72*H);
 const expected=10*W/595.2756;
 for(let y=minY;y<maxY;y++)for(let x=minX;x<maxX;x++){
  const first=y*W+x;if(!ink[first]||was[first])continue;
  let lo=0,hi=0,left=x,right=x,top=y,bottom=y;
  fifo[hi++]=first;was[first]=1;
  while(lo<hi){
   const n=fifo[lo++],px=n%W,py=(n-px)/W;
   if(px<left)left=px;if(px>right)right=px;if(py<top)top=py;if(py>bottom)bottom=py;
   for(const to of [px>0?n-1:-1,px<W-1?n+1:-1,py>0?n-W:-1,py<H-1?n+W:-1]){
    if(to<0||!ink[to]||was[to])continue;
    was[to]=1;fifo[hi++]=to;
   }
  }
  const ww=right-left+1,hh=bottom-top+1,ratio=ww/hh;
  if(ww>=expected*.70&&ww<=expected*1.60&&hh>=expected*.70&&hh<=expected*1.60&&ratio>.70&&ratio<1.45)
   shapes.push({x:left,y:top,w:ww,h:hh});
 }
 const math=shapes.filter(p=>p.w>=expected*.84&&p.w<=expected*1.40&&p.h>=expected*.84&&p.h<=expected*1.40&&p.w/p.h>.75&&p.w/p.h<1.3&&p.x>.55*W&&p.x<.89*W&&p.y>.515*H&&p.y<.69*H);
 const uniq=[];
 for(const shape of math.sort((a,b)=>a.y-b.y||a.x-b.x)){
  if(!uniq.some(q=>Math.abs(q.x-shape.x)<expected*.22&&Math.abs(q.y-shape.y)<expected*.22))uniq.push(shape);
 }
 const rows=[];
 for(const q of uniq){
  const row=rows.find(r=>Math.abs(r.reduce((v,z)=>v+z.y,0)/r.length-q.y)<expected*.8);
  if(row)row.push(q);else rows.push([q]);
 }
 if(rows.length!==7||rows.some(r=>r.length<3||r.length>4)||uniq.length<26||uniq.length>28)
  return {aligned:false,reason:'anchors',anchors:uniq.length,rowSizes:rows.map(r=>r.length)};
 const full=rows.filter(r=>r.length===4);
 if(full.length<4)return {aligned:false,reason:'insufficient_math_rows',anchors:uniq.length};
 const columnCenters=Array.from({length:4},(_,j)=>
  full.reduce((sum,row)=>sum+row.slice().sort((a,b)=>a.x-b.x)[j].x,0)/full.length);
 const fits={x:[],y:[]},mapped=new Set();
 for(let i=0;i<7;i++){
  const rowMap=[];
  for(const q of rows[i]){
   let column=0,dist=Infinity;
   for(let j=0;j<4;j++){const d=Math.abs(q.x-columnCenters[j]);if(d<dist){column=j;dist=d;}}
   if(dist>expected*.80||rowMap.some(q=>q.column===column))
    return {aligned:false,reason:'math_columns_inconsistent',anchors:uniq.length};
   rowMap.push({q,column});
   fits.x.push([350+55*column,q.x]);fits.y.push([445+19*i,q.y]);mapped.add(column);
  }
 }
 if(mapped.size!==4)return {aligned:false,reason:'math_columns_missing',anchors:uniq.length};
 const linear=pairs=>{
  const n=pairs.length,mx=pairs.reduce((a,p)=>a+p[0],0)/n,my=pairs.reduce((a,p)=>a+p[1],0)/n;
  const numerator=pairs.reduce((a,p)=>a+(p[0]-mx)*(p[1]-my),0),denominator=pairs.reduce((a,p)=>a+(p[0]-mx)**2,0);
  const scale=numerator/denominator;
  return {scale,offset:my-mx*scale};
 };
 const xf=linear(fits.x),yf=linear(fits.y);
 const mapping=[];
 const push=(key,x,y)=>mapping.push([key,x,y]);
 [[40,173],[40,191],[40,209],[320,173],[320,191]].forEach(([x,y],i)=>push('H'+(i+1),x,y));
 [[40,255],[40,273],[40,291],[40,309],[320,255],[320,273],[320,291]].forEach(([x,y],i)=>push('L'+(i+1),x,y));
 [[245,360],[340,360],[445,360],[245,380],[340,380],[445,380]].forEach(([x,y],i)=>push(['T10','T11','T12','T20','T21','T22'][i],x,y));
 for(let i=0;i<7;i++)for(let j=0;j<4;j++)push('M'+(i+1)+'_'+['A','P','N','NO'][j],350+55*j,445+19*i);
 const scores={},missing=[],details={};
 for(const [key,x,y] of mapping){
  const xx=xf.scale*x+xf.offset,yy=yf.scale*y+yf.offset;
  const candidates=shapes.map(q=>({q,d:Math.hypot(q.x-xx,q.y-yy)}))
    .filter(o=>Math.abs(o.q.x-xx)<expected*1.1&&Math.abs(o.q.y-yy)<expected*.8)
    .sort((a,b)=>a.d-b.d);
  let box=candidates[0]?.q;
  if(!box){
   if(/^M[1-7]_(A|P|N|NO)$/.test(key)&&uniq.length>=26)
    box={x:Math.round(xx),y:Math.round(yy),w:Math.round(expected),h:Math.round(expected)};
   else{missing.push(key);scores[key]=0;continue;}
  }
  const l=Math.floor(box.x+box.w*.30),r=Math.ceil(box.x+box.w*.70);
  const t=Math.floor(box.y+box.h*.30),b=Math.ceil(box.y+box.h*.70);
  let count=0,dark=0;
  for(let yy=t;yy<b;yy++)for(let xx=l;xx<r;xx++){
   if(xx>=0&&xx<W&&yy>=0&&yy<H){dark+=ink[yy*W+xx];count++;}
  }
  scores[key]=count?dark/count:0;
  details[key]={x:box.x,y:box.y,w:box.w,h:box.h,offset:candidates[0]?.d??0,inferred:!candidates.length};
 }
 const choose=keys=>{
  const sorted=keys.map(key=>({key,score:scores[key]||0})).sort((a,b)=>b.score-a.score);
  return sorted[0].score>=.35&&sorted[0].score-sorted[1].score>=.18?sorted[0].key:'';
 };
 const Hkeys=Array.from({length:5},(_,i)=>'H'+(i+1));
 const Lkeys=Array.from({length:7},(_,i)=>'L'+(i+1));
 const answers={H:choose(Hkeys),L:Lkeys.filter(key=>scores[key]>=.31),
  T1:choose(['T10','T11','T12']),T2:choose(['T20','T21','T22'])};
 for(let i=1;i<=7;i++)answers['M'+i]=choose(['A','P','N','NO'].map(v=>'M'+i+'_'+v));
 const required=answers.H&&answers.T1&&answers.T2&&Array.from({length:7},(_,i)=>answers['M'+(i+1)]).every(Boolean);
 return {aligned:missing.length===0&&!!required,answers,scores,missing,anchors:uniq.length,
  shapes:shapes.length,reason:required?'':'missing_mark',details};
}
window.LuminaGradeFixa={scan,version:'2026-pdf-scan-v1'};
})();
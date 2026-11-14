
/* Navegação visual da capa — preserva a autenticação e as telas originais. */
(function(){
 "use strict";
 const $=id=>document.getElementById(id);
 const landing=$('landingView'),login=$('loginView'),app=$('appView');
 const access=$('btnHeaderAccess'),logout=$('btnLogout');
 const headLinks=Array.from(document.querySelectorAll('[data-head-page]'));
 if(!landing||!login||!app)return;
 function sync(){
   const active=!app.classList.contains('hidden');
   const authenticating=!login.classList.contains('hidden');
   if(active){landing.classList.add('hidden');login.classList.add('hidden');}
   else if(authenticating){landing.classList.add('hidden');}
   else{landing.classList.remove('hidden');}
   access?.classList.toggle('hidden',active);
   if(!active)logout?.classList.add('hidden');
   const current=active?document.querySelector('.nav-btn.current')?.dataset.page:'visao';
   for(const b of headLinks)b.classList.toggle('is-current',b.dataset.headPage===current);
 }
 function toLogin(target){
   if(!app.classList.contains('hidden'))return navigate(target||'visao');
   landing.classList.add('hidden');login.classList.remove('hidden');sync();
   window.scrollTo({top:0,behavior:'instant'});
   window.requestAnimationFrame(()=>{if(target&&$('teacherMagicEmail'))$('teacherMagicEmail').focus({preventScroll:true});});
 }
 function toLanding(){
   if(!app.classList.contains('hidden'))return navigate('visao');
   login.classList.add('hidden');landing.classList.remove('hidden');sync();
   window.scrollTo({top:0,behavior:'instant'});
 }
 function navigate(target){
   const button=document.querySelector('.nav-btn[data-page="'+target+'"]');
   if(button&&!app.classList.contains('hidden'))button.click();
   else toLogin(target);
   sync();
 }
 access?.addEventListener('click',()=>toLogin());
 document.querySelectorAll('[data-public-action]').forEach(b=>b.addEventListener('click',()=>{
   const target=b.dataset.publicAction;
   if(target==='home')toLanding();
   else if(target==='login')toLogin();
   else navigate(target);
 }));
 headLinks.forEach(b=>b.addEventListener('click',()=>{
   const page=b.dataset.headPage;
   if(page==='home')toLanding();
   else navigate(page);
 }));
 document.querySelectorAll('[data-back-to-landing]').forEach(b=>b.addEventListener('click',e=>{e.preventDefault();toLanding();}));
 const watcher=new MutationObserver(sync);
 watcher.observe(app,{attributes:true,attributeFilter:['class']});
 watcher.observe(login,{attributes:true,attributeFilter:['class']});
 const navWatcher=new MutationObserver(sync);
 document.querySelectorAll('.nav-btn').forEach(b=>navWatcher.observe(b,{attributes:true,attributeFilter:['class']}));
 sync();
})();

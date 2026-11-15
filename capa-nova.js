/* Navegação da capa pública e privada do Painel das Aprendizagens.
   Não altera autenticação, permissões, leitor ou gravação dos resultados.
   A capa continua acessível durante uma sessão autenticada. */
(function(){
 "use strict";
 const $=id=>document.getElementById(id);
 const landing=$('landingView'),login=$('loginView'),app=$('appView');
 const access=$('btnHeaderAccess'),logout=$('btnLogout');
 const headLinks=Array.from(document.querySelectorAll('[data-head-page]'));
 if(!landing||!login||!app)return;

 // A página inicial é a primeira vista, inclusive quando o Supabase restaura uma sessão.
 // appView mantém sua classe de autenticação intacta; o CSS só troca o que é exibido.
 let showLandingForSignedIn=true;
 function setHidden(el,hidden){
   if(el&&el.classList.contains('hidden')!==hidden)el.classList.toggle('hidden',hidden);
 }
 function sync(){
   const signedIn=!app.classList.contains('hidden');
   const authenticating=!login.classList.contains('hidden');
   const showHome=signedIn?showLandingForSignedIn:!authenticating;

   setHidden(landing,!showHome);
   if(signedIn)setHidden(login,true);
   document.body.classList.toggle('landing-home-mode',signedIn&&showHome);

   // Na capa com sessão ativa, um botão abre o painel sem solicitar login novamente.
   setHidden(access,signedIn&&!showHome);
   if(access){
     const label=signedIn?'♙ Abrir painel':'♙ Acessar';
     if(access.textContent!==label)access.textContent=label;
   }
   if(!signedIn)setHidden(logout,true);

   const current=showHome?'home':signedIn?document.querySelector('.nav-btn.current')?.dataset.page:'home';
   for(const b of headLinks){
     const selected=b.dataset.headPage===current;
     if(b.classList.contains('is-current')!==selected)b.classList.toggle('is-current',selected);
   }
 }
 function toPanel(target){
   const destination=target||'visao';
   if(app.classList.contains('hidden')){
     showLandingForSignedIn=false;
     setHidden(landing,true);
     setHidden(login,false);
     sync();
     window.scrollTo({top:0,behavior:'instant'});
     return;
   }
   showLandingForSignedIn=false;
   // Se a aba já estava selecionada, mesmo assim remover o modo capa.
   const button=document.querySelector('.nav-btn[data-page="'+destination+'"]');
   if(button)button.click();
   sync();
   window.scrollTo({top:0,behavior:'instant'});
 }
 function toHome(){
   if(!app.classList.contains('hidden')){
     showLandingForSignedIn=true;
   }else{
     setHidden(login,true);
   }
   sync();
   window.scrollTo({top:0,behavior:'instant'});
 }

 access?.addEventListener('click',()=>toPanel('visao'));
 document.querySelectorAll('[data-public-action]').forEach(b=>b.addEventListener('click',()=>{
   const dest=b.dataset.publicAction;
   if(dest==='home')toHome();
   else if(dest==='login')toPanel('visao');
   else toPanel(dest);
 }));
 headLinks.forEach(b=>b.addEventListener('click',()=>{
   const page=b.dataset.headPage;
   if(page==='home')toHome();else toPanel(page);
 }));
 document.querySelectorAll('[data-back-to-landing]').forEach(b=>b.addEventListener('click',e=>{
   e.preventDefault();toHome();
 }));
 // Observa apenas transições reais de autenticação e de página.
 // O sync não modifica essas classes quando já estão no estado pretendido.
 const watcher=new MutationObserver(sync);
 watcher.observe(app,{attributes:true,attributeFilter:['class']});
 watcher.observe(login,{attributes:true,attributeFilter:['class']});
 const navWatcher=new MutationObserver(sync);
 document.querySelectorAll('.nav-btn').forEach(b=>navWatcher.observe(b,{attributes:true,attributeFilter:['class']}));
 sync();
})();

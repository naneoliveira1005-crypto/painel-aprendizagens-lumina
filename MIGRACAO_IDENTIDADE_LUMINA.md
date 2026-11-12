# Migração segura — domínio e e-mails institucionais Lumina
Status: PREPARADA · DNS e SMTP ainda NÃO alterados

## Estado verificado
- Site: https://naneoliveira1005-crypto.github.io/painel-aprendizagens-lumina/
- Proposta: https://painel.lumina-br.com/
- O domínio lumina-br.com está registrado no Squarespace (confirmado por comunicações de renovação do titular).
- DNS autoritativo: ns-cloud-e1..e4.googledomains.com.
- MX institucional atual: smtp.google.com — preservar integralmente.
- Na última consulta, painel.lumina-br.com ainda não tinha entrada CNAME.
- GitHub Pages está funcionando no domínio antigo; arquivo CNAME ainda não presente no repositório.
- Não alterar a URL de login das professoras antes da verificação do novo domínio.

## Sequência planejada e reversível
1. Acessar Squarespace Domains como titular e localizar lumina-br.com > DNS settings.
2. Criar SOMENTE este registro, sem remover os existentes:
   Tipo: CNAME
   Host/nome: painel
   Destino/valor: naneoliveira1005-crypto.github.io
   TTL: padrão do provedor
   Não incluir o caminho /painel-aprendizagens-lumina no valor CNAME.
3. Confirmar propagação DNS pública e ausência de conflito A/AAAA/CNAME para painel.
4. Configurar GitHub > repositório > Settings > Pages > Custom domain: painel.lumina-br.com.
   Verificar HTTPS, redirecionamentos e carregamento de JS/CSS/imagens.
5. Em Supabase do projeto da Escola Sônia Maria:
   Authentication > URL Configuration:
   Site URL: https://painel.lumina-br.com/
   Redirect URLs: manter a URL antiga do GitHub Pages e adicionar a nova raiz (e index.html se necessário).
   Só definir a nova Site URL quando os acessos pela nova URL estiverem testados.
6. No envio de e-mails do Supabase (Auth > SMTP Settings):
   configurar SMTP institucional usando credenciais protegidas em painel, nunca no repositório.
   Nome do remetente sugerido: Lumina | Painel das Aprendizagens.
   Endereço de remetente institucional: usar conta ou alias verificado do domínio lumina-br.com.
   Testar entrega, SPF/DKIM/DMARC e fluxo de clique sem expor senhas.
7. Testar numa conta docente previamente autorizada:
   receber link, entrar, conferir apenas turmas atribuídas, sair/entrar novamente;
   verificar que a coordenação mantém acesso e que as matrículas/dados não mudaram.
8. Só então comunicar o novo endereço às professoras e atualizar manuais/QR de acesso.
9. Reversão: manter credenciais, DNS/MX existentes, URLs antigas permitidas;
   em caso de falha, restaurar configuração anterior antes de distribuir novo link.

## Observações
- NÃO usar o e-mail da coordenação como domínio/site: e-mail identifica a conta, domínio identifica o endereço web.
- NÃO transferir o projeto Supabase nem trocar a conta GitHub; nenhuma dessas ações é necessária para usar um domínio da Lumina.
- Dados pedagógicos e contas de estudantes não fazem parte da migração e devem permanecer intocados.
- A mudança do domínio depende de sessão administrativa do Squarespace, e a mudança do remetente depende de configurar SMTP no Supabase.
- Não marcar concluído até que DNS + HTTPS + login + e-mail tenham sido testados em produção.

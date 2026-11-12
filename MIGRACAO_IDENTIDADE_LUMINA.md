# Migração segura — domínio e e-mails institucionais Lumina
Status: BLOQUEADA NA REAUTENTICAÇÃO DO SQUARESPACE · DNS e SMTP ainda NÃO alterados; domínio personalizado no GitHub foi revertido por segurança

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


## Execução e reversão de segurança — 11/11/2026 (noite)
- Conferido em navegador autenticado que `lumina-br.com` aparece como domínio ativo administrado pela conta da Lumina Educacional no Squarespace, com acesso a detalhes DNS.
- Tentativa de adicionar CNAME `painel` para `naneoliveira1005-crypto.github.io` foi bloqueada por exigência de novo login/2FA do Google ao acionar “Adicionar registro”. **Não foi criado nenhum novo registro DNS**. MX/SPF/DKIM existentes não foram alterados.
- A configuração de domínio personalizado `painel.lumina-br.com` foi salva temporariamente no GitHub Pages, mas, diante da falha em adicionar DNS, foi **removida do GitHub Pages na mesma sessão**, restaurando o endereço anterior que permaneceu acessível. Não alterar novamente domínio personalizado até que DNS tenha sido publicado e verificado.
- Necessário reautenticar o perfil Squarespace com 2FA no ato da alteração, sem compartilhar senha em chat. Depois: criar CNAME, verificar propagação, configurar novamente custom domain GitHub, testar HTTPS, corrigir allowlist Supabase Auth, checar login.
- **Pedido adicional da usuária:** retirar também a vinculação administrativa de “Nani”, e não somente da URL. O repo ainda pertence a `naneoliveira1005-crypto`. A mudança de domínio **não transfere propriedade do repositório**. Para separar totalmente, será preciso uma conta ou organização GitHub administrada pela Lumina e um processo deliberado de transferência de repositório — com a anuência e controle das credenciais pelas responsáveis; não iniciar transferência sem identificar destino e proteger o funcionamento.


## Organização própria GitHub da Lumina — 12/11/2026
- Organização **criada**, gratuita e vazia: https://github.com/lumina-educacional; contato institucional `luminaeducacional.consultoria@lumina-br.com`.
- Criada pela sessão `naneoliveira1005-crypto`, atual titular/owner inicial da organização. **NÃO constitui ainda administração independente de Nair**.
- Tentativa de convidar `priscilapossi3@gmail.com` como administradora foi **bloqueada antes do envio** pela confirmação de segurança `sudo mode`/2FA do GitHub da conta criadora. Não registrar convite como enviado; não compartilhar código em chat.
- Antes de transferir repositório escolar: Nair precisa autorizar a operação no GitHub e convidar Priscila como **Owner** (GitHub docs permitem convidar para role Owner na organização gratuita), Priscila precisa possuir sua própria conta GitHub, com e-mail verificado, aceitar convite e ter acesso administrativo confirmado.
- Somente depois disso avaliar transferência exclusiva do repo `painel-aprendizagens-lumina` e adequação GitHub Pages, DNS Squarespace e Supabase redirect URL. Repositórios `Cartas-de-Percurso` e `memorias-em-movimento-cenpec-2026` **não tocar**.


## Ativação pública do domínio institucional — 12/11/2026
- A usuária criou no Squarespace o registro DNS CNAME host `painel` para `naneoliveira1005-crypto.github.io`, TTL 4 horas. Confirmado no DNS público do Google com status 0 e resposta correspondente.
- No GitHub Pages do repositório escolar (ainda em `naneoliveira1005-crypto`), foi configurado e salvo o Custom domain `painel.lumina-br.com`; fonte de publicação main/root preservada. Arquivo CNAME verificado no repositório com conteúdo correto.
- Teste por navegador externo confirmou `https://painel.lumina-br.com/` via HTTPS exibindo 'Lumina · Painel de Aprendizagens' e formulário de entrada, com URL final correta.
- Teste do endereço anterior `https://naneoliveira1005-crypto.github.io/painel-aprendizagens-lumina/` confirmou redirecionamento automático para o novo endereço.
- GitHub ainda relatou em sua tela DNS check 'in progress' e Enforce HTTPS indisponível no instante da configuração; embora HTTPS público tenha respondido, verificar futuramente estado final do certificado e Enforce HTTPS.
- Não foi feito teste autenticado real do Magic Link nem alteração das URLs permitidas em Supabase Auth. Antes de comunicar docentes, validar redirect URL do domínio novo no projeto Supabase escolar e testar login com professora autorizada e Priscila.
- Organização `lumina-educacional` criada gratuitamente, com duas contas Owner conforme inspeção do GitHub: `naneoliveira1005-crypto` e `020721Sonia` (aparentemente a conta de Priscila; confirmar identidade com a responsável). **Repositório ainda NÃO transferido**, para evitar romper link DNS ou autenticação.
- Próxima fase de transferência administrativa exige: confirmar conta Owner de Priscila, preparar mudança do CNAME para `lumina-educacional.github.io` após transferência do repo, realinhar custom domain no GitHub Pages e reconfirmar URLs Supabase antes do corte.

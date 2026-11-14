# Continuidade do projeto — Painel das Aprendizagens · Escola Sônia Maria

**Atualizado em:** 11/11/2026 · Salvador/BA · final da noite

## Orientação para retomar em outro chat

Retome o desenvolvimento e a verificação do **Painel das Aprendizagens da Escola Sônia Maria**, com a linguagem objetiva, cuidadosa e prática já adotada com a coordenação. Antes de fazer qualquer mudança, **leia este documento e os arquivos atuais do GitHub, confira o banco do Supabase e não suponha que algo está publicado sem confirmar o deploy**. Não peça à usuária que reconte o projeto do zero.

## Ambiente e referências

- Produção: https://naneoliveira1005-crypto.github.io/painel-aprendizagens-lumina/
- GitHub: `naneoliveira1005-crypto/painel-aprendizagens-lumina` (branch main)
- Supabase: projeto `qqygivtxxuhjmexvphma` (integração da Escola Sônia Maria). **Não há credenciais ou senhas neste documento**.
- Versão de entrada na data: `index.html` carrega `aplicativo.js?v=20261111-individual-e-revisao-m5-v32`.
- Leitor carregado na aba Leitura de fichas: `leitor-v5.html?v=20261111-revisao-m5-omr-v20`.
- Módulo óptico: `leitor-omr-v2.js?v=20261111-marcadores-e-m5-v3`.
- Gerador de impressão: `fichas-personalizadas.js`.
- Verificar os commits de publicação com GitHub Actions; houve falhas intermitentes de deploy em versões antigas.

## Objetivo e funcionamento acordado

A escola/secretaria imprime **fichas padronizadas já individualizadas**, com nome, turma, QR próprio e quatro marcas de alinhamento. A professora **não imprime, não recorta etiquetas, não marca X**. Ela aplica as atividades, **pinta completamente os quadradinhos da ficha de correção OMR V2**, digitaliza pelo Google Drive em PDF (pode conter várias páginas) ou tira foto JPG/PNG e envia ao painel. O leitor compara QR e respostas. Os resultados ficam **provisórios para conferência**; somente a coordenação autoriza publicação oficial e gráficos. Não inventar resultados quando a leitura é incerta.

Há 16 turmas (1º A ao 5º C, conforme banco) e **449 estudantes cadastrados**. Verificação em 11/11/2026: **0 avaliações oficiais no projeto**. As **2 avaliações de teste do 3º B**, antes publicadas por engano, foram retiradas da área oficial mediante confirmação expressa da usuária e **arquivadas com seus 2 históricos e lote de origem** na tabela privada `app_private.assessment_test_archive` (7 entradas). Há **6 fichas OMR V2 de ensaio em 3º B aguardando conferência** (lote de 1 e lote de 5); **7 registros de testes antigos de 2º A** continuam pendentes de matrícula. As 449 matrículas ativas foram preservadas. O 3º B conta com 30 estudantes ativos, nenhum oficialmente avaliado. Não apagar ou publicar esses registros inadvertidamente.

## Atualização solicitada e aplicada neste atendimento

A usuária mostrou um PDF de cinco fichas pintadas: a tela indicou **4 prontas, 1 com pendências (M5 — grupos iguais e repartição)**. O sistema acrescentava dois avisos desnecessários quando apenas M5 era incerto: alinhamento geral e segunda verificação da grade. A análise concluiu que a geometria e a presença de uma marcação são conceitos diferentes.

Alterações já feitas em GitHub:
1. O gerador de impressão continua com modelo **único OMR V2**. Em **Avaliações**, o antigo botão **“Imprimir 5 fichas para validação” foi substituído por “Imprimir ficha individual do estudante”**, com seletor de **turma e estudante**. Foram mantidos os botões **“Imprimir todas as fichas de correção da turma”** e **“Imprimir avaliação completa da turma”**.
2. O leitor OMR passou a informar separadamente `aligned:true` para as quatro referências e `complete:false` se faltar uma resposta. O leitor não acrescenta avisos genéricos da grade quando a geometria V2 é válida; **M5 continua pendente se o preenchimento for incerto**, sem adivinhar o valor.
3. A seção de revisão permite correção pontual, **somente depois de marcar a confirmação explícita de que a pessoa comparou a resposta com a ficha original**, e desde que o QR V2 e os marcos estejam íntegros. A correção manual **não publica automaticamente**.
4. Atualização publicada pelo `index.html` com cache busting v32. Confirmar GitHub Actions e o carregamento público antes de pedir novo teste.

**Não afirmar que o PDF real de cinco páginas agora terá 5 prontas automaticamente:** as cinco fichas, em especial a página com M5 incerto, precisam de conferência real. Caso a usuária entregue esse PDF no chat novo, comparar as respostas reconhecidas com as páginas originais e investigar o percentual de preenchimento de M5; não liberar marca duvidosa por redução indiscriminada de limiar.

## Fluxo e estado do banco

- O fluxo testado com sucesso é: **Leitura de fichas → Escolher PDF/foto → Analisar lote inteiro → Conferir respostas → Consolidar fichas válidas → Enviar e salvar lote para conferência → aguardar “LOTE SALVO”**.
- A mensagem “LOTE SALVO” só aparece após confirmação do Supabase. Ao trocar de página, o **contador transitório do leitor zera**, mas **lotes confirmados permanecem armazenados**. A leitura não armazena o PDF/fotografia original no banco; preservar arquivo institucional.
- A usuária já confirmou com captura a gravação da primeira ficha OMR pintada no banco.
- O perfil de coordenação pedagógica ativo é Priscila. Há **8 pré-cadastros docentes, mas 0 contas de professoras ativas** e 0 vínculos autenticados (última consulta). O código e RLS para envio docente às turmas autorizadas foram preparados, porém **a ativação e o teste com contas reais continuam pendentes**. NÃO criar contas, liberar senhas ou enviar convites sem aprovação e conferência de nomes/e-mails/turmas.
- Supabase: função `public.lumina_stage_csv_pilot` salva provisoriamente, checa papel e turma. Políticas RLS `lumina_teacher_assigned_*` restringem docentes a turmas em `staff_classrooms`; resultados oficiais exigem conferência e etapa separada.
- Auditoria anterior: proteção de senha vazada desabilitada no Supabase Auth; consultar https://supabase.com/docs/guides/auth/password-security#password-strength-and-leaked-password-protection.

## Prioridades ao retomar

1. Conferir que os três botões de impressão e o seletor de estudante aparecem no link público atualizado. Testar impressão individual de **1 folha A4** com QR válido, sem imprimir fichas reais em massa desnecessariamente.
2. Examinar a página **M5** do PDF de cinco fichas. O resultado mostrado no painel era **4 prontas / 1 em revisão**. Se a marca for legível, a professora/coordenação poderá revisar só esse campo com confirmação visual. Se for difícil de ler, pedir digitalização mais nítida da página; não estimar resposta.
3. Confirmar que após consolidar e salvar o lote a confirmação “LOTE SALVO” permanece válida, e conferir os registros provisórios no banco.
4. Quando o fluxo de cinco fichas estiver seguro, preparar a impressão por turma e **habilitação controlada de contas docentes**, com acesso somente às respectivas turmas.
5. Não apagar histórico, não publicar piloto como avaliação oficial e não inventar sucesso de testes não executados.

## Comando curto para o próximo chat

> Retome o Painel das Aprendizagens da Escola Sônia Maria do ponto em que paramos. Leia primeiro o arquivo `CONTINUIDADE_PAINEL_SONIA_MARIA.md` no repositório GitHub `naneoliveira1005-crypto/painel-aprendizagens-lumina`. Confira a versão publicada e o Supabase da Escola Sônia Maria. Estamos usando exclusivamente fichas OMR V2 preenchidas, com QR individual. No último teste, cinco fichas foram analisadas: quatro prontas, uma pendente em M5. Foi solicitado trocar o botão de cinco fichas por impressão individual, mantendo os dois modos coletivos; o código foi atualizado. Continue a partir da validação dessas alterações, sem pedir que eu reconte tudo e sem publicar resultados de teste.


## Correção do cadastro antes da aplicação real (11/11/2026)

A usuária confirmou que **as duas avaliações oficiais anteriores do 3º B eram testes, não resultados de aprendizagem reais**. Executada limpeza transacional com backup reversível, arquivando 2 linhas de `assessment_results`, 2 de `assessment_result_history`, 2 de `assessment_import_rows` e 1 de `import_batches`. A auditoria privada está em `app_private.assessment_test_archive`, sem acesso `anon` ou `authenticated`. Conferência posterior: **0 resultados oficiais**, **30 estudantes ativos no 3º B**, **449 matrículas ativas no projeto**. Os lotes OMR piloto de 1 e 5 registros permanecem provisórios e **não entram nos gráficos**. Não publicar os testes. Os próximos passos são organizar a aplicação real e concluir vinculação/autenticação das professoras.

**Orientação essencial à usuária:** não precisa imprimir todas as fichas do 3º B só para continuar o desenvolvimento. A escola imprimirá quando estiver pronta para aplicar a avaliação real com a turma. Não repetir pilotos desnecessários.


## Acesso das professoras sem senha (11/11/2026 — versão v34)

Solicitação: organizar automaticamente os acessos e vínculos, sem cadastro manual pela usuária, com roteiro de uso simples. **Implementado o primeiro acesso por link no e-mail**, sem senhas distribuídas. O login por senha da coordenação foi preservado.

- Frontend: `index.html` com formulário `teacherMagicForm`/botão **Receber link de acesso por e-mail**; `aplicativo.js` usa `supabase.auth.signInWithOtp` e `shouldCreateUser:true`, depois chama RPC `public.lumina_activate_registered_teacher` no primeiro login confirmado; docente abre na aba **Leitura de fichas**.
- Backend: função privada `app_private.lumina_activate_teacher_internal` (`SECURITY DEFINER`, `search_path=''`) verifica `auth.uid()`, `auth.users.email_confirmed_at` e igualdade do e-mail com a lista docente pré-cadastrada; concede papel teacher e **somente** as turmas de `staff_directory_classrooms`, atualizando `staff_directory.status='active'`. Wrapper público `SECURITY INVOKER` autorizado só a `authenticated`; `anon` não executa. Não utilizar `service_role` no frontend.
- **16 vínculos** em 8 professoras (duas turmas cada). **5/8 com e-mail**: Ana Paula Silva Brito `aninhasbritto2015@gmail.com` (5º A, 5º C); Andréa (1º A,1º B); Carla (2º A,2º C); Cirlene (3º A,3º C); Genilzan (2º B,4º D). **3/8 ainda sem e-mail**: Ana Rita (4º A e 4º C), Joselita (4º B e 5º B), Roseli (3º B e 3º D). Não confundir Roseli com Eulimar sem confirmação documental; o banco atual atribui essas turmas a Roseli.
- A consulta de autenticação confirmou **0 contas docentes ativadas** até a implantação; professores precisam abrir o link enviado para ativação efetiva. **Não foram enviados convites/emails automaticamente** neste desenvolvimento.
- **Atenção antes de distribuir amplamente**: o SMTP do Supabase para enviar links a e-mails externos **não foi validado**. A documentação oficial informa que o SMTP padrão pode enviar somente a membros autorizados do projeto; pode ser necessário configurar SMTP próprio em Authentication → Emails → SMTP Settings. Testar o primeiro link com uma professora real e verificar recebimento. Não afirmar que e-mails foram entregues até confirmar.
- Um guia de **uma página A4** (Word e PDF, com QR de acesso) foi gerado na conversa em `Guia_Professoras_Painel_Sonia_Maria.docx` e `Guia_Professoras_Painel_Sonia_Maria.pdf`. Uso: abrir link, digitar e-mail, receber link, abrir e-mail, analisar e enviar as fichas, esperar **LOTE SALVO**.
- Dashboard de professora RLS por `staff_classrooms`; a coordenação permanece responsável pela publicação oficial. Nunca enviar senha por WhatsApp.

**Próxima ação:** confirmar entrega real de um link de autenticação e início de sessão docente com cadastro autorizado, verificar se no banco `staff_profiles.role='teacher'` e dois vínculos são criados; só então distribuir orientação às cinco professoras que possuem e-mail. Solicitar os três e-mails ausentes para completar as demais, sem permitir acesso por e-mail aleatório.


## Atualização de acesso, turmas e alertas (11/11/2026, noite)

- **Ana Rita Andrade Lima** teve o e-mail `andradeanarita06@gmail.com` incluído diretamente e verificado em `public.staff_directory`. Atribuições já existentes: 4º A e 4º C. Conta ainda em `pending`, pois exige confirmação do e-mail pela própria professora.
- Verificado no Supabase: **8 professoras, 16 vínculos únicos, 16 turmas cobertas, zero turma sem professora**, cada docente possui **exatamente duas turmas**. Isso não conflita com `staff_classrooms` (chave composta `user_id,classroom_id`) nem com `app_private.is_assigned_teacher` (verifica a turma solicitada contra todos os vínculos da conta). A ativação por e-mail copia todas as turmas, não apenas a primeira.
- **6 de 8 professoras possuem e-mail**. Faltam **Joselita Ribeiro Santana** (4º B, 5º B) e **Roseli** (3º B, 3º D). Não criar e-mails fictícios.
- Criado log protegido `app_private.teacher_activation_log` e trigger `lumina_log_teacher_activation` que registra transição `pending/invited→active` com auth_user_id confirmado. Só serviço administrativo pode ler o log; sem acesso anônimo ou dos usuários docentes.
- Criada automação `Avisar ativações das professoras`, checagem horária condicional em America/Bahia. Ao detectar eventos ainda não avisados, conferir `staff_profiles`, `staff_classrooms` e as turmas e enviar aviso à usuária. Atualizar `notified_at` para evitar alertas duplicados. Não mencionar nomes de alunos nas notificações.
- **Próxima validação real**: uma das professoras com e-mail, por exemplo Ana Paula ou Ana Rita, solicitar link no painel e confirmar recebimento no e-mail. Verificar SMTP real e redirect URL do Supabase; o envio para endereços externos pode exigir SMTP próprio, conforme documentação. Só após teste real afirmar acesso efetivo à plataforma.


## Problema de login móvel e domínio institucional (11/11/2026 — versão v35)

A professora Ana Rita recebeu o e-mail de link mágico e, ao clicar, viu uma página vazia do Supabase no navegador do celular. No banco, `auth.users` já apresentava e-mail confirmado e login registrado, **mas `staff_directory.status='pending'`**, sem `staff_profiles` nem vínculos de `staff_classrooms`. Portanto, não afirmar que ela já consegue enviar fichas.

Teste seguro de ativação com transação **ROLLBACK** confirmou que a função `public.lumina_activate_registered_teacher()` vincula **exatamente 4º A e 4º C**, sem contas duplicadas. Estado persistente não foi modificado.

Correção no frontend (`aplicativo.js?v=20261111-corrigir-retorno-login-v35`): `emailRedirectTo` aponta para a **raiz** do site via `new URL('./', window.location.href).href`, e o callback `SIGNED_IN` trata chegada tardia da sessão no mobile com chamada assíncrona fora do callback e proteção contra duplicidade. Tratamento explícito de limite de e-mails 429. GitHub Pages concluiu deploy v35 com sucesso.

**Pendente externo:** verificar em Supabase → Authentication → URL Configuration o Site URL e redirect allowlist da URL pública `https://naneoliveira1005-crypto.github.io/painel-aprendizagens-lumina/` (incluir também `.../index.html` se aplicável). O conector Supabase atual não disponibiliza edição desse ajuste de Auth; precisa painel administrativo. A tela vazia no domínio Supabase é compatível com URL de retorno inadequada; não confirmar causa única sem verificar configuração. Log Auth teve ao menos um 429 `over_email_send_rate_limit`; não orientar repetição de links sem intervalo. Antes de liberar vários acessos, configurar SMTP de uso real se necessário.

**Branding solicitado:** a coordenação quer que o endereço público não exiba `naneoliveira1005-crypto`, e prefere identidade de Priscila associada à Lumina. A conta atual de coordenação está cadastrada com `priscilapossi3@gmail.com` (não `gamail.com`). O identificador `naneoliveira...` é o usuário do GitHub na URL, **não** o e-mail de acesso; para alterar a URL sem alterar cadastros, usar domínio próprio da Lumina sob controle DNS, com configuração GitHub Pages e posterior atualização da allowlist do Supabase Auth. Não transferir repositório nem modificar DNS sem instruções e acesso ao domínio.

---

## Atualização consolidada — 14/11/2026 (pré-aplicação)

**Esta seção prevalece sobre situações antigas de acesso, piloto e versão do leitor descritas acima.** As etapas anteriores são mantidas apenas como histórico. A aplicação real das avaliações ainda não ocorreu.

### Estado do banco da Escola Sônia Maria
- Supabase exclusivo da escola: `qqygivtxxuhjmexvphma`. **Nunca usar o projeto de Barrocas.**
- 449 estudantes ativos, distribuídos em 16 turmas, todos vinculados à sua turma e com QR individual. Não há QR duplicado nem matrícula sem vínculo.
- 0 resultados oficiais em `assessment_results`; o ciclo de avaliação 2026 permanece em rascunho.
- 14 registros experimentais, pertencentes a 4 lotes, **arquivados em 14/11, sem exclusão**: linhas `assessment_import_rows.validation_status='rejected'`, notas iniciadas com `ARQUIVADO COMO TESTE EM 2026-11-14`, lotes `import_batches.status='failed'`. Sete tinham vínculo com matrícula real e sete eram registros mais antigos sem vínculo. Todos foram preservados, mas não bloqueiam novos lançamentos nem participam dos resultados.
- Conferência posterior ao arquivamento: 14 linhas preservadas, 4 lotes arquivados, 0 fichas em revisão ativa, 0 resultados oficiais, 449 matrículas preservadas.
- Estrutura para envio: até 10 fichas da mesma turma por lote; previsão agregada de **51 lotes** para as 449 fichas, respeitando as 16 turmas.

### Leitor OMR V2 e revisão da interface
- Corrigida a recuperação de marcas geométricas em `leitor-omr-v2.js`, com novas tentativas controladas por limiar de contraste e versão de cache atualizada em `leitor-v5.html`. Não flexibilizar aceitação de marcas ambíguas.
- Com ficha experimental preenchida: Priscila confirmou **1 pronta, 0 pendências**, exportou CSV correto com LP e M1–M7; enviou e recebeu `LOTE SALVO`. A gravação foi verificada no banco, e a ficha do 1º A apareceu no histórico depois de atualizar.
- Em `aplicativo.js`, inicializada a variável `pedagogicalReviewMessage` que antes ocultava a seção “Conferência pedagógica — fichas armazenadas”.
- Depois de arquivar pilotos, os registros experimentais são excluídos da contagem de pendências ativas e o histórico apresenta “Arquivado · teste”.
- Ajuste semântico em `aplicativo.js`: a opção T11 da ficha impressa é **“Recita”**, portanto o histórico deve mostrar **“Recita o texto de memória”** (NÃO “Receita”); M7 é “Leitura de dados”.
- O fluxo real segue: imprimir → aplicar → pintar os quadradinhos → enviar foto/PDF OMR → revisar → consolidar → salvar provisoriamente → conferência pedagógica da coordenação → publicação oficial, separadamente.

### Testes de geração, navegação e segurança
- Revisão estática do gerador `fichas-personalizadas.js` com estudantes inteiramente fictícios para 1º, 2º, 3º, 4º e 5º anos: `correction` gera 1 página A4/estudante, `activities` gera 2, `full` gera 3. Gerador rejeitou estudante inativo, turma incorreta, QR inválido e duplicata.
- A conferência do material confirma estrutura com cinco palavras, frase, texto de memória, narrativa e sete atividades de Matemática por ano, além de roteiro/gabarito docente. **A validação visual de uma impressão física A4 em tamanho real continua pendente.**
- A visita ao site público mostrou login, demonstração e leitor acessíveis. Na demonstração, dados são fictícios e os recursos de impressão e envio real não ficam expostos. Essa ausência é uma proteção intencional; para impressão real, usar conta de coordenação.
- RLS conferida com transações de leitura simulando cada uma das três professoras ativas: Ana Rita vê somente 4º A (33) e 4º C (25), Cirlene só 3º A (28) e 3º C (26), Roseli só 3º B (30) e 3º D (24). A validação navegando pelo perfil docente real ainda está pendente.
- Os acessos de cinco docentes continuam aguardando confirmação: Ana Paula (5º A/C), Andréa (1º A/B), Carla (2º A/C), Genilzan (2º B/4º D) e Joselita (4º B/5º B). Joselita já tem registro Auth, mas seu e-mail não está confirmado; as quatro outras ainda não têm conta Auth criada. Priscila solicitou novamente os acessos e aguarda retorno.
- Advisor Supabase: proteção contra senhas comprometidas desabilitada (pendência de configuração administrativa); duas tabelas de log/arquivo em `app_private` com RLS sem políticas, isolamento intencional sem acesso docente.

### Operação e próximas etapas
- Gerada planilha operacional `Controle_Operacional_Painel_Sonia_Maria_2026.xlsx` com Resumo, Turmas, Lotes, Acessos, Checklist e Orientacoes: 449 fichas OMR; 898 páginas de atividades; 1.347 páginas caso todas as atividades e correções sejam impressas; 51 lotes planejados.
- **Não imprimir 449 novas fichas para testar; não solicitar repetição da aplicação.** As professoras ainda não aplicaram. Aguarda-se autorização da escola para a impressão/entrega e a futura aplicação.
- A aplicação de **um primeiro lote REAL** e a conferência prática do acesso no navegador de uma professora devem ocorrer depois da aplicação ou quando a docente estiver disponível.
- Prioridades independentes das professoras: conferir uma impressão física A4 com QR e quatro marcas, validar gabaritos e a versão final dos instrumentos com a coordenação, organizar logística e garantir publicação controlada.
- Não inserir dados fictícios em matrícula real. Não reativar, concluir conferência ou publicar lotes arquivados. Antes de publicar os primeiros resultados reais, verificar a integridade do lote e autorização da coordenação.

**Versão de entrada revisada em 14/11/2026:** `index.html` referencia `aplicativo.js?v=20261114-revisao-instrumentos-v43`, que inclui a correção de T11. Confirmar no site se a publicação já propagou antes de orientar uma atualização de navegador.


### Complemento de homologação e segurança — 14/11/2026
- Adicionado em `aplicativo.js` o botão **Imprimir ficha fictícia de conferência A4** exclusivamente à área de Avaliações da coordenação autenticada. Invoca a função já existente `LuminaFichas.printTestSheet()`, gerando uma ficha fictícia não vinculada a matrícula; botão ausente da demonstração e do perfil docente. `index.html` referencia `aplicativo.js?v=20261114-impressao-ficticia-v44`. A renderização em navegador autenticado e a impressão física ainda precisam da conferência de Priscila.
- Criados para controle técnico o PDF `Ficha_Ficticia_OMR_V2_Conferencia_A4.pdf` (reprodução de conferência do layout do gerador) e o documento `Homologacao_Fichas_e_Acesso_Docente_Sonia_Maria_2026.docx`, com roteiro de checagem física, critérios pedagógicos e validação do acesso docente. A amostra PDF tem 1 folha A4 e o QR fictício foi decodificado no teste digital.
- Identificada permissão excessiva nas políticas `results_authorized_insert` e `results_authorized_update`: `can_manage_classroom()` também autorizava docentes, de modo que uma professora autenticada poderia gravar resultados oficiais via API sem conferência da coordenação. Aplicada migração `restrict_official_results_writes_to_pedagogical_admin_20261114` no **Supabase da escola** para restringir INSERT/UPDATE de `assessment_results` ao papel `pedagogical_admin`, mantendo SELECT para docentes de turmas atribuídas.
- Verificação após migração: política INSERT/UPDATE agora exige `app_private.has_school_role(..., ['pedagogical_admin'])`; Ana Rita (teacher) retorna `may_write_official=false`, Priscila (admin) `true`. 0 registros oficiais, 14 testes arquivados e 3 professoras ativas mantidos. Não foi publicado nenhum resultado.
- Não há sessão de professora ativa disponível no navegador automatizado conectado; por segurança, não se deve simular que o teste no navegador real foi concluído. A validação final do login, navegação e envio de uma professora requer a própria docente (Ana Rita, Cirlene ou Roseli) entrar pelo acesso pessoal, sem compartilhar senha nem links de autenticação.
- Atenção ao material pedagógico: texto de memória e suas opções impressas são **Lê / Recita / Não lê** (T11=Recita); a palavra “Receita” foi erro anterior de rótulo, corrigido no GitHub. Priscila deve homologar didaticamente os instrumentos antes da aplicação.

### Homologação física do modelo OMR V2 — 14/11/2026
- Priscila comunicou a conclusão da conferência física de **uma ficha fictícia de teste, impressa em A4**.
- Respostas da coordenação: (1) folha inteira sem cortes: **sim**; (2) QR Code e quatro referências de alinhamento visíveis: **sim**; (3) textos, LP e M1–M7 nítidos e legíveis: **sim**; (4) quadradinhos bem posicionados e fáceis de preencher: **sim**.
- **Decisão:** homologação física do layout **APROVADA**, sem correções de impressão identificadas nessa amostra. Evidência: declaração da coordenação; não confundir com verificação independente da impressão física.
- **Sem publicação de dados**, alteração de cadastros ou avaliação real. Permanecem pendentes: homologação pedagógica dos instrumentos 1º–5º, navegação em uma conta docente real, demais cinco ativações, aplicação e publicação controlada dos primeiros lotes reais.

### Parecer técnico-pedagógico de pré-homologação (14/11/2026)
- Foi relido o arquivo original `fichas-personalizadas.js` (instrumentos LP e Matemática 1º–5º, roteiros de professoras, gabaritos, OMR) e o painel `aplicativo.js`. A revisão é **análise técnica**, não homologação já aprovada por Priscila.
- LP: ditado de cinco palavras no campo semântico animais (BORBOLETA, CAVALO, GATO, PATO, BOI), uma frase, parlenda de memória, narrativa A Lebre e a Tartaruga em versões de complexidade crescente e duas perguntas de compreensão por ano. A lista básica é útil para hipóteses de escrita, mas **não permite inferir domínio ortográfico completo dos 4º/5º anos**. A compreensão oral tem registro de observação manual; não é indicador OMR automatizado.
- Matemática: sete situações por ano, total de 35; gabaritos `keys` confrontados com os 35 enunciados sem erros aritméticos identificados. Há progressão de números, operações e interpretação. **Não é diagnóstico exaustivo de todos os eixos matemáticos.**
- Pontos de ajuste *a submeter à aprovação pedagógica*: (1) esclarecer a régua A/P/N/NO: **A = demonstrou com autonomia e resposta adequada**, **P = demonstrou parcialmente ou com ajuda**, **N = não demonstrou nesta atividade**, **NO = não observado**; (2) M7 atualmente traz dados em linha separados por ponto e vírgula e rotulados 'TABELA' — propõe-se apresentá-los em uma tabela simples de duas colunas, preservando dados, perguntas, gabaritos e os sete indicadores; (3) explicitar no roteiro que M4 em cada ano observa apenas a operação apresentada, M5 apenas a situação de multiplicação/divisão apresentada e que as conclusões da lista de palavras dos 4º/5º são restritas às hipóteses de escrita observadas.
- Ajustes **não pedagógicos** já aplicados ao painel: substituído texto que instruía marcar X por **pintar completamente os quadradinhos OMR V2**, corrigido 'leitura local dos X' e a descrição do escopo da Matemática para não anunciar atividade específica de comparação/ordenação inexistente. O gerador e os gabaritos originais não foram alterados. `index.html` carrega `aplicativo.js?v=20261114-instrucoes-omr-v46`.
- **Aguardando sinalização de Priscila** para autorizar ou pedir revisão dos ajustes pedagógicos propostos. Não publicar resultados, reimprimir em massa nem alterar critérios do instrumento sem essa decisão. Após aprovação e eventual atualização de layout, repetir teste de A4 em uma ficha fictícia, sem dados de estudante.

### Homologação pedagógica aprovada e implementada — 14/11/2026
- **Decisão expressa da coordenação:** Priscila aprovou os três ajustes pedagógicos do 1º ao 5º ano em 14/11/2026. A aprovação abrange (1) critérios A/P/N/NO claros; (2) M7 em tabela de duas colunas; (3) orientações docentes sobre limites de interpretação.
- Alterado `fichas-personalizadas.js`, fonte original de impressão. Critérios completos no roteiro: `A` = aprendizagem demonstrada com resposta adequada e autonomia; `P` = parcialmente ou com ajuda; `N` = não demonstrada *nesta atividade*; `NO` = não observado. Na ficha OMR a legenda é abreviada para permanecer na mesma linha, sem mover quadradinhos ou quatro marcos.
- M7 é apresentada como tabela simples por ano (três linhas e duas colunas), seguida pela mesma pergunta, mantendo exatamente os dados originais: frutas (1º), livros lidos (2º), brinquedos (3º), visitas à biblioteca (4º), arrecadação (5º). M7 permanece o sétimo indicador e a questão da página é intitulada **Leitura de dados**. O código e as respostas de referência não mudaram.
- O roteiro docente orienta que leitura do enunciado pela professora não implica automaticamente categoria `P`; M4 e M5 têm evidência restrita à situação proposta; o ditado de 4º/5º não comprova domínio ortográfico integral; compreensão oral e observações permanecem manuais.
- Em `aplicativo.js`, os rótulos dos gráficos, tabelas, detalhes de estudante e histórico protegido foram alinhados aos critérios aprovados; foi incluída uma legenda interpretativa na seção de Matemática. Não houve alteração de códigos A/P/N/NO ou do formato dos JSONs armazenados.
- **Testes executados:** comparação programática dos objetos originais `poems`, `lp`, `mat`, `keys` antes/depois (idênticos); reconstrução literal dos cinco dados/enunciados de M7 em tabelas (idênticos); simulação de `printSchoolPacket` nos anos 1–5 e modos `correction`/ `activities`/ `full` (15 cenários válidos, respectivamente 1/2/3 páginas definidas pelo gerador), verificação de 5 roteiros docentes, QR fictício V2, quatro marcas OMR; renderização fictícia do painel oficial e da legenda de Matemática sem inconsistências. Código JS com sintaxe válida.
- **Versão carregada em `index.html`:** `fichas-personalizadas.js?v=20261114-homologacao-pedagogica-v11` e `aplicativo.js?v=20261114-homologacao-pedagogica-v47`. Commit de index `c9d57e8da4e415c22baf6c01432581478302c044`.
- **Não foram inseridos, revisados ou publicados dados reais** durante estes ajustes. Depois das mudanças de M7, ainda é recomendável conferir **uma impressão da página de atividades de Matemática**, especialmente que a tabela não seja cortada ou passe do limite da folha. Isso é checagem gráfica, não nova aprovação de critérios.

### Homologação gráfica M7 concluída — 14/11/2026
- **Priscila confirmou explicitamente que as cinco tabelas M7 (1º, 2º, 3º, 4º e 5º anos) estão corretas** após a atualização dos instrumentos.
- Os cinco critérios de conferência visual comunicados anteriormente foram considerados atendidos pela coordenação: tabela em duas colunas, três linhas de dados, dados legíveis, pergunta abaixo da tabela e página sem cortes ou aperto.
- **Resultado:** homologação física (A4), pedagógica (ajustes A/P/N/NO, M7 e orientações) e gráfica final do M7 registradas como aprovadas pela coordenação, para os instrumentos de 1º a 5º ano.
- Nenhuma mudança de enunciado, gabarito ou posição OMR necessária após essa sinalização. **Não houve publicação de resultados de estudantes.**
- Próxima fase: verificar perfil docente autenticado e permissões reais; concluir as cinco ativações pendentes, revisar controle de recebimento e fazer o primeiro teste com um lote real somente depois da aplicação.

### Pré-liberação docente — auditoria de acesso e publicação (14/11/2026)
- Após a confirmação de Priscila de que os cinco M7 impressos estão corretos, iniciada a fase de preparação operacional, **sem aplicação real e sem publicação oficial**.
- Consulta atualizada do Supabase da escola `qqygivtxxuhjmexvphma`: 449 matrículas ativas, 16 turmas, 1 ciclo 2026 em rascunho, 0 resultados oficiais, 0 fichas aguardando conferência, 0 lotes ativos, 14 testes preservados e arquivados.
- **Acessos confirmados:** Ana Rita (4º A/4º C, 33+25 estudantes), Cirlene (3º A/3º C, 28+26) e Roseli (3º B/3º D, 30+24). Consultas em transações `READ ONLY`, simulando cada usuário com RLS, mostraram apenas as duas turmas previstas e autorização para publicações oficiais = `false`.
- **Pendente:** Ana Paula, Andréa, Carla e Genilzan sem autenticação concluída; Joselita com conta Auth mas e-mail ainda não confirmado; Priscila já fez nova solicitação de acesso e aguarda retorno das professoras. Não reenviar convites ou resetar contas sem necessidade.
- RPCs de lote `lumina_stage_csv_pilot` e publicação `lumina_publish_reviewed_batch` usam `SECURITY INVOKER`, não permitem execução anônima; staging contempla docentes atribuídos e publicação exige `pedagogical_admin`. Políticas de `assessment_results` para inserção/atualização já restringem publicação à coordenação.
- Teste em memória do componente da aba **Leitura de fichas**: perfil docente mostra leitor, confirmação do envio e histórico dos próprios lotes; não exibe seção de publicação institucional. Perfil de coordenação exibe conferência. Demonstração não oferece leitor real. **O teste não substitui navegação autenticada por uma professora real.**
- Última auditoria dos registros de Auth teve quatro eventos relacionados a OTP/verificação no intervalo padrão de 24 horas, sem ocorrências de HTTP 429, 400 ou 500 nessas amostras; **isso não comprova que Joselita recebeu o e-mail**. A confirmação dela continua pendente.
- **Próximo passo que requer participação docente:** uma das três professoras ativas deverá entrar pelo próprio e-mail e verificar visualmente seu painel, suas duas turmas e a aba de leitura, sem enviar dados fictícios. Quando as provas forem aplicadas, conferir o primeiro lote real antes de qualquer publicação.

### Verificação no navegador: modo Demonstração / perfil Professora
- Em 14/11/2026 foi realizada navegação pública no site `https://painel.lumina-br.com/` exclusivamente em `MODO DEMONSTRAÇÃO`, selecionando `Simular perfil: Professora`.
- Confirmado: navegação nas páginas Visão geral, Turmas e Avaliações, apenas com estrutura e dados fictícios; seção Equipe e acessos mostra somente orientações; **Leitura de fichas** bloqueada no modo demo (nenhum envio nem salvamento reais).
- Esse teste **não equivale** à autenticação de uma professora real nem comprova que seu link individual funciona. O aplicativo usa `signInWithOtp` (link por e-mail, sem senha definida pela escola); **não entrar por e-mail pessoal das professoras nem criar senha em nome delas**.
- Alternativa segura para validação de autenticação sem envolver as docentes: criar somente mediante autorização uma conta de teste com e-mail controlado pela equipe autorizada, sem autorização para estudantes reais, e desativá-la após testar. Não inserir alunos fictícios em turmas reais nem publicar resultados para executar esse teste. A validação de acesso individual das três docentes ativas permanece pendente.

### Acesso temporário de homologação de autenticação — 14/11/2026
- Foi autorizado o uso de **e-mail controlado pela usuária** para um teste exclusivo de autenticação; por privacidade, não registrar o e-mail no GitHub público.
- Solicitado **uma única vez** o link OTP em https://painel.lumina-br.com/ pelo formulário "Professora: entrar sem senha"; interface confirmou "Link solicitado". **Entrega e clique no e-mail ainda não confirmados.**
- Conta em `auth.users` criada pelo fluxo legítimo `signInWithOtp`, sem senha criada pela equipe; e-mail ainda não confirmado na última consulta. Associado perfil `teacher` **TESTE TEMPORARIO - HOMOLOGACAO LUMINA (SEM TURMAS)** em `staff_profiles` somente para permitir verificar a navegação autenticada, sem adicionar `staff_directory`, sem vínculos em `staff_classrooms`, sem matrícula fictícia e sem modificar a lista docente oficial.
- Verificação via RLS em transação somente leitura com a identidade de teste: **0 estudantes, 0 turmas, 0 resultados oficiais, 0 lotes e 0 vínculos**; a estrutura de 1 ciclo rascunho pode ser vista. `may_publish_official=false`.
- Conferência posterior: 449 matrículas, 16 turmas, 8 professoras planejadas, 16 vínculos docentes previstos e 0 resultados oficiais — inalterados.
- **Pendente:** usuário deve abrir o e-mail no próprio dispositivo, clicar apenas uma vez no link individual, ver se entra no painel e se a aba "Leitura de fichas" abre. Esta conta não permitirá selecionar alunos nem enviar fichas reais, intencionalmente.
- **Após testar, desativar/remover o perfil temporário** em `staff_profiles` e, se possível por fluxo administrativo próprio do Auth, encerrar também o acesso Auth experimental. Não modificar/afetar contas de professoras reais.

### Autenticação da identidade temporária confirmada — 14/11/2026
- Usuária confirmou que entrou normalmente com o e-mail de homologação, sem senha de professora. Consulta posterior em `auth.users` confirmou `email_confirmed_at` preenchido e `last_sign_in_at` não nulo. **Fluxo real de autenticação por e-mail está validado para a identidade experimental.**
- Identidade de teste no `staff_profiles` continua como `teacher`, ativa e com identificação inequívoca de teste, **sem vínculo em `staff_directory` ou `staff_classrooms`**.
- Nova simulação RLS autenticada/READ ONLY retornou 0 matrículas, 0 turmas, 0 resultados oficiais, 0 lotes e 0 linhas de importação. O acesso real à informação dos alunos não foi usado.
- Inspeção de `aplicativo.js` com dados vazios e papel de professora: a aba `Leitura de fichas` produz o iframe `leitor-v5.html`, o título `1. Enviar ficha preenchida` e a mensagem `Nenhum lote enviado`, sem controles de publicação; validação de sintaxe JS aprovada.
- Conferência pós-login: 449 matrículas, 16 turmas, oito professoras oficiais, 0 resultados oficiais, 0 linhas em revisão e 14 pilotos arquivados; intactos.
- **Pendente para encerramento do acesso temporário:** usuária confirmar que clicou na aba `Leitura de fichas` no seu navegador e viu o leitor. Depois disso, desativar imediatamente o perfil temporário de `staff_profiles`. Sem reproduzir acesso docente a dados reais; a verificação de cada conta docente real continua pendente.

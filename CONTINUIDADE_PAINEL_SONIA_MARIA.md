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

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

Há 16 turmas (1º A ao 5º C, conforme banco) e **449 estudantes cadastrados**. Última consulta: **2 avaliações oficiais** já existentes no 3º B; **1 ficha OMR V2 pintada salva provisoriamente** em 3º B; **7 registros históricos antigos** do 2º A pendentes de matrícula. Não apagar ou publicar esses registros inadvertidamente.

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

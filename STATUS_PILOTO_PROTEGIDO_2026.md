# Painel das Aprendizagens — atualização da integração piloto (08/11/2026)

## Contexto e estado confirmado
- Escola Municipal Sônia Maria Pereira do Nascimento; coordenação: Priscila.
- GitHub: `naneoliveira1005-crypto/painel-aprendizagens-lumina`; site: https://naneoliveira1005-crypto.github.io/painel-aprendizagens-lumina/
- Supabase da escola: projeto `qqygivtxxuhjmexvphma` (não confundir com o projeto Por Escrito do mestrado).
- 449 estudantes e 16 turmas confirmados. 449 QR Codes individuais distintos.
- Resultado real de leitura: foto A4 da ficha fictícia identificada como "1 pronta; 0 pendências" com leitor V5 corrigido.
- Banco conferido após as alterações: 449 estudantes; 0 resultados oficiais; 1 lote anterior; 7 linhas provisórias anteriores.

## Implementação efetuada nesta continuação
1. Aproveitada tabela existente `import_batches` e `assessment_import_rows`.
2. Política RLS `lumina_admin_stage_pilot_insert`: somente a coordenação autenticada pode inserir linhas provisórias correspondentes a QR, matrícula confirmada e turma/ciclo do mesmo estabelecimento. Status: `awaiting_pedagogical_review`.
3. Função Supabase `public.lumina_stage_csv_pilot`, SECURITY INVOKER, acessível à função `authenticated` mas não a `anon`/PUBLIC. Lotes atômicos de 1–10 fichas de UMA turma, ciclo 2026 em rascunho, prevenção de arquivo já importado e matrícula duplicada em revisão. Guarda respostas e vínculo a estudantes, sem escrever em `assessment_results`.
4. `aplicativo.js`: checagem técnica de CSV, vínculo com cadastro, botão de guarda provisória apenas após validação completa, geração de SHA-256 e chamada RPC com confirmação explícita. Novo leitor integrado em iframe na área **Leitura de fichas** para a coordenação; lote consolidado é transferido por postMessage estritamente mesma origem e fonte de iframe verificada. Limpeza de dados temporários ao sair da conta.
5. `leitor-v5.html`: botão **Enviar lote para o Painel da Lumina** quando aberto dentro do painel.
6. `index.html`: versão da interface `20261108-piloto-direto-r3`.

## Testes executados
- JavaScript dos dois scripts passou na validação de sintaxe.
- CSV fictício com uma matrícula de teste passou na validação local; mistura de turmas e QR desconhecido foram rejeitados.
- Página pública em modo demonstração: CSV presente; o botão de registro provisório NÃO aparece sem conta autorizada.
- Supabase: a RPC é SECURITY INVOKER; authenticated tem EXECUTE; anon e PUBLIC não. Política INSERT exige admin. Nenhum resultado oficial publicado.
- **Não foi testado ainda o salvamento ponta a ponta com a sessão real de Priscila.** Não declare o upload validado antes desse teste.

## Como testar no perfil da coordenação
1. Entrar no site como Priscila.
2. Abrir **Leitura de fichas** → **Abrir leitor dentro do painel**.
3. Carregar 1 a 10 fotos legíveis de uma mesma turma, com autorização institucional, e clicar **Analisar lote inteiro**.
4. Conferir os X com as folhas físicas. Consolidar fichas válidas e clicar **Enviar lote para o Painel da Lumina**.
5. Conferir os nomes, turmas e QR Codes exibidos. Se não houver pendência, clicar **Guardar este lote piloto para conferência pedagógica**.
6. Confirmar que o painel indica **EM CONFERÊNCIA**, e confirmar no banco que `assessment_results` continua com zero registros não aprovados.

## Limites e pendências críticas
- A funcionalidade nova grava SOMENTE respostas provisórias, QR e matrícula: **não armazena fotografias/PDFs originais**. Esses arquivos deverão ser preservados institucionalmente até ser implementado armazenamento em bucket privado com RLS.
- Ainda não há decisão de publicação após validação pedagógica, nem gestão de revisão docente completa.
- Equipe das professoras e permissões individuais exigem revisão antes da liberação escolar.
- **Não imprimir as 449 fichas até validar o piloto autenticado, o armazenamento dos originais e as consultas por perfil.**
- Não misturar registros do mestrado com Supabase escolar.

## Próximo trabalho prioritário
Testar a integração autenticada com Priscila, confirmar atomicidade/erros, depois implementar armazenamento seguro dos originais em bucket privado, consulta por turma e liberação controlada para professoras. Simplificar ao máximo: fotografia + conferência das exceções, sem exportação manual de CSV no fluxo definitivo.

## Incidente de leitura real e correção (09/11/2026)
- Uma foto de ficha REAL do 3º ano foi reconhecida com 1 pendência, apesar de cinco campos sinalizados como não identificados terem X visível: T1, T2, M3, M4, M6. **Não publicar foto, nome ou QR** da criança em repositório público.
- A coordenação clicou inadvertidamente em “Salvar revisão”. Na aplicação atual, esse botão alterava apenas estado da aba do leitor V5, não a base de dados. Confirmação no Supabase: 0 resultados oficiais, 0 novos registros em `awaiting_pedagogical_review`; as 7 linhas provisórias anteriores e 1 lote anterior continuam intactos.
- Diagnóstico com a imagem real em ambiente local: em Matemática, 27 dos 28 contornos de caixas foram detectados de modo confiável; a marca do 28º quadradinho era visível. O algoritmo anterior exigia quantidade exata e recorria à leitura por coordenadas aproximadas, com falsos “sem marca única”.
- Correção em `leitor-v5.html`: leitura alternativa `getAnswersFromMathAnchors`, que estima a grade com 4 colunas e 7 linhas a partir de pelo menos 24 quadradinhos, recalibra outras seções, permite até dois contornos incompletos, usa contraste por alternativas e mantém dúvidas em **Revisar** em vez de inventar marcações.
- Validação: análise geométrica do arquivo real em Python recuperou todas as 46 posições e X observados. A versão JS do algoritmo passou em teste sintético com um contorno ausente. Teste público de ficha fictícia no navegador: 1 pronta, 0 pendências, todos os X esperados identificados. **Ainda falta teste da foto real pelo navegador da coordenação na versão nova.**
- Botão adicional: `Desfazer revisão e reler automaticamente` para uma ficha individual; campo de revisão manual renomeado para `Aplicar revisão nesta aba (não publica)`, com diálogo de confirmação.
- Publicação: `index.html` versão `20261109-releitura-grade-v10`; acesso pelo `leitor-v5.html?v=20261109-releitura-grade-v10`.
- Não liberar as 449 fichas para aplicação em massa antes de comprovar o resultado da foto REAL na versão nova e piloto de gravação protegida/autorizada.

## Revisão de arquitetura: digitalização tipo Drive e QR ampliado (08–09/11/2026)
- **Problema real identificado:** uma fotografia do 3º ano gerava `QR não identificado` e `Imagem fora da proporção A4` embora a ficha impressa e suas marcações fossem visíveis. Não armazenar nem publicar imagem, nome ou QR real da criança no repositório.
- **Causa do erro:** o leitor diminuía a fotografia completa antes de tentar ler QR. No arquivo local privado da foto, OpenCV decodificou o QR após ampliar o arquivo 1,25× e também ao processar um recorte da região superior direita; a detecção do papel por limiar de Otsu identificou as quatro bordas com aspecto próximo a A4. Isso demonstra que a imagem tinha informação suficiente.
- **Nova estratégia no site:** `readQr` em `leitor-v5.html` examina primeiro regiões ampliadas sem reduzir o QR; `auto-a4.js` acrescentou identificação do contorno físico pelas quatro extremidades da maior região clara. `analyzeOne` tenta leitura direta por grade + QR e só digitaliza/corrige perspectiva quando necessário. A proporção da *foto com mesa* não é confundida com a proporção da folha.
- **Proteção contra resultados falsamente "Pronta":** foi observada em QA uma habilidade L3 omitida enquanto os demais campos constavam como "Pronta". O leitor voltou a priorizar a grade completa e não aceita a falta de contornos nas seções de leitura/hipótese/texto como resposta em branco validada. O QA passou novamente com todos os X conferidos.
- **Testes verificáveis:** (1) no arquivo real, recorte QR e aumento permitiram decodificação com OpenCV; borda do papel foi detectada; (2) teste web fictício com fotografia em fundo claro retornou 1 pronta/0 pendências e todos os X corretos; (3) teste web com fotografia sintética de 899×1599, mesa escura e compressão JPEG (sem qualquer dado pessoal) retornou 1 pronta/0 pendências e todos os X corretos.
- **Limitação honesta:** ainda falta validar a *mesma fotografia real* no navegador da coordenação com a versão atual. Não afirmar 100% de acurácia sem piloto maior e amostragem de diferentes anos, iluminação, impressoras e aparelhos.
- **Versão publicada:** `index.html` carrega `aplicativo.js?v=20261109-digitalizacao-drive-v13` e o painel aponta para `leitor-v5.html?v=20261109-digitalizacao-drive-v13`.
- **Google Drive:** a digitalização do aplicativo móvel (Android/iOS) usa captura automática, detecção de bordas, filtros e correção. Ela pode ser usada pela escola para gerar PDF/JPG e carregá-los no leitor. O scanner nativo do Google não é uma função Web embutível diretamente num site estático; a versão do Painel usa um pipeline equivalente local.
- **Regra:** fotos e resultados de estudantes continuam locais até autorização e confirmação explícita da coordenação; nenhuma avaliação oficial publicada. Evitar dependência de marcação manual de cantos e de exportação manual de CSV para professoras.

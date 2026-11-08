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

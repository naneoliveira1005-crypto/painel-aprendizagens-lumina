# Protocolo de entrada em operação — primeiro lote real OMR V2

> **Escola Municipal Sônia Maria Pereira do Nascimento | Lumina | 2026**
> Preparado na homologação técnica em 14/11/2026. **Nenhum dado oficial é publicado por este documento.**

## Condições para começar
- Aplicação pedagógica real concluída; usar somente fichas de correção OMR V2 dos estudantes autorizados da escola.
- Confirmação visual de que QR, quatro marcas pretas e quadradinhos estão íntegros, preenchidos por completo (não usar X).
- Professora com acesso individual ativo e turmas corretas **ou** coordenação pedagógica autorizada. **Não usar conta experimental de homologação.**
- Turma e matrículas conferidas, ciclo diagnóstico 2026 em rascunho.

## Etapa A — Recebimento do primeiro lote (sem publicação)
1. Começar por **1 a 3 fichas reais, da mesma turma**, fotografadas com nitidez ou digitalizadas em PDF. Máximo técnico: 10 por envio.
2. Entrar em `https://painel.lumina-br.com/` com a conta institucional autorizada e abrir **Leitura de fichas**.
3. Carregar as fichas e clicar **Analisar lote inteiro**. Checar QR, quatro marcas e campos; corrigir *apenas* o que foi efetivamente verificado na folha original. Se houver incerteza, manter em revisão.
4. Clicar **Consolidar fichas válidas** e depois **Enviar e salvar lote para conferência**.
5. **Aguardar a mensagem “LOTE SALVO”**, sem sair da página antes da confirmação. Se aparecer “NÃO SALVO”, não considerar o lote entregue: verificar mensagem e histórico.
6. No histórico, conferir turma, quantidade e estado **Em conferência**. As fotos originais devem ser preservadas em local institucional protegido; o leitor não as salva no Supabase.

## Etapa B — Conferência pedagógica da coordenação
1. Priscila acessa com perfil de coordenação e abre **Leitura de fichas → Conferência pedagógica — fichas armazenadas**.
2. Para **cada ficha**, compara as marcações salvas com a **ficha original**, verifica código/turma, hipótese de escrita, leitura, textos e M1–M7. Resolver divergências **antes** de prosseguir.
3. Somente após essa comparação, aciona **Concluir conferência desta ficha (não publica)**.
4. Quando todas as fichas estiverem `ready_for_commit`, o painel oferecerá a **publicação oficial**. **Não clicar em “Publicar oficialmente” até a autorização expressa da coordenação para o primeiro lote real.** A publicação deve ocorrer apenas com avaliações reais conferidas.

## Etapa C — Verificação pós-publicação (quando autorizada)
- Confirmar que o número de avaliações oficiais aumentou **exatamente** na quantidade do lote autorizado.
- Conferir um registro individual autorizado contra a ficha original; inspecionar H, L, T1, T2 e M1–M7.
- Abrir **Avaliações → Painel de resultados por turma** e conferir cobertura (avaliados ÷ matrículas ativas), contagens de hipóteses de escrita, leitura e categorias A/P/N/NO.
- Verificar se **NO** não está sendo interpretado como N e se sem ficha **não** aparece como dificuldade de aprendizagem.
- Guardar uma ata simples da conferência e pendências, sem anexar nomes de estudantes a repositórios públicos.

## Cuidados e plano de contingência
- **Não misturar** dados fictícios ou do laboratório com os 449 estudantes reais.
- Se o leitor falhar, **não publicar resultados**. Manter a ficha original, conservar o CSV somente em ambiente restrito e registrar a mensagem de erro.
- Professoras só veem as próprias turmas; publicação oficial é exclusiva da coordenação.
- Esta é a **fase 1**. As seis ferramentas avançadas da fase 2 estão registradas separadamente no issue `#1` e só começarão depois da homologação do fluxo real.

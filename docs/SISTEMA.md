# ProLicita — Documentação do Sistema

## 1. Visão geral

O **ProLicita** é um radar de licitações públicas. Ele monitora automaticamente o **PNCP** (Portal Nacional de Contratações Públicas), cruza cada licitação publicada com o perfil de cada empresa cadastrada e avisa a empresa — no painel e por WhatsApp — quando encontra uma oportunidade compatível, já com o link do portal e do edital em mãos.

**Objetivo do produto:** eliminar o trabalho manual de garimpar o PNCP todos os dias. A empresa cadastra seu perfil uma vez (o que ela faz, onde atua, que tipo de contratação lhe interessa) e o sistema passa a vigiar o PNCP por ela.

## 2. Stack técnica

| Camada | Tecnologia |
|---|---|
| Frontend/Backend | Next.js (App Router, TypeScript), Tailwind CSS, shadcn/ui |
| Banco de dados | Neon (Postgres serverless) + Drizzle ORM |
| Autenticação | Auth.js (NextAuth v5), credenciais email/senha |
| Fonte de licitações | API pública de consulta do PNCP |
| Matching por IA | DeepSeek (API compatível com OpenAI) |
| Notificação WhatsApp | Evolution API (instância própria do usuário) |
| Hospedagem alvo | Vercel (inclui cron jobs) |

## 3. Como o sistema funciona (fluxo geral)

```
 PNCP  →  Sincronização  →  Banco (licitações)
                                   │
                                   ▼
                     Pré-filtro (região, modalidade,
                      faixa de valor, palavras-chave)
                                   │
                                   ▼
                        IA (DeepSeek) avalia se o
                        objeto da licitação combina
                        com o perfil da empresa
                                   │
                          ┌────────┴────────┐
                          ▼                  ▼
                     Relevante           Descartado
                          │
                          ▼
              Notificação no painel
              + WhatsApp para cada
                contato cadastrado
```

1. **Sincronização com o PNCP**: busca as licitações publicadas recentemente (por data, UF e modalidade) e salva/atualiza no banco local. Não busca o edital nesse momento — isso é feito depois, sob demanda, só para as licitações relevantes (para não sobrecarregar a API do PNCP).
2. **Pré-filtro (sem custo de IA)**: para cada empresa, filtra as licitações ainda não avaliadas por região de interesse, modalidade selecionada, faixa de valor e palavras-chave/descrição do perfil. Só o que passa nesse filtro vai para a IA.
3. **Avaliação por IA**: a IA lê o objeto da licitação e a descrição do perfil da empresa e decide se é uma oportunidade relevante, com uma nota (score) e uma justificativa em português.
4. **Registro do resultado**: toda licitação avaliada (relevante ou não) é registrada, para nunca ser reavaliada duas vezes pela mesma empresa.
5. **Notificação**: se for relevante, cria uma notificação no painel e envia uma mensagem de WhatsApp (via Evolution API) para cada contato cadastrado da empresa, com objeto, órgão, valor estimado, motivo do match, link do portal e link do edital.

## 4. Disparo da busca

- **Automático**: um cron job roda periodicamente (a cada 6 horas, configurável) e executa a sincronização + matching para **todas** as empresas cadastradas, em escopo nacional/todas as modalidades.
- **Manual**: a empresa pode clicar em "Buscar agora" no painel a qualquer momento — nesse caso a busca é feita apenas na região e modalidades configuradas no perfil **daquela empresa**, o que é mais rápido e mais econômico.

## 5. Cadastro e autenticação

- Cada usuário cria uma conta com nome, email e senha (login por credenciais, sem redes sociais).
- Hoje cada usuário representa uma empresa (1 conta = 1 empresa). O modelo de dados já suporta expandir para múltiplas empresas por usuário no futuro, se necessário.

## 6. Perfil da empresa

O perfil é o coração do sistema — quanto mais completo, mais precisa é a IA. Campos disponíveis:

**Dados institucionais**
- Razão social, nome fantasia, CNPJ
- Porte (ME, EPP, Médio, Grande)
- Segmento/ramo de atuação
- Telefone, email, site

**Endereço**
- Logradouro, número, bairro, CEP, município, UF

**Perfil de atuação (usado pelo matching)**
- CNAEs
- Palavras-chave de interesse
- Descrição livre do perfil (o que a empresa faz/oferece — quanto mais detalhada, melhor a IA avalia)
- Faixa de valor de interesse (mínimo e máximo por licitação)

**Região de busca**
- Lista de UFs de interesse, **ou**
- Opção "Buscar em todo o Brasil" (ignora o filtro de UF)

**Modalidades de contratação de interesse**
- Lista das 13 modalidades do PNCP (Pregão Eletrônico, Concorrência, Dispensa, Inexigibilidade, etc.)
- Se nada for selecionado, busca em **todas** as modalidades

**Contatos para WhatsApp**
- Lista de contatos (nome + número), cada um recebe as notificações de novas licitações relevantes

## 7. Telas do painel

| Tela | O que mostra |
|---|---|
| **Visão geral** (`/dashboard`) | Contador de licitações compatíveis, região monitorada, últimas licitações encontradas, botão "Buscar agora" |
| **Licitações** (`/licitacoes`) | Lista de todas as licitações relevantes para a empresa, com órgão, objeto, valor, modalidade, motivo do match e botões "Ver no portal" / "Ver edital" |
| **Detalhe da licitação** (`/licitacoes/[id]`) | Objeto completo, detalhes, justificativa da IA, links |
| **Perfil da empresa** (`/perfil`) | Formulário completo descrito na seção 6 |

## 8. Modelo de dados (tabelas principais)

- **users** — contas de login (nome, email, senha)
- **empresas** — todo o perfil descrito na seção 6, vinculado a um usuário
- **licitacoes** — cache local das licitações publicadas no PNCP (objeto, órgão, valor, modalidade, links, dados brutos da API)
- **empresa_licitacao_matches** — resultado da avaliação da IA para cada par empresa/licitação (relevante, descartado ou pendente), com nota e justificativa
- **notificacoes** — histórico de notificações enviadas (canal painel/whatsapp, status enviado/erro, mensagem)

## 9. Integrações externas (o que depende de configuração)

| Integração | Uso | Status |
|---|---|---|
| Neon (Postgres) | Banco de dados principal | ✅ Configurado |
| API do PNCP | Fonte das licitações (pública, não exige chave) | ✅ Integrado e testado com dados reais |
| DeepSeek | Avaliação de match por IA | ✅ Configurado |
| Evolution API | Envio de WhatsApp | ⚠️ URL e chave configuradas — falta o nome da instância (`EVOLUTION_INSTANCE`) para os envios funcionarem de fato |

## 10. Limitações conhecidas

- **Rate limit do PNCP**: a API pública do PNCP bloqueia temporariamente (HTTP 429) quando recebe muitas requisições em sequência. O sistema já trata isso com espera entre chamadas e novas tentativas automáticas, mas buscas muito amplas (todas as UFs + todas as modalidades) podem demorar alguns minutos.
- **Busca manual x automática**: a busca manual é sempre escopada ao perfil da empresa (mais rápida); a busca automática (cron) roda em escopo nacional para cobrir todas as empresas de uma vez.
- **1 empresa por usuário** no momento (schema já preparado para expandir).

## 11. Próximos passos sugeridos

- Finalizar a integração de WhatsApp (falta `EVOLUTION_INSTANCE`) e testar um envio real.
- Deploy em produção (Vercel), com o cron job agendado.
- Ajustar a frequência do cron conforme volume de empresas/licitações.
- (Opcional) Permitir múltiplas empresas por conta de usuário.
- (Opcional) Adicionar filtro/busca dentro da lista de licitações no painel.

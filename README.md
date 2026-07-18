# ProLicita

Radar de licitações públicas: monitora o [PNCP](https://pncp.gov.br) automaticamente,
cruza cada licitação publicada com o perfil da empresa cadastrada (filtro por
UF/palavras-chave + confirmação por IA) e notifica no painel e via WhatsApp
(Evolution API), com os links do portal e do edital.

## Stack

- Next.js (App Router, TypeScript) + Tailwind + shadcn/ui
- Neon (Postgres) + Drizzle ORM
- Auth.js (NextAuth v5) com credenciais email/senha
- DeepSeek API para o matching por IA
- Evolution API para envio de WhatsApp

## Configuração inicial

1. Instale as dependências:

   ```bash
   npm install
   ```

2. Copie `.env.example` para `.env.local` e preencha:

   - `DATABASE_URL` — crie um projeto em [neon.tech](https://neon.tech) e copie a connection string.
   - `AUTH_SECRET` — gere com `openssl rand -base64 32` (ou qualquer string aleatória longa).
   - `DEEPSEEK_API_KEY` — chave da [API DeepSeek](https://platform.deepseek.com).
   - `EVOLUTION_API_URL`, `EVOLUTION_API_KEY`, `EVOLUTION_INSTANCE` — dados da sua instância do Evolution API.
   - `CRON_SECRET` — qualquer string aleatória (protege o endpoint de cron).

3. Rode as migrations no Neon:

   ```bash
   npx drizzle-kit push
   ```

4. Suba o servidor de desenvolvimento:

   ```bash
   npm run dev
   ```

5. Acesse `http://localhost:3000`, crie uma conta, preencha o perfil da
   empresa em **Perfil da empresa** (CNAEs, palavras-chave, UF, WhatsApp) e
   clique em **Buscar agora** no dashboard para rodar a primeira busca.

## Como funciona a busca

- **Manual**: o botão "Buscar agora" chama `POST /api/licitacoes/buscar`,
  sincroniza as licitações publicadas recentemente no PNCP e roda o matching
  só para a empresa do usuário logado.
- **Automática**: em produção (Vercel), `vercel.json` agenda
  `GET /api/cron/buscar-licitacoes` a cada 6 horas, protegido pelo header
  `Authorization: Bearer $CRON_SECRET` (a Vercel injeta isso automaticamente
  quando `CRON_SECRET` está configurado nas env vars do projeto).
- **Matching**: primeiro um filtro barato por UF e palavras-chave reduz o
  volume de licitações candidatas; depois a IA (DeepSeek) avalia o objeto de
  cada uma contra a descrição do perfil da empresa e decide se é relevante.
- **Notificação**: toda licitação considerada relevante gera uma notificação
  no painel e, se a empresa tiver WhatsApp cadastrado, uma mensagem via
  Evolution API com o objeto, órgão, valor estimado, link do portal e do
  edital.

## Observações importantes

- Este ambiente de desenvolvimento não conseguiu validar as chamadas reais à
  API do PNCP (`pncp.gov.br` estava inacessível a partir do sandbox usado
  para montar o projeto). O client em `lib/pncp/client.ts` foi implementado
  com base na documentação pública da API de consulta do PNCP — teste
  localmente ou no deploy (onde o acesso à internet deve funcionar
  normalmente) e ajuste os parâmetros se algum endpoint tiver mudado.
- O formato de envio do Evolution API em `lib/notifications/whatsapp.ts`
  segue o padrão v2 (`POST /message/sendText/{instance}` com `number` e
  `text`). Se sua instância usar uma versão diferente, ajuste o corpo da
  requisição nesse arquivo.
- Cada usuário tem uma única empresa associada (MVP). O schema em
  `lib/db/schema.ts` já suporta múltiplas empresas por usuário caso isso
  seja necessário no futuro.

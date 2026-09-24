# Guia de Implantacao - JJCAC (Jiu-Jitsu para Todos)

Este guia descreve os procedimentos necessarios para realizar a implantacao (deploy) do sistema **JJCAC** de gestao de presencas, seja no ambiente de nuvem (**Vercel + Supabase Cloud**) ou na infraestrutura local da **UFPE (Docker/On-Premises)**.

---

## Pre-requisitos Gerais

Antes de iniciar qualquer uma das opcoes de deploy, sera necessario:

1. **Conta no Supabase Cloud** com um projeto criado.
2. **Credenciais do projeto Supabase** (`URL` e `ANON_KEY`) obtidas no painel de configuracoes de API.
3. **Schema do banco de dados aplicado** — execute o arquivo [`docs/SCHEMA_COMPLETO.sql`](SCHEMA_COMPLETO.sql) no SQL Editor do Supabase.
4. **Variaveis de ambiente configuradas** conforme descrito abaixo.

---

## Configuracao das Variaveis de Ambiente

Crie um arquivo `.env.local` na raiz do projeto (use o arquivo `.env.example` como modelo):

```env
# Conexao com o Supabase Cloud
NEXT_PUBLIC_SUPABASE_URL=https://sua-url-do-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-anon-key-aqui

# Codigos e chaves de seguranca (Servidor apenas - Nunca use NEXT_PUBLIC_!)
INVITE_CODE_ADMIN=SEU_CODIGO_SECRETO_ADMIN
QR_SECRET=SUA_CHAVE_SECRETA_QR
HMAC_SIGNING_KEY=SUA_CHAVE_HMAC
ENCRYPTION_KEY=CHAVE_HEX_64_CARACTERES
```

Descricao de cada variavel:

- `NEXT_PUBLIC_SUPABASE_URL`: URL do projeto no Supabase.
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Chave anonima publica para requisicoes do cliente.
- `INVITE_CODE_ADMIN`: Codigo secreto para cadastro de administradores/professores.
- `QR_SECRET`: Chave secreta para criptografia dos tokens de QR Code de presenca.
- `HMAC_SIGNING_KEY`: Chave para assinatura HMAC-SHA256 dos tokens rotativos.
- `ENCRYPTION_KEY`: Chave de criptografia AES-256-CBC para dados sensiveis (64 caracteres hex).

---

## Opcao A: Implantacao em Nuvem (Vercel + Supabase Cloud)

Esta e a opcao recomendada por sua estabilidade, escalabilidade e custo operacional minimo.

### 1. Preparando o Banco no Supabase Cloud

1. Crie uma conta gratuita no [Supabase](https://supabase.com).
2. Crie um novo projeto (ex: `jiujitsuCac`).
3. Acesse o **SQL Editor** do Supabase.
4. Execute o conteudo completo do arquivo [`docs/SCHEMA_COMPLETO.sql`](SCHEMA_COMPLETO.sql).

### 2. Deploy do Frontend na Vercel

1. Conecte o repositorio Git do projeto a sua conta [Vercel](https://vercel.com).
2. Crie um novo projeto apontando para este repositorio.
3. Nas configuracoes do projeto na Vercel, adicione as variaveis de ambiente especificadas acima.
4. Clique em **Deploy**. A Vercel compilara e servira o aplicativo automaticamente.

---

## Opcao B: Implantacao Local / On-Premises via Docker (Para TI da UFPE)

Se a TI da UFPE preferir executar a aplicacao em seus proprios servidores locais, utilize a solucao de containerizacao via Docker.

### 1. Pre-requisitos do Servidor

- Docker Engine instalado (versao 24.0 ou superior).
- Docker Compose instalado (versao 2.0 ou superior).
- Porta `3000` liberada e disponivel no servidor.

### 2. Executando o Container

1. Clone o repositorio na maquina servidora.
2. Preencha o arquivo `.env.local` na raiz com as chaves reais de producao.
3. Execute o comando abaixo para construir a imagem e iniciar em segundo plano:
   ```bash
   docker compose up -d --build
   ```
4. O Next.js sera compilado no modo `standalone` multi-stage (imagem Alpine Linux de aproximadamente 150MB) e iniciara na porta `3000`.

### 3. Gerenciando o Servico

- **Visualizar logs do sistema:**
    ```bash
    docker compose logs -f jjcac-web
    ```
- **Parar o servidor:**
    ```bash
    docker compose down
    ```
- **Verificar status do container:**
    ```bash
    docker compose ps
    ```

---

## Opcao C: Implantacao Hibrida (App na Vercel + Supabase On-Premises)

Caso a UFPE exija que todos os dados residam em seus proprios servidores:

1. A TI da UFPE pode implantar um container do PostgreSQL local com a stack do Supabase Docker (PostgreSQL + PostgREST + GoTrue Auth) em seu datacenter.
2. O endereco do banco local exposto externamente de forma segura sera configurado como `NEXT_PUBLIC_SUPABASE_URL` no painel da Vercel.
3. O deploy do frontend e realizado na nuvem da Vercel apontando para o banco de dados on-premises da UFPE.

---

## Manutencao e Migracoes do Banco

Para aplicar atualizacoes no banco de dados sem perda de dados existentes:

1. Utilize as migrations SQL contidas na pasta `supabase/migrations/`.
2. Em producao no Supabase Cloud, aplique as queries usando o SQL Editor do painel Supabase ou via CLI do Supabase.

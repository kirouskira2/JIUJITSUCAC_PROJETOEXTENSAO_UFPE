# Guia de Implantação — JJCAC (Jiu-Jitsu para Todos)

Este guia descreve os procedimentos necessários para realizar a implantação (deploy) do sistema **JJCAC** de gestão de presenças, seja no ambiente de nuvem (**Vercel + Supabase Cloud**) ou na infraestrutura local da **UFPE (Docker/On-Premises)**.

---

## 📋 Pré-requisitos Gerais

Antes de iniciar qualquer uma das opções de deploy, você precisará:

1. **Conta no Supabase Cloud** (opcional se for utilizar a versão Cloud integrada).
2. **Projeto Supabase criado** e as credenciais (`URL` e `ANON_KEY`) obtidas no painel de configurações de API.
3. **Variáveis de Ambiente configuradas** (ver seção correspondente abaixo).

---

## ⚙️ Configuração das Variáveis de Ambiente

Crie um arquivo `.env.local` na raiz do projeto (use o arquivo `.env.example` como modelo):

```env
# Conexão com o Supabase Cloud
NEXT_PUBLIC_SUPABASE_URL=https://vjakavxwjsqebekkdqjj.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-anon-key-aqui

# Códigos e chaves de segurança (Servidor apenas - Nunca use NEXT_PUBLIC_!)
INVITE_CODE_ADMIN=SEU_CODIGO_SECRETO_ADMIN
QR_SECRET=JJCAC-TATAME-UFPE
```

*   `NEXT_PUBLIC_SUPABASE_URL`: A URL do seu projeto no Supabase.
*   `NEXT_PUBLIC_SUPABASE_ANON_KEY`: A chave anônima (anon key) pública para requisições do cliente.
*   `INVITE_CODE_ADMIN`: Código secreto que os professores e administradores precisarão inserir ao se cadastrar.
*   `QR_SECRET`: Chave secreta de alta entropia para criptografar os tokens dos QR Codes de presença gerados temporariamente no tatame.

---

## ⚡ Opção A: Implantação em Nuvem (Vercel + Supabase Cloud) - Altamente Recomendado

Esta é a opção mais estável, escalável e com zero custos operacionais de manutenção de hardware.

### 1. Preparando o Banco no Supabase Cloud
1. Crie uma conta gratuita no [Supabase](https://supabase.com).
2. Crie um novo projeto (ex: `jiujitsuCac`).
3. Acesse o **SQL Editor** do Supabase.
4. Execute as migrações localizadas na pasta `./supabase/migrations` na ordem correta, ou use a CLI do Supabase para fazer o push das migrations.

### 2. Deploy do Frontend na Vercel
1. Conecte o repositório Git do projeto à sua conta [Vercel](https://vercel.com).
2. Crie um novo projeto apontando para esse repositório.
3. Nas configurações do projeto na Vercel, adicione as quatro variáveis de ambiente especificadas na seção acima.
4. Clique em **Deploy**. A Vercel buildará e servirá o app automaticamente através de sua rede Edge Global CDN.

---

## 🐳 Opção B: Implantação Local / On-Premises via Docker (Para TI da UFPE)

Se a TI da UFPE preferir rodar a aplicação em seus próprios servidores locais, utilize a solução de containerização via **Docker**.

### 1. Pré-requisitos do Servidor
*   Docker Engine instalado (versão 24.0 ou superior).
*   Docker Compose instalado (versão 2.0 ou superior).
*   Porta `3000` liberada e não sendo utilizada no servidor.

### 2. Executando o Container
1. Clone o repositório na máquina servidora.
2. Certifique-se de preencher o arquivo `.env.local` na raiz com as chaves reais de produção.
3. Execute o comando abaixo para construir a imagem otimizada e rodar em segundo plano:
   ```bash
   docker compose up -d --build
   ```
4. O Next.js será compilado no modo `standalone` multi-stage (imagem leve com Alpine Linux de apenas ~150MB) e iniciará na porta `3000`.

### 3. Gerenciando o Serviço
*   **Ver logs do sistema:**
    ```bash
    docker compose logs -f jjcac-web
    ```
*   **Parar o servidor:**
    ```bash
    docker compose down
    ```
*   **Verificar saúde do container:**
    ```bash
    docker compose ps
    ```
    O Docker possui um `healthcheck` interno configurado que faz requisições de 30 em 30 segundos na rota principal `/` para garantir o funcionamento estável.

---

## 🔀 Opção C: Implantação Híbrida (App na Vercel + Supabase On-Premises)

Caso a UFPE exija que todos os **dados** residam em seus próprios servidores locais, mas prefira a confiabilidade da Vercel para o frontend:

1. A TI da UFPE pode implantar um container do PostgreSQL local com a stack do Supabase Docker (PostgreSQL + PostgREST + GoTrue Auth) em seu próprio Datacenter.
2. O endereço do banco local exposto externamente de forma segura será colocado como `NEXT_PUBLIC_SUPABASE_URL` no painel da Vercel.
3. O deploy do frontend é feito na nuvem da Vercel apontando para o banco de dados on-premises da UFPE.

---

## 🛠️ Manutenção e Migrações do Banco

Para aplicar atualizações no banco de dados sem perder dados existentes:
1. Use as migrations SQL contidas na pasta `supabase/migrations/`.
2. Em produção no Supabase Cloud, você pode aplicar essas queries usando a ferramenta de linha de comando ou colando diretamente as queries de atualização no painel **SQL Editor** do Supabase.

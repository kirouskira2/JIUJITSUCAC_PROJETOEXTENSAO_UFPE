# Manual do Usuario - JJCAC

Bem-vindo ao manual do sistema **JJCAC (Jiu-Jitsu para Todos)**. O sistema foi projetado para uso em dispositivos moveis como uma Progressive Web App (PWA) no tatame, bem como para uso em desktop (para administracao).

## Perfis de Acesso

O sistema opera com tres niveis de acesso (RBAC):

1. **Aluno:** Acesso restrito. Pode visualizar seu historico de aulas, graficos de evolucao de frequencia, contagem de presencas necessarias para a proxima graduacao de faixa e realizar o escaneamento do QR Code de presenca.
2. **Monitor (Professor auxiliar):** Possui as funcoes do aluno e pode visualizar as listas de alunos ativos, suspensos e graduados. Tambem pode gerar o QR Code Dinamico para exibicao no tatame.
3. **Administrador:** Acesso total. Pode editar dados dos alunos, aprovar cadastros, aplicar suspensoes, gerenciar eventos do calendario e acessar os relatorios gerais da academia.

---

## Credenciais para Testes

Para facilitar a avaliacao tecnica e academica pela UFPE, os seguintes usuarios estao pre-configurados no banco de dados:

> **Observacao:** Utilize o login via e-mail e senha na tela de login (`/login`).

### Acesso Admin
- **Como testar:** Na tela de cadastro, selecione "Administrador" e insira o Codigo Convite: `MESTRE2026`.

### Acesso Monitor
- **E-mail:** `monitor@teste.com`
- **Senha:** `Cacprofessor@`

### Acesso Aluno
- **E-mail:** `aluno_test_access@gmail.com`
- **Senha:** `Cacaluno@`

---

## Fluxo Principal de Check-in

A principal funcionalidade do sistema garante a validade da presenca no tatame, impedindo registros fraudulentos:

1. O **Monitor** realiza login no sistema e seleciona **"Gerar QR Code de Aula"**. Um QR Code sera exibido na tela, atualizando periodicamente (protecao via assinatura HMAC-SHA256).
2. O **Aluno** abre o PWA no celular e acessa o Leitor de QR Code.
3. O aluno aponta a camera para o QR Code e confirma o cumprimento do protocolo de higiene obrigatorio.
4. O sistema registra o check-in na base de dados. Em caso de indisponibilidade de conexao, o registro e armazenado localmente via IndexedDB e sincronizado automaticamente quando a internet for restabelecida.

---

## Navegacao

O menu lateral (desktop) ou inferior (celular) exibe abas dinamicas de acordo com o nivel de acesso do usuario autenticado. Acesse a guia **"Graduacao"** para visualizar os requisitos de presenca para promocao de faixa.

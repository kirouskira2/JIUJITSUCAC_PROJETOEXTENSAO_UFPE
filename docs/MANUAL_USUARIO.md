# Manual do Usuário - JJCAC

Bem-vindo ao manual do sistema **JJCAC (Jiu-Jitsu para Todos)**. O sistema foi desenhado para uso em dispositivos móveis como uma *Progressive Web App* (PWA) no tatame, bem como para uso em desktop (para administração).

## Perfis de Acesso

O sistema funciona baseado na divisão de três papéis (RBAC):

1. **Aluno:** Possui acesso restrito. Pode visualizar seu histórico de aulas, gráficos de evolução (frequência) e a contagem necessária para sua próxima graduação de faixa, além do escaneamento do QR Code.
2. **Monitor (Professor auxiliar):** Possui as funções do aluno e pode visualizar as listas de alunos ativos, suspensos e graduados. Também pode abrir a tela de geração do QR Code Dinâmico (para ser exibido na TV ou Tablet da academia).
3. **Administrador:** Acesso total. Pode editar dados dos alunos, aprovar cadastros, aplicar suspensões, gerenciar eventos do calendário, e acessar os relatórios gerais da academia.

---

## Como Testar a Aplicação

Para facilitar a avaliação técnica e acadêmica pela UFPE, já deixamos usuários pré-configurados no banco de dados para testes rápidos de cada perfil. Utilize as credenciais abaixo na tela de login (`/login`):

> **Atenção:** Se o ambiente exigir confirmação de e-mail (Magic Link desativado por questões de teste de senha bruta), utilize o login via senha abaixo.

### 🔹 Acesso Admin
- **E-mail:** *(Solicitar e-mail admin ao criador ou cadastrar via código convite)*
- **Como testar sem conta prévia:** Vá na aba "Cadastro", escolha "Administrador" e digite o Código Convite: `MESTRE2026`.

### 🔹 Acesso Monitor
- **E-mail:** `monitor@teste.com`
- **Senha:** `Nininha123@`

### 🔹 Acesso Aluno
- **E-mail:** `aluno_test_access@gmail.com`
- **Senha:** `Nininha123@`

---

## Fluxo Principal de Check-in

A principal funcionalidade do sistema garante a validade da presença no tatame, evitando check-ins fraudulentos.
1. O **Monitor** loga no sistema e clica em **"Gerar QR Code de Aula"**. Um QR code grande será exibido na tela, atualizando a cada X segundos (proteção HMAC-SHA256).
2. O **Aluno** abre o PWA no celular e acessa o Leitor de QR.
3. O aluno aponta a câmera e confirma a política de higiene obrigatória.
4. O sistema registrará o check-in na base (ou no modo offline do IndexedDB, sincronizando posteriormente quando a internet retornar).

---

## Modos de Navegação
O menu lateral ou inferior (no celular) fornecerá abas dinâmicas de acordo com seu nível de acesso. Acesse a guia **"Graduação"** para analisar como os requisitos do "Shading" operam para promover um aluno!

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function seedUser(email, password, role, fullName) {
  console.log(`\nCriando usuário: ${email} (${role})`);
  
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
        role: role, // 'aluno', 'monitor' ou 'admin'
        category: 'academico',
        phone: '(11) 99999-9999',
        emergency_contact: '(11) 88888-8888',
        ufpe_bond: 'Estudante UFPE',
        academic_level: 'Graduação'
      }
    }
  });

  if (error) {
    console.error(`❌ Erro ao criar ${email}:`, error.message);
  } else {
    console.log(`✅ Usuário criado com sucesso: ${data.user?.id}`);
    console.log(`⚠️  Se o Supabase estiver com "Confirm Email" ativado, você precisará confirmar o e-mail no painel do Supabase antes de conseguir logar.`);
  }
}

async function main() {
  console.log('Iniciando Seed de Usuários de Teste...');
  
  await seedUser('aluno_test_access@gmail.com', 'Nininha123@', 'aluno', 'Aluno Teste E2E');
  await seedUser('monitor@teste.com', 'Nininha123@', 'monitor', 'Monitor Teste E2E');
  await seedUser('aluno1@teste.com', 'Nininha123@', 'aluno', 'Aluno 1 Isolamento RLS');

  console.log('\nSeed concluído!');
}

main();

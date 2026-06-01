import { createClient } from '@/lib/supabase/server';

export async function GET() {
  try {
    const supabase = await createClient();
    
    // Faz um SELECT extremamente simples e leve na tabela principles para manter a conexão ativa
    const { count, error } = await supabase
      .from('principles')
      .select('id', { count: 'exact', head: true });
      
    if (error) {
      return Response.json(
        { status: 'error', message: error.message },
        { status: 500 }
      );
    }
    
    return Response.json({
      status: 'alive',
      timestamp: new Date().toISOString(),
      principlesCount: count
    });
  } catch (err: any) {
    return Response.json(
      { status: 'error', message: err.message || 'Erro interno' },
      { status: 500 }
    );
  }
}

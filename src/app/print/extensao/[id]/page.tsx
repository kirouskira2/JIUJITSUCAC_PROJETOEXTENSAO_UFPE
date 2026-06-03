import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { ExtensaoCertificado, AttendanceRecord } from "@/components/reports/extensao-certificado";

export default async function PrintExtensaoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    redirect("/login");
  }

  // Verifica permissão (apenas Admin/Monitor ou o próprio Aluno se futuramente liberado)
  const { data: authProfile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (authProfile?.role !== "admin" && authProfile?.role !== "monitor" && user.id !== id) {
    redirect("/aluno");
  }

  // Busca dados do Aluno alvo
  const { data: studentProfile, error: studentError } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", id)
    .single();

  if (studentError || !studentProfile) {
    return <div className="p-8 text-center text-red-600 font-bold">Erro: Aluno não encontrado.</div>;
  }

  // Busca presenças (attendances) confirmadas
  const { data: attendancesData, error: attError } = await supabase
    .from("attendance")
    .select(`
      id,
      checked_in_at,
      workout:workouts (
        date,
        technique_name
      )
    `)
    .eq("profile_id", id)
    .order("checked_in_at", { ascending: true });

  if (attError) {
    return <div className="p-8 text-center text-red-600 font-bold">Erro ao buscar presenças.</div>;
  }

  // Mapeia para o formato esperado pelo componente PDF
  const rawAttendances = (attendancesData || []) as any[];
  const formattedAttendances: AttendanceRecord[] = rawAttendances.map(item => {
    const workout = Array.isArray(item.workout) ? item.workout[0] : item.workout;
    const workoutDate = workout?.date || item.checked_in_at.split('T')[0];
    
    // Converte a data do banco (YYYY-MM-DD) para DD/MM/YYYY
    const dateParts = workoutDate.split('-');
    const formattedDate = dateParts.length === 3 ? `${dateParts[2]}/${dateParts[1]}/${dateParts[0]}` : workoutDate;

    // TODO: Definir início e fim a partir do projeto (Padrão 15:00 - 17:00)
    return {
      id: item.id,
      date: formattedDate,
      startTime: "15:00",
      endTime: "17:00",
      hours: 1.5,
    };
  });

  // Gera um Hash combinando o ID do aluno e o timestamp atual para verificação (Ex: "abc12...-170...")
  const currentTimestamp = Date.now().toString(36);
  const docHash = `${id.split('-')[0].toUpperCase()}-${currentTimestamp.toUpperCase()}`;

  // Informações Fixas do Projeto (deveriam vir do BD ou Constantes)
  const projectInfo = {
    sigaaCode: "PJ222-2024",
    title: "Jiu-Jitsu para Todos: Inclusão, Arte e Empoderamento na UFPE e Comunidade Local",
    period: "02/09/2024 a 31/12/2025",
    coordinator: "Sadi da Silva Seabra Filho",
  };

  // Informações do Estudante
  const studentInfo = {
    fullName: studentProfile.full_name,
    enrollmentId: studentProfile.enrollment_id || "N/A",
    cpf: studentProfile.cpf || "N/A",
    rg: studentProfile.rg || "N/A",
    email: studentProfile.email || "N/A",
    course: studentProfile.course || "N/A",
    center: studentProfile.center || "N/A",
    category: studentProfile.category || "N/A",
  };

  // Renderiza o componente A4 isolado do layout global (através do print:m-0 print:p-0 e body bg-white que colocamos)
  return (
    <ExtensaoCertificado 
      student={studentInfo}
      project={projectInfo}
      attendances={formattedAttendances}
      docHash={docHash}
      totalClassesOffered={80} // Valor fictício base. Na prática poderia ser contado via SELECT total de workouts
    />
  );
}

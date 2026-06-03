"use client";

import React, { useEffect, useState } from "react";

export interface AttendanceRecord {
  id: string;
  date: string; // ISO ou DD/MM/YYYY
  startTime: string; // ex: 15:00
  endTime: string; // ex: 17:00
  hours: number;
}

export interface ExtensaoCertificadoProps {
  student: {
    fullName: string;
    enrollmentId: string;
    cpf: string;
    rg: string;
    email: string;
    course: string;
    center: string;
    category: string;
  };
  project: {
    sigaaCode: string;
    title: string;
    period: string;
    coordinator: string;
  };
  attendances: AttendanceRecord[];
  docHash: string;
  totalClassesOffered?: number; // Opcional para cálculo de %
}

export function ExtensaoCertificado({ student, project, attendances, docHash, totalClassesOffered }: ExtensaoCertificadoProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Dispara a impressão automaticamente assim que carregar (apenas após montar no client)
    setTimeout(() => {
      window.print();
    }, 1000);
  }, []);

  if (!mounted) return null;

  const totalHours = attendances.reduce((acc, curr) => acc + curr.hours, 0);
  const totalPresences = attendances.length;
  
  // Cálculo de frequência (se não for informado o total de aulas, consideramos que o aluno cumpriu o necessário da sua carga, mas o ideal é ter o total)
  // Vamos usar o maior número entre presenças e um fixo, ou se passado, usar.
  const baseTotalClasses = totalClassesOffered && totalClassesOffered > totalPresences ? totalClassesOffered : totalPresences;
  const percentage = baseTotalClasses > 0 ? Math.round((totalPresences / baseTotalClasses) * 100) : 0;

  return (
    <div className="w-full bg-white text-black min-h-screen font-sans">
      <div className="max-w-[210mm] mx-auto p-[10mm] bg-white print:p-0 print:m-0 print:max-w-none">
        
        {/* HEADER UFPE */}
        <div className="flex w-full mb-6 print:border-none border border-neutral-200">
          <div className="w-[80px] bg-[#C1121F] text-white flex flex-col items-center justify-center font-bold text-xl leading-tight">
            <span>JJ</span>
            <span>CAC</span>
          </div>
          <div className="flex-1 bg-[#1A233A] text-white p-3 flex justify-between items-center">
            <div className="flex flex-col text-[11px] leading-snug">
              <span className="font-bold">Universidade Federal de Pernambuco — UFPE</span>
              <span>Pró-Reitoria de Extensão e Cultura — PROEXC</span>
              <span>Departamento de Expressão Gráfica — CAC / DEG</span>
              <span>Projeto: {project.title}</span>
            </div>
            <div className="font-bold text-sm text-right">
              {project.sigaaCode}
            </div>
          </div>
        </div>

        {/* TITLE */}
        <h1 className="text-center font-bold text-lg text-[#1A233A] mb-1 uppercase tracking-wide">
          Declaração de Horas de Extensão Universitária
        </h1>
        <p className="text-center text-[10px] text-gray-600 mb-4 pb-2 border-b-2 border-[#1A233A]">
          Documento oficial para fins de cômputo de horas curriculares e registro no SIGAA · Resolução CNE/CES nº 7/2018
        </p>

        {/* AVISO VALIDADE */}
        <div className="bg-blue-50/50 border border-blue-100 p-2 text-[10px] text-blue-900 mb-6">
          <span className="font-bold">■ Este documento tem validade acadêmica mediante assinatura do coordenador ou autenticação digital pelo SIGAA/UFPE.</span><br/>
          Código de verificação: <span className="font-mono font-bold">{docHash}</span>
        </div>

        {/* SEC I */}
        <h2 className="font-bold text-xs text-[#1A233A] mb-2 uppercase border-b border-gray-200 pb-1">
          I — Identificação do Projeto de Extensão
        </h2>
        <div className="grid grid-cols-3 gap-x-4 gap-y-3 text-[10px] mb-6">
          <div className="col-span-1">
            <span className="text-gray-500 uppercase block text-[9px] mb-0.5">Código SIGAA</span>
            <span className="font-medium text-black">{project.sigaaCode}</span>
          </div>
          <div className="col-span-1">
            <span className="text-gray-500 uppercase block text-[9px] mb-0.5">Categoria</span>
            <span className="font-medium text-black">Projeto de Extensão</span>
          </div>
          <div className="col-span-1">
            <span className="text-gray-500 uppercase block text-[9px] mb-0.5">Situação</span>
            <span className="font-medium text-black">Em Execução</span>
          </div>
          <div className="col-span-3">
            <span className="text-gray-500 uppercase block text-[9px] mb-0.5">Título Completo</span>
            <span className="font-medium text-black">{project.title}</span>
          </div>
          <div className="col-span-1">
            <span className="text-gray-500 uppercase block text-[9px] mb-0.5">Unidade Proponente</span>
            <span className="font-medium text-black">DEG — CAC / UFPE</span>
          </div>
          <div className="col-span-1">
            <span className="text-gray-500 uppercase block text-[9px] mb-0.5">Período de Realização</span>
            <span className="font-medium text-black">{project.period}</span>
          </div>
          <div className="col-span-1">
            <span className="text-gray-500 uppercase block text-[9px] mb-0.5">Local</span>
            <span className="font-medium text-black">Salas de Dança — CAC, Recife-PE</span>
          </div>
          <div className="col-span-1">
            <span className="text-gray-500 uppercase block text-[9px] mb-0.5">Coordenador(a)</span>
            <span className="font-medium text-black">{project.coordinator}</span>
          </div>
          <div className="col-span-1">
            <span className="text-gray-500 uppercase block text-[9px] mb-0.5">Contato</span>
            <span className="font-medium text-black">sadi.seabrafo@ufpe.br</span>
          </div>
          <div className="col-span-1">
            <span className="text-gray-500 uppercase block text-[9px] mb-0.5">Dias e Horário</span>
            <span className="font-medium text-black">Seg. e Qua. · 15h00 às 17h00</span>
          </div>
        </div>

        {/* SEC II */}
        <h2 className="font-bold text-xs text-[#1A233A] mb-2 uppercase border-b border-gray-200 pb-1 mt-6">
          II — Identificação do Extensionista
        </h2>
        <div className="grid grid-cols-3 gap-x-4 gap-y-3 text-[10px] mb-6">
          <div className="col-span-2">
            <span className="text-gray-500 uppercase block text-[9px] mb-0.5">Nome Completo</span>
            <span className="font-medium text-red-700 italic uppercase">{student.fullName || "—"}</span>
          </div>
          <div className="col-span-1">
            <span className="text-gray-500 uppercase block text-[9px] mb-0.5">Matrícula SIGAA</span>
            <span className="font-medium text-red-700 italic">{student.enrollmentId || "—"}</span>
          </div>
          <div className="col-span-1">
            <span className="text-gray-500 uppercase block text-[9px] mb-0.5">CPF</span>
            <span className="font-medium text-red-700 italic">{student.cpf || "—"}</span>
          </div>
          <div className="col-span-1">
            <span className="text-gray-500 uppercase block text-[9px] mb-0.5">RG / Órgão Emissor</span>
            <span className="font-medium text-red-700 italic">{student.rg || "—"}</span>
          </div>
          <div className="col-span-1">
            <span className="text-gray-500 uppercase block text-[9px] mb-0.5">E-mail Institucional</span>
            <span className="font-medium text-red-700 italic">{student.email || "—"}</span>
          </div>
          <div className="col-span-2">
            <span className="text-gray-500 uppercase block text-[9px] mb-0.5">Curso de Graduação / Pós-Graduação</span>
            <span className="font-medium text-red-700 italic">{student.course || "—"}</span>
          </div>
          <div className="col-span-1">
            <span className="text-gray-500 uppercase block text-[9px] mb-0.5">Centro / Departamento</span>
            <span className="font-medium text-red-700 italic">{student.center || "—"}</span>
          </div>
          <div className="col-span-1">
            <span className="text-gray-500 uppercase block text-[9px] mb-0.5">Categoria de Participação</span>
            <span className="font-medium text-red-700 italic uppercase">{student.category || "—"}</span>
          </div>
          <div className="col-span-1">
            <span className="text-gray-500 uppercase block text-[9px] mb-0.5">Período de Apuração</span>
            <span className="font-medium text-red-700 italic">{project.period}</span>
          </div>
          <div className="col-span-1">
            <span className="text-gray-500 uppercase block text-[9px] mb-0.5">Nº do Documento</span>
            <span className="font-mono font-medium text-red-700 italic">{docHash.split('-')[0].toUpperCase()}</span>
          </div>
        </div>

        {/* SEC III */}
        <h2 className="font-bold text-xs text-[#1A233A] mb-2 uppercase border-b border-gray-200 pb-1 mt-6 break-after-avoid">
          III — Registro Individual de Frequência
        </h2>
        <div className="w-full mb-2">
          <table className="w-full text-[10px] text-center border-collapse">
            <thead>
              <tr className="bg-[#1A233A] text-white">
                <th className="py-1 px-2 border border-[#1A233A] font-bold w-20">Data</th>
                <th className="py-1 px-2 border border-[#1A233A] font-bold w-20">Dia</th>
                <th className="py-1 px-2 border border-[#1A233A] font-bold w-16">Início</th>
                <th className="py-1 px-2 border border-[#1A233A] font-bold w-16">Término</th>
                <th className="py-1 px-2 border border-[#1A233A] font-bold w-16">C.H.</th>
                <th className="py-1 px-2 border border-[#1A233A] font-bold flex-1 text-left">Validação (Check-in Digital)</th>
              </tr>
            </thead>
            <tbody>
              {attendances.map((att, i) => (
                <tr key={att.id} className="even:bg-gray-50 break-inside-avoid">
                  <td className="py-1.5 px-2 border border-gray-300 text-red-700 italic">{att.date}</td>
                  <td className="py-1.5 px-2 border border-gray-300 text-red-700 italic">
                    {/* Calcula o dia da semana a partir da data. Exemplo simples: Seg, Qua */}
                    {new Date(att.date.split("/").reverse().join("-")).toLocaleDateString('pt-BR', { weekday: 'short' }).replace('.', '').replace('-feira', '')}
                  </td>
                  <td className="py-1.5 px-2 border border-gray-300">{att.startTime}</td>
                  <td className="py-1.5 px-2 border border-gray-300">{att.endTime}</td>
                  <td className="py-1.5 px-2 border border-gray-300">{att.hours.toString().replace('.', ',')}h</td>
                  <td className="py-1.5 px-2 border border-gray-300 text-green-700 font-bold text-left flex items-center gap-1">
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                    Confirmado via App
                  </td>
                </tr>
              ))}
              {attendances.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-4 text-center border border-gray-300 text-gray-500">
                    Nenhum registro de presença encontrado.
                  </td>
                </tr>
              )}
            </tbody>
            {attendances.length > 0 && (
              <tfoot>
                <tr className="bg-gray-100 font-bold">
                  <td colSpan={4} className="py-1 px-2 border border-gray-300 text-right uppercase">C.H. Total</td>
                  <td className="py-1 px-2 border border-gray-300 text-red-700">{totalHours.toString().replace('.', ',')}h</td>
                  <td className="py-1 px-2 border border-gray-300"></td>
                </tr>
              </tfoot>
            )}
          </table>
          <p className="text-[8px] text-gray-500 mt-1 italic">
            * Linhas geradas pelo sistema JJCAC a partir das presenças confirmadas no período. C.H. = 1,5h por aula (90 min). A coluna de validação registra a confirmação eletrônica do perfil pessoal via QR Code na base de dados.
          </p>
        </div>

        <div className="break-inside-avoid mt-8">
          {/* SEC IV */}
          <h2 className="font-bold text-xs text-[#1A233A] mb-4 uppercase border-b border-gray-200 pb-1">
            IV — Resumo de Frequência e Carga Horária
          </h2>
          <div className="flex w-full border border-gray-300 text-center">
            <div className="flex-1 py-4 border-r border-gray-300 flex flex-col justify-center">
              <span className="text-2xl font-black text-red-700 mb-1">{baseTotalClasses}</span>
              <span className="text-[8px] uppercase text-gray-500 font-bold">Aulas ministradas no<br/>período</span>
            </div>
            <div className="flex-1 py-4 border-r border-gray-300 flex flex-col justify-center">
              <span className="text-2xl font-black text-red-700 mb-1">{totalPresences}</span>
              <span className="text-[8px] uppercase text-gray-500 font-bold">Presenças confirmadas</span>
            </div>
            <div className="flex-1 py-4 border-r border-gray-300 flex flex-col justify-center">
              <span className="text-2xl font-black text-[#1A233A] mb-1">{percentage}%</span>
              <span className="text-[8px] uppercase text-gray-500 font-bold">Frequência do<br/>Extensionista</span>
            </div>
            <div className="flex-1 py-4 bg-[#1A233A] text-white flex flex-col justify-center">
              <span className="text-2xl font-black mb-1">{totalHours.toString().replace('.', ',')}h</span>
              <span className="text-[8px] uppercase font-bold text-gray-300">Carga Horária Total</span>
            </div>
          </div>
          <p className="text-[8px] text-gray-500 mt-1 italic">
            Fórmula: C.H. Total = Nº Presenças × 1,5h · Frequência (%) = (Presenças ÷ Total de Aulas) × 100
          </p>

          {/* SEC V */}
          <h2 className="font-bold text-xs text-[#1A233A] mb-2 uppercase border-b border-gray-200 pb-1 mt-6">
            V — Declaração Formal
          </h2>
          <div className="text-[10px] text-justify leading-relaxed text-gray-800 bg-gray-50 p-4 border border-gray-200">
            A Coordenação do Projeto de Extensão <strong>{project.title}</strong> — código SIGAA <strong>{project.sigaaCode}</strong>, vinculado ao Departamento de Expressão Gráfica (DEG/CAC) da <strong>Universidade Federal de Pernambuco — UFPE</strong>, sob responsabilidade do Prof. <strong>{project.coordinator}</strong> — <strong>declara</strong> para os devidos fins que o(a) extensionista <strong>{student.fullName || "[Nome]"}</strong>, portador(a) do CPF <strong>{student.cpf || "[CPF]"}</strong>, matrícula SIGAA <strong>{student.enrollmentId || "[Matrícula]"}</strong>, vinculado(a) ao curso de <strong>{student.course || "[Curso]"}</strong>, na categoria <strong>{student.category || "[Categoria]"}</strong>, participou das atividades regulares deste projeto no período de <strong>{project.period}</strong>, registrando <strong>{totalPresences}</strong> presenças devidamente confirmadas pelo sistema eletrônico de controle de frequência JJCAC, correspondentes a uma carga horária total de <strong>{totalHours} horas</strong>, com índice de frequência de <strong>{percentage}%</strong> em relação ao total de aulas ministradas no período. Este documento é emitido em conformidade com a <strong>Resolução CNE/CES nº 7, de 18 de dezembro de 2018</strong>, e com as normas da PROEXC/UFPE, podendo ser utilizado para o cômputo de horas de extensão curricular obrigatória.
          </div>

          {/* SEC VI */}
          <h2 className="font-bold text-xs text-[#1A233A] mb-6 uppercase border-b border-gray-200 pb-1 mt-6">
            VI — Assinaturas e Autenticação
          </h2>
          <div className="grid grid-cols-2 gap-8 text-center text-[10px]">
            <div>
              <div className="border-b border-gray-400 w-full mb-2"></div>
              <p className="font-bold">{project.coordinator}</p>
              <p className="text-gray-500">Coordenador do Projeto — DEG / CAC / UFPE</p>
              <p className="text-gray-500 text-[8px] mt-0.5">SIAPE: ________________ · (81) 99663-8792</p>
            </div>
            <div>
              <div className="border-b border-gray-400 w-full mb-2 h-3.5"></div>
              <p className="font-bold">Pró-Reitoria de Extensão e Cultura</p>
              <p className="text-gray-500">PROEXC — UFPE</p>
              <p className="text-gray-500 text-[8px] mt-0.5">Autenticação Digital SIGAA: _____________________</p>
            </div>
          </div>
          <div className="text-center mt-6 text-[10px] font-bold">
            Recife — PE, _____ de ______________________ de 20____.
          </div>

          <div className="mt-8 text-center text-[8px] text-gray-400 border-t border-gray-200 pt-2 pb-4">
            Sistema JJCAC — Jiu-Jitsu para Todos · UFPE / CAC / DEG · Registro: {docHash} · Emitido em: {new Date().toLocaleString("pt-BR")}
            <br />
            Este documento tem validade somente com assinatura do coordenador ou autenticação digital pelo SIGAA.
          </div>
        </div>

      </div>
    </div>
  );
}

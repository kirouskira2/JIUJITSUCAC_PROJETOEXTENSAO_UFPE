// ============================================================================
// ARQUIVO: src/lib/mappers.ts
// PROJETO: JJCAC — Jiu-Jitsu para Todos
// DESCRIÇÃO: Funções centralizadas de mapeamento snake_case → camelCase
//            Elimina duplicação de código (DRY) entre Server Actions.
// VERSION: 1.0 (Criado após auditoria de qualidade V4.1)
// ============================================================================

import type { Profile, Principle, Workout, Attendance } from "./schemas";

// ============================================================================
// Database Row Types (snake_case — como vêm do Supabase)
// ============================================================================

export interface ProfileRow {
  id: string;
  full_name: string;
  email: string;
  cpf: string | null;
  role: "admin" | "monitor" | "aluno";
  belt: string;
  category: "frequente" | "academico" | "visitante";
  institution: string | null;
  enrollment_id: string | null;
  phone: string | null;
  emergency_contact: string | null;
  ufpe_bond: string | null;
  academic_level: string | null;
  sexual_orientation: string | null;
  gender_identity: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface PrincipleRow {
  id: number;
  number: number;
  title_pt: string;
  title_en: string;
  description: string;
  category: string | null;
}

export interface WorkoutRow {
  id: string;
  date: string;
  technique_name: string;
  technique_what: string;
  technique_how: string;
  technique_why: string;
  principle_id: number;
  registered_by: string;
  created_at: string;
  updated_at: string;
}

export interface AttendanceRow {
  id: string;
  profile_id: string;
  workout_id: string;
  checked_in_at: string;
  hygiene_confirmed: boolean;
  created_at: string;
}

// ============================================================================
// Mapper Functions
// ============================================================================

export function mapProfile(row: ProfileRow): Profile {
  return {
    id: row.id,
    fullName: row.full_name,
    email: row.email,
    cpf: row.cpf,
    role: row.role,
    belt: row.belt,
    category: row.category,
    institution: row.institution,
    enrollmentId: row.enrollment_id,
    phone: row.phone,
    emergencyContact: row.emergency_contact,
    ufpeBond: row.ufpe_bond,
    academicLevel: row.academic_level,
    sexualOrientation: row.sexual_orientation,
    genderIdentity: row.gender_identity,
    isActive: row.is_active,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function mapPrinciple(row: PrincipleRow): Principle {
  return {
    id: row.id,
    number: row.number,
    titlePt: row.title_pt,
    titleEn: row.title_en,
    description: row.description,
    category: row.category,
  };
}

export function mapWorkout(row: WorkoutRow): Workout {
  return {
    id: row.id,
    date: row.date,
    techniqueName: row.technique_name,
    techniqueWhat: row.technique_what,
    techniqueHow: row.technique_how,
    techniqueWhy: row.technique_why,
    principleId: row.principle_id,
    registeredBy: row.registered_by,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function mapAttendance(row: AttendanceRow): Attendance {
  return {
    id: row.id,
    profileId: row.profile_id,
    workoutId: row.workout_id,
    checkedInAt: row.checked_in_at,
    hygieneConfirmed: row.hygiene_confirmed,
    createdAt: row.created_at,
  };
}

// ============================================================================
// Event / Announcement / Notification Mappers
// ============================================================================

export interface EventRow {
  id: string;
  title: string;
  description: string | null;
  event_date: string;
  type: string;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface AnnouncementRow {
  id: string;
  title: string;
  message: string;
  importance: string;
  created_by: string;
  created_at: string;
}

export interface NotificationRow {
  id: string;
  profile_id: string;
  title: string;
  message: string;
  link: string | null;
  is_read: boolean;
  created_at: string;
}

export interface MappedEvent {
  id: string;
  title: string;
  description: string | null;
  eventDate: string;
  type: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface MappedAnnouncement {
  id: string;
  title: string;
  message: string;
  importance: string;
  createdBy: string;
  createdAt: string;
}

export interface MappedNotification {
  id: string;
  profileId: string;
  title: string;
  message: string;
  link: string | null;
  isRead: boolean;
  createdAt: string;
}

export function mapEvent(row: EventRow): MappedEvent {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    eventDate: row.event_date,
    type: row.type,
    createdBy: row.created_by,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function mapAnnouncement(row: AnnouncementRow): MappedAnnouncement {
  return {
    id: row.id,
    title: row.title,
    message: row.message,
    importance: row.importance,
    createdBy: row.created_by,
    createdAt: row.created_at,
  };
}

export function mapNotification(row: NotificationRow): MappedNotification {
  return {
    id: row.id,
    profileId: row.profile_id,
    title: row.title,
    message: row.message,
    link: row.link,
    isRead: row.is_read,
    createdAt: row.created_at,
  };
}

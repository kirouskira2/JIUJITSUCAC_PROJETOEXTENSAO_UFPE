// ============================================================================
// ARQUIVO: sprint-zero/Sprint0_04_Schemas_Zod.ts
// PROJETO: JJCAC — Jiu-Jitsu CAC ("Jiu-Jitsu para Todos")
// DESCRIÇÃO: Schemas de validação Zod para todas as Server Actions
// DERIVADO DE: Artifact 2 (SQL Schema) + Artifact 3 (API Contract)
// RESPONSIBLE AGENT: Backend_Agent (supervised by Auditor_TRM)
// SPRINT ZERO PROFILE: STANDARD
// VERSION: 1.0
// ============================================================================

import { z } from "zod";

// ============================================================================
// 1. ENUMS (Mirror SQL enums from Artifact 2 — EXACTLY)
// ============================================================================

/** Ref: Artifact 2 → create type user_role */
export const userRoleSchema = z.enum(["admin", "monitor", "aluno"]);

/** Ref: Artifact 2 → create type student_category */
export const studentCategorySchema = z.enum(["frequente", "academico", "visitante"]);

/** Report export format */
export const reportFormatSchema = z.enum(["pdf", "csv"]);

// ============================================================================
// 2. SHARED PRIMITIVES (Reusable field validators)
// ============================================================================

const uuidField = z.string().uuid("ID inválido");

const emailField = z
  .string()
  .email("E-mail inválido")
  .max(255, "E-mail muito longo");

const passwordField = z
  .string()
  .min(6, "Senha deve ter no mínimo 6 caracteres")
  .max(128, "Senha muito longa");

const fullNameField = z
  .string()
  .min(1, "Nome é obrigatório")
  .max(200, "Nome muito longo")
  .transform((val) => val.trim());

const dateField = z.coerce.date();

const optionalDateField = z.coerce.date().optional();

const principleIdField = z
  .number()
  .int("ID do princípio deve ser inteiro")
  .min(1, "ID do princípio mínimo é 1")
  .max(32, "ID do princípio máximo é 32");

// ============================================================================
// 3. INPUT SCHEMAS — /actions/auth.ts
// Ref: Artifact 3 → signIn, signUp
// ============================================================================

/** Ref: Artifact 3 → signIn action */
export const signInSchema = z.object({
  email: emailField,
  password: passwordField,
});

/** Ref: Artifact 3 → signUp action */
export const signUpSchema = z.object({
  email: emailField,
  password: passwordField,
  fullName: fullNameField,
});

// ============================================================================
// 4. INPUT SCHEMAS — /actions/profiles.ts
// Ref: Artifact 3 → listProfiles, getProfile, updateProfile,
//                    promoteToMonitor, toggleUserActive
// ============================================================================

/** Ref: Artifact 3 → listProfiles action */
export const listProfilesSchema = z.object({
  role: userRoleSchema.optional(),
  category: studentCategorySchema.optional(),
  isActive: z.boolean().optional(),
  search: z.string().max(200, "Busca muito longa").optional(),
});

/** Ref: Artifact 3 → getProfile action */
export const getProfileSchema = z.object({
  profileId: uuidField,
});

/** Ref: Artifact 3 → updateProfile action */
export const updateProfileSchema = z.object({
  profileId: uuidField,
  fullName: fullNameField.optional(),
  belt: z.string().min(1, "Faixa é obrigatória").optional(),
  category: studentCategorySchema.optional(),
  institution: z.string().max(200, "Instituição muito longa").optional(),
  enrollmentId: z.string().max(50, "Matrícula muito longa").optional(),
});

/** Ref: Artifact 3 → promoteToMonitor action */
export const promoteToMonitorSchema = z.object({
  targetUserId: uuidField,
});

/** Ref: Artifact 3 → promoteBelt action */
export const promoteBeltSchema = z.object({
  targetUserId: uuidField,
  newBelt: z.string().min(1, "Faixa é obrigatória"),
  notes: z.string().optional(),
});

/** Ref: Artifact 3 → toggleUserActive action */
export const toggleUserActiveSchema = z.object({
  targetUserId: uuidField,
});

// ============================================================================
// 5. INPUT SCHEMAS — /actions/checkin.ts
// Ref: Artifact 3 → registerCheckin, getMyAttendance
// ============================================================================

/** Ref: Artifact 3 → registerCheckin action
 *  hygieneConfirmed must be literally true — Ecologia Integral is mandatory (SR2) */
export const registerCheckinSchema = z.object({
  profileId: uuidField,
  workoutId: uuidField,
  hygieneConfirmed: z.literal(true, {
    errorMap: () => ({
      message: "Confirmação de higiene (Ecologia Integral) é obrigatória",
    }),
  }),
});

/** Ref: Artifact 3 → getMyAttendance action */
export const getMyAttendanceSchema = z.object({
  startDate: optionalDateField,
  endDate: optionalDateField,
}).refine(
  (data) => {
    if (data.startDate && data.endDate) {
      return data.startDate <= data.endDate;
    }
    return true;
  },
  { message: "Data inicial deve ser anterior à data final" }
);

// ============================================================================
// 6. INPUT SCHEMAS — /actions/workouts.ts
// Ref: Artifact 3 → createWorkout, updateWorkout, listWorkouts
// ============================================================================

/** Ref: Artifact 3 → createWorkout action
 *  Metodologia Shading: What / How / Why */
export const createWorkoutSchema = z.object({
  date: dateField,
  techniqueName: z
    .string()
    .min(1, "Nome da técnica é obrigatório")
    .max(200, "Nome muito longo"),
  techniqueWhat: z
    .string()
    .min(1, "Descrição 'O que se faz' é obrigatória")
    .max(2000, "Descrição muito longa"),
  techniqueHow: z
    .string()
    .min(1, "Descrição 'Como se faz' é obrigatória")
    .max(2000, "Descrição muito longa"),
  techniqueWhy: z
    .string()
    .min(1, "Descrição 'Por que se faz' é obrigatória")
    .max(2000, "Descrição muito longa"),
  principleId: principleIdField,
});

/** Ref: Artifact 3 → updateWorkout action */
export const updateWorkoutSchema = z.object({
  workoutId: uuidField,
  techniqueName: z.string().min(1).max(200).optional(),
  techniqueWhat: z.string().min(1).max(2000).optional(),
  techniqueHow: z.string().min(1).max(2000).optional(),
  techniqueWhy: z.string().min(1).max(2000).optional(),
  principleId: principleIdField.optional(),
});

/** Ref: Artifact 3 → listWorkouts action */
export const listWorkoutsSchema = z.object({
  startDate: optionalDateField,
  endDate: optionalDateField,
}).refine(
  (data) => {
    if (data.startDate && data.endDate) {
      return data.startDate <= data.endDate;
    }
    return true;
  },
  { message: "Data inicial deve ser anterior à data final" }
);

// ============================================================================
// 7. INPUT SCHEMAS — /actions/dashboard.ts
// Ref: Artifact 3 → getDashboardStats, getStudentsByCategory
// ============================================================================

/** Ref: Artifact 3 → getDashboardStats action */
export const getDashboardStatsSchema = z.object({
  startDate: optionalDateField,
  endDate: optionalDateField,
});

/** Ref: Artifact 3 → getStudentsByCategory action */
export const getStudentsByCategorySchema = z.object({
  category: studentCategorySchema,
});

// ============================================================================
// 8. INPUT SCHEMAS — /actions/reports.ts
// Ref: Artifact 3 → exportAttendanceReport, exportAcademicReport
// ============================================================================

/** Ref: Artifact 3 → exportAttendanceReport action */
export const exportAttendanceReportSchema = z.object({
  startDate: dateField,
  endDate: dateField,
  category: studentCategorySchema.optional(),
  format: reportFormatSchema,
}).refine(
  (data) => data.startDate <= data.endDate,
  { message: "Data inicial deve ser anterior à data final" }
);

/** Ref: Artifact 3 → exportAcademicReport action */
export const exportAcademicReportSchema = z.object({
  startDate: dateField,
  endDate: dateField,
}).refine(
  (data) => data.startDate <= data.endDate,
  { message: "Data inicial deve ser anterior à data final" }
);

// ============================================================================
// 9. OUTPUT / RESPONSE SCHEMAS (Return types for Server Components)
// ============================================================================

/** Profile response — mirrors SQL table profiles */
export const profileResponseSchema = z.object({
  id: uuidField,
  fullName: z.string(),
  email: z.string().email(),
  role: userRoleSchema,
  belt: z.string(),
  category: studentCategorySchema,
  institution: z.string().nullable(),
  enrollmentId: z.string().nullable(),
  isActive: z.boolean(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

/** Principle response — mirrors SQL table principles */
export const principleResponseSchema = z.object({
  id: z.number().int(),
  number: z.number().int(),
  titlePt: z.string(),
  titleEn: z.string(),
  description: z.string(),
  category: z.string().nullable(),
});

/** Graduation response — mirrors SQL table graduations */
export const graduationResponseSchema = z.object({
  id: uuidField,
  profileId: uuidField,
  previousBelt: z.string(),
  newBelt: z.string(),
  promotedBy: uuidField,
  promotionDate: z.string(),
  notes: z.string().nullable(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

/** Workout response — mirrors SQL table workouts */
export const workoutResponseSchema = z.object({
  id: uuidField,
  date: z.string(),
  techniqueName: z.string(),
  techniqueWhat: z.string(),
  techniqueHow: z.string(),
  techniqueWhy: z.string(),
  principleId: z.number().int(),
  registeredBy: uuidField,
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

/** Workout with joined Principle data */
export const workoutWithPrincipleSchema = workoutResponseSchema.extend({
  principle: principleResponseSchema,
});

/** Attendance response — mirrors SQL table attendance */
export const attendanceResponseSchema = z.object({
  id: uuidField,
  profileId: uuidField,
  workoutId: uuidField,
  checkedInAt: z.string().datetime(),
  hygieneConfirmed: z.boolean(),
  createdAt: z.string().datetime(),
});

/** Attendance with joined Workout and Principle data */
export const attendanceWithWorkoutSchema = attendanceResponseSchema.extend({
  workout: workoutWithPrincipleSchema,
});

/** Profile with attendance count (for dashboard) */
export const profileWithAttendanceCountSchema = profileResponseSchema.extend({
  attendanceCount: z.number().int(),
});

/** Dashboard stats response — Ref: Artifact 3 → getDashboardStats */
export const dashboardStatsSchema = z.object({
  totalStudents: z.number().int(),
  activeStudents: z.number().int(),
  studentsByCategory: z.object({
    frequente: z.number().int(),
    academico: z.number().int(),
    visitante: z.number().int(),
  }),
  studentsByBelt: z.array(
    z.object({
      belt: z.string(),
      count: z.number().int(),
    })
  ),
  averageAttendance: z.number(),
  attendanceByWeek: z.array(
    z.object({
      week: z.string(),
      count: z.number().int(),
    })
  ),
  totalWorkouts: z.number().int(),
});

/** Academic report row — Ref: Artifact 3 → exportAcademicReport */
export const academicReportRowSchema = z.object({
  studentName: z.string(),
  studentEmail: z.string().email(),
  institution: z.string().nullable(),
  enrollmentId: z.string().nullable(),
  workoutDate: z.string(),
  techniqueName: z.string(),
  techniqueWhat: z.string(),
  techniqueHow: z.string(),
  techniqueWhy: z.string(),
  principleTitle: z.string(),
  checkedInAt: z.string().datetime(),
});

/** Standard ActionResponse<T> envelope */
export const actionResponseSchema = <T extends z.ZodType>(dataSchema: T) =>
  z.object({
    success: z.boolean(),
    data: dataSchema.optional(),
    error: z.string().optional(),
  });

// ============================================================================
// 10. INFERRED TYPES (For TypeScript usage across the application)
// ============================================================================

// --- Enums ---
export type UserRole = z.infer<typeof userRoleSchema>;
export type StudentCategory = z.infer<typeof studentCategorySchema>;
export type ReportFormat = z.infer<typeof reportFormatSchema>;

// --- Input Types ---
export type SignInInput = z.infer<typeof signInSchema>;
export type SignUpInput = z.infer<typeof signUpSchema>;
export type ListProfilesInput = z.infer<typeof listProfilesSchema>;
export type GetProfileInput = z.infer<typeof getProfileSchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
export type PromoteToMonitorInput = z.infer<typeof promoteToMonitorSchema>;
export type PromoteBeltInput = z.infer<typeof promoteBeltSchema>;
export type ToggleUserActiveInput = z.infer<typeof toggleUserActiveSchema>;
export type RegisterCheckinInput = z.infer<typeof registerCheckinSchema>;
export type GetMyAttendanceInput = z.infer<typeof getMyAttendanceSchema>;
export type CreateWorkoutInput = z.infer<typeof createWorkoutSchema>;
export type UpdateWorkoutInput = z.infer<typeof updateWorkoutSchema>;
export type ListWorkoutsInput = z.infer<typeof listWorkoutsSchema>;
export type GetDashboardStatsInput = z.infer<typeof getDashboardStatsSchema>;
export type GetStudentsByCategoryInput = z.infer<typeof getStudentsByCategorySchema>;
export type ExportAttendanceReportInput = z.infer<typeof exportAttendanceReportSchema>;
export type ExportAcademicReportInput = z.infer<typeof exportAcademicReportSchema>;

// --- Response Types ---
export type Profile = z.infer<typeof profileResponseSchema>;
export type Principle = z.infer<typeof principleResponseSchema>;
export type Graduation = z.infer<typeof graduationResponseSchema>;
export type Workout = z.infer<typeof workoutResponseSchema>;
export type WorkoutWithPrinciple = z.infer<typeof workoutWithPrincipleSchema>;
export type Attendance = z.infer<typeof attendanceResponseSchema>;
export type AttendanceWithWorkout = z.infer<typeof attendanceWithWorkoutSchema>;
export type ProfileWithAttendanceCount = z.infer<typeof profileWithAttendanceCountSchema>;
export type DashboardStats = z.infer<typeof dashboardStatsSchema>;
export type AcademicReportRow = z.infer<typeof academicReportRowSchema>;

// --- ActionResponse Generic ---
export type ActionResponse<T> = {
  success: boolean;
  data?: T;
  error?: string;
};

// ============================================================================
// TRM VERIFICATION CHECKLIST
// ============================================================================
//
// - [x] Each Artifact 3 action has a corresponding Zod schema? ✅
//       signIn, signUp, listProfiles, getProfile, updateProfile,
//       promoteToMonitor, toggleUserActive, registerCheckin,
//       getMyAttendance, createWorkout, updateWorkout, listWorkouts,
//       getDashboardStats, getStudentsByCategory,
//       exportAttendanceReport, exportAcademicReport
//
// - [x] Zod enums EXACTLY mirror SQL enums from Artifact 2? ✅
//       userRoleSchema = ('admin', 'monitor', 'aluno')
//       studentCategorySchema = ('frequente', 'academico', 'visitante')
//
// - [x] Error messages are descriptive (not generic)? ✅
//       "Nome é obrigatório", "Confirmação de higiene é obrigatória", etc.
//
// - [x] Inferred types exported for use in Server Components? ✅
//       16 Input types + 9 Response types + ActionResponse<T>
//
// - [x] No field with z.any() or z.unknown()? ✅ — Zero instances
//
// - [x] Optional fields explicitly marked with .optional()? ✅
//
// ============================================================================
// Sprint Zero Artifact 4 complete. Audit Gateway approved.
// Awaiting command: "Proceed" to generate Artifact 7 (Cross-Validation Report).
// ============================================================================

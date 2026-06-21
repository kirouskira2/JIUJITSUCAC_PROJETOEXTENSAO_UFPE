# Sprint Zero — Document Generation Protocol

**Classification:** AGENT  
**Codename:** `Sprint_Zero`  
**Version:** V4  
**Context Layer:** Phase (Sprint Zero)  
**Est. Tokens:** ~3,000 tokens  

---

## 1. Core Principle

> **No line of code exists without documentation that justifies it.**
>
> Sprint Zero is the mandatory Phase 0 that precedes Playbook Phases 1-5.
> It transforms a vague briefing into 8 precise document artifacts that
> feed the Worker TRM throughout the entire software construction.

### Why This Exists

```
WITHOUT SPRINT ZERO:
  Briefing → Direct code → Rework → Technical debt → Chaos

WITH SPRINT ZERO:
  Briefing → 8 Documents → Doc-guided code → Zero ambiguity
```

### Analogy

Sprint Zero is the **architectural blueprint**. No builder (Worker TRM) starts raising walls without the floor plan, electrical project, plumbing project, and soil report approved by the engineer (Architect TRM).

---

## 2. Sprint Zero Profiles

Not every project requires the same depth. The Orchestrator MUST select a profile at session start based on project complexity.

### Profile Definitions

```
PROFILE: NANO
  Use when: Landing page, portfolio, blog (no backend logic)
  Artifacts: None (inline 10-line briefing only)
  Time: < 5 minutes

PROFILE: LITE
  Use when: TODO app, simple MVP, 1-5 screens
  Artifacts: Art.1 (domain summary) + Art.8 (sprint plan)
  Time: < 15 minutes

PROFILE: STANDARD (default)
  Use when: SaaS medium complexity, V3.1, 5-20 screens
  Artifacts: Art.1, Art.2, Art.3, Art.4, Art.7, Art.8
  Time: < 1 hour

PROFILE: FULL
  Use when: V4 Governance, Enterprise, Compliance, multi-agent policy
  Artifacts: All 8 artifacts at full depth
  Time: 2-3 hours
```

### Auto-Detection Logic

```
IF entities.count == 0 AND target == "landing" → NANO
IF entities.count <= 3 AND target == "V3.1"   → LITE
IF entities.count <= 10 AND target == "V3.1"  → STANDARD
IF target == "V4"                              → FULL
DEFAULT                                        → STANDARD
```

The detected profile is stored in `.prisma/state.json` under `sprintZeroProfile`. The developer may override it.

---

## 3. Position in Project Lifecycle

```
┌──────────────────────────────────────────────────────────┐
│                  PRISMA V4 FULL LIFECYCLE                 │
│                                                          │
│  ┌────────────┐                                          │
│  │  BRIEFING  │  Client input (text or Stitch HTML)      │
│  └─────┬──────┘                                          │
│        │                                                 │
│        ▼                                                 │
│  ╔════════════════════════════════════════╗               │
│  ║  SPRINT ZERO (Documentation)          ║  ◀── HERE     │
│  ║  8 artifacts generated in sequence    ║               │
│  ║  Each audited before the next         ║               │
│  ╚════════════════╤═══════════════════════╝               │
│                   │                                      │
│                   ▼                                      │
│  ┌────────────────────────────────────────┐              │
│  │  PHASES 1-5 (Code)                    │              │
│  │  Each sprint consults Sprint Zero     │              │
│  │  artifacts as the source of truth     │              │
│  └────────────────────────────────────────┘              │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

---

## 4. Artifact Chain (Order and Dependencies)

The sequence is **rigid**. Each artifact depends on the previous ones. No skipping allowed.

```
ARTIFACT 1          ARTIFACT 2         ARTIFACT 3
Domain       ──────▶ SQL Script  ──────▶ API Contract
Analysis             + RLS              (OpenAPI)
   │                    │                   │
   │                    │                   │
   ▼                    ▼                   ▼
ARTIFACT 6          ARTIFACT 4         ARTIFACT 5
Monitoring   ◀──── Zod Schemas  ◀────── Gherkin
& Observ.                               Scenarios (BDD)
                        │
                        ▼
                    ARTIFACT 7          ARTIFACT 8
                    Validation   ──────▶ Implementation
                    Report              Plan (Sprints)
```

---

## 5. Complete Artifact Specifications

---

### 📄 ARTIFACT 1: Domain Analysis & Strategy

**Filename:** `Sprint0_01_Domain_Analysis.md`  
**Responsible Agent:** `Architect_TRM`  
**Input:** Client briefing (free text or Stitch HTML)  
**Objective:** Map the problem domain BEFORE thinking about solutions.

#### Required Content:

```markdown
1. PROJECT CONTEXT
   ├── Project name
   ├── Industry/Sector
   ├── Target audience
   ├── Problem it solves
   └── Unique value proposition

2. ENTITY MAP (Domain Model)
   ├── Entity: [Name]
   │   ├── Key attributes
   │   ├── Relationships (1:N, N:N, 1:1)
   │   └── Linked business rules
   └── Entity diagram (Mermaid)

3. USER FLOWS (User Journeys)
   ├── Persona 1: [Name/Role]
   │   └── Flow: Login → Primary action → Result
   ├── Persona 2: [Name/Role]
   │   └── Flow: ...
   └── Administrative flows

4. BUSINESS RULE CLASSIFICATION
   ├── STATIC RULES (can live in code — V3.1)
   │   └── Ex: "User needs a valid email to register"
   ├── VOLATILE RULES (must go to Policy Agent — V4)
   │   └── Ex: "Project limit per plan", "Discount rate"
   └── Classification table with justification

5. ARCHITECTURAL TRIAGE
   ├── Compilation Target: V3.1 | V4 | HYBRID
   ├── Justification based on the 80/20 Rule
   └── Signals detected in briefing
```

#### TRM Verification (Before proceeding):

- [ ] All briefing entities mapped?
- [ ] No "invented" entities absent from the briefing?
- [ ] Rules correctly classified (static vs volatile)?
- [ ] Architectural triage justified with concrete signals?
- [ ] User flows cover all identified personas?

---

### 📄 ARTIFACT 2: SQL Script & Security (Schema + RLS)

**Filename:** `Sprint0_02_Schema_SQL.sql`  
**Responsible Agent:** `Backend_Agent` (supervised by `Architect_TRM`)  
**Input:** Artifact 1 (Domain Analysis)  
**Objective:** Translate the domain model into an impenetrable data structure.

#### Required Content:

```sql
-- 1. EXTENSIONS
--    (vector, uuid-ossp — if needed)

-- 2. DOMAIN ENUMS
--    Derived EXACTLY from Artifact 1 classifications
--    Ex: create type project_status as enum ('draft', 'active', 'completed');

-- 3. TABLES
--    One table per entity from the Entity Map
--    Constraints with descriptive names
--    Audit fields: created_at, updated_at

-- 4. ROW LEVEL SECURITY (RLS)
--    MANDATORY on ALL tables
--    Policies for SELECT, INSERT, UPDATE, DELETE
--    Isolation by auth.uid()

-- 5. INDEXES
--    Frequently queried columns
--    Partial indexes where applicable

-- 6. TRIGGERS
--    Automatic updated_at
--    Soft delete where applicable

-- 7. FUNCTIONS
--    SECURITY DEFINER only when justified
--    Each function documented with COMMENT ON FUNCTION
```

#### TRM Verification:

- [ ] Each Artifact 1 entity has a corresponding table?
- [ ] Every table has RLS enabled (`ENABLE ROW LEVEL SECURITY`)?
- [ ] Enums reflect exactly the domain classifications?
- [ ] No table without a SELECT policy?
- [ ] Audit fields present (`created_at`, `updated_at`)?
- [ ] Table and column names in `snake_case`?
- [ ] Descriptively named constraints?

---

### 📄 ARTIFACT 3: API Contract (OpenAPI / Server Actions)

**Filename:** `Sprint0_03_API_Contract.yaml`  
**Responsible Agent:** `Backend_Agent`  
**Input:** Artifact 1 (Domain) + Artifact 2 (SQL)  
**Objective:** Define ALL system operations before implementing them.

#### Required Content:

```yaml
# For EACH Server Action in the system:

/actions/{domain}.ts:
  actionName:
    description: "What this action does and WHY it exists"
    auth_required: true | false
    input:
      schema: Zod schema name
      fields:
        - name: field1
          type: string | number | uuid | enum
          validation: "min(1), max(100), email(), uuid()"
    output:
      success_type: "Data type when success=true"
      error_cases:
        - "Not authenticated"
        - "Record not found"
        - "Validation failed"
    tables_accessed:
      - table_name (SELECT | INSERT | UPDATE | DELETE)
    rls_dependency: "Which RLS policy protects this operation"
    business_rules:
      - rule: "Rule description"
        type: STATIC | VOLATILE
        delegation: "V3.1 (code) | V4 (Policy Agent)"
```

#### TRM Verification:

- [ ] Each Artifact 1 user flow has corresponding actions?
- [ ] Each action references tables that exist in Artifact 2?
- [ ] All actions are `async` and return `ActionResponse<T>`?
- [ ] Volatile rules marked as "V4 (Policy Agent)"?
- [ ] No action without `auth_required` defined?
- [ ] Error cases cover real scenarios (not generic)?

---

### 📄 ARTIFACT 4: Zod Validation Schemas

**Filename:** `Sprint0_04_Schemas_Zod.ts`  
**Responsible Agent:** `Backend_Agent`  
**Input:** Artifact 2 (SQL) + Artifact 3 (API)  
**Objective:** Generate Zod schemas that validate ALL system inputs.

#### Required Content:

```typescript
// For EACH action defined in Artifact 3:

import { z } from "zod";

// === ENUMS (Mirror SQL enums from Artifact 2) ===
export const projectStatusSchema = z.enum([
  "draft", "active", "completed"
]);

// === INPUT SCHEMAS (One per Server Action) ===
export const createProjectSchema = z.object({
  projectName: z.string()
    .min(1, "Name required")
    .max(100, "Maximum 100 characters"),
  industry: z.string().min(1),
  targetAudience: z.string().min(1),
  // ... each field validated individually
});

// === OUTPUT SCHEMAS (Return types) ===
export const projectResponseSchema = z.object({
  id: z.string().uuid(),
  projectName: z.string(),
  status: projectStatusSchema,
  createdAt: z.string().datetime(),
});

// === INFERRED TYPES (For TypeScript usage) ===
export type CreateProjectInput = z.infer<typeof createProjectSchema>;
export type ProjectResponse = z.infer<typeof projectResponseSchema>;
```

#### TRM Verification:

- [ ] Each Artifact 3 action has a corresponding Zod schema?
- [ ] Zod enums EXACTLY mirror SQL enums from Artifact 2?
- [ ] Error messages are descriptive (not generic)?
- [ ] Inferred types exported for use in Server Components?
- [ ] No field with `z.any()` or `z.unknown()` without justification?
- [ ] Optional fields explicitly marked with `.optional()`?

---

### 📄 ARTIFACT 5: Gherkin Scenarios (BDD)

**Filename:** `Sprint0_05_Gherkin_Scenarios.feature`  
**Responsible Agent:** `Auditor_TRM`  
**Input:** Artifact 1 (User Flows) + Artifact 3 (API)  
**Objective:** Define expected behavior in verifiable human language.

#### Required Content:

```gherkin
# One Feature per user flow from Artifact 1

Feature: Project Creation
  As an authenticated user on the Pro plan
  I want to create a new project
  So that I can generate my software automatically

  Scenario: Successful creation
    Given I am authenticated as a "pro" user
    And I have fewer than 10 active projects
    When I submit a creation request with name "My App"
    Then the system returns success=true
    And the project appears in the list with status "draft"

  Scenario: Project limit reached
    Given I am authenticated as a "free" user
    And I already have 3 active projects
    When I submit a creation request
    Then the system returns success=false
    And the error message contains "Project limit reached"

  # V4 SCENARIOS (Volatile rules):
  Scenario: Limit defined by policy document
    Given the document "plan_rules.pdf" defines limit of 5 projects for Free
    And the Policy Agent is active
    When a Free user with 4 projects tries to create the 5th
    Then the Policy Agent queries the document
    And returns decision="APPROVED" with citation of the excerpt
```

#### TRM Verification:

- [ ] Each Artifact 1 user flow has at least 3 scenarios (happy path + 2 edge cases)?
- [ ] Authentication scenarios covered (authenticated, unauthenticated, wrong plan)?
- [ ] V4 scenarios include Policy Agent reference (if `target = V4`)?
- [ ] Scenario language is verifiable (precise Given/When/Then)?
- [ ] No generic scenarios ("the system works") — all are specific?

---

### 📄 ARTIFACT 6: Monitoring & Observability Plan

**Filename:** `Sprint0_06_Monitoring.md`  
**Responsible Agent:** `Security_Agent` + `Architect_TRM`  
**Input:** Artifact 3 (API) + Artifact 1 (Domain)  
**Objective:** Define WHAT to monitor, HOW to log, and WHEN to alert.

#### Required Content:

```markdown
1. STRUCTURED LOGS
   ├── Which actions generate log in audit_logs?
   ├── Format: { action, user_id, input_summary, result, timestamp }
   ├── What to NEVER log (PII, passwords, tokens)
   └── Retention: 90 days (configurable)

2. USAGE METRICS (usage_metrics table)
   ├── operation_type: Each action mapped
   ├── tokens_consumed: LLM usage tracking
   ├── cost_usd: Cost estimate per operation
   └── Aggregations: by user, by day, by plan

3. AGENT METRICS (if V4)
   ├── Decisions per agent (approved/rejected/escalated)
   ├── Average latency per agent
   ├── Confidence distribution
   └── Human escalation rate

4. ALERTS
   ├── Token budget > 80% → WARNING
   ├── Token budget > 95% → CRITICAL
   ├── Agent with > 30% escalation → INVESTIGATE
   ├── Agent latency > 5s → DEGRADATION
   └── Security failure (BLOCK) → IMMEDIATE

5. DASHBOARD KPIs
   ├── Which charts to display (ref: Tremor components)
   ├── Refresh rate
   └── Available filters (date, user, plan)
```

#### TRM Verification:

- [ ] All Artifact 3 actions have mapped logs?
- [ ] PII explicitly excluded from logs?
- [ ] Alerts have concrete thresholds (not "when too much")?
- [ ] Agent metrics present if `target = V4`?
- [ ] Dashboard KPIs defined with specific Tremor components?

---

### 📄 ARTIFACT 7: Cross-Validation Report

**Filename:** `Sprint0_07_Validation_Report.md`  
**Responsible Agent:** `Auditor_TRM`  
**Input:** ALL previous artifacts (1 through 6)  
**Objective:** Cross-reference all documents and ensure total consistency.

#### Required Content:

```markdown
# TRACEABILITY MATRIX

| Entity (Art.1) | SQL Table (Art.2) | Actions (Art.3) | Zod (Art.4) | Gherkin (Art.5) | Logs (Art.6) |
|:---|:---|:---|:---|:---|:---|
| User | public.users ✅ | signIn, signOut ✅ | signInSchema ✅ | auth.feature ✅ | auth_logs ✅ |
| Project | public.projects ✅ | createProject ✅ | createProjectSchema ✅ | projects.feature ✅ | project_logs ✅ |
| ... | ... | ... | ... | ... | ... |

# CONSISTENCY CHECKS

□ Each Art.1 entity has a table in Art.2?
□ Each Art.2 table has an action in Art.3?
□ Each Art.3 action has a Zod schema in Art.4?
□ Each Art.1 flow has a Gherkin scenario in Art.5?
□ Each Art.3 action has a log in Art.6?
□ Names consistent between SQL (snake_case) and TS (camelCase)?
□ SQL enums = Zod enums = TypeScript enums?

# RESULT

| Check | Status | Note |
|:---|:---:|:---|
| Entity Coverage | ✅/❌ | [detail] |
| Action Coverage | ✅/❌ | [detail] |
| Validation Coverage | ✅/❌ | [detail] |
| Test Coverage | ✅/❌ | [detail] |
| Log Coverage | ✅/❌ | [detail] |
| Name Consistency | ✅/❌ | [detail] |

# VERDICT
"Sprint Zero is APPROVED/REJECTED for starting Code Phases."
```

#### TRM Verification:

- [ ] Traceability matrix complete (no empty cells)?
- [ ] Each ❌ has justification and correction plan?
- [ ] Cross-referenced names are consistent between artifacts?
- [ ] No "orphan" entities (exist in domain but not in SQL)?
- [ ] No "orphan" actions (exist in API but not in Gherkin)?

---

### 📄 ARTIFACT 8: Implementation Plan (Project Sprints)

**Filename:** `Sprint0_08_Implementation_Plan.md`  
**Responsible Agent:** `Architect_TRM`  
**Input:** ALL previous artifacts + Generic Playbook  
**Objective:** Translate Sprint Zero artifacts into concrete code sprints.

#### Required Content:

```markdown
# IMPLEMENTATION PLAN — [Project Name]

## Compilation Target: V3.1 | V4 | HYBRID
## Estimate: X sprints | Y files

---

## PHASE 1: INFRASTRUCTURE
Sprint 1.1: Initialize Next.js 15 + deps
Sprint 1.2: .env.local (Supabase keys)
Sprint 1.3: Supabase utilities (server.ts, client.ts)
Sprint 1.4: Blue Midnight theme (tailwind.config + globals.css)
→ GATEWAY: Validate Infra

## PHASE 2: DATA (Derived from Artifact 2)
Sprint 2.1: Execute Sprint0_02_Schema_SQL.sql in Supabase
Sprint 2.2: Verify RLS on each table
→ GATEWAY: Validate Security

## PHASE 3: BACKEND (Derived from Artifacts 3 + 4)
Sprint 3.1: /actions/auth.ts (ref: Artifact 3 → auth actions)
Sprint 3.2: /actions/[domain].ts (ref: Artifact 3 → domain actions)
Sprint 3.3: Zod schemas (ref: Artifact 4)
Sprint 3.4: Policy Agents (if V4, ref: Artifact 3 → volatile rules)
→ GATEWAY: Validate Contracts

## PHASE 4: FRONTEND (Derived from Stitch + Artifact 1)
Sprint 4.1: Root Layout
Sprint 4.2: Dashboard Layout + Sidebar
Sprint 4.3: Main pages (ref: Artifact 1 → flows)
→ GATEWAY: Validate Performance

## PHASE 5: INTERACTIVITY
Sprint 5.1: Forms (ref: Artifact 4 → Zod schemas)
Sprint 5.2: Connect to Server Actions
Sprint 5.3: Toasts and visual feedback
→ GATEWAY: Validate UX

## FINAL VERIFICATION (Derived from Artifact 5)
Sprint F.1: Validate Gherkin scenarios against running app
Sprint F.2: Verify monitoring (ref: Artifact 6)
Sprint F.3: Final delivery report
```

#### TRM Verification:

- [ ] Each sprint references the Sprint Zero artifact that justifies it?
- [ ] No "invented" sprints without documentary basis?
- [ ] Gateways present between each phase?
- [ ] Compilation target consistent with Artifact 1 triage?
- [ ] Final verification sprints include Gherkin and monitoring?

---

## 6. Execution Protocol

### 6.1 Cadence

```
RULE: One artifact at a time. Same protocol as code.

1. Generate Artifact N
2. Execute TRM verification for Artifact N
3. Declare: "Sprint Zero Artifact N complete.
   Audit Gateway approved."
4. Await command: "Proceed."
5. Generate Artifact N+1
```

### 6.2 Conditional Triage by Profile

| Profile | Required Artifacts | Optional Artifacts |
|:---:|:---|:---|
| NANO | None (inline briefing) | — |
| LITE | 1, 8 | — |
| STANDARD | 1, 2, 3, 4, 7, 8 | 5 (simplified Gherkin), 6 (basic) |
| FULL | 1, 2, 3, 4, 5, 6, 7, 8 | None — all mandatory |

### 6.3 Sprint Zero Completion Criteria

Sprint Zero is complete ONLY when:

1. ✅ All required artifacts for the selected profile have been generated
2. ✅ The Validation Report (Artifact 7) has no pending ❌ (if required)
3. ✅ The Implementation Plan (Artifact 8) references each artifact
4. ✅ The Lead Architect approves the complete document package

**Only then are the Code Phases (1-5) activated.**

---

## 7. Agent Responsibility Matrix

| Artifact | Primary Agent | Support Agent |
|:---|:---|:---|
| 1. Domain Analysis | `Architect_TRM` | — |
| 2. SQL Script | `Backend_Agent` | `Security_Agent` (RLS) |
| 3. API Contract | `Backend_Agent` | `Architect_TRM` (triage) |
| 4. Zod Schemas | `Backend_Agent` | `Auditor_TRM` (zero any) |
| 5. Gherkin Scenarios | `Auditor_TRM` | `Architect_TRM` (flows) |
| 6. Monitoring | `Security_Agent` | `Backend_Agent` (metrics) |
| 7. Validation Report | `Auditor_TRM` | All (cross-referencing) |
| 8. Implementation Plan | `Architect_TRM` | `Auditor_TRM` (feasibility) |

---

## 8. Absolute Rules

1. **Documentation before code.** If Artifact 7 has ❌, code does not start. No exceptions.
2. **Total traceability.** Each code sprint MUST reference the document artifact that originated it.
3. **Briefing is sacred.** If the client said "3 user types", there are 3. Do not invent a 4th.
4. **Consistent names.** If the entity is "Project" in Artifact 1, it is `projects` in SQL, `createProject` in the API, and `createProjectSchema` in Zod. Convention breach = rejection.
5. **Triage before everything.** Artifact 1 defines the `compilation_target`. All subsequent artifacts respect that decision.
6. **Artifact 7 is the final judge.** If the traceability matrix shows gaps, Sprint Zero is rejected.

---

*Protocol generated under Prisma V4 Kernel directives — Lead Architect Pedro Lucas Santos de Araújo*

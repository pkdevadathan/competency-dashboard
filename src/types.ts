export type CompetencyLevel = 'L0' | 'L1' | 'L2' | 'L3'

/** How far Actual sits behind Expected (role-relative health). */
export type Standing = 'Meet' | '1-Behind' | '2-Behind' | 'Unknown'

export type RoleLevel =
  | 'TPL'
  | 'TL'
  | 'Sr. Dev'
  | 'Dev'
  | 'Jr Dev'
  | 'Trainee'

export interface SubCompetencyScore {
  competency: string
  subCompetency: string
  expected: CompetencyLevel | null
  actual: CompetencyLevel | null
  weight: number
}

export interface Person {
  id: string
  name: string
  experienceLabel: string
  role: RoleLevel
  scores: SubCompetencyScore[]
  /** Weighted Expected overall (target bar for this person). */
  expectedLevel: CompetencyLevel
  expectedScore: number
  /** Absolute skill from weighted Actual (L0–L3). */
  overallLevel: CompetencyLevel
  overallScore: number
  /** Role-relative health from Expected vs Actual. Drives pyramid color. */
  standing: Standing
  avgStepsBehind: number
  meetExpectedCount: number
  oneBehindCount: number
  twoPlusBehindCount: number
  totalCompared: number
  totalScored: number
}

export interface ParsedWorkbook {
  sheetName: string
  people: Person[]
  competencyGroups: string[]
}

export const ROLE_ORDER: RoleLevel[] = [
  'TPL',
  'TL',
  'Sr. Dev',
  'Dev',
  'Jr Dev',
  'Trainee',
]

export const ROLE_LABELS: Record<RoleLevel, string> = {
  TPL: 'TPL',
  TL: 'TL',
  'Sr. Dev': 'Sr. Dev & Lead',
  Dev: 'Dev',
  'Jr Dev': 'Jr Dev',
  Trainee: 'Trainee / Buffer',
}

/** Absolute skill colors (detail view). */
export const LEVEL_COLORS: Record<CompetencyLevel, string> = {
  L0: '#6b7280',
  L1: '#c62828',
  L2: '#f0a202',
  L3: '#2e7d32',
}

/** Pyramid colors = vs Expected, not absolute level. */
export const STANDING_COLORS: Record<Standing, string> = {
  Meet: '#2e7d32',
  '1-Behind': '#f0a202',
  '2-Behind': '#c62828',
  Unknown: '#6b7280',
}

export const STANDING_LABELS: Record<Standing, string> = {
  Meet: 'On track',
  '1-Behind': '1 behind',
  '2-Behind': '2+ behind',
  Unknown: 'No data',
}

export type CompetencyLevel = 'L1' | 'L2' | 'L3'

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
  overallLevel: CompetencyLevel
  overallScore: number
  meetExpectedCount: number
  belowExpectedCount: number
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

export const LEVEL_COLORS: Record<CompetencyLevel, string> = {
  L1: '#c62828',
  L2: '#f0a202',
  L3: '#2e7d32',
}

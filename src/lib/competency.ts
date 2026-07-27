import type { CompetencyLevel, Person, SubCompetencyScore } from '../types'

const LEVEL_VALUE: Record<CompetencyLevel, number> = {
  L1: 1,
  L2: 2,
  L3: 3,
}

export function parseLevel(raw: unknown): CompetencyLevel | null {
  if (raw == null) return null
  const text = String(raw).trim().toUpperCase()
  if (text === 'L1' || text === '1') return 'L1'
  if (text === 'L2' || text === '2') return 'L2'
  if (text === 'L3' || text === '3') return 'L3'
  return null
}

export function parseWeight(raw: unknown): number {
  if (raw == null || raw === '') return 1
  const value = Number(raw)
  if (!Number.isFinite(value) || value <= 0) return 1
  return value
}

/** Map continuous weighted score (1–3) to a level band. */
export function levelFromScore(score: number): CompetencyLevel {
  if (score < 1.5) return 'L1'
  if (score < 2.5) return 'L2'
  return 'L3'
}

/**
 * Weighted average of Actual scores:
 * sum(levelValue * weight) / sum(weight), where L1=1, L2=2, L3=3.
 */
export function computeOverall(scores: SubCompetencyScore[]): {
  overallScore: number
  overallLevel: CompetencyLevel
  totalScored: number
} {
  let weightedSum = 0
  let weightTotal = 0
  let totalScored = 0

  for (const row of scores) {
    if (!row.actual) continue
    weightedSum += LEVEL_VALUE[row.actual] * row.weight
    weightTotal += row.weight
    totalScored += 1
  }

  if (weightTotal === 0) {
    return { overallScore: 0, overallLevel: 'L1', totalScored: 0 }
  }

  const overallScore = weightedSum / weightTotal
  return {
    overallScore,
    overallLevel: levelFromScore(overallScore),
    totalScored,
  }
}

export function gapStats(scores: SubCompetencyScore[]) {
  let meetExpectedCount = 0
  let belowExpectedCount = 0
  let totalScored = 0

  for (const row of scores) {
    if (!row.actual || !row.expected) continue
    totalScored += 1
    if (LEVEL_VALUE[row.actual] >= LEVEL_VALUE[row.expected]) {
      meetExpectedCount += 1
    } else {
      belowExpectedCount += 1
    }
  }

  return { meetExpectedCount, belowExpectedCount, totalScored }
}

export function withRecomputedPerson(person: Person): Person {
  const overall = computeOverall(person.scores)
  const gaps = gapStats(person.scores)
  return {
    ...person,
    ...overall,
    meetExpectedCount: gaps.meetExpectedCount,
    belowExpectedCount: gaps.belowExpectedCount,
  }
}

export function groupScoresByCompetency(scores: SubCompetencyScore[]) {
  const map = new Map<string, SubCompetencyScore[]>()
  for (const score of scores) {
    const list = map.get(score.competency) ?? []
    list.push(score)
    map.set(score.competency, list)
  }
  return map
}

export function formatScore(score: number): string {
  return score.toFixed(2)
}

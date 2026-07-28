import type {
  CompetencyLevel,
  Person,
  Standing,
  SubCompetencyScore,
} from '../types'

/** Numeric value used in weighted average / gap math. */
const LEVEL_VALUE: Record<CompetencyLevel, number> = {
  L0: 0,
  L1: 1,
  L2: 2,
  L3: 3,
}

export function parseLevel(raw: unknown): CompetencyLevel | null {
  if (raw == null) return null
  const text = String(raw).trim().toUpperCase()
  if (text === 'L0' || text === '0') return 'L0'
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

/**
 * Absolute skill bands on weighted Actual (0–3):
 * L0 < 1 | L1 [1, 1.67) | L2 [1.67, 2.33) | L3 [2.33, 3]
 */
export function levelFromScore(score: number): CompetencyLevel {
  if (score < 1) return 'L0'
  if (score < 1.67) return 'L1'
  if (score < 2.33) return 'L2'
  return 'L3'
}

/**
 * Role-relative standing from weighted average steps behind Expected.
 * Practical thirds on the 0–1 gap range (where most people sit).
 */
export function standingFromGap(avgStepsBehind: number, compared: number): Standing {
  if (compared === 0) return 'Unknown'
  if (avgStepsBehind < 0.33) return 'Meet'
  if (avgStepsBehind < 0.67) return '1-Behind'
  return '2-Behind'
}

/** Blend green → amber → red from avg steps behind (0 = best, 1+ = worst). */
export function heatmapColorFromGap(avgStepsBehind: number, compared: number): string {
  if (compared === 0) return '#6b7280'
  const t = Math.min(1, Math.max(0, avgStepsBehind))
  if (t <= 0.5) {
    return mixHex('#2e7d32', '#f0a202', t / 0.5)
  }
  return mixHex('#f0a202', '#c62828', (t - 0.5) / 0.5)
}

function mixHex(a: string, b: string, t: number): string {
  const ar = parseInt(a.slice(1, 3), 16)
  const ag = parseInt(a.slice(3, 5), 16)
  const ab = parseInt(a.slice(5, 7), 16)
  const br = parseInt(b.slice(1, 3), 16)
  const bg = parseInt(b.slice(3, 5), 16)
  const bb = parseInt(b.slice(5, 7), 16)
  const r = Math.round(ar + (br - ar) * t)
  const g = Math.round(ag + (bg - ag) * t)
  const bl = Math.round(ab + (bb - ab) * t)
  return `#${toHex(r)}${toHex(g)}${toHex(bl)}`
}

function toHex(n: number): string {
  return n.toString(16).padStart(2, '0')
}

/** Prefer dark text on light/amber cells for heatmap readability. */
export function heatmapTextColor(avgStepsBehind: number, compared: number): string {
  if (compared === 0) return '#fff'
  // Mid amber is bright — use dark ink there
  if (avgStepsBehind > 0.25 && avgStepsBehind < 0.75) return '#132229'
  return '#fff'
}

/** Steps Actual is behind Expected for one row (0 if meet/exceed). */
export function stepsBehind(
  expected: CompetencyLevel | null,
  actual: CompetencyLevel | null,
): number | null {
  if (!expected || !actual) return null
  return Math.max(0, LEVEL_VALUE[expected] - LEVEL_VALUE[actual])
}

/**
 * Weighted average for Actual or Expected:
 * sum(levelValue * weight) / sum(weight), where L0=0, L1=1, L2=2, L3=3.
 */
export function computeWeightedLevel(
  scores: SubCompetencyScore[],
  field: 'actual' | 'expected',
): {
  score: number
  level: CompetencyLevel
  totalScored: number
} {
  let weightedSum = 0
  let weightTotal = 0
  let totalScored = 0

  for (const row of scores) {
    const level = row[field]
    if (!level) continue
    weightedSum += LEVEL_VALUE[level] * row.weight
    weightTotal += row.weight
    totalScored += 1
  }

  if (weightTotal === 0) {
    return { score: 0, level: 'L0', totalScored: 0 }
  }

  const score = weightedSum / weightTotal
  return {
    score,
    level: levelFromScore(score),
    totalScored,
  }
}

/** @deprecated Prefer computeWeightedLevel(..., 'actual') */
export function computeOverall(scores: SubCompetencyScore[]) {
  const result = computeWeightedLevel(scores, 'actual')
  return {
    overallScore: result.score,
    overallLevel: result.level,
    totalScored: result.totalScored,
  }
}

/**
 * Gap vs Expected (weighted). This is what should judge juniors fairly:
 * Expected L2 + Actual L1 = 1 behind; Expected L3 + Actual L1 = 2 behind.
 */
export function gapStats(scores: SubCompetencyScore[]) {
  let meetExpectedCount = 0
  let oneBehindCount = 0
  let twoPlusBehindCount = 0
  let totalCompared = 0
  let weightedBehind = 0
  let weightTotal = 0

  for (const row of scores) {
    const behind = stepsBehind(row.expected, row.actual)
    if (behind == null) continue

    totalCompared += 1
    weightedBehind += behind * row.weight
    weightTotal += row.weight

    if (behind === 0) meetExpectedCount += 1
    else if (behind === 1) oneBehindCount += 1
    else twoPlusBehindCount += 1
  }

  const avgStepsBehind = weightTotal === 0 ? 0 : weightedBehind / weightTotal

  return {
    meetExpectedCount,
    oneBehindCount,
    twoPlusBehindCount,
    totalCompared,
    avgStepsBehind,
    standing: standingFromGap(avgStepsBehind, totalCompared),
  }
}

export function withRecomputedPerson(person: Person): Person {
  const actual = computeWeightedLevel(person.scores, 'actual')
  const expected = computeWeightedLevel(person.scores, 'expected')
  const gaps = gapStats(person.scores)
  return {
    ...person,
    expectedLevel: expected.level,
    expectedScore: expected.score,
    overallLevel: actual.level,
    overallScore: actual.score,
    totalScored: actual.totalScored,
    standing: gaps.standing,
    avgStepsBehind: gaps.avgStepsBehind,
    meetExpectedCount: gaps.meetExpectedCount,
    oneBehindCount: gaps.oneBehindCount,
    twoPlusBehindCount: gaps.twoPlusBehindCount,
    totalCompared: gaps.totalCompared,
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

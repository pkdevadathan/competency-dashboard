import * as XLSX from 'xlsx'
import type { ParsedWorkbook, Person, SubCompetencyScore } from '../types'
import { computeWeightedLevel, gapStats, parseLevel, parseWeight } from './competency'
import { inferRole, splitNameAndExperience } from './roles'

const PREFERRED_SHEETS = ['OFH_Competancy', 'OFH_Competency', 'STLA']

function pickSheet(workbook: XLSX.WorkBook): string {
  for (const name of PREFERRED_SHEETS) {
    if (workbook.SheetNames.includes(name)) return name
  }
  return workbook.SheetNames[0]
}

function isWeightageHeader(value: unknown): boolean {
  return String(value ?? '')
    .trim()
    .toLowerCase()
    .includes('weight')
}

function isPersonHeader(value: unknown): boolean {
  if (typeof value !== 'string') return false
  const text = value.trim()
  if (!text) return false
  const lower = text.toLowerCase()
  if (
    lower.includes('competency') ||
    lower.includes('weight') ||
    lower.includes('assesment') ||
    lower.includes('assessment')
  ) {
    return false
  }
  return true
}

function findWeightageCol(headerRow: (string | number | null)[]): number | null {
  for (let col = 0; col < headerRow.length; col += 1) {
    if (isWeightageHeader(headerRow[col])) return col
  }
  return null
}

export function parseCompetencyWorkbook(data: ArrayBuffer): ParsedWorkbook {
  const workbook = XLSX.read(data, { type: 'array' })
  const sheetName = pickSheet(workbook)
  const sheet = workbook.Sheets[sheetName]
  const rows = XLSX.utils.sheet_to_json<(string | number | null)[]>(sheet, {
    header: 1,
    defval: null,
    raw: true,
  })

  if (rows.length < 3) {
    throw new Error('Sheet looks empty. Expected competency headers and scores.')
  }

  const headerRow = rows[0] ?? []
  const weightCol = findWeightageCol(headerRow)
  const firstPersonCol = weightCol != null ? weightCol + 1 : 2

  const peopleMeta: { col: number; header: string }[] = []
  for (let col = firstPersonCol; col < headerRow.length; col += 3) {
    const header = headerRow[col]
    if (!isPersonHeader(header)) continue
    peopleMeta.push({ col, header: String(header).trim() })
  }

  if (peopleMeta.length === 0) {
    throw new Error(
      'No people found. Expected names in row 1 after Sub_Competency / Weightage, every 3 columns.',
    )
  }

  let currentCompetency = 'General'
  const competencyGroups: string[] = []
  const scoresByPerson = new Map<number, SubCompetencyScore[]>()
  for (const person of peopleMeta) scoresByPerson.set(person.col, [])

  for (let r = 2; r < rows.length; r += 1) {
    const row = rows[r] ?? []
    const competencyCell = row[0]
    const subCompetencyCell = row[1]

    if (competencyCell != null && String(competencyCell).trim()) {
      currentCompetency = String(competencyCell).trim()
      if (!competencyGroups.includes(currentCompetency)) {
        competencyGroups.push(currentCompetency)
      }
    }

    if (subCompetencyCell == null || !String(subCompetencyCell).trim()) continue
    const subCompetency = String(subCompetencyCell).trim()
    const weight = weightCol != null ? parseWeight(row[weightCol]) : 1

    for (const person of peopleMeta) {
      // Person block is still Expected | Self | Actual — Self is ignored.
      const expected = parseLevel(row[person.col])
      const actual = parseLevel(row[person.col + 2])
      if (!expected && !actual) continue

      scoresByPerson.get(person.col)!.push({
        competency: currentCompetency,
        subCompetency,
        expected,
        actual,
        weight,
      })
    }
  }

  const people: Person[] = peopleMeta.map(({ col, header }) => {
    const { name, experienceLabel } = splitNameAndExperience(header)
    const scores = scoresByPerson.get(col) ?? []
    const actual = computeWeightedLevel(scores, 'actual')
    const expected = computeWeightedLevel(scores, 'expected')
    const gaps = gapStats(scores)

    return {
      id: `${name}-${col}`,
      name,
      experienceLabel,
      role: inferRole(header),
      scores,
      expectedLevel: expected.level,
      expectedScore: expected.score,
      overallLevel: actual.level,
      overallScore: actual.score,
      standing: gaps.standing,
      avgStepsBehind: gaps.avgStepsBehind,
      meetExpectedCount: gaps.meetExpectedCount,
      oneBehindCount: gaps.oneBehindCount,
      twoPlusBehindCount: gaps.twoPlusBehindCount,
      totalCompared: gaps.totalCompared,
      totalScored: actual.totalScored,
    }
  })

  return { sheetName, people, competencyGroups }
}

export async function loadWorkbookFromUrl(url: string): Promise<ParsedWorkbook> {
  const response = await fetch(url)
  if (!response.ok) throw new Error(`Could not load ${url}`)
  const buffer = await response.arrayBuffer()
  return parseCompetencyWorkbook(buffer)
}

export async function loadWorkbookFromFile(file: File): Promise<ParsedWorkbook> {
  const buffer = await file.arrayBuffer()
  return parseCompetencyWorkbook(buffer)
}

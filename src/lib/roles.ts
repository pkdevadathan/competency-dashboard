import type { RoleLevel } from '../types'

/** Default hierarchy when the Excel sheet has no role column. Editable in the UI. */
const DEFAULT_BY_NAME: Record<string, RoleLevel> = {
  'rohit chavan': 'TPL',
  'jayesh patil': 'TL',
  'aniruddha bhalekar': 'Sr. Dev',
  'pratik malode': 'Sr. Dev',
  'suraj sutar': 'Dev',
  'sarakavas muzammil': 'Jr Dev',
  'arkadeep bhattacharjee': 'Jr Dev',
  'abhijeet bhosale': 'TL',
  'kunal patil': 'Dev',
}

function normalizeName(name: string): string {
  return name
    .replace(/\([^)]*\)/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase()
}

function yearsFromLabel(label: string): number | null {
  const plus = label.match(/(\d+)\+\s*years?/i)
  if (plus) return Number(plus[1]) + 0.5

  const yearsMonths = label.match(/(\d+(?:\.\d+)?)\s*years?\s*(\d+)?\s*months?/i)
  if (yearsMonths) {
    const years = Number(yearsMonths[1])
    const months = yearsMonths[2] ? Number(yearsMonths[2]) / 12 : 0
    return years + months
  }

  const yearsOnly = label.match(/(\d+(?:\.\d+)?)\s*years?/i)
  if (yearsOnly) return Number(yearsOnly[1])

  return null
}

export function inferRole(fullHeader: string): RoleLevel {
  const key = normalizeName(fullHeader)
  if (DEFAULT_BY_NAME[key]) return DEFAULT_BY_NAME[key]

  const years = yearsFromLabel(fullHeader)
  if (years == null) return 'Dev'
  if (years >= 10) return 'TPL'
  if (years >= 8) return 'TL'
  if (years >= 5) return 'Sr. Dev'
  if (years >= 3.5) return 'Dev'
  if (years >= 1.5) return 'Jr Dev'
  return 'Trainee'
}

export function splitNameAndExperience(header: string): {
  name: string
  experienceLabel: string
} {
  const match = header.match(/^(.*?)(?:\s*\((.+)\))?\s*$/)
  const name = (match?.[1] ?? header).trim()
  const experienceLabel = match?.[2]?.trim() ?? ''
  return { name, experienceLabel }
}

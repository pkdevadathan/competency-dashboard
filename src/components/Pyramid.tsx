import type { Person, RoleLevel } from '../types'
import { LEVEL_COLORS, ROLE_LABELS, ROLE_ORDER } from '../types'

interface PyramidProps {
  people: Person[]
  selectedId: string | null
  onSelect: (person: Person) => void
}

export function Pyramid({ people, selectedId, onSelect }: PyramidProps) {
  const tiers = ROLE_ORDER.map((role) => ({
    role,
    members: people.filter((p) => p.role === role),
  }))

  const maxCount = Math.max(1, ...tiers.map((t) => t.members.length))

  if (people.length === 0) {
    return <div className="pyramid empty">Upload a competency workbook to build the pyramid.</div>
  }

  return (
    <div className="pyramid" role="list">
      <div className="pyramid-frame">
        {tiers.map(({ role, members }, tierIndex) => (
          <div
            key={role}
            className={`pyramid-tier ${members.length === 0 ? 'is-empty' : ''}`}
            role="listitem"
          >
            <div className="tier-label">
              <span className="tier-grade">{roleGrade(role)}</span>
              <span className="tier-name">{ROLE_LABELS[role]}</span>
            </div>

            <div className="tier-track">
              <div
                className="tier-members"
                style={{
                  width: `${Math.max(18, (Math.max(members.length, 1) / maxCount) * 100)}%`,
                }}
              >
                {members.length === 0 ? (
                  <div className="person-block empty-slot" aria-hidden>
                    —
                  </div>
                ) : (
                  members.map((person, index) => (
                    <button
                      key={person.id}
                      type="button"
                      className={`person-block ${selectedId === person.id ? 'selected' : ''}`}
                      style={{
                        background: LEVEL_COLORS[person.overallLevel],
                        animationDelay: `${tierIndex * 50 + index * 35}ms`,
                        flex: `1 1 ${100 / members.length}%`,
                      }}
                      onClick={() => onSelect(person)}
                      title={`${person.name} — ${person.overallLevel} (${person.overallScore.toFixed(2)})`}
                    >
                      <span className="person-name">{shortName(person.name)}</span>
                      <span className="person-level">{person.overallLevel}</span>
                    </button>
                  ))
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function shortName(name: string): string {
  const parts = name.trim().split(/\s+/)
  if (parts.length === 1) return parts[0]
  return `${parts[0]} ${parts[parts.length - 1][0]}.`
}

function roleGrade(role: RoleLevel): string {
  switch (role) {
    case 'TPL':
      return 'F/G'
    case 'TL':
      return 'E/F/G'
    case 'Sr. Dev':
      return 'C/D'
    case 'Dev':
      return 'B/C'
    case 'Jr Dev':
      return 'A/B'
    case 'Trainee':
      return 'A'
  }
}

import type { Person, RoleLevel } from '../types'
import { ROLE_LABELS, ROLE_ORDER, STANDING_COLORS, STANDING_LABELS } from '../types'
import {
  heatmapColorFromGap,
  heatmapTextColor,
} from '../lib/competency'

export type PyramidMode = 'standing' | 'heatmap'

interface PyramidProps {
  people: Person[]
  selectedId: string | null
  onSelect: (person: Person) => void
  mode?: PyramidMode
}

export function Pyramid({
  people,
  selectedId,
  onSelect,
  mode = 'standing',
}: PyramidProps) {
  const tiers = ROLE_ORDER.map((role) => ({
    role,
    members: people.filter((p) => p.role === role),
  }))

  const maxCount = Math.max(1, ...tiers.map((t) => t.members.length))

  if (people.length === 0) {
    return <div className="pyramid empty">Upload a competency workbook to build the pyramid.</div>
  }

  return (
    <div className={`pyramid mode-${mode}`} role="list">
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
                  members.map((person, index) => {
                    const isHeatmap = mode === 'heatmap'
                    const background = isHeatmap
                      ? heatmapColorFromGap(person.avgStepsBehind, person.totalCompared)
                      : STANDING_COLORS[person.standing]
                    const color = isHeatmap
                      ? heatmapTextColor(person.avgStepsBehind, person.totalCompared)
                      : '#fff'

                    return (
                      <button
                        key={person.id}
                        type="button"
                        className={`person-block ${selectedId === person.id ? 'selected' : ''} ${isHeatmap ? 'heatmap-block' : ''}`}
                        style={{
                          background,
                          color,
                          animationDelay: `${tierIndex * 50 + index * 35}ms`,
                          flex: `1 1 ${100 / members.length}%`,
                        }}
                        onClick={() => onSelect(person)}
                        title={
                          isHeatmap
                            ? `${person.name} — avg ${person.avgStepsBehind.toFixed(2)} steps behind`
                            : `${person.name} — ${STANDING_LABELS[person.standing]} (avg ${person.avgStepsBehind.toFixed(2)} behind)`
                        }
                      >
                        <span className="person-name">{shortName(person.name)}</span>
                        {isHeatmap ? (
                          <span className="person-metric">{person.avgStepsBehind.toFixed(2)}</span>
                        ) : (
                          <span className="person-level">{standingShort(person.standing)}</span>
                        )}
                      </button>
                    )
                  })
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function standingShort(standing: Person['standing']): string {
  switch (standing) {
    case 'Meet':
      return 'On track'
    case '1-Behind':
      return '1 behind'
    case '2-Behind':
      return '2+ behind'
    case 'Unknown':
      return 'No data'
  }
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

import type { Person } from '../types'
import { LEVEL_COLORS } from '../types'
import { formatScore, groupScoresByCompetency } from '../lib/competency'

interface PersonDetailProps {
  person: Person | null
  onClose: () => void
}

export function PersonDetail({ person, onClose }: PersonDetailProps) {
  if (!person) {
    return (
      <aside className="detail-panel empty-detail">
        <h2>Person details</h2>
        <p>Select someone in the pyramid to see scores and gaps.</p>
      </aside>
    )
  }

  const groups = groupScoresByCompetency(person.scores)
  const meetPct =
    person.totalScored > 0
      ? Math.round((person.meetExpectedCount / person.totalScored) * 100)
      : 0

  return (
    <aside className="detail-panel">
      <div className="detail-header">
        <div>
          <p className="eyebrow">Team member</p>
          <h2>{person.name}</h2>
          {person.experienceLabel && (
            <p className="muted">{person.experienceLabel}</p>
          )}
        </div>
        <button type="button" className="icon-close" onClick={onClose} aria-label="Close">
          ×
        </button>
      </div>

      <div className="detail-stats">
        <div
          className="stat-card level-card"
          style={{ borderColor: LEVEL_COLORS[person.overallLevel] }}
        >
          <span className="stat-label">Overall competency</span>
          <strong style={{ color: LEVEL_COLORS[person.overallLevel] }}>
            {person.overallLevel}
          </strong>
          <span className="stat-sub">
            Score {formatScore(person.overallScore)} (1–3 weighted avg)
          </span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Meets expected</span>
          <strong>{meetPct}%</strong>
          <span className="stat-sub">
            {person.meetExpectedCount}/{person.totalScored} sub-competencies
          </span>
        </div>
      </div>

      <div className="score-groups">
        {[...groups.entries()].map(([group, scores]) => (
          <details key={group} className="score-group" open={group === [...groups.keys()][0]}>
            <summary>
              {group}
              <span>{scores.length}</span>
            </summary>
            <ul>
              {scores.map((score) => (
                <li key={`${group}-${score.subCompetency}`}>
                  <div className="sub-name">
                    <span>{score.subCompetency}</span>
                    <span className="weight-chip">w {score.weight}</span>
                  </div>
                  <div className="level-pills">
                    <LevelPill label="Exp" level={score.expected} />
                    <LevelPill label="Actual" level={score.actual} emphasize />
                  </div>
                </li>
              ))}
            </ul>
          </details>
        ))}
      </div>
    </aside>
  )
}

function LevelPill({
  label,
  level,
  emphasize = false,
}: {
  label: string
  level: string | null
  emphasize?: boolean
}) {
  if (!level) {
    return (
      <span className="level-pill muted-pill">
        {label}: —
      </span>
    )
  }

  return (
    <span
      className={`level-pill ${emphasize ? 'emphasize' : ''}`}
      style={{ background: LEVEL_COLORS[level as keyof typeof LEVEL_COLORS] }}
    >
      {label}: {level}
    </span>
  )
}

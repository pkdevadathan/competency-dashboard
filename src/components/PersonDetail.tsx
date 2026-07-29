import type { CompetencyLevel, Person } from '../types'
import { LEVEL_COLORS, STANDING_COLORS, STANDING_LABELS } from '../types'
import {
  formatScore,
  groupScoresByCompetency,
  stepsBehind,
} from '../lib/competency'

interface PersonDetailProps {
  person: Person | null
  onClose: () => void
}

export function PersonDetail({ person, onClose }: PersonDetailProps) {
  if (!person) {
    return (
      <aside className="detail-panel empty-detail">
        <h2>Person details</h2>
        <p>Select someone in the pyramid to see scores and gaps vs expected.</p>
      </aside>
    )
  }

  const groups = groupScoresByCompetency(person.scores)
  const meetPct =
    person.totalCompared > 0
      ? Math.round((person.meetExpectedCount / person.totalCompared) * 100)
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
        <div className="stat-card skill-compare">
          <span className="stat-label">Expected vs current skill</span>
          <div className="skill-compare-row">
            <div className="skill-side">
              <span className="skill-side-label">Expected</span>
              <strong style={{ color: LEVEL_COLORS[person.expectedLevel] }}>
                {person.expectedLevel}
              </strong>
              <span className="stat-sub">{formatScore(person.expectedScore)}</span>
            </div>
            <span className="skill-arrow" aria-hidden>
              →
            </span>
            <div className="skill-side">
              <span className="skill-side-label">Current</span>
              <strong style={{ color: LEVEL_COLORS[person.overallLevel] }}>
                {person.overallLevel}
              </strong>
              <span className="stat-sub">{formatScore(person.overallScore)}</span>
            </div>
          </div>
        </div>
        <div
          className="stat-card level-card"
          style={{ borderColor: STANDING_COLORS[person.standing] }}
        >
          <span className="stat-label">Vs expected</span>
          <strong style={{ color: STANDING_COLORS[person.standing] }}>
            {STANDING_LABELS[person.standing]}
          </strong>
          <span className="stat-sub">
            Expected − Current = {formatScore(person.scoreGap)} · {meetPct}% meet
          </span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Gap breakdown</span>
          <strong>
            {person.meetExpectedCount} / {person.oneBehindCount} / {person.twoPlusBehindCount}
          </strong>
          <span className="stat-sub">meet · one behind · two+ behind</span>
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
              {scores.map((score) => {
                const behind = stepsBehind(score.expected, score.actual)
                return (
                  <li key={`${group}-${score.subCompetency}`}>
                    <div className="sub-name">
                      <span>{score.subCompetency}</span>
                      <span className="weight-chip">w {score.weight}</span>
                    </div>
                    <div className="level-pills">
                      <LevelPill label="Exp" level={score.expected} />
                      <LevelPill label="Actual" level={score.actual} emphasize />
                      <GapPill behind={behind} />
                    </div>
                  </li>
                )
              })}
            </ul>
          </details>
        ))}
      </div>
    </aside>
  )
}

function GapPill({ behind }: { behind: number | null }) {
  if (behind == null) {
    return <span className="level-pill muted-pill">Gap: —</span>
  }
  if (behind === 0) {
    return (
      <span className="level-pill" style={{ background: STANDING_COLORS.Meet }}>
        On track
      </span>
    )
  }
  if (behind === 1) {
    return (
      <span className="level-pill" style={{ background: STANDING_COLORS['1-Behind'] }}>
        1 behind
      </span>
    )
  }
  return (
    <span className="level-pill" style={{ background: STANDING_COLORS['2-Behind'] }}>
      {behind}+ behind
    </span>
  )
}

function LevelPill({
  label,
  level,
  emphasize = false,
}: {
  label: string
  level: CompetencyLevel | null
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
      style={{ background: LEVEL_COLORS[level] }}
    >
      {label}: {level}
    </span>
  )
}

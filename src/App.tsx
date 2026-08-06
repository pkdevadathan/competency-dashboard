import { useEffect, useMemo, useRef, useState } from 'react'
import { FileUpload } from './components/FileUpload'
import { PersonDetail } from './components/PersonDetail'
import { Pyramid, type PyramidMode } from './components/Pyramid'
import {
  loadWorkbookFromFile,
  loadWorkbookFromUrl,
} from './lib/parseExcel'
import type { Person } from './types'
import './App.css'

const SAMPLE_URL = `${import.meta.env.BASE_URL}data/OFH_Competancy.xlsm`

export default function App() {
  const [people, setPeople] = useState<Person[]>([])
  const [sourceLabel, setSourceLabel] = useState<string | null>(null)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [activeView, setActiveView] = useState<PyramidMode>('standing')
  const scrollerRef = useRef<HTMLDivElement>(null)

  const selected = useMemo(
    () => people.find((p) => p.id === selectedId) ?? null,
    [people, selectedId],
  )

  async function ingest(
    loader: () => Promise<{ people: Person[]; sheetName: string }>,
    label: string,
  ) {
    setLoading(true)
    setError(null)
    try {
      const parsed = await loader()
      setPeople(parsed.people)
      setSourceLabel(label)
      setSelectedId(parsed.people[0]?.id ?? null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load workbook')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void ingest(() => loadWorkbookFromUrl(SAMPLE_URL), 'Sample: OFH_Competancy.xlsm')
  }, [])

  function showView(mode: PyramidMode) {
    setActiveView(mode)
    const scroller = scrollerRef.current
    if (!scroller) return
    const slide = scroller.querySelector<HTMLElement>(`[data-view="${mode}"]`)
    slide?.scrollIntoView({ behavior: 'smooth', inline: 'start', block: 'nearest' })
  }

  function handleScroll() {
    const scroller = scrollerRef.current
    if (!scroller) return
    const mid = scroller.scrollLeft + scroller.clientWidth / 2
    const slides = [...scroller.querySelectorAll<HTMLElement>('[data-view]')]
    let closest: PyramidMode = 'standing'
    let best = Number.POSITIVE_INFINITY
    for (const slide of slides) {
      const center = slide.offsetLeft + slide.offsetWidth / 2
      const dist = Math.abs(center - mid)
      if (dist < best) {
        best = dist
        closest = slide.dataset.view as PyramidMode
      }
    }
    setActiveView(closest)
  }

  return (
    <div className="app-shell">
      <FileUpload
        loading={loading}
        error={error}
        sourceLabel={sourceLabel}
        onFile={(file) =>
          void ingest(() => loadWorkbookFromFile(file), `Uploaded: ${file.name}`)
        }
        onLoadSample={() =>
          void ingest(() => loadWorkbookFromUrl(SAMPLE_URL), 'Sample: OFH_Competancy.xlsm')
        }
      />

      <main className="workspace">
        <section className="pyramid-panel">
          <div className="panel-heading with-tabs">
            <h2>Team Pyramid</h2>
            <div className="view-tabs" role="tablist" aria-label="Pyramid views">
              <button
                type="button"
                role="tab"
                aria-selected={activeView === 'standing'}
                className={activeView === 'standing' ? 'active' : ''}
                onClick={() => showView('standing')}
              >
                Standing
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={activeView === 'heatmap'}
                className={activeView === 'heatmap' ? 'active' : ''}
                onClick={() => showView('heatmap')}
              >
                Heatmap
              </button>
            </div>
          </div>

          <div
            className="pyramid-scroller"
            ref={scrollerRef}
            onScroll={handleScroll}
          >
            <div className="pyramid-slide" data-view="standing">
              <p className="slide-caption">Traffic light vs Expected (green / amber / red)</p>
              <Pyramid
                mode="standing"
                people={people}
                selectedId={selectedId}
                onSelect={(person) => setSelectedId(person.id)}
              />
            </div>

            <div className="pyramid-slide" data-view="heatmap">
              <div className="heatmap-legend" aria-hidden>
                <span>0.00</span>
                <div className="heatmap-legend-bar" />
                <span>1.00+</span>
              </div>
              <Pyramid
                mode="heatmap"
                people={people}
                selectedId={selectedId}
                onSelect={(person) => setSelectedId(person.id)}
              />
            </div>
          </div>
        </section>

        <PersonDetail
          person={selected}
          onClose={() => setSelectedId(null)}
        />
      </main>
    </div>
  )
}

import { useEffect, useMemo, useState } from 'react'
import { FileUpload } from './components/FileUpload'
import { PersonDetail } from './components/PersonDetail'
import { Pyramid } from './components/Pyramid'
import {
  loadWorkbookFromFile,
  loadWorkbookFromUrl,
} from './lib/parseExcel'
import type { Person } from './types'
import './App.css'

const SAMPLE_URL = '/data/OFH_Competancy.xlsm'

export default function App() {
  const [people, setPeople] = useState<Person[]>([])
  const [sourceLabel, setSourceLabel] = useState<string | null>(null)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

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
          <div className="panel-heading">
            <h2>Team Pyramid</h2>
          </div>
          <Pyramid
            people={people}
            selectedId={selectedId}
            onSelect={(person) => setSelectedId(person.id)}
          />
        </section>

        <PersonDetail
          person={selected}
          onClose={() => setSelectedId(null)}
        />
      </main>
    </div>
  )
}

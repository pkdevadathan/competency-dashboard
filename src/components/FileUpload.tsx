interface FileUploadProps {
  onFile: (file: File) => void
  onLoadSample: () => void
  loading: boolean
  error: string | null
  sourceLabel: string | null
}

export function FileUpload({
  onFile,
  onLoadSample,
  loading,
  error,
  sourceLabel,
}: FileUploadProps) {
  return (
    <section className="upload-bar">
      <div className="upload-actions">
        <label className="file-button">
          <input
            type="file"
            accept=".xlsx,.xlsm,.xls"
            onChange={(e) => {
              const file = e.target.files?.[0]
              if (file) onFile(file)
              e.target.value = ''
            }}
          />
          Upload Excel
        </label>
        <button type="button" className="ghost-button" onClick={onLoadSample} disabled={loading}>
          Load OFH sample
        </button>
      </div>
      <div className="upload-status">
        {loading && <span>Loading workbook…</span>}
        {!loading && sourceLabel && <span className="source-pill">{sourceLabel}</span>}
        {error && <span className="error-text">{error}</span>}
      </div>
    </section>
  )
}

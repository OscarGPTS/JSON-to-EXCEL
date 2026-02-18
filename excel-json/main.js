import '/src/style.css'
import '/src/excel-json.css'
import * as XLSX from 'xlsx'

const app = document.querySelector('#app')

app.innerHTML = `
  <div class="app-shell">
    <header class="hero">
      <div>
        <p class="eyebrow">Excel o CSV a JSON</p>
        <h1>Importa hojas y exporta en segundos</h1>
        <p class="subtitle">
          Carga un archivo, elige la hoja y decide si quieres JSON o una lista plana.
        </p>
      </div>
      <div class="hero-card">
        <div class="hero-stat">
          <span>Archivo</span>
          <strong id="file-name">Sin cargar</strong>
        </div>
        <div class="hero-stat">
          <span>Filas</span>
          <strong id="row-count">0</strong>
        </div>
        <div class="hero-stat">
          <span>Hoja</span>
          <strong id="sheet-count">0</strong>
        </div>
      </div>
    </header>

    <main class="grid single">
      <section class="panel" aria-labelledby="import-title">
        <div class="panel-header">
          <div>
            <h2 id="import-title">Importar archivo</h2>
            <p>Compatible con .xlsx, .xls y .csv.</p>
          </div>
          <div class="button-row">
            <a class="ghost link" href="/">Ir a JSON a Excel</a>
          </div>
        </div>

        <div class="import-grid">
          <label class="file-drop">
            <input id="file-input" type="file" accept=".xlsx,.xls,.csv" />
            <span>Arrastra tu archivo o haz click para cargarlo</span>
          </label>

          <div class="controls">
            <div class="control">
              <label for="sheet-select">Hoja</label>
              <select id="sheet-select" disabled></select>
            </div>
            <div class="control">
              <label>Pestanas</label>
              <div class="sheet-tabs" id="sheet-tabs"></div>
            </div>
            <div class="control">
              <label for="header-row">Fila de encabezados</label>
              <input id="header-row" type="number" min="1" value="1" />
            </div>
            <div class="control">
              <label for="data-start-row">Fila de datos</label>
              <input id="data-start-row" type="number" min="1" value="2" />
            </div>
            <div class="control">
              <label>Salida</label>
              <div class="radio-row">
                <label><input type="radio" name="output" value="json" checked /> JSON</label>
                <label><input type="radio" name="output" value="list" /> Lista</label>
              </div>
            </div>
            <div class="control">
              <label for="download-name">Nombre del archivo</label>
              <input id="download-name" type="text" value="export" />
            </div>
          </div>
        </div>

        <div class="field-panel">
          <div class="field-header">
            <strong>Campos a exportar</strong>
            <div class="button-row">
              <button class="ghost" id="select-all" disabled>Seleccionar todo</button>
              <button class="ghost" id="clear-all" disabled>Limpiar</button>
            </div>
          </div>
          <div class="field-list" id="field-list">
            <div class="empty">Sin columnas detectadas.</div>
          </div>
        </div>

        <div class="panel-footer">
          <div class="hint" id="status">Carga un archivo para comenzar.</div>
          <div class="button-row">
            <button class="ghost" id="copy-output" disabled>Copiar</button>
            <button class="accent" id="download-output" disabled>Descargar</button>
          </div>
        </div>
      </section>

      <section class="panel" aria-labelledby="preview-title">
        <div class="panel-header">
          <div>
            <h2 id="preview-title">Vista previa</h2>
            <p>Se muestran hasta 8 filas para validar.</p>
          </div>
        </div>
        <div class="preview" id="preview"></div>
        <div class="output">
          <pre id="output"></pre>
        </div>
      </section>
    </main>
  </div>
`

const elements = {
  fileInput: document.querySelector('#file-input'),
  sheetSelect: document.querySelector('#sheet-select'),
  sheetTabs: document.querySelector('#sheet-tabs'),
  headerRow: document.querySelector('#header-row'),
  dataStartRow: document.querySelector('#data-start-row'),
  fileName: document.querySelector('#file-name'),
  rowCount: document.querySelector('#row-count'),
  sheetCount: document.querySelector('#sheet-count'),
  status: document.querySelector('#status'),
  output: document.querySelector('#output'),
  preview: document.querySelector('#preview'),
  downloadName: document.querySelector('#download-name'),
  downloadOutput: document.querySelector('#download-output'),
  copyOutput: document.querySelector('#copy-output'),
  selectAll: document.querySelector('#select-all'),
  clearAll: document.querySelector('#clear-all'),
  fieldList: document.querySelector('#field-list')
}

const state = {
  workbook: null,
  rows: [],
  headers: [],
  selectedHeaders: new Set()
}

function setStatus(message, tone = 'neutral') {
  elements.status.textContent = message
  elements.status.dataset.tone = tone
}

function updateStats(fileName, sheetTotal) {
  elements.fileName.textContent = fileName || 'Sin cargar'
  elements.sheetCount.textContent = String(sheetTotal || 0)
  elements.rowCount.textContent = String(state.rows.length)
}

function readFileAsArrayBuffer(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result)
    reader.onerror = () => reject(reader.error)
    reader.readAsArrayBuffer(file)
  })
}

function normalizeHeaders(rawHeaders) {
  const headers = rawHeaders.map((value, index) => {
    const trimmed = String(value ?? '').trim()
    return trimmed || `Columna ${index + 1}`
  })

  const seen = new Map()
  return headers.map((header) => {
    const count = seen.get(header) || 0
    seen.set(header, count + 1)
    return count ? `${header} (${count + 1})` : header
  })
}

function getRowSettings() {
  const headerRow = Math.max(Number(elements.headerRow.value) || 1, 1)
  const dataStartRow = Math.max(Number(elements.dataStartRow.value) || headerRow + 1, 1)
  const safeDataStart = Math.max(dataStartRow, headerRow + 1)
  if (safeDataStart !== dataStartRow) {
    elements.dataStartRow.value = String(safeDataStart)
  }
  return { headerRow, dataStartRow: safeDataStart }
}

function parseWorksheet(sheetName) {
  if (!state.workbook) return
  const worksheet = state.workbook.Sheets[sheetName]
  if (!worksheet) return

  const { headerRow, dataStartRow } = getRowSettings()
  const headerIndex = headerRow - 1
  const rawRows = XLSX.utils.sheet_to_json(worksheet, {
    header: 1,
    defval: '',
    range: headerIndex
  })

  const rawHeaders = rawRows[0] || []
  const headers = normalizeHeaders(rawHeaders)
  const dataStartIndex = Math.max(dataStartRow - 1, headerRow)
  const startOffset = dataStartIndex - headerIndex
  const dataRows = rawRows.slice(startOffset)

  const rows = dataRows.map((row) => {
    const record = {}
    headers.forEach((header, index) => {
      record[header] = row?.[index] ?? ''
    })
    return record
  })

  state.rows = rows
  state.headers = headers
  state.selectedHeaders = new Set(state.headers)
  renderFieldSelector()
  renderPreview()
  renderOutput()
  updateStats(elements.fileName.textContent, state.workbook.SheetNames.length)
}

function getSelectedHeaders() {
  return state.headers.filter((header) => state.selectedHeaders.has(header))
}

function renderFieldSelector() {
  if (!state.headers.length) {
    elements.fieldList.innerHTML = '<div class="empty">Sin columnas detectadas.</div>'
    elements.selectAll.disabled = true
    elements.clearAll.disabled = true
    return
  }

  const html = state.headers
    .map((header) => {
      const checked = state.selectedHeaders.has(header) ? 'checked' : ''
      return `
        <label class="field-item">
          <input type="checkbox" data-header="${header}" ${checked} />
          <span>${header}</span>
        </label>
      `
    })
    .join('')

  elements.fieldList.innerHTML = html
  elements.selectAll.disabled = false
  elements.clearAll.disabled = false
}

function renderPreview() {
  if (!state.rows.length) {
    elements.preview.innerHTML = '<div class="empty">Sin datos para mostrar.</div>'
    return
  }

  const headers = getSelectedHeaders()
  if (!headers.length) {
    elements.preview.innerHTML = '<div class="empty">Selecciona al menos un campo.</div>'
    return
  }
  const previewRows = state.rows.slice(0, 8)
  const headerHtml = headers.map((item) => `<th>${item}</th>`).join('')
  const bodyHtml = previewRows
    .map((row) => {
      const cells = headers.map((key) => `<td>${row[key] ?? ''}</td>`).join('')
      return `<tr>${cells}</tr>`
    })
    .join('')

  elements.preview.innerHTML = `
    <table>
      <thead><tr>${headerHtml}</tr></thead>
      <tbody>${bodyHtml}</tbody>
    </table>
  `
}

function buildListOutput() {
  if (!state.rows.length) return ''
  const headers = getSelectedHeaders()
  if (!headers.length) return ''
  return state.rows
    .map((row, index) => {
      const values = headers.map((key) => String(row[key] ?? '')).join(' | ')
      return `${index + 1}. ${values}`
    })
    .join('\n')
}

function renderOutput() {
  const selected = document.querySelector('input[name="output"]:checked').value
  const headers = getSelectedHeaders()
  if (!state.rows.length || !headers.length) {
    elements.output.textContent = ''
    elements.downloadOutput.disabled = true
    elements.copyOutput.disabled = true
    return
  }

  const filteredRows = state.rows.map((row) => {
    const filtered = {}
    headers.forEach((header) => {
      filtered[header] = row[header]
    })
    return filtered
  })

  const outputText = selected === 'json'
    ? JSON.stringify(filteredRows, null, 2)
    : buildListOutput()

  elements.output.textContent = outputText
  elements.downloadOutput.disabled = false
  elements.copyOutput.disabled = false
}

async function handleFile(file) {
  if (!file) return
  setStatus('Procesando archivo...', 'neutral')
  try {
    const buffer = await readFileAsArrayBuffer(file)
    state.workbook = XLSX.read(buffer, { type: 'array' })
    elements.sheetSelect.innerHTML = state.workbook.SheetNames
      .map((name) => `<option value="${name}">${name}</option>`)
      .join('')
    elements.sheetTabs.innerHTML = state.workbook.SheetNames
      .map((name, index) => {
        const active = index === 0 ? 'active' : ''
        return `<button class="sheet-tab ${active}" data-sheet="${name}">${name}</button>`
      })
      .join('')
    elements.sheetSelect.disabled = false
    elements.fileName.textContent = file.name
    parseWorksheet(state.workbook.SheetNames[0])
    setStatus('Archivo cargado.', 'ok')
  } catch (error) {
    setStatus('No se pudo leer el archivo.', 'error')
  }
}

elements.fileInput.addEventListener('change', (event) => {
  const file = event.target.files?.[0]
  handleFile(file)
})

elements.sheetSelect.addEventListener('change', (event) => {
  parseWorksheet(event.target.value)
})

elements.headerRow.addEventListener('change', () => {
  const selected = elements.sheetSelect.value
  if (selected) parseWorksheet(selected)
})

elements.dataStartRow.addEventListener('change', () => {
  const selected = elements.sheetSelect.value
  if (selected) parseWorksheet(selected)
})

elements.sheetTabs.addEventListener('click', (event) => {
  const target = event.target
  if (!target.classList.contains('sheet-tab')) return
  const sheetName = target.dataset.sheet
  elements.sheetSelect.value = sheetName
  elements.sheetTabs.querySelectorAll('.sheet-tab').forEach((button) => {
    button.classList.toggle('active', button.dataset.sheet === sheetName)
  })
  parseWorksheet(sheetName)
})

elements.fieldList.addEventListener('change', (event) => {
  const target = event.target
  if (target.type !== 'checkbox') return
  const header = target.dataset.header
  if (target.checked) {
    state.selectedHeaders.add(header)
  } else {
    state.selectedHeaders.delete(header)
  }
  renderPreview()
  renderOutput()
})

elements.selectAll.addEventListener('click', () => {
  state.selectedHeaders = new Set(state.headers)
  renderFieldSelector()
  renderPreview()
  renderOutput()
})

elements.clearAll.addEventListener('click', () => {
  state.selectedHeaders.clear()
  renderFieldSelector()
  renderPreview()
  renderOutput()
})

document.querySelectorAll('input[name="output"]').forEach((radio) => {
  radio.addEventListener('change', renderOutput)
})

elements.downloadOutput.addEventListener('click', () => {
  const selected = document.querySelector('input[name="output"]:checked').value
  const headers = getSelectedHeaders()
  const filteredRows = state.rows.map((row) => {
    const filtered = {}
    headers.forEach((header) => {
      filtered[header] = row[header]
    })
    return filtered
  })
  const outputText = selected === 'json'
    ? JSON.stringify(filteredRows, null, 2)
    : buildListOutput()
  const extension = selected === 'json' ? 'json' : 'txt'
  const blob = new Blob([outputText], { type: 'text/plain;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = `${elements.downloadName.value || 'export'}.${extension}`
  anchor.click()
  URL.revokeObjectURL(url)
})

elements.copyOutput.addEventListener('click', async () => {
  try {
    await navigator.clipboard.writeText(elements.output.textContent)
    setStatus('Copiado al portapapeles.', 'ok')
  } catch (error) {
    setStatus('No se pudo copiar.', 'error')
  }
})

setStatus('Carga un archivo para comenzar.', 'neutral')

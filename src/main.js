import './style.css'
import * as XLSX from 'xlsx'

const samplePayload = {
  success: true,
  total: 3,
  data: [
    {
      id: 1001,
      uuid: 'd134d93b-1a74-4b0c-9e9c-8c2e6dfb51a1',
      nombre_completo: 'Valeria Soto Ramirez',
      nombre: 'Valeria',
      apellido: 'Soto Ramirez',
      email: 'valeria.soto@demo.com',
      telefono: '555-0101',
      fecha_admission: '2024-01-15',
      activo: true,
      puesto: {
        id: 7,
        nombre: 'Analista de Datos'
      },
      departamento: {
        id: 3,
        nombre: 'Innovacion'
      },
      area: {
        id: 2,
        nombre: 'Laboratorio'
      },
      razon_social: {
        id: 21,
        nombre: 'DEMO HOLDING S.A.'
      },
      jefe_directo: {
        id: 2001,
        uuid: '63f2b7b8-fb1c-4e78-9a21-4c0a6e6b23fe',
        nombre_completo: 'Rafael Villanueva Torres',
        nombre: 'Rafael',
        apellido: 'Villanueva Torres',
        email: 'rafael.villanueva@demo.com',
        telefono: '555-0110'
      },
      ubicacion: {
        pais: 'Mexico',
        ciudad: 'Queretaro',
        direccion: {
          calle: 'Calle 10',
          numero: '45B',
          cp: '76000'
        }
      },
      equipo: {
        nombre: 'Exploracion',
        lider: {
          id: 3001,
          nombre: 'Luisa Romero'
        }
      }
    },
    {
      id: 1002,
      uuid: '5b88a6e5-215b-4a92-8bde-4892d9d97c0e',
      nombre_completo: 'Mario Alvarez Gil',
      nombre: 'Mario',
      apellido: 'Alvarez Gil',
      email: null,
      telefono: '555-0102',
      fecha_admission: '2024-06-03',
      activo: false,
      puesto: {
        id: 11,
        nombre: 'Supervisor de Planta'
      },
      departamento: {
        id: 4,
        nombre: 'Operaciones'
      },
      area: {
        id: 5,
        nombre: 'Produccion'
      },
      razon_social: {
        id: 22,
        nombre: 'NOVA INDUSTRY GROUP'
      },
      jefe_directo: {
        id: 2002,
        uuid: 'a2f8c2f1-4b92-46d9-9d6b-1ce6d1b0f4f2',
        nombre_completo: 'Carmen Juarez Soto',
        nombre: 'Carmen',
        apellido: 'Juarez Soto',
        email: 'carmen.juarez@demo.com',
        telefono: '555-0112'
      },
      ubicacion: {
        pais: 'Mexico',
        ciudad: 'Monterrey',
        direccion: {
          calle: 'Av. Central',
          numero: '128',
          cp: '64000'
        }
      },
      equipo: {
        nombre: 'Calidad',
        lider: {
          id: 3002,
          nombre: 'Sandra Ibarra'
        }
      }
    },
    {
      id: 1003,
      uuid: '9a2f6a1b-96c1-4f7b-8eb9-8cc871c5f71d',
      nombre_completo: 'Diana Reyes Mora',
      nombre: 'Diana',
      apellido: 'Reyes Mora',
      email: 'diana.reyes@demo.com',
      telefono: '555-0103',
      fecha_admission: '2025-02-10',
      activo: true,
      puesto: {
        id: 15,
        nombre: 'Coordinadora de Servicios'
      },
      departamento: {
        id: 8,
        nombre: 'Servicios'
      },
      area: {
        id: 9,
        nombre: 'Atencion al Cliente'
      },
      razon_social: {
        id: 23,
        nombre: 'LATAM SERVICE LAB'
      },
      jefe_directo: {
        id: 2003,
        uuid: 'f192a4d9-0b1b-4fa1-95a7-2d3b7f224f05',
        nombre_completo: 'Jorge Castillo Vega',
        nombre: 'Jorge',
        apellido: 'Castillo Vega',
        email: 'jorge.castillo@demo.com',
        telefono: '555-0114'
      },
      ubicacion: {
        pais: 'Mexico',
        ciudad: 'Guadalajara',
        direccion: {
          calle: 'Circuito Norte',
          numero: '300',
          cp: '44100'
        }
      },
      equipo: {
        nombre: 'Customer Ops',
        lider: {
          id: 3003,
          nombre: 'Ivan Medrano'
        }
      }
    }
  ]
}

const app = document.querySelector('#app')

app.innerHTML = `
  <div class="app-shell">
    <header class="hero">
      <div>
        <p class="eyebrow">JSON a Excel</p>
        <h1>Exporta JSON a EXCEL</h1>
        <p class="subtitle">
          Pega tu JSON, elige los campos y genera un Excel listo para compartir.
        </p>
      </div>
      <div class="hero-card">
        <div class="hero-stat">
          <span>Campos elegidos</span>
          <strong id="selected-count">0</strong>
        </div>
        <div class="hero-stat">
          <span>Registros</span>
          <strong id="record-count">0</strong>
        </div>
        <div class="hero-stat">
          <span>Estado</span>
          <strong id="status-text">Listo</strong>
        </div>
      </div>
    </header>

    <main class="grid">
      <section class="panel" aria-labelledby="json-input-title">
        <div class="panel-header">
          <div>
            <h2 id="json-input-title">JSON de entrada</h2>
            <p>Detectamos automaticamente arreglos en <span class="chip">data</span>.</p>
          </div>
          <div class="button-row">
            <button class="ghost" id="load-sample">Usar ejemplo</button>
            <button id="parse-json">Analizar JSON</button>
          </div>
        </div>
        <textarea id="json-input" spellcheck="false" placeholder="Pega aqui tu JSON..."></textarea>
        <div class="panel-footer">
          <div class="hint" id="parse-message">Sin datos cargados.</div>
          <div class="button-row">
            <input id="file-name" type="text" value="export" />
            <button class="accent" id="export-excel">Exportar Excel</button>
          </div>
        </div>
      </section>

      <section class="panel" aria-labelledby="field-title">
        <div class="panel-header">
          <div>
            <h2 id="field-title">Seleccion de campos</h2>
            <p>Marca los campos principales o subcampos anidados.</p>
          </div>
          <div class="button-row">
            <button class="ghost" id="select-all">Seleccionar todo</button>
            <button class="ghost" id="clear-all">Limpiar</button>
          </div>
        </div>
        <div class="field-toolbar">
          <input id="field-filter" type="search" placeholder="Filtrar por nombre o ruta" />
        </div>
        <div class="field-list" id="field-list"></div>
        <div class="panel-footer">
          <div class="hint">Vista previa (hasta 5 registros).</div>
          <div class="preview" id="preview"></div>
        </div>
      </section>
    </main>
  </div>
`

const state = {
  records: [],
  fieldTree: [],
  pathMap: new Map(),
  selectedPaths: new Set(),
  filter: ''
}

const elements = {
  jsonInput: document.querySelector('#json-input'),
  parseButton: document.querySelector('#parse-json'),
  loadSample: document.querySelector('#load-sample'),
  fieldList: document.querySelector('#field-list'),
  selectedCount: document.querySelector('#selected-count'),
  recordCount: document.querySelector('#record-count'),
  statusText: document.querySelector('#status-text'),
  parseMessage: document.querySelector('#parse-message'),
  selectAll: document.querySelector('#select-all'),
  clearAll: document.querySelector('#clear-all'),
  fieldFilter: document.querySelector('#field-filter'),
  exportExcel: document.querySelector('#export-excel'),
  fileName: document.querySelector('#file-name'),
  preview: document.querySelector('#preview')
}

const typeLabels = {
  string: 'texto',
  number: 'numero',
  boolean: 'booleano',
  object: 'objeto',
  array: 'arreglo',
  null: 'nulo',
  unknown: 'desconocido'
}

function detectRecords(payload) {
  if (Array.isArray(payload)) {
    return payload
  }
  if (payload && typeof payload === 'object') {
    if (Array.isArray(payload.data)) {
      return payload.data
    }
  }
  return []
}

function inferType(value) {
  if (value === null || value === undefined) return 'null'
  if (Array.isArray(value)) return 'array'
  if (typeof value === 'object') return 'object'
  if (typeof value === 'string') return 'string'
  if (typeof value === 'number') return 'number'
  if (typeof value === 'boolean') return 'boolean'
  return 'unknown'
}

function mergeNode(list, key, value, path) {
  let node = list.find((item) => item.key === key)
  const nodeType = inferType(value)

  if (!node) {
    node = {
      key,
      path,
      type: nodeType,
      children: []
    }
    list.push(node)
  }

  if (nodeType === 'object') {
    Object.entries(value || {}).forEach(([childKey, childValue]) => {
      mergeNode(node.children, childKey, childValue, `${path}.${childKey}`)
    })
  }

  return node
}

function buildFieldTree(records) {
  const root = []
  records.forEach((record) => {
    if (!record || typeof record !== 'object') return
    Object.entries(record).forEach(([key, value]) => {
      mergeNode(root, key, value, key)
    })
  })

  const map = new Map()
  const walk = (nodes) => {
    nodes.forEach((node) => {
      map.set(node.path, node)
      if (node.children.length) walk(node.children)
    })
  }
  walk(root)

  return { root, map }
}

function flattenValue(value) {
  if (value === null || value === undefined) return ''
  if (typeof value === 'object') return JSON.stringify(value)
  return value
}

function getValueByPath(record, path) {
  const parts = path.split('.')
  let current = record
  for (const part of parts) {
    if (current === null || current === undefined) return ''
    current = current[part]
  }
  return flattenValue(current)
}

function getLeafPaths(nodes) {
  const paths = []
  nodes.forEach((node) => {
    if (!node.children.length) {
      paths.push(node.path)
      return
    }
    paths.push(...getLeafPaths(node.children))
  })
  return paths
}

function getSelectionState(node) {
  if (!node.children.length) {
    return state.selectedPaths.has(node.path) ? 'all' : 'none'
  }
  const states = node.children.map(getSelectionState)
  const allSelected = states.every((value) => value === 'all')
  const noneSelected = states.every((value) => value === 'none')
  if (allSelected) return 'all'
  if (noneSelected) return 'none'
  return 'some'
}

function filterTree(nodes, term) {
  if (!term) return nodes
  const lowered = term.toLowerCase()
  const matchesNode = (node) =>
    node.key.toLowerCase().includes(lowered) || node.path.toLowerCase().includes(lowered)

  const walk = (list) => {
    return list
      .map((node) => {
        const filteredChildren = walk(node.children || [])
        if (matchesNode(node) || filteredChildren.length) {
          return { ...node, children: filteredChildren }
        }
        return null
      })
      .filter(Boolean)
  }

  return walk(nodes)
}

function renderTree(nodes, level = 0) {
  return nodes
    .map((node) => {
      const stateFlag = getSelectionState(node)
      const checked = stateFlag === 'all' ? 'checked' : ''
      const typeLabel = typeLabels[node.type] || 'dato'
      const childHtml = node.children.length ? renderTree(node.children, level + 1) : ''

      return `
        <div class="field-row" style="--level: ${level}">
          <label>
            <input type="checkbox" data-path="${node.path}" ${checked} />
            <span class="field-name">${node.key}</span>
            <span class="field-type">${typeLabel}</span>
          </label>
        </div>
        ${childHtml}
      `
    })
    .join('')
}

function renderPreview() {
  const selectedLeafPaths = getSelectedLeafPaths()
  const rows = state.records.slice(0, 5).map((record) => {
    const row = {}
    selectedLeafPaths.forEach((path) => {
      row[path] = getValueByPath(record, path)
    })
    return row
  })

  if (!rows.length || !selectedLeafPaths.length) {
    elements.preview.innerHTML = '<div class="empty">Sin vista previa.</div>'
    return
  }

  const header = selectedLeafPaths.map((path) => `<th>${path}</th>`).join('')
  const body = rows
    .map((row) => {
      const cells = selectedLeafPaths.map((path) => `<td>${row[path] ?? ''}</td>`).join('')
      return `<tr>${cells}</tr>`
    })
    .join('')

  elements.preview.innerHTML = `
    <table>
      <thead><tr>${header}</tr></thead>
      <tbody>${body}</tbody>
    </table>
  `
}

function getSelectedLeafPaths() {
  const leaves = getLeafPaths(state.fieldTree)
  return leaves.filter((path) => state.selectedPaths.has(path))
}

function updateCounts() {
  elements.selectedCount.textContent = String(getSelectedLeafPaths().length)
  elements.recordCount.textContent = String(state.records.length)
}

function renderFieldList() {
  const filtered = filterTree(state.fieldTree, state.filter)
  if (!filtered.length) {
    elements.fieldList.innerHTML = '<div class="empty">No hay campos disponibles.</div>'
    return
  }

  elements.fieldList.innerHTML = renderTree(filtered)

  elements.fieldList.querySelectorAll('input[type="checkbox"]').forEach((checkbox) => {
    const node = state.pathMap.get(checkbox.dataset.path)
    if (!node || !node.children.length) return
    const selectionState = getSelectionState(node)
    checkbox.indeterminate = selectionState === 'some'
  })
}

function renderAll() {
  renderFieldList()
  renderPreview()
  updateCounts()
}

function setStatus(message, tone = 'ok') {
  elements.statusText.textContent = message
  elements.statusText.dataset.tone = tone
  elements.parseMessage.textContent = message
}

function parseInput() {
  const raw = elements.jsonInput.value.trim()
  if (!raw) {
    setStatus('Agrega un JSON para continuar.', 'warn')
    return
  }

  try {
    const payload = JSON.parse(raw)
    const records = detectRecords(payload)
    if (!records.length) {
      setStatus('No se encontraron registros en data.', 'warn')
      state.records = []
      state.fieldTree = []
      state.pathMap = new Map()
      state.selectedPaths.clear()
      renderAll()
      return
    }

    state.records = records
    const { root, map } = buildFieldTree(records)
    state.fieldTree = root
    state.pathMap = map
    state.selectedPaths = new Set(getLeafPaths(root))
    setStatus('JSON procesado.', 'ok')
    renderAll()
  } catch (error) {
    setStatus('JSON invalido. Revisa la sintaxis.', 'error')
  }
}

function toggleSelection(path, checked) {
  const node = state.pathMap.get(path)
  if (!node) return
  const descendants = getLeafPaths(node.children)
  const paths = node.children.length ? descendants : [node.path]
  paths.forEach((target) => {
    if (checked) {
      state.selectedPaths.add(target)
    } else {
      state.selectedPaths.delete(target)
    }
  })
}

function exportExcel() {
  const selectedLeafPaths = getSelectedLeafPaths()
  if (!state.records.length || !selectedLeafPaths.length) {
    setStatus('Selecciona campos antes de exportar.', 'warn')
    return
  }

  const rows = state.records.map((record) => {
    const row = {}
    selectedLeafPaths.forEach((path) => {
      row[path] = getValueByPath(record, path)
    })
    return row
  })

  const worksheet = XLSX.utils.json_to_sheet(rows)
  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Datos')
  const fileName = `${elements.fileName.value || 'export'}.xlsx`
  XLSX.writeFile(workbook, fileName)
  setStatus('Archivo generado.', 'ok')
}

elements.loadSample.addEventListener('click', () => {
  elements.jsonInput.value = JSON.stringify(samplePayload, null, 2)
  parseInput()
})

elements.parseButton.addEventListener('click', parseInput)
elements.exportExcel.addEventListener('click', exportExcel)

elements.selectAll.addEventListener('click', () => {
  getLeafPaths(state.fieldTree).forEach((path) => state.selectedPaths.add(path))
  renderAll()
})

elements.clearAll.addEventListener('click', () => {
  state.selectedPaths.clear()
  renderAll()
})

elements.fieldFilter.addEventListener('input', (event) => {
  state.filter = event.target.value
  renderFieldList()
})

elements.fieldList.addEventListener('change', (event) => {
  const target = event.target
  if (target.type !== 'checkbox') return
  toggleSelection(target.dataset.path, target.checked)
  renderAll()
})

setStatus('Sin datos cargados.', 'neutral')
renderAll()

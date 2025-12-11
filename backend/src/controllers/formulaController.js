import fs from 'fs';
import path from 'path';
import xlsx from 'xlsx';
import XLSX_CALC from 'xlsx-calc';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DEFAULT_WORKBOOK = 'VALORIZAÇÃO EM PPM - CLIENTES.xlsx';
const EDITABLE_COLOR = 'FEF2CB';

const workbookOptions = {
  cellFormula: true,
  cellNF: true,
  cellStyles: true,
  cellDates: true
};

const resolveWorkbookPath = () => {
  if (process.env.FORMULA_WORKBOOK_PATH) {
    return path.resolve(process.env.FORMULA_WORKBOOK_PATH);
  }

  const repositoryRoot = path.resolve(__dirname, '../../..');
  return path.join(repositoryRoot, DEFAULT_WORKBOOK);
};

const ensureSheetName = (workbook, requestedSheet) => {
  if (requestedSheet && workbook.SheetNames.includes(requestedSheet)) {
    return requestedSheet;
  }

  return workbook.SheetNames[0] ?? null;
};

const normalizeColor = (value) => {
  if (!value) return null;
  const raw = typeof value === 'string' ? value : value.rgb;
  if (!raw) return null;
  const upper = raw.toUpperCase();
  return upper.length > 6 ? upper.slice(-6) : upper;
};

const isEditableCell = (cell) => {
  if (!cell || !cell.s) return false;
  const fg = normalizeColor(cell.s?.fgColor?.rgb);
  const bg = normalizeColor(cell.s?.bgColor?.rgb);
  return fg === EDITABLE_COLOR || bg === EDITABLE_COLOR;
};

const parseNumber = (value) => {
  if (typeof value === 'number') return value;
  if (typeof value !== 'string') return NaN;
  const sanitized = value
    .replace(/\s+/g, '')
    .replace(/\./g, '')
    .replace(',', '.');
  return Number(sanitized);
};

const coerceCellValue = (cell, incomingValue) => {
  if (incomingValue === null || incomingValue === undefined || incomingValue === '') {
    delete cell.v;
    delete cell.w;
    delete cell.f;
    cell.t = 'z';
    return;
  }

  if (cell.t === 'n' || typeof incomingValue === 'number') {
    const numeric = typeof incomingValue === 'number' ? incomingValue : parseNumber(incomingValue);
    if (Number.isNaN(numeric)) {
      throw new Error('Valor numérico inválido');
    }
    cell.v = numeric;
    cell.t = 'n';
    delete cell.w;
    delete cell.f;
    return;
  }

  if (cell.t === 'b') {
    cell.v = Boolean(incomingValue);
    cell.t = 'b';
    delete cell.w;
    delete cell.f;
    return;
  }

  cell.v = String(incomingValue);
  cell.t = 's';
  cell.w = cell.v;
  delete cell.f;
};

const formatCellForResponse = (cell, address) => {
  if (!cell) {
    return {
      address,
      value: null,
      display: null,
      formula: null,
      type: null,
      editable: false
    };
  }

  const editable = isEditableCell(cell);
  const type = cell.t ?? null;

  let display = cell.w ?? null;
  if (display == null && Object.prototype.hasOwnProperty.call(cell, 'v')) {
    try {
      display = xlsx.utils.format_cell(cell);
    } catch (err) {
      display = cell.v;
    }
  }

  return {
    address,
    value: Object.prototype.hasOwnProperty.call(cell, 'v') ? cell.v : null,
    display,
    formula: cell.f ?? null,
    type,
    editable
  };
};

const collectEditableCells = (sheet) => {
  const result = new Set();
  const reference = sheet['!ref'];
  if (!reference) {
    return result;
  }

  const range = xlsx.utils.decode_range(reference);
  for (let rowIdx = range.s.r; rowIdx <= range.e.r; rowIdx += 1) {
    for (let colIdx = range.s.c; colIdx <= range.e.c; colIdx += 1) {
      const address = xlsx.utils.encode_cell({ r: rowIdx, c: colIdx });
      const cell = sheet[address];
      if (isEditableCell(cell)) {
        result.add(address);
      }
    }
  }

  return result;
};

const buildSheetPayload = (workbook, sheetName) => {
  const sheet = workbook.Sheets[sheetName];
  if (!sheet) {
    throw new Error(`Aba "${sheetName}" não encontrada.`);
  }

  const reference = sheet['!ref'];
  if (!reference) {
    return {
      sheetName,
      availableSheets: workbook.SheetNames,
      range: null,
      merges: sheet['!merges'] ?? [],
      grid: [],
      editableCells: []
    };
  }

  const range = xlsx.utils.decode_range(reference);
  const grid = [];
  const editableCells = [];

  for (let rowIdx = range.s.r; rowIdx <= range.e.r; rowIdx += 1) {
    const row = [];
    for (let colIdx = range.s.c; colIdx <= range.e.c; colIdx += 1) {
      const address = xlsx.utils.encode_cell({ r: rowIdx, c: colIdx });
      const cell = sheet[address];
      const formatted = formatCellForResponse(cell, address);
      if (formatted.editable) {
        editableCells.push(address);
      }
      row.push(formatted);
    }
    grid.push(row);
  }

  return {
    sheetName,
    availableSheets: workbook.SheetNames,
    range,
    merges: sheet['!merges'] ?? [],
    grid,
    editableCells
  };
};

const recalcWorkbook = (workbook) => {
  try {
    XLSX_CALC(workbook);
  } catch (error) {
    console.error('Erro ao recalcular planilha:', error);
    throw error;
  }
};

export const getFormulas = (req, res, next) => {
  try {
    const workbookPath = resolveWorkbookPath();

    if (!fs.existsSync(workbookPath)) {
      return res.status(404).json({
        message: `Arquivo de planilha não encontrado em ${workbookPath}. Configure FORMULA_WORKBOOK_PATH se o arquivo estiver em outro local.`
      });
    }

    const workbook = xlsx.readFile(workbookPath, workbookOptions);
    const sheetName = ensureSheetName(workbook, req.query.sheet);

    if (!sheetName) {
      return res.status(400).json({ message: 'Planilha sem abas disponíveis.' });
    }

    recalcWorkbook(workbook);

    const payload = buildSheetPayload(workbook, sheetName);
    payload.source = workbookPath;

    res.json(payload);
  } catch (error) {
    next(error);
  }
};

export const updateFormulas = (req, res, next) => {
  try {
    const { sheetName: requestedSheet, updates } = req.body || {};

    if (!Array.isArray(updates) || updates.length === 0) {
      return res.status(400).json({ message: 'Nenhuma alteração informada.' });
    }

    const workbookPath = resolveWorkbookPath();
    if (!fs.existsSync(workbookPath)) {
      return res.status(404).json({
        message: `Arquivo de planilha não encontrado em ${workbookPath}. Configure FORMULA_WORKBOOK_PATH se o arquivo estiver em outro local.`
      });
    }

    const workbook = xlsx.readFile(workbookPath, workbookOptions);
    const sheetName = ensureSheetName(workbook, requestedSheet);

    if (!sheetName) {
      return res.status(400).json({ message: 'Planilha sem abas disponíveis.' });
    }

    const sheet = workbook.Sheets[sheetName];
    if (!sheet) {
      return res.status(404).json({ message: `Aba "${sheetName}" não encontrada.` });
    }

    const editable = collectEditableCells(sheet);

    for (const update of updates) {
      const { address, value } = update || {};
      if (!address) {
        return res.status(400).json({ message: 'Atualização sem endereço de célula.' });
      }

      if (!editable.has(address)) {
        return res.status(403).json({ message: `Célula ${address} não é editável.` });
      }

      const cell = sheet[address] || { s: { patternType: 'solid', fgColor: { rgb: EDITABLE_COLOR }, bgColor: { rgb: EDITABLE_COLOR } } };
      sheet[address] = cell;

      try {
        coerceCellValue(cell, value);
      } catch (error) {
        return res.status(400).json({ message: `Erro ao atualizar ${address}: ${error.message}` });
      }
    }

    recalcWorkbook(workbook);

    xlsx.writeFile(workbook, workbookPath);

    const payload = buildSheetPayload(workbook, sheetName);
    payload.source = workbookPath;
    payload.message = 'Planilha atualizada com sucesso.';

    res.json(payload);
  } catch (error) {
    next(error);
  }
};

import { useEffect, useMemo, useState } from 'react';
import { formulasAPI } from '../api';
import { Loader2, RotateCcw, Save } from 'lucide-react';

const columnLetter = (index) => {
  let n = index + 1;
  let letters = '';
  while (n > 0) {
    const remainder = (n - 1) % 26;
    letters = String.fromCharCode(65 + remainder) + letters;
    n = Math.floor((n - 1) / 26);
  }
  return letters;
};

const normalizeDraftValue = (value) => {
  if (value === null || value === undefined) return '';
  return String(value);
};

export default function FormulaWorkbook() {
  const [sheetData, setSheetData] = useState(null);
  const [selectedSheet, setSelectedSheet] = useState('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [drafts, setDrafts] = useState({});

  const cellLookup = useMemo(() => {
    if (!sheetData?.grid) return {};
    const map = {};
    sheetData.grid.forEach((row) => {
      row.forEach((cell) => {
        map[cell.address] = cell;
      });
    });
    return map;
  }, [sheetData]);

  const hasDrafts = Object.keys(drafts).length > 0;

  const fetchSheet = async (nextSheet) => {
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      const response = await formulasAPI.getSheet({ sheet: nextSheet });
      setSheetData(response.data);
      setSelectedSheet(response.data.sheetName);
      setDrafts({});
    } catch (err) {
      const message = err?.response?.data?.message || 'Não foi possível carregar a planilha.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSheet();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleCellChange = (address, rawValue) => {
    const baseCell = cellLookup[address];
    const original = baseCell && baseCell.value !== null && baseCell.value !== undefined
      ? String(baseCell.value)
      : '';

    setDrafts((prev) => {
      const next = { ...prev };
      if (rawValue === original) {
        delete next[address];
      } else {
        next[address] = rawValue;
      }
      return next;
    });
  };

  const handleSave = async () => {
    if (!sheetData || !hasDrafts) return;

    setSaving(true);
    setError('');
    setSuccess('');

    try {
      const updates = Object.entries(drafts).map(([address, rawValue]) => {
        const cell = cellLookup[address];
        if (!cell) return { address, value: rawValue };

        if (rawValue === '') {
          return { address, value: null };
        }

        if (cell.type === 'n') {
          const candidate = Number(
            String(rawValue)
              .replace(/\s+/g, '')
              .replace(/\./g, '')
              .replace(',', '.')
          );

          return { address, value: Number.isNaN(candidate) ? rawValue : candidate };
        }

        return { address, value: rawValue };
      });

      const response = await formulasAPI.updateSheet({
        sheetName: sheetData.sheetName,
        updates
      });

      setSheetData(response.data);
      setSelectedSheet(response.data.sheetName);
      setDrafts({});
      setSuccess(response.data.message || 'Planilha atualizada com sucesso.');
    } catch (err) {
      const message = err?.response?.data?.message || 'Erro ao salvar alterações.';
      setError(message);
    } finally {
      setSaving(false);
    }
  };

  const handleReload = () => {
    if (!sheetData) {
      fetchSheet();
      return;
    }
    fetchSheet(sheetData.sheetName);
  };

  if (!sheetData && loading) {
    return (
      <div className="flex items-center justify-center py-10">
        <Loader2 className="h-6 w-6 animate-spin text-ebenezer-green" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-3">
          <label className="text-sm font-semibold text-slate-600">
            Aba
            <select
              value={selectedSheet}
              onChange={(event) => fetchSheet(event.target.value)}
              className="ml-2 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-ebenezer-green focus:outline-none"
              disabled={loading || saving}
            >
              {(sheetData?.availableSheets || []).map((sheet) => (
                <option key={sheet} value={sheet}>
                  {sheet}
                </option>
              ))}
            </select>
          </label>
          <button
            type="button"
            onClick={handleReload}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-600 hover:border-ebenezer-green hover:text-ebenezer-green"
            disabled={loading}
          >
            <RotateCcw className="h-4 w-4" />
            Recarregar
          </button>
        </div>
        <button
          type="button"
          onClick={handleSave}
          disabled={!hasDrafts || saving}
          className="inline-flex items-center gap-2 rounded-lg bg-ebenezer-green px-4 py-2 text-sm font-semibold text-white shadow-lg transition-all hover:bg-emerald-600 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {saving ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Salvando...
            </>
          ) : (
            <>
              <Save className="h-4 w-4" />
              Salvar alterações
            </>
          )}
        </button>
      </div>

      {error && (
        <div className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {error}
        </div>
      )}

      {success && (
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          {success}
        </div>
      )}

      <div className="rounded-2xl border border-slate-200 bg-white shadow-inner">
        <div className="max-h-[480px] overflow-auto">
          <table className="min-w-full border-collapse text-sm">
            <thead className="bg-slate-100 text-slate-600">
              <tr>
                <th className="sticky left-0 z-20 border border-slate-200 bg-slate-100 px-3 py-2 text-left text-xs font-semibold uppercase tracking-wider">#</th>
                {(sheetData?.grid?.[0] || []).map((_, columnIndex) => (
                  <th
                    key={`col-${columnIndex}`}
                    className="border border-slate-200 px-3 py-2 text-left text-xs font-semibold uppercase tracking-wider"
                  >
                    {columnLetter(columnIndex)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {(sheetData?.grid || []).map((row, rowIndex) => {
                const rowNumber = (sheetData.range?.s?.r || 0) + rowIndex + 1;
                return (
                  <tr key={`row-${rowNumber}`} className="even:bg-slate-50">
                    <th className="sticky left-0 z-10 border border-slate-200 bg-slate-100 px-3 py-2 text-xs font-semibold text-slate-500">
                      {rowNumber}
                    </th>
                    {row.map((cell) => {
                      const isDirty = Object.prototype.hasOwnProperty.call(drafts, cell.address);
                      const baseValue = normalizeDraftValue(
                        Object.prototype.hasOwnProperty.call(drafts, cell.address)
                          ? drafts[cell.address]
                          : cell.value
                      );

                      return (
                        <td
                          key={cell.address}
                          className={`min-w-[110px] border border-slate-200 align-top ${
                            cell.editable ? 'bg-amber-100/80' : 'bg-white'
                          } ${isDirty ? 'ring-2 ring-inset ring-ebenezer-green/60' : ''}`}
                        >
                          {cell.editable ? (
                            <input
                              type="text"
                              value={baseValue}
                              onChange={(event) => handleCellChange(cell.address, event.target.value)}
                              className="w-full bg-transparent px-2 py-1 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-ebenezer-green"
                            />
                          ) : (
                            <span className="block px-2 py-1 text-sm text-slate-700 whitespace-nowrap">
                              {cell.display ?? ''}
                            </span>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <p className="text-xs text-slate-500">
        Somente as células destacadas em dourado (cor FEF2CB) aceitam edição. Após salvar, os cálculos
        da planilha são recalculados no servidor para manter os valores consistentes com o Excel
        original.
      </p>
    </div>
  );
}

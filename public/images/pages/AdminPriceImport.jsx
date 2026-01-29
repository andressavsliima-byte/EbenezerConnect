import { useState, useRef } from 'react';
import { Upload, Download, CheckCircle, XCircle, FileSpreadsheet, AlertCircle } from 'lucide-react';
import { productsAPI } from '../api';

export default function AdminPriceImport() {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef(null);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelect = (selectedFile) => {
    const validExtensions = ['.xlsx', '.xls'];
    const fileName = selectedFile.name.toLowerCase();
    const isValid = validExtensions.some(ext => fileName.endsWith(ext));
    
    if (!isValid) {
      alert('Por favor, selecione um arquivo Excel (.xlsx ou .xls)');
      return;
    }
    
    if (selectedFile.size > 5 * 1024 * 1024) {
      alert('Arquivo muito grande. O tamanho máximo é 5MB.');
      return;
    }
    
    setFile(selectedFile);
    setResults(null);
  };

  const handleFileInputChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelect(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      alert('Por favor, selecione um arquivo primeiro');
      return;
    }

    setLoading(true);
    try {
      const response = await productsAPI.importPrices(file);
      setResults(response.data);
    } catch (error) {
      alert('Erro ao processar planilha: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  const downloadTemplate = () => {
    // Criar template Excel dinamicamente
    const data = [
      ['SKU', 'Nome do Produto', 'Novo Preço'],
      ['MOT-001', 'Motor Elétrico 1HP', '450.00'],
      ['COR-002', 'Corrente Industrial', '120.50'],
      ['ROL-003', 'Rolamento SKF', '85.00'],
      ['', '', ''],
      ['', '', ''],
      ['INSTRUÇÕES:', '', ''],
      ['• SKU: Código único do produto (obrigatório)', '', ''],
      ['• Novo Preço: Use ponto ou vírgula como decimal (ex: 450.00 ou 450,50)', '', ''],
      ['• Nome do Produto: Apenas para referência, não é usado na importação', '', ''],
    ];

    // Converter para CSV (compatível com Excel)
    const csv = data.map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
    const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'modelo_atualizacao_precos.csv';
    link.click();
  };

  const downloadResults = () => {
    if (!results) return;

    const data = [
      ['SKU', 'Nome do Produto', 'Preço Antigo', 'Preço Novo', 'Status', 'Mensagem'],
      ...results.results.map(r => [
        r.sku,
        r.name || '',
        r.oldPrice?.toFixed(2) || '',
        r.newPrice?.toFixed(2) || '',
        r.status === 'success' ? 'Sucesso' : 'Erro',
        r.message || ''
      ])
    ];

    const csv = data.map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
    const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
    link.download = `relatorio_importacao_${timestamp}.csv`;
    link.click();
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Importar Preços</h1>
          <p className="text-gray-600">
            Atualize os preços de múltiplos produtos através do upload de uma planilha Excel
          </p>
        </div>

        {/* Download Template Card */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center mb-2">
                <FileSpreadsheet className="w-6 h-6 text-[#6faf3a] mr-2" />
                <h2 className="text-xl font-semibold text-gray-900">Planilha Modelo</h2>
              </div>
              <p className="text-gray-600 mb-4">
                Baixe a planilha modelo com o formato correto para importação
              </p>
            </div>
            <button
              onClick={downloadTemplate}
              className="flex items-center px-4 py-2 bg-[#6faf3a] text-white rounded-md hover:bg-[#5a9130] transition-colors"
            >
              <Download className="w-4 h-4 mr-2" />
              Download Modelo
            </button>
          </div>
        </div>

        {/* Upload Card */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Upload da Planilha</h2>
          
          {/* Drag and Drop Area */}
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              dragActive ? 'border-[#6faf3a] bg-green-50' : 'border-gray-300 bg-gray-50'
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <Upload className={`w-12 h-12 mx-auto mb-4 ${dragActive ? 'text-[#6faf3a]' : 'text-gray-400'}`} />
            <p className="text-lg font-medium text-gray-700 mb-2">
              Arraste e solte o arquivo aqui
            </p>
            <p className="text-sm text-gray-500 mb-4">ou</p>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
            >
              Selecionar Arquivo
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx,.xls"
              onChange={handleFileInputChange}
              className="hidden"
            />
            <p className="text-xs text-gray-500 mt-4">
              Apenas arquivos .xlsx ou .xls (máximo 5MB)
            </p>
          </div>

          {/* Selected File */}
          {file && (
            <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-md flex items-center justify-between">
              <div className="flex items-center">
                <FileSpreadsheet className="w-5 h-5 text-green-600 mr-2" />
                <span className="text-sm text-gray-700">{file.name}</span>
                <span className="text-xs text-gray-500 ml-2">
                  ({(file.size / 1024).toFixed(2)} KB)
                </span>
              </div>
              <button
                onClick={() => setFile(null)}
                className="text-red-600 hover:text-red-800 text-sm"
              >
                Remover
              </button>
            </div>
          )}

          {/* Process Button */}
          <button
            onClick={handleUpload}
            disabled={!file || loading}
            className={`w-full mt-4 py-3 rounded-md font-semibold transition-colors ${
              !file || loading
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-[#6faf3a] text-white hover:bg-[#5a9130]'
            }`}
          >
            {loading ? 'Processando...' : 'Processar Importação'}
          </button>

          {/* Loading Indicator */}
          {loading && (
            <div className="mt-4">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-[#6faf3a] h-2 rounded-full animate-pulse" style={{ width: '100%' }}></div>
              </div>
            </div>
          )}
        </div>

        {/* Results Card */}
        {results && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Resultados da Importação</h2>
              <button
                onClick={downloadResults}
                className="flex items-center px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
              >
                <Download className="w-4 h-4 mr-2" />
                Exportar Relatório
              </button>
            </div>

            {/* Summary */}
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-sm text-blue-600 font-medium">Total Processados</p>
                <p className="text-2xl font-bold text-blue-900">{results.summary.total}</p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <p className="text-sm text-green-600 font-medium">Atualizados</p>
                <p className="text-2xl font-bold text-green-900">{results.summary.updated}</p>
              </div>
              <div className="bg-red-50 p-4 rounded-lg">
                <p className="text-sm text-red-600 font-medium">Erros</p>
                <p className="text-2xl font-bold text-red-900">{results.summary.errors}</p>
              </div>
            </div>

            {/* Results Table */}
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">SKU</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Produto</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Preço Antigo</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Preço Novo</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Mensagem</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {results.results.map((result, index) => (
                    <tr key={index} className={result.status === 'error' ? 'bg-red-50' : 'bg-green-50'}>
                      <td className="px-4 py-3 whitespace-nowrap">
                        {result.status === 'success' ? (
                          <CheckCircle className="w-5 h-5 text-green-600" />
                        ) : (
                          <XCircle className="w-5 h-5 text-red-600" />
                        )}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                        {result.sku}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700">
                        {result.name || '-'}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">
                        {result.oldPrice ? `R$ ${result.oldPrice.toFixed(2)}` : '-'}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm font-semibold text-gray-900">
                        {result.newPrice ? `R$ ${result.newPrice.toFixed(2)}` : '-'}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {result.message || 'Atualizado com sucesso'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

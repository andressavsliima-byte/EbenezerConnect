import XLSX from 'xlsx';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Criar dados da planilha modelo
const data = [
  {
    'SKU': 'MOT-001',
    'Nome do Produto': 'Motor Elétrico 1HP',
    'Novo Preço': 450.00
  },
  {
    'SKU': 'COR-002',
    'Nome do Produto': 'Corrente Industrial',
    'Novo Preço': 120.50
  },
  {
    'SKU': 'ROL-003',
    'Nome do Produto': 'Rolamento SKF',
    'Novo Preço': 85.00
  },
  {},
  {},
  {
    'SKU': 'INSTRUÇÕES:',
    'Nome do Produto': '',
    'Novo Preço': ''
  },
  {
    'SKU': '• SKU: Código único do produto (obrigatório)',
    'Nome do Produto': '',
    'Novo Preço': ''
  },
  {
    'SKU': '• Novo Preço: Use ponto ou vírgula como decimal (ex: 450.00 ou 450,50)',
    'Nome do Produto': '',
    'Novo Preço': ''
  },
  {
    'SKU': '• Nome do Produto: Apenas para referência, não é usado na importação',
    'Nome do Produto': '',
    'Novo Preço': ''
  }
];

// Criar workbook e worksheet
const workbook = XLSX.utils.book_new();
const worksheet = XLSX.utils.json_to_sheet(data);

// Ajustar largura das colunas
worksheet['!cols'] = [
  { wch: 15 }, // SKU
  { wch: 40 }, // Nome do Produto
  { wch: 15 }  // Novo Preço
];

// Adicionar worksheet ao workbook
XLSX.utils.book_append_sheet(workbook, worksheet, 'Preços');

// Salvar arquivo
const outputPath = path.join(__dirname, '../public/templates/modelo_atualizacao_precos.xlsx');
XLSX.writeFile(workbook, outputPath);

console.log(`Template Excel criado em: ${outputPath}`);

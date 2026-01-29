# UI Component Visualization

## Page Layout: /admin/importar-precos

```
┌─────────────────────────────────────────────────────────────────────┐
│                         NAVBAR (if not hidden)                       │
└─────────────────────────────────────────────────────────────────────┘

┌──────────────┐  ┌─────────────────────────────────────────────────┐
│              │  │                                                   │
│   SIDEBAR    │  │  ┌─────────────────────────────────────────┐    │
│              │  │  │  Importar Preços                        │    │
│ Dashboard    │  │  │  Atualize os preços de múltiplos        │    │
│ Usuários     │  │  │  produtos através do upload de uma      │    │
│ Produtos     │  │  │  planilha Excel                         │    │
│ ━━━━━━━━━━━  │  │  └─────────────────────────────────────────┘    │
│ ⬆ Importar   │  │                                                   │
│   Preços     │  │  ┌─────────────────────────────────────────┐    │
│ Admin        │  │  │  📊 Planilha Modelo                     │    │
│ Config       │  │  │                                         │    │
│              │  │  │  Baixe a planilha modelo com o formato │    │
│              │  │  │  correto para importação               │    │
│              │  │  │                                         │    │
│              │  │  │             [⬇ Download Modelo]        │    │
│              │  │  └─────────────────────────────────────────┘    │
│              │  │                                                   │
│              │  │  ┌─────────────────────────────────────────┐    │
│              │  │  │  Upload da Planilha                     │    │
│              │  │  │                                         │    │
│              │  │  │  ╔═════════════════════════════════╗   │    │
│              │  │  │  ║                                 ║   │    │
│              │  │  │  ║         ⬆ (Upload Icon)       ║   │    │
│              │  │  │  ║                                 ║   │    │
│              │  │  │  ║  Arraste e solte o arquivo aqui║   │    │
│              │  │  │  ║              ou                 ║   │    │
│              │  │  │  ║      [Selecionar Arquivo]      ║   │    │
│              │  │  │  ║                                 ║   │    │
│              │  │  │  ║  Apenas arquivos .xlsx ou .xls  ║   │    │
│              │  │  │  ║        (máximo 5MB)            ║   │    │
│              │  │  │  ╚═════════════════════════════════╝   │    │
│              │  │  │                                         │    │
│              │  │  │  [Processar Importação]                │    │
│              │  │  └─────────────────────────────────────────┘    │
│              │  │                                                   │
│              │  └───────────────────────────────────────────────────┘
│              │
└──────────────┘
```

## After File Upload - Selected State

```
┌─────────────────────────────────────────────────────────────────┐
│  Upload da Planilha                                            │
│                                                                 │
│  ╔═══════════════════════════════════════╗                    │
│  ║       (Drag and drop area)           ║                    │
│  ╚═══════════════════════════════════════╝                    │
│                                                                 │
│  ┌────────────────────────────────────────────────┐           │
│  │ 📄 precos_atualizacao.xlsx (45.2 KB)  [Remover]│ (Green bg)│
│  └────────────────────────────────────────────────┘           │
│                                                                 │
│  ╔═══════════════════════════════════════╗                    │
│  ║   [Processar Importação]              ║  (Green button)   │
│  ╚═══════════════════════════════════════╝                    │
└─────────────────────────────────────────────────────────────────┘
```

## During Processing

```
┌─────────────────────────────────────────────────────────────────┐
│  ╔═══════════════════════════════════════╗                    │
│  ║   [Processando...]                    ║  (Disabled)       │
│  ╚═══════════════════════════════════════╝                    │
│                                                                 │
│  ████████████████████████████████████████  (Animated)         │
└─────────────────────────────────────────────────────────────────┘
```

## Results Display

```
┌───────────────────────────────────────────────────────────────────┐
│  Resultados da Importação          [⬇ Exportar Relatório]       │
│                                                                    │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐                │
│  │  Total     │  │ Atualizados│  │   Erros    │                │
│  │  Process.  │  │            │  │            │                │
│  │    150     │  │    145     │  │     5      │                │
│  │  (Blue)    │  │  (Green)   │  │   (Red)    │                │
│  └────────────┘  └────────────┘  └────────────┘                │
│                                                                    │
│  ┌──────────────────────────────────────────────────────────────┐│
│  │Status│ SKU     │ Produto       │ Preço  │ Preço │ Mensagem ││
│  │      │         │               │ Antigo │ Novo  │          ││
│  ├──────────────────────────────────────────────────────────────┤│
│  │ ✓ │ MOT-001 │ Motor 1HP     │ 400.00 │ 450.00│ Success  ││ ◄ Green
│  │ ✓ │ COR-002 │ Corrente Ind. │ 100.00 │ 120.50│ Success  ││ ◄ Green
│  │ ✗ │ INV-999 │ Produto Teste │   -    │ 100.00│ Not Found││ ◄ Red
│  │ ✓ │ ROL-003 │ Rolamento SKF │  75.00 │  85.00│ Success  ││ ◄ Green
│  │ ✗ │ BAD-001 │ Produto Err   │   -    │  ABC  │ Inv Price││ ◄ Red
│  └──────────────────────────────────────────────────────────────┘│
└───────────────────────────────────────────────────────────────────┘
```

## Color Scheme

```
Primary Green:   #6faf3a (Buttons, success indicators)
Hover Green:     #5a9130 (Button hover)
Light Green:     #4e7330 (Sidebar hover)

Background:      #f9fafb (Gray 50)
Card BG:         #ffffff (White)

Success BG:      #f0fdf4 (Green 50)
Success Border:  #bbf7d0 (Green 200)
Success Icon:    #16a34a (Green 600)

Error BG:        #fef2f2 (Red 50)
Error Icon:      #dc2626 (Red 600)

Info BG:         #eff6ff (Blue 50)
```

## Icons Used (Lucide React)

```
Upload           ⬆  - Main upload area
Download         ⬇  - Download buttons
CheckCircle      ✓  - Success indicator
XCircle          ✗  - Error indicator
FileSpreadsheet  📄  - File representation
AlertCircle      ⚠  - Warnings (unused but imported)
```

## Responsive Behavior

### Desktop (md and up)
```
┌────────┬─────────────────────┐
│Sidebar │   Main Content      │
│ 240px  │   Flex: remaining   │
└────────┴─────────────────────┘
```

### Mobile
```
┌──────────────────┐
│  Main Content    │
│  (Full width)    │
│                  │
│                  │
└──────────────────┘
┌──────────────────┐
│  Mobile Tab Bar  │
└──────────────────┘
```

## Component Hierarchy

```
AdminPriceImport
│
├── Header Section
│   ├── Title (h1)
│   └── Description (p)
│
├── Template Download Card
│   ├── Icon + Title
│   ├── Description
│   └── Download Button
│
├── Upload Card
│   ├── Title
│   ├── Drag & Drop Area
│   │   ├── Upload Icon
│   │   ├── Instructions
│   │   ├── File Input (hidden)
│   │   └── Select Button
│   ├── Selected File Display (conditional)
│   ├── Process Button
│   └── Loading Bar (conditional)
│
└── Results Card (conditional)
    ├── Header + Export Button
    ├── Summary Statistics
    │   ├── Total Card (blue)
    │   ├── Updated Card (green)
    │   └── Errors Card (red)
    └── Results Table
        ├── Table Header
        └── Table Body (mapped rows)
            ├── Status Icon
            ├── SKU
            ├── Product Name
            ├── Old Price
            ├── New Price
            └── Message
```

## State Management

```javascript
States:
├── file: File | null
├── loading: boolean
├── results: ImportResults | null
├── dragActive: boolean
└── fileInputRef: RefObject

Import Results Structure:
{
  success: boolean,
  summary: {
    total: number,
    updated: number,
    errors: number
  },
  results: Array<{
    sku: string,
    name: string,
    oldPrice?: number,
    newPrice?: number,
    status: 'success' | 'error',
    message?: string
  }>
}
```

## User Interactions Flow

```
1. Page Load
   ↓
2. Optional: Download Template
   ↓
3. Select/Drop File
   ↓ (validates file)
4. File Displayed
   ↓
5. Click "Processar Importação"
   ↓ (shows loading)
6. API Call
   ↓ (receives response)
7. Results Displayed
   ↓
8. Optional: Export Results
```

## Error States

### File Validation Error
```
┌───────────────────────────────────┐
│  ⚠ Alert Dialog                  │
│  Por favor, selecione um arquivo │
│  Excel (.xlsx ou .xls)           │
│           [OK]                    │
└───────────────────────────────────┘
```

### Size Limit Error
```
┌───────────────────────────────────┐
│  ⚠ Alert Dialog                  │
│  Arquivo muito grande. O tamanho │
│  máximo é 5MB.                   │
│           [OK]                    │
└───────────────────────────────────┘
```

### Processing Error
```
┌───────────────────────────────────┐
│  ⚠ Alert Dialog                  │
│  Erro ao processar planilha:     │
│  [error message from API]        │
│           [OK]                    │
└───────────────────────────────────┘
```

## Accessibility Features

```
✓ Keyboard Navigation
  - Tab through all interactive elements
  - Enter to trigger buttons
  - Space for checkboxes/radios

✓ Screen Reader Support
  - Semantic HTML (table, button, etc.)
  - Alt text for icons
  - ARIA labels where needed

✓ Visual Feedback
  - Focus indicators
  - Hover states
  - Active states
  - Loading indicators

✓ Color Contrast
  - Text meets WCAG AA standards
  - Icons are distinguishable
  - Status colors are clear
```

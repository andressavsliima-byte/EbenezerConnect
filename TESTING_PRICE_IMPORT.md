# Testing Guide: Bulk Price Import Feature

## Overview
This guide provides instructions for testing the bulk price import functionality.

## Prerequisites
1. Running MongoDB instance
2. Backend server running on port 5000
3. Frontend dev server running on port 3001
4. Admin user account

## Test Scenarios

### 1. Template Download
**Steps:**
1. Login as admin user
2. Navigate to "Importar Preços" in the admin sidebar
3. Click "Download Modelo" button
4. Verify that a CSV file is downloaded
5. Open the file and verify it contains:
   - Headers: SKU, Nome do Produto, Novo Preço
   - Sample data rows
   - Instructions section

**Expected Result:** CSV file downloads successfully with correct format

### 2. Valid File Upload
**Steps:**
1. Create a test Excel file (.xlsx) with the following content:
   ```
   SKU         | Nome do Produto    | Novo Preço
   TEST-001    | Produto Teste 1    | 100.00
   TEST-002    | Produto Teste 2    | 250.50
   ```
2. Ensure products with SKUs TEST-001 and TEST-002 exist in the database
3. Drag and drop the file into the upload area OR click "Selecionar Arquivo"
4. Verify file name appears below the upload area
5. Click "Processar Importação"
6. Wait for processing to complete

**Expected Result:**
- Progress indicator shows during processing
- Results table displays with:
  - Green checkmarks for successful updates
  - Summary shows: 2 total, 2 updated, 0 errors
  - Old and new prices are displayed correctly
- Products in database should have updated prices

### 3. Invalid File Type
**Steps:**
1. Try to upload a .txt, .pdf, or .jpg file
2. Observe the response

**Expected Result:**
- Alert message: "Por favor, selecione um arquivo Excel (.xlsx ou .xls)"
- File is not accepted

### 4. File Too Large
**Steps:**
1. Try to upload a file larger than 5MB
2. Observe the response

**Expected Result:**
- Alert message: "Arquivo muito grande. O tamanho máximo é 5MB."
- File is not accepted

### 5. Non-existent SKU
**Steps:**
1. Create Excel file with SKU that doesn't exist in database:
   ```
   SKU           | Nome do Produto    | Novo Preço
   INVALID-999   | Produto Inexistente| 99.99
   ```
2. Upload and process

**Expected Result:**
- Results table shows red X icon for the row
- Status: "error"
- Message: "Produto não encontrado"
- Summary: 1 total, 0 updated, 1 error

### 6. Invalid Price Format
**Steps:**
1. Create Excel file with invalid prices:
   ```
   SKU       | Nome do Produto | Novo Preço
   TEST-001  | Produto Teste   | ABC
   TEST-002  | Produto Teste   | -50
   ```
2. Upload and process

**Expected Result:**
- Both rows show error status
- Message: "Preço inválido (deve ser um número positivo)"
- Summary: 2 total, 0 updated, 2 errors

### 7. Duplicate SKU in Spreadsheet
**Steps:**
1. Create Excel file with duplicate SKUs:
   ```
   SKU       | Nome do Produto | Novo Preço
   TEST-001  | Produto Teste   | 100.00
   TEST-001  | Produto Teste   | 150.00
   ```
2. Upload and process

**Expected Result:**
- Second occurrence shows error
- Message: "SKU duplicado na planilha"
- Summary: 2 total, 1 updated, 1 error

### 8. Empty SKU
**Steps:**
1. Create Excel file with missing SKU:
   ```
   SKU  | Nome do Produto | Novo Preço
        | Produto Teste   | 100.00
   ```
2. Upload and process

**Expected Result:**
- Row shows error status
- Message: "SKU não informado"
- Summary: 1 total, 0 updated, 1 error

### 9. Mixed Valid and Invalid Rows
**Steps:**
1. Create Excel file with mix of valid and invalid data:
   ```
   SKU         | Nome do Produto    | Novo Preço
   TEST-001    | Produto Teste 1    | 100.00
   INVALID     | Produto Inexistente| 50.00
   TEST-002    | Produto Teste 2    | ABC
   TEST-003    | Produto Teste 3    | 200.00
   ```
2. Upload and process

**Expected Result:**
- TEST-001: Success (green)
- INVALID: Error - "Produto não encontrado"
- TEST-002: Error - "Preço inválido"
- TEST-003: Success (green)
- Summary: 4 total, 2 updated, 2 errors

### 10. Export Results
**Steps:**
1. After processing any upload, click "Exportar Relatório"
2. Verify CSV file is downloaded with timestamp in filename
3. Open the file and verify it contains:
   - All processed rows with their status
   - Old and new prices
   - Error messages where applicable

**Expected Result:**
- CSV downloads with format: `relatorio_importacao_YYYY-MM-DDTHH-MM-SS.csv`
- File contains complete results data

### 11. Decimal Format Handling
**Steps:**
1. Create Excel file with different decimal formats:
   ```
   SKU       | Nome do Produto | Novo Preço
   TEST-001  | Produto Teste 1 | 100.50
   TEST-002  | Produto Teste 2 | 200,75
   TEST-003  | Produto Teste 3 | 300
   ```
2. Upload and process

**Expected Result:**
- All three prices are accepted and properly converted
- Both comma and period are handled correctly
- Integer values are accepted

### 12. Empty Spreadsheet
**Steps:**
1. Create Excel file with only headers (no data rows)
2. Upload and process

**Expected Result:**
- Error message: "Planilha vazia ou formato inválido"
- No results table is displayed

### 13. Access Control
**Steps:**
1. Try to access `/admin/importar-precos` as a non-admin user
2. Try to call the API endpoint directly without admin credentials

**Expected Result:**
- Non-admin users are redirected or see access denied
- API returns 403 Forbidden

### 14. Drag and Drop Interaction
**Steps:**
1. Drag an Excel file over the upload area
2. Observe the visual feedback
3. Drop the file
4. Verify file is selected

**Expected Result:**
- Upload area changes color/style when file is dragged over
- File is automatically selected after drop
- File name appears below upload area

### 15. Activity Logging
**Steps:**
1. Process a file upload
2. Check server logs

**Expected Result:**
- Log entry contains:
  - User email who performed import
  - Number of products updated
  - Number of errors
  - Format: `[PRICE IMPORT] User: user@example.com | Updated: X | Errors: Y`

## API Testing with cURL

### Valid Upload
```bash
curl -X POST http://localhost:5000/api/products/import-prices \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -F "file=@test-prices.xlsx"
```

### Expected Response
```json
{
  "success": true,
  "summary": {
    "total": 3,
    "updated": 2,
    "errors": 1
  },
  "results": [
    {
      "sku": "TEST-001",
      "name": "Produto Teste 1",
      "oldPrice": 50.00,
      "newPrice": 100.00,
      "status": "success"
    },
    {
      "sku": "INVALID",
      "name": "Produto Inexistente",
      "newPrice": 50.00,
      "status": "error",
      "message": "Produto não encontrado"
    }
  ]
}
```

## Database Verification

After successful imports, verify in MongoDB:
```javascript
db.products.find({ sku: "TEST-001" }).pretty()
```

Check that:
- `price` field has the new value
- `updatedAt` field has been updated to current timestamp

## Performance Testing

Test with a large file:
1. Create Excel with 100-500 products
2. Upload and process
3. Verify:
   - Processing completes within reasonable time
   - All rows are processed
   - Memory usage is acceptable
   - No server timeout

## Notes
- All tests should be performed in a development/staging environment
- Create test products before testing to avoid modifying production data
- Keep a backup of product data before running tests
- Test with both .xlsx and .xls file formats

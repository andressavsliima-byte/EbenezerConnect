# Bulk Price Import Feature - Documentation

## Overview
The Bulk Price Import feature allows administrators to update product prices in bulk by uploading an Excel spreadsheet. This streamlines the process of updating multiple product prices simultaneously.

## Features

### 1. Template Download
- Provides a downloadable CSV template with the correct format
- Includes sample data and instructions
- Compatible with Excel and other spreadsheet applications

### 2. File Upload
- **Drag and Drop**: Simply drag an Excel file into the upload area
- **File Browser**: Click "Selecionar Arquivo" to browse and select a file
- **File Validation**: 
  - Accepts only .xlsx and .xls formats
  - Maximum file size: 5MB
  - Validates file type both by extension and MIME type

### 3. Real-time Processing
- Shows loading indicator during file processing
- Processes each row sequentially
- Validates data before updating database

### 4. Detailed Results
- **Summary Statistics**:
  - Total rows processed
  - Number of successful updates
  - Number of errors
  
- **Results Table**:
  - Color-coded status (green = success, red = error)
  - Shows SKU, product name, old price, new price
  - Displays error messages for failed updates
  
- **Export Functionality**:
  - Download complete results as CSV
  - Includes timestamp in filename
  - Contains all processing details

## Spreadsheet Format

### Required Columns
1. **SKU** (required): The unique product identifier
2. **Nome do Produto** (optional): Product name for reference only
3. **Novo Preço** (required): The new price to set

### Example Data
```
SKU         | Nome do Produto          | Novo Preço
MOT-001     | Motor Elétrico 1HP       | 450.00
COR-002     | Corrente Industrial      | 120.50
ROL-003     | Rolamento SKF            | 85.00
```

### Rules and Validations
- **SKU must be unique** in the spreadsheet (no duplicates)
- **SKU must exist** in the database
- **Price must be numeric** and non-negative
- **Decimal separator**: Accepts both period (.) and comma (,)
- **Price format**: Can be integer (100) or decimal (100.50 or 100,50)

## Validation and Error Handling

### File-level Validations
- ✅ File format (.xlsx or .xls only)
- ✅ File size (maximum 5MB)
- ✅ Non-empty spreadsheet

### Row-level Validations
- ✅ SKU is provided
- ✅ SKU exists in database
- ✅ No duplicate SKUs in the same file
- ✅ Price is a valid positive number
- ✅ Price format is correct

### Error Messages
- "SKU não informado" - Missing SKU field
- "Produto não encontrado" - Product with this SKU doesn't exist
- "SKU duplicado na planilha" - Same SKU appears multiple times
- "Preço inválido (deve ser um número positivo)" - Invalid price format or negative value
- "Planilha vazia ou formato inválido" - No data rows in spreadsheet

## Security Features

### Access Control
- **Admin Only**: Only users with admin role can access this feature
- **Authentication Required**: Must be logged in with valid token
- **Protected Route**: Frontend and backend both enforce admin-only access

### File Security
- **Type Validation**: Validates both file extension and MIME type
- **Size Limit**: 5MB maximum to prevent abuse
- **Memory Upload**: Files are processed in memory (not saved to disk)
- **Sanitization**: All input data is sanitized before processing

### Activity Logging
- Every import is logged with:
  - User email who performed the import
  - Timestamp
  - Number of products updated
  - Number of errors

## Usage Guide

### Step 1: Access the Feature
1. Login as an administrator
2. Click on "Importar Preços" in the left sidebar (admin menu)
3. You'll see the bulk price import page

### Step 2: Download Template (Optional)
1. Click "Download Modelo" button
2. A CSV file will download with the correct format
3. Open in Excel or similar application
4. Use this as a reference for your data

### Step 3: Prepare Your Spreadsheet
1. Create or open an Excel file (.xlsx or .xls)
2. Include these columns in the first row:
   - SKU
   - Nome do Produto (optional)
   - Novo Preço
3. Fill in your data rows
4. Ensure SKUs exist in your database
5. Use valid price formats

### Step 4: Upload the File
**Option A - Drag and Drop:**
1. Drag your Excel file over the upload area
2. The area will highlight when ready
3. Drop the file

**Option B - File Browser:**
1. Click "Selecionar Arquivo"
2. Browse to your Excel file
3. Click Open

### Step 5: Review and Process
1. Verify the file name appears below the upload area
2. Check file size is under 5MB
3. Click "Processar Importação" button
4. Wait for processing to complete (progress bar will show)

### Step 6: Review Results
1. Check the summary statistics:
   - How many products were processed
   - How many were successfully updated
   - How many had errors
2. Review the results table:
   - Green checkmarks = successful updates
   - Red X marks = errors (read the message)
3. Verify old vs new prices are correct

### Step 7: Export Results (Optional)
1. Click "Exportar Relatório"
2. A CSV file will download with complete results
3. Keep this for your records

## Best Practices

### Before Importing
- ✅ **Backup your database** before making bulk changes
- ✅ **Test with a small file first** (5-10 products)
- ✅ **Verify SKUs** exist in the system
- ✅ **Double-check prices** for accuracy
- ✅ **Use consistent decimal format** throughout the file

### During Import
- ✅ **Wait for completion** - don't navigate away during processing
- ✅ **Check for errors** in the results table
- ✅ **Review the summary** statistics

### After Import
- ✅ **Export results** for your records
- ✅ **Verify key products** in the system
- ✅ **Check the activity log** on the server
- ✅ **Notify stakeholders** of price changes

## Common Issues and Solutions

### Issue: "Arquivo muito grande"
**Solution**: Your file exceeds 5MB. Try:
- Splitting into multiple smaller files
- Removing unnecessary columns or formatting
- Compressing the file

### Issue: Multiple "Produto não encontrado" errors
**Solution**: 
- Verify SKUs are correct (check spelling, case-sensitivity)
- Ensure products exist in database
- Export products list and compare SKUs

### Issue: "Preço inválido" errors
**Solution**:
- Remove any currency symbols (R$, $, etc.)
- Use only numbers and decimal separator
- Avoid spaces in price values
- Check for negative values

### Issue: File upload doesn't work
**Solution**:
- Check file extension is .xlsx or .xls
- Verify file is not corrupted (try opening in Excel)
- Try using file browser instead of drag-and-drop
- Clear browser cache and try again

## Technical Details

### API Endpoint
```
POST /api/products/import-prices
```

### Request Headers
```
Authorization: Bearer {admin_token}
Content-Type: multipart/form-data
```

### Request Body
```
file: [Excel file]
```

### Response Format
```json
{
  "success": true,
  "summary": {
    "total": 150,
    "updated": 145,
    "errors": 5
  },
  "results": [
    {
      "sku": "MOT-001",
      "name": "Motor Elétrico 1HP",
      "oldPrice": 400.00,
      "newPrice": 450.00,
      "status": "success"
    },
    {
      "sku": "INV-999",
      "name": "Produto Teste",
      "newPrice": 100.00,
      "status": "error",
      "message": "Produto não encontrado"
    }
  ]
}
```

### Database Impact
For each successful update:
- `price` field is updated
- `updatedAt` field is set to current timestamp
- No other product fields are modified

## Future Enhancements
Potential improvements for future versions:
- Price history tracking
- Scheduled imports
- Bulk update of other fields (stock, category, etc.)
- Email notifications after import
- Preview before commit
- Undo functionality
- Import from CSV directly
- API rate limiting
- Batch processing for very large files

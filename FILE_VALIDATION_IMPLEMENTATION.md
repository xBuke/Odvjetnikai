# File Validation Implementation

This document outlines the file validation system implemented to ensure only allowed document types can be uploaded to the storage bucket.

## Overview

The validation system provides both client-side and server-side validation to prevent invalid files from being uploaded, ensuring data integrity and security.

## Components Added/Modified

### 1. File Validation Library (`src/lib/fileValidation.ts`)

**New file** that provides comprehensive validation utilities:

- **Allowed MIME Types**: PDF, images (JPEG, PNG, GIF, WebP), text files (TXT, CSV), Microsoft Office documents (DOC, DOCX, XLS, XLSX, PPT, PPTX)
- **File Size Limit**: 50MB maximum
- **Document Type Validation**: Validates against the `document_type` enum from the database
- **Client-side validation functions**: `validateFile()`, `validateDocumentType()`
- **Server-side validation functions**: `validateFileServerSide()`
- **User-friendly error messages**: `getFileValidationErrorMessage()`

### 2. Documents Page (`src/app/documents/page.tsx`)

**Modified** to include comprehensive validation:

- **Client-side validation on file selection**: Validates file type, size, and extension before allowing selection
- **Pre-upload validation**: Additional validation before starting the upload process
- **Document type validation**: Ensures selected document type is valid
- **Server-side validation**: Calls API endpoint for additional security
- **Updated file input**: Added comprehensive `accept` attribute and helpful user message
- **Improved error handling**: Uses toast notifications for better UX

### 3. API Route (`src/app/api/upload/validate/route.ts`)

**New API endpoint** for server-side validation:

- **POST `/api/upload/validate`**: Validates files and document types on the server
- **FormData support**: Accepts file and document type for validation
- **Comprehensive validation**: File type, size, extension, and document type validation
- **Error responses**: Returns detailed error messages for invalid files

### 4. Storage Bucket Configuration

**Updated** storage bucket creation and migration files:

- **`create-storage-bucket.js`**: Updated with comprehensive MIME type list
- **`supabase/migrations/20250103_add_documents_bucket.sql`**: Updated with matching MIME types

## Validation Flow

### Client-Side Validation (Immediate)
1. **File Selection**: When user selects a file, immediate validation occurs
2. **File Type Check**: Validates MIME type and file extension
3. **File Size Check**: Ensures file is under 50MB limit
4. **User Feedback**: Shows error toast if validation fails

### Pre-Upload Validation (Before Upload)
1. **Document Type Validation**: Ensures selected document type is valid
2. **Re-validation**: Double-checks file validation before upload
3. **Server Validation**: Calls API endpoint for server-side validation

### Server-Side Validation (API Route)
1. **File Validation**: Validates file type, size, and extension
2. **Document Type Validation**: Validates document type enum value
3. **Response**: Returns validation result with detailed error messages

## Allowed File Types

### Documents
- **PDF**: `application/pdf`
- **Microsoft Word**: `application/msword`, `application/vnd.openxmlformats-officedocument.wordprocessingml.document`
- **Microsoft Excel**: `application/vnd.ms-excel`, `application/vnd.openxmlformats-officedocument.spreadsheetml.sheet`
- **Microsoft PowerPoint**: `application/vnd.ms-powerpoint`, `application/vnd.openxmlformats-officedocument.presentationml.presentation`

### Images
- **JPEG**: `image/jpeg`, `image/jpg`
- **PNG**: `image/png`
- **GIF**: `image/gif`
- **WebP**: `image/webp`

### Text Files
- **Plain Text**: `text/plain`
- **CSV**: `text/csv`

## Document Types (Enum Validation)

The system validates against the `document_type` enum from the database:
- `ugovor` (Contract)
- `pravni_dokument` (Legal Document)
- `nacrt_dokumenta` (Document Draft)
- `financijski_dokument` (Financial Document)
- `korespondencija` (Correspondence)
- `dokazni_materijal` (Evidence Material)

## Security Features

1. **Double Validation**: Both client and server-side validation
2. **MIME Type Validation**: Prevents file type spoofing
3. **File Extension Validation**: Additional security layer
4. **Size Limits**: Prevents large file uploads
5. **Document Type Validation**: Ensures only valid document types are used

## Error Messages

The system provides user-friendly error messages in Croatian:
- File size exceeded: "Datoteka je prevelika. Maksimalna veličina je 50MB."
- Invalid file type: "Tip datoteke nije podržan. Dozvoljeni tipovi: PDF, slike (JPG, PNG, GIF, WebP), tekstualne datoteke (TXT, CSV), Microsoft Office dokumenti (DOC, DOCX, XLS, XLSX, PPT, PPTX)."
- Invalid document type: "Neispravan tip dokumenta. Molimo odaberite valjan tip dokumenta."

## Usage

### For Developers

```typescript
import { validateFile, validateDocumentType } from '@/lib/fileValidation';

// Validate a file
const validation = validateFile(file);
if (!validation.isValid) {
  console.error(validation.error);
}

// Validate document type
if (!validateDocumentType('ugovor')) {
  console.error('Invalid document type');
}
```

### For API Usage

```typescript
const formData = new FormData();
formData.append('file', file);
formData.append('documentType', 'ugovor');

const response = await fetch('/api/upload/validate', {
  method: 'POST',
  body: formData
});

const result = await response.json();
if (!result.isValid) {
  console.error(result.error);
}
```

## Testing

To test the validation system:

1. **Valid Files**: Try uploading PDF, DOC, DOCX, XLS, XLSX, PPT, PPTX, TXT, CSV, JPG, PNG, GIF, WebP files
2. **Invalid Files**: Try uploading executable files, archives, or other unsupported formats
3. **Large Files**: Try uploading files larger than 50MB
4. **Invalid Document Types**: Try selecting invalid document types in the form

## Future Enhancements

Potential improvements for the validation system:
1. **Virus Scanning**: Integrate with antivirus API
2. **Content Validation**: Validate file content matches declared type
3. **Custom File Types**: Allow configuration of allowed file types
4. **Batch Validation**: Support for multiple file validation
5. **Audit Logging**: Log validation attempts for security monitoring

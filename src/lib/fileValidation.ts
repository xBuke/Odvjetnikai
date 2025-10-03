import { DocumentType } from './documentTypes';

// Allowed MIME types for document uploads
export const ALLOWED_MIME_TYPES = [
  'application/pdf',
  'image/jpeg',
  'image/jpg', 
  'image/png',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
] as const;

// Maximum file size (50MB)
export const MAX_FILE_SIZE = 50 * 1024 * 1024;

// File extensions that correspond to allowed MIME types
export const ALLOWED_EXTENSIONS = [
  '.pdf',
  '.jpg',
  '.jpeg', 
  '.png',
  '.doc',
  '.docx'
] as const;

export interface FileValidationResult {
  isValid: boolean;
  error?: string;
}

/**
 * Validates file type and size on the client side
 */
export function validateFile(file: File): FileValidationResult {
  // Check file size
  if (file.size > MAX_FILE_SIZE) {
    return {
      isValid: false,
      error: `File size exceeds maximum allowed size of ${MAX_FILE_SIZE / (1024 * 1024)}MB`
    };
  }

  // Check MIME type
  if (!ALLOWED_MIME_TYPES.includes(file.type as typeof ALLOWED_MIME_TYPES[number])) {
    return {
      isValid: false,
      error: `File type "${file.type}" is not allowed. Allowed types: ${ALLOWED_MIME_TYPES.join(', ')}`
    };
  }

  // Check file extension as additional validation
  const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
  if (!ALLOWED_EXTENSIONS.includes(fileExtension as typeof ALLOWED_EXTENSIONS[number])) {
    return {
      isValid: false,
      error: `File extension "${fileExtension}" is not allowed. Allowed extensions: ${ALLOWED_EXTENSIONS.join(', ')}`
    };
  }

  return { isValid: true };
}

/**
 * Validates document type enum value
 */
export function validateDocumentType(type: string): type is DocumentType {
  const validTypes: DocumentType[] = [
    'ugovor',
    'pravni_dokument',
    'nacrt_dokumenta', 
    'financijski_dokument',
    'korespondencija',
    'dokazni_materijal'
  ];
  return validTypes.includes(type as DocumentType);
}

/**
 * Server-side validation function (can be used in API routes)
 */
export function validateFileServerSide(file: File, documentType?: string): FileValidationResult {
  // First validate the file itself
  const fileValidation = validateFile(file);
  if (!fileValidation.isValid) {
    return fileValidation;
  }

  // If document type is provided, validate it
  if (documentType && !validateDocumentType(documentType)) {
    return {
      isValid: false,
      error: `Invalid document type "${documentType}". Must be one of: ugovor, pravni_dokument, nacrt_dokumenta, financijski_dokument, korespondencija, dokazni_materijal`
    };
  }

  return { isValid: true };
}

/**
 * Get user-friendly error message for file validation
 */
export function getFileValidationErrorMessage(error: string): string {
  if (error.includes('File size exceeds')) {
    return 'Datoteka je prevelika. Maksimalna veličina je 50MB.';
  }
  if (error.includes('File type') || error.includes('File extension')) {
    return 'Tip datoteke nije podržan. Dozvoljeni tipovi: PDF, DOC, DOCX, JPG, PNG.';
  }
  if (error.includes('Invalid document type')) {
    return 'Neispravan tip dokumenta. Molimo odaberite valjan tip dokumenta.';
  }
  return 'Greška pri validaciji datoteke.';
}

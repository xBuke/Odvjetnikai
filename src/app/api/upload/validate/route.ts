import { NextRequest, NextResponse } from 'next/server';
import { validateFileServerSide, validateDocumentType } from '@/lib/fileValidation';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const documentType = formData.get('documentType') as string;

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Validate file and document type
    const validation = validateFileServerSide(file, documentType);
    
    if (!validation.isValid) {
      return NextResponse.json(
        { 
          error: validation.error,
          isValid: false 
        },
        { status: 400 }
      );
    }

    // If document type is provided, validate it separately
    if (documentType && !validateDocumentType(documentType)) {
      return NextResponse.json(
        { 
          error: `Invalid document type "${documentType}". Must be one of: ugovor, pravni_dokument, nacrt_dokumenta, financijski_dokument, korespondencija, dokazni_materijal`,
          isValid: false 
        },
        { status: 400 }
      );
    }

    return NextResponse.json({
      isValid: true,
      message: 'File validation passed',
      fileInfo: {
        name: file.name,
        size: file.size,
        type: file.type
      }
    });

  } catch (error) {
    console.error('File validation error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error during file validation',
        isValid: false 
      },
      { status: 500 }
    );
  }
}

'use client';

import { useState, useEffect, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { 
  ArrowLeft,
  Download,
  FileText,
  Calendar,
  User,
  File,
  Eye,
  Share2,
  Edit
} from 'lucide-react';
import { getDocumentLabel, type DocumentType } from '@/lib/documentTypes';


interface Document {
  id: string;
  name: string;
  caseId: string | null;
  caseTitle: string | null;
  uploadedDate: string;
  size: string;
  type: DocumentType;
  description?: string;
  content?: string;
}

export default function DocumentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const documentId = params.id as string;


  // Mock documents data with additional details
  const mockDocuments: Document[] = useMemo(() => [
    {
      id: 'doc-1-uuid-1234-5678-9abc-def012345678',
      name: 'Ugovor o suradnji - Zagrebačka banka.pdf',
      caseId: 'case-1-uuid-1234-5678-9abc-def012345678',
      caseTitle: 'Horvat protiv Zagrebačke banke - Spor ugovora',
      uploadedDate: '2024-12-01',
      size: '2.4 MB',
      type: 'ugovor',
      description: 'Licencni ugovor za softver između Horvata i Zagrebačke banke. Sadrži uvjete i odredbe za korištenje vlasničkog softvera.',
      content: `UGOVOR O SUDRADNJI

Ovaj Ugovor o licenciranju softvera ("Ugovor") sklopljen je 1. prosinca 2024. godine između Marka Horvata ("Primatelj licence") i Zagrebačke banke d.d. ("Davatelj licence").

1. DODJELA LICENCE
Davatelj licence ovime dodjeljuje Primatelju licence neisključivu, neprenosivu licencu za korištenje Softvera u skladu s uvjetima i odredbama navedenim u ovom Ugovoru.

2. OGRANIČENJA
Primatelj licence neće:
- Kopirati, mijenjati ili stvarati izvedena djela Softvera
- Obavljati obrnuto inženjerstvo, dekompajliranje ili rastavljanje Softvera
- Distribuirati, podlicencirati ili prenositi Softver trećim stranama

3. UVJETI PLAĆANJA
Primatelj licence pristaje platiti Davatelju licence iznos od 50.000 EUR u roku od 30 dana od sklapanja ovog Ugovora.

4. ROK I RASKID
Ovaj Ugovor počinje na datum sklapanja i traje 2 godine, osim ako se ne raskine ranije u skladu s odredbama ovog Ugovora.

5. MJEŠOVITO PRAVO
Ovaj Ugovor regulira se i tumači u skladu sa zakonima Republike Hrvatske.

U POTVRDU GORE NAPISANOG, stranke su potpisale ovaj Ugovor na datum naveden gore.

Marko Horvat                    Zagrebačka banka d.d.
_________________            _________________
Potpis                        Potpis

Datum: _______________        Datum: _______________`
    },
    {
      id: 'doc-2-uuid-2345-6789-abcd-ef0123456789',
      name: 'Zahtjev za dozvolu za obavljanje djelatnosti.pdf',
      caseId: 'case-4-uuid-4567-89ab-cdef-012345678901',
      caseTitle: 'Babić - Osnivanje tvrtke',
      uploadedDate: '2024-11-28',
      size: '1.8 MB',
      type: 'pravni_dokument',
      description: 'Zahtjev za dozvolu za obavljanje djelatnosti za Babić d.o.o. Uključuje sve potrebne obrasce i prateću dokumentaciju.',
      content: `ZAHTJEV ZA DOZVOLU ZA OBAVLJANJE DJELATNOSTI

PODACI O PODNOSITELJU ZAHTJEVA:
Naziv tvrtke: Babić d.o.o.
Vrsta tvrtke: Društvo s ograničenom odgovornošću
Adresa: Ilica 123, 10000 Zagreb
Kontakt osoba: Ivana Babić
Telefon: +385 98 456 7890
Email: ivana.babic@poduzetnik.hr

DJELATNOSTI:
Glavna djelatnost: Tehnološko savjetovanje
Sporedne djelatnosti: Razvoj softvera, IT usluge

ZAHTJEVANA DOZVOLA:
Vrsta dozvole: Opća dozvola za obavljanje djelatnosti
Trajanje: Godišnja
Naknada: 500 EUR

PRATEĆI DOKUMENTI:
- Statut tvrtke
- Ugovor o osnivanju
- Potvrda o OIB-u
- Potvrda o osiguranju

IZJAVA:
Ovime izjavljujem da su podaci navedeni u ovom zahtjevu istiniti i točni prema mojoj najboljoj spoznaji.

Potpis: _________________
Datum: _________________`
    },
    {
      id: 'doc-3-uuid-3456-789a-bcde-f01234567890',
      name: 'Nacrt radnog ugovora.docx',
      caseId: null,
      caseTitle: null,
      uploadedDate: '2024-11-25',
      size: '856 KB',
      type: 'nacrt_dokumenta',
      description: 'Nacrt radnog ugovora za izvršnu poziciju. Sadrži standardne uvjete i odredbe za zapošljavanje.',
      content: `NACRT RADNOG UGOVORA

ZAPOSLENIK: [Ime za popuniti]
RADNO MJESTO: Izvršni direktor
TVRTKA: [Naziv tvrtke]
DATUM STUPANJA: [Datum]

1. RADNO MJESTO I DUŽNOSTI
Zaposlenik će služiti kao Izvršni direktor i obavljati dužnosti koje mu dodijeli Upravni odbor.

2. NAKNADA
Osnovna plaća: 150.000 EUR godišnje
Bonus: Na temelju rezultata, do 25% osnovne plaće
Beneficije: Zdravstveno osiguranje, mirovinski plan, godišnji odmor

3. ROK ZAPOŠLJAVANJA
Ovaj ugovor počinje [Datum] i traje do raskida od strane bilo koje stranke s 30 dana pismenog obavještenja.

4. POVJERLJIVOST
Zaposlenik pristaje čuvati povjerljivost svih vlasničkih informacija i poslovnih tajni.

5. ZABRANA KONKURENCIJE
Zaposlenik pristaje ne konkurirati s Tvrtkom u razdoblju od 12 mjeseci nakon raskida.

[Dodatni uvjeti za pregovaranje]`
    },
    {
      id: 'doc-4-uuid-4567-89ab-cdef-012345678901',
      name: 'Financijski izvještaj 2024.xlsx',
      caseId: 'case-2-uuid-2345-6789-abcd-ef0123456789',
      caseTitle: 'Novak - Trgovina nekretninama',
      uploadedDate: '2024-11-20',
      size: '3.2 MB',
      type: 'financijski_dokument',
      description: 'Godišnji financijski izvještaj za Novak Nekretnine. Uključuje bilancu, račun dobiti i gubitka te izvještaj o novčanom toku.',
      content: `FINANCIAL STATEMENTS 2024
GARCIA REAL ESTATE

BALANCE SHEET
As of December 31, 2024

ASSETS:
Current Assets:
  Cash and Cash Equivalents: $250,000
  Accounts Receivable: $180,000
  Inventory: $320,000
  Total Current Assets: $750,000

Fixed Assets:
  Property, Plant & Equipment: $2,500,000
  Less: Accumulated Depreciation: ($500,000)
  Net Fixed Assets: $2,000,000

Total Assets: $2,750,000

LIABILITIES:
Current Liabilities:
  Accounts Payable: $120,000
  Short-term Debt: $200,000
  Total Current Liabilities: $320,000

Long-term Liabilities:
  Long-term Debt: $1,200,000
  Total Liabilities: $1,520,000

EQUITY:
Owner's Equity: $1,230,000
Total Liabilities and Equity: $2,750,000

INCOME STATEMENT
For the Year Ended December 31, 2024

Revenue: $3,200,000
Cost of Goods Sold: $1,800,000
Gross Profit: $1,400,000

Operating Expenses:
  Salaries and Wages: $600,000
  Rent: $120,000
  Utilities: $80,000
  Other Expenses: $200,000
Total Operating Expenses: $1,000,000

Net Income: $400,000`
    }
  ], []);

  const [document, setDocument] = useState<Document | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate API call to fetch document details
    const foundDocument = mockDocuments.find(doc => doc.id === documentId);
    if (foundDocument) {
      setDocument(foundDocument);
    }
    setLoading(false);
  }, [documentId, mockDocuments]);

  // Handle download
  const handleDownload = () => {
    if (document) {
      // Downloading document
      alert(`Downloading ${document.name}`);
    }
  };

  // Handle back navigation
  const handleBack = () => {
    router.push('/documents');
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Map document type enum values to user-friendly labels
  const getDocumentTypeLabel = (type: DocumentType) => {
    return getDocumentLabel(type);
  };

  // Get file icon based on type
  const getFileIcon = (type: DocumentType) => {
    switch (type) {
      case 'ugovor':
        return <FileText className="w-8 h-8 text-blue-600" />;
      case 'pravni_dokument':
        return <FileText className="w-8 h-8 text-green-600" />;
      case 'nacrt_dokumenta':
        return <FileText className="w-8 h-8 text-yellow-600" />;
      case 'financijski_dokument':
        return <FileText className="w-8 h-8 text-purple-600" />;
      case 'korespondencija':
        return <FileText className="w-8 h-8 text-orange-600" />;
      case 'dokazni_materijal':
        return <FileText className="w-8 h-8 text-red-600" />;
      default:
        return <FileText className="w-8 h-8 text-gray-600" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading document...</p>
        </div>
      </div>
    );
  }

  if (!document) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <FileText className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-foreground mb-2">Document Not Found</h2>
          <p className="text-muted-foreground mb-4">The document you&apos;re looking for doesn&apos;t exist.</p>
          <button
            onClick={handleBack}
            className="flex items-center space-x-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors duration-200 mx-auto"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Documents</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-card rounded-lg shadow-sm border border-border p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={handleBack}
              className="flex items-center space-x-2 text-muted-foreground hover:text-foreground transition-colors duration-200"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Back to Documents</span>
            </button>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={handleDownload}
              className="flex items-center space-x-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors duration-200"
            >
              <Download className="w-4 h-4" />
              <span>Download</span>
            </button>
          </div>
        </div>
      </div>

      {/* Document Info */}
      <div className="bg-card rounded-lg shadow-sm border border-border p-6">
        <div className="flex items-start space-x-4">
          <div className="w-16 h-16 bg-primary/10 rounded-lg flex items-center justify-center">
            {getFileIcon(document.type)}
          </div>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-foreground mb-2">{document.name}</h1>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-muted-foreground">
              <div className="flex items-center">
                <File className="w-4 h-4 mr-2 text-muted-foreground" />
                <span>{getDocumentTypeLabel(document.type)}</span>
              </div>
              <div className="flex items-center">
                <Calendar className="w-4 h-4 mr-2 text-muted-foreground" />
                <span>Uploaded {formatDate(document.uploadedDate)}</span>
              </div>
              <div className="flex items-center">
                <span className="font-medium">{document.size}</span>
              </div>
            </div>
            {document.caseTitle && (
              <div className="mt-3 flex items-center">
                <User className="w-4 h-4 mr-2 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">
                  Linked to: <span className="font-medium text-foreground">{document.caseTitle}</span>
                </span>
              </div>
            )}
            {document.description && (
              <div className="mt-3">
                <p className="text-sm text-muted-foreground">{document.description}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Document Preview */}
      <div className="bg-card rounded-lg shadow-sm border border-border overflow-hidden">
        <div className="px-6 py-4 border-b border-border">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-foreground">Document Preview</h3>
            <div className="flex items-center space-x-2">
              <button className="flex items-center space-x-1 text-muted-foreground hover:text-foreground p-2 rounded hover:bg-accent transition-colors duration-200">
                <Eye className="w-4 h-4" />
                <span className="text-sm">Preview</span>
              </button>
            </div>
          </div>
        </div>
        
        <div className="p-6">
          {/* Mock PDF Preview */}
          <div className="bg-muted border-2 border-dashed border-border rounded-lg p-8 text-center">
            <div className="max-w-2xl mx-auto">
              <FileText className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h4 className="text-lg font-medium text-foreground mb-2">Document Preview</h4>
              <p className="text-muted-foreground mb-4">
                This is a mock preview of the document content. In a real application, 
                this would show the actual document content or a PDF viewer.
              </p>
              
              {/* Mock document content */}
              <div className="bg-card border border-border rounded-lg p-6 text-left max-h-96 overflow-y-auto">
                <div className="prose prose-sm max-w-none">
                  <pre className="whitespace-pre-wrap font-mono text-sm text-foreground">
                    {document.content || 'Document content would be displayed here...'}
                  </pre>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Document Actions */}
      <div className="bg-card rounded-lg shadow-sm border border-border p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">Document Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={handleDownload}
            className="flex items-center justify-center space-x-2 bg-primary text-primary-foreground px-4 py-3 rounded-lg hover:bg-primary/90 transition-colors duration-200"
          >
            <Download className="w-5 h-5" />
            <span>Download Document</span>
          </button>
          
          <button className="flex items-center justify-center space-x-2 bg-muted text-muted-foreground px-4 py-3 rounded-lg hover:bg-accent hover:text-accent-foreground transition-colors duration-200">
            <Share2 className="w-5 h-5" />
            <span>Share Document</span>
          </button>
          
          <button className="flex items-center justify-center space-x-2 bg-muted text-muted-foreground px-4 py-3 rounded-lg hover:bg-accent hover:text-accent-foreground transition-colors duration-200">
            <Edit className="w-5 h-5" />
            <span>Edit Details</span>
          </button>
        </div>
      </div>
    </div>
  );
}

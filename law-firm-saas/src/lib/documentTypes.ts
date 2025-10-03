import type { DocumentType } from '../../types/supabase';

export const DOCUMENT_TYPES = {
  ugovor: "Ugovor",
  punomoc: "Punomoć",
  tuzba: "Tužba",
  pravni_dokument: "Pravni dokument",
  nacrt_dokumenta: "Nacrt dokumenta",
  financijski_dokument: "Financijski dokument",
  korespondencija: "Korespondencija",
  dokazni_materijal: "Dokazni materijal"
} as const;

// Re-export the generated type
export type { DocumentType };

export function getDocumentLabel(type: DocumentType): string {
  return DOCUMENT_TYPES[type] ?? type;
}

// Helper function to get all document type entries for dropdowns
export function getDocumentTypeOptions() {
  return Object.entries(DOCUMENT_TYPES).map(([value, label]) => ({
    value,
    label
  }));
}

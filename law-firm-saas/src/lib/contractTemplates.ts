// Contract Templates Library
// Contains predefined contract templates with placeholders

export interface ContractTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  template: string;
  placeholders: string[];
}

export interface ContractData {
  date: string;
  client_name: string;
  client_address: string;
  law_firm_name: string;
  law_firm_address: string;
  description: string;
  case_number: string;
  opposing_party?: string;
}

// Croatian Legal Representation Contract Template
const LEGAL_REPRESENTATION_CONTRACT = `UGOVOR O ZASTUPANJU

Sklopljen dana: {{date}}

IZMEĐU:
Klijent: {{client_name}}, 
Adresa: {{client_address}}

i

Odvjetnički ured: {{law_firm_name}}, 
Adresa: {{law_firm_address}}

Predmet zastupanja:
{{description}}

Broj predmeta: {{case_number}}

Obveze odvjetničkog ureda:
- pružati pravne usluge u skladu s pravilima struke
- redovito izvještavati klijenta o tijeku postupka

Obveze klijenta:
- dostaviti sve potrebne dokumente i informacije
- redovito podmirivati troškove odvjetničkih usluga

Trajanje ugovora:
Ovaj ugovor stupa na snagu danom potpisa i vrijedi do okončanja predmeta ili pisanog otkaza.

Potpis klijenta: _____________________

Potpis odvjetnika: ___________________`;

// Power of Attorney Template (Punomoć)
const POWER_OF_ATTORNEY_CONTRACT = `PUNOMOĆ

Ja, dolje potpisani {{client_name}}, 
s prebivalištem na adresi {{client_address}}, 
ovlašćujem odvjetnički ured {{law_firm_name}}, 
sa sjedištem na adresi {{law_firm_address}}, 

da me zastupa u predmetu broj: {{case_number}}, 
protiv stranke: {{opposing_party}}, 
pred svim nadležnim sudovima i institucijama.

Ova punomoć daje ovlasti za poduzimanje svih potrebnih pravnih radnji u svrhu zaštite mojih prava i interesa u navedenom predmetu.

Datum: {{date}}

Potpis klijenta: ______________________`;

// Lawsuit Template (Tužba)
const LAWSUIT_CONTRACT = `TUŽBA

Sud: ________________________________

Tužitelj: {{client_name}}, 
Adresa: {{client_address}}

Protiv tuženika: {{opposing_party}}, 
Adresa: ______________________________

Broj predmeta: {{case_number}}

Opis tužbenog zahtjeva:
{{description}}

Obrazloženje:
Na temelju gore navedenih činjenica, tužitelj zahtijeva od suda da donese presudu u njegovu korist.

Datum: {{date}}

Potpis tužitelja: _____________________`;

// Legal Consultation Contract Template
const LEGAL_CONSULTATION_CONTRACT = `UGOVOR O PRAVNOJ KONZULTACIJI

Sklopljen dana: {{date}}

IZMEĐU:
Klijent: {{client_name}}, 
Adresa: {{client_address}}

i

Odvjetnički ured: {{law_firm_name}}, 
Adresa: {{law_firm_address}}

Predmet konzultacije:
{{description}}

Broj predmeta: {{case_number}}

Obveze odvjetničkog ureda:
- pružiti pravnu konzultaciju u skladu s pravilima struke
- dati pismeni izvještaj o konzultaciji

Obveze klijenta:
- dostaviti sve potrebne dokumente i informacije
- podmiriti troškove konzultacije

Trajanje ugovora:
Ovaj ugovor stupa na snagu danom potpisa i vrijedi do okončanja konzultacije.

Potpis klijenta: _____________________

Potpis odvjetnika: ___________________`;

// Contract templates collection
export const CONTRACT_TEMPLATES: ContractTemplate[] = [
  {
    id: 'legal-representation-contract',
    name: 'Ugovor o zastupanju',
    description: 'Standardni ugovor o zastupanju klijenta u pravnim postupcima',
    category: 'Pravno',
    template: LEGAL_REPRESENTATION_CONTRACT,
    placeholders: [
      'date',
      'client_name', 
      'client_address',
      'law_firm_name',
      'law_firm_address',
      'description',
      'case_number'
    ]
  },
  {
    id: 'power-of-attorney-contract',
    name: 'Punomoć',
    description: 'Predložak dokumenta punomoći za zastupanje klijenta',
    category: 'Pravno',
    template: POWER_OF_ATTORNEY_CONTRACT,
    placeholders: [
      'date',
      'client_name',
      'client_address',
      'law_firm_name',
      'law_firm_address',
      'case_number',
      'opposing_party'
    ]
  },
  {
    id: 'lawsuit-contract',
    name: 'Tužba',
    description: 'Predložak tužbe za podnošenje u sud',
    category: 'Pravno',
    template: LAWSUIT_CONTRACT,
    placeholders: [
      'date',
      'client_name',
      'client_address',
      'opposing_party',
      'case_number',
      'description'
    ]
  },
  {
    id: 'legal-consultation-contract',
    name: 'Ugovor o konzultaciji',
    description: 'Ugovor o pružanju pravne konzultacije',
    category: 'Pravno',
    template: LEGAL_CONSULTATION_CONTRACT,
    placeholders: [
      'date',
      'client_name', 
      'client_address',
      'law_firm_name',
      'law_firm_address',
      'description',
      'case_number'
    ]
  }
];

// Helper function to get all contract templates
export function getContractTemplates(): ContractTemplate[] {
  return CONTRACT_TEMPLATES;
}

// Helper function to get a specific contract template by ID
export function getContractTemplate(id: string): ContractTemplate | undefined {
  return CONTRACT_TEMPLATES.find(template => template.id === id);
}

// Helper function to generate contract content from template and data
export function generateContract(templateId: string, data: ContractData): string {
  const template = getContractTemplate(templateId);
  if (!template) {
    throw new Error(`Contract template with ID ${templateId} not found`);
  }

  let content = template.template;
  
  // Replace all placeholders with actual data
  Object.entries(data).forEach(([key, value]) => {
    const placeholder = `{{${key}}}`;
    content = content.replace(new RegExp(placeholder, 'g'), value || '');
  });

  return content;
}

// Helper function to validate contract data
export function validateContractData(data: Partial<ContractData>, templateId?: string): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (!data.date) errors.push('Datum je obavezan');
  if (!data.client_name) errors.push('Ime klijenta je obavezno');
  if (!data.client_address) errors.push('Adresa klijenta je obavezna');
  if (!data.law_firm_name) errors.push('Naziv odvjetničkog ureda je obavezan');
  if (!data.law_firm_address) errors.push('Adresa odvjetničkog ureda je obavezna');
  if (!data.description) errors.push('Opis predmeta je obavezan');
  if (!data.case_number) errors.push('Broj predmeta je obavezan');
  
  // Validate opposing_party for templates that require it
  if (templateId && (templateId === 'power-of-attorney-contract' || templateId === 'lawsuit-contract')) {
    if (!data.opposing_party) errors.push('Protivna strana je obavezna');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

// Helper function to format date for Croatian locale
export function formatDateForContract(date: Date): string {
  return date.toLocaleDateString('hr-HR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

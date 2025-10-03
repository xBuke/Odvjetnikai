'use client';

import { useState, useEffect } from 'react';
import { 
  FileText, 
  Download, 
  X, 
  Loader2, 
  AlertCircle,
  Calendar,
  User,
  MapPin,
  FileCheck
} from 'lucide-react';
import { 
  getContractTemplates, 
  getContractTemplate,
  generateContract, 
  validateContractData,
  formatDateForContract,
  type ContractTemplate,
  type ContractData 
} from '@/lib/contractTemplates';
import { generateContractPDF, formatContentForPDF } from '@/lib/pdfGenerator';
import { useToast } from '@/components/ui/Toast';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/lib/supabaseClient';
import jsPDF from 'jspdf';

interface ContractGeneratorProps {
  isOpen: boolean;
  onClose: () => void;
  onContractGenerated?: (contractContent: string, contractName: string) => void;
  selectedCase?: {
    id: string;
    title: string;
    clientName: string;
  };
  lawFirmInfo?: {
    name: string;
    address: string;
  };
}

export default function ContractGenerator({
  isOpen,
  onClose,
  onContractGenerated,
  selectedCase,
  lawFirmInfo
}: ContractGeneratorProps) {
  const { showToast } = useToast();
  
  // Safe access to language context
  let t: (key: string) => string;
  try {
    const languageContext = useLanguage();
    t = languageContext.t;
  } catch {
    t = (key: string) => key;
  }

  const [templates] = useState<ContractTemplate[]>(getContractTemplates());
  const [selectedTemplate, setSelectedTemplate] = useState<ContractTemplate | null>(null);
  const [contractData, setContractData] = useState<ContractData>({
    date: formatDateForContract(new Date()),
    client_name: selectedCase?.clientName || '',
    client_address: '',
    law_firm_name: lawFirmInfo?.name || '',
    law_firm_address: lawFirmInfo?.address || '',
    description: selectedCase?.title || '',
    case_number: selectedCase?.id.slice(-8) || '',
    opposing_party: ''
  });
  const [generatedContract, setGeneratedContract] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);

  // Reset form when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setSelectedTemplate(null);
      setGeneratedContract('');
      setErrors([]);
      setContractData({
        date: formatDateForContract(new Date()),
        client_name: selectedCase?.clientName || '',
        client_address: '',
        law_firm_name: lawFirmInfo?.name || '',
        law_firm_address: lawFirmInfo?.address || '',
        description: selectedCase?.title || '',
        case_number: selectedCase?.id.slice(-8) || '',
        opposing_party: ''
      });
    }
  }, [isOpen, selectedCase, lawFirmInfo]);

  // Handle template selection
  const handleTemplateSelect = (template: ContractTemplate) => {
    setSelectedTemplate(template);
    setGeneratedContract('');
    setErrors([]);
  };

  // Handle form input changes
  const handleInputChange = (field: keyof ContractData, value: string) => {
    setContractData(prev => ({
      ...prev,
      [field]: value
    }));
    setErrors([]);
  };

  // Generate contract preview
  const handleGeneratePreview = () => {
    if (!selectedTemplate) {
      showToast('Molimo odaberite predložak ugovora', 'error');
      return;
    }

    const validation = validateContractData(contractData, selectedTemplate.id);
    if (!validation.isValid) {
      setErrors(validation.errors);
      showToast('Molimo ispunite sva obavezna polja', 'error');
      return;
    }

    try {
      const contract = generateContract(selectedTemplate.id, contractData);
      setGeneratedContract(contract);
      setErrors([]);
    } catch (error) {
      console.error('Error generating contract:', error);
      showToast('Greška pri generiranju ugovora', 'error');
    }
  };

  // Download contract as text file
  const handleDownload = () => {
    if (!generatedContract || !selectedTemplate) return;

    const blob = new Blob([generatedContract], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${selectedTemplate.name}_${contractData.case_number}_${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    showToast('Ugovor uspješno preuzet kao tekst', 'success');
  };

  // Download contract as PDF
  const handleDownloadPDF = () => {
    if (!generatedContract || !selectedTemplate) return;

    try {
      const filename = `${selectedTemplate.name}_${contractData.case_number}_${new Date().toISOString().split('T')[0]}`;
      const formattedContent = formatContentForPDF(generatedContract);
      
      generateContractPDF(formattedContent, filename, {
        title: selectedTemplate.name,
        author: contractData.law_firm_name,
        subject: `Ugovor o zastupanju - ${contractData.case_number}`,
        keywords: 'ugovor, zastupanje, pravni',
        creator: 'Law Firm SaaS'
      });

      showToast('Ugovor uspješno preuzet kao PDF', 'success');
    } catch (error) {
      console.error('Error generating PDF:', error);
      showToast('Greška pri generiranju PDF-a', 'error');
    }
  };

  // Generate and save contract
  const handleGenerateAndSave = async () => {
    if (!generatedContract || !selectedTemplate) {
      showToast('Molimo prvo generirajte pregled ugovora', 'error');
      return;
    }

    setIsGenerating(true);
    
    try {
      // Generate PDF
      const filename = `${selectedTemplate.name}_${contractData.case_number}_${new Date().toISOString().split('T')[0]}`;
      const formattedContent = formatContentForPDF(generatedContract);
      
      // Create PDF blob
      const doc = new jsPDF();
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(12);
      
      const lines = formattedContent.split('\n');
      const pageHeight = doc.internal.pageSize.height;
      const margin = 20;
      const lineHeight = 7;
      let yPosition = margin;

      // Add title
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      const firstLine = lines.find(line => line.trim() !== '') || 'DOKUMENT';
      doc.text(firstLine.toUpperCase(), margin, yPosition);
      yPosition += 15;

      // Reset font for content
      doc.setFontSize(12);
      doc.setFont('helvetica', 'normal');

      // Process each line
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        
        if (line === '') {
          yPosition += lineHeight / 2;
          continue;
        }

        if (yPosition + lineHeight > pageHeight - margin) {
          doc.addPage();
          yPosition = margin;
        }

        const maxWidth = doc.internal.pageSize.width - (margin * 2);
        const splitLines = doc.splitTextToSize(line, maxWidth);
        
        if (Array.isArray(splitLines)) {
          for (let j = 0; j < splitLines.length; j++) {
            if (yPosition + lineHeight > pageHeight - margin) {
              doc.addPage();
              yPosition = margin;
            }
            doc.text(splitLines[j], margin, yPosition);
            yPosition += lineHeight;
          }
        } else {
          doc.text(splitLines, margin, yPosition);
          yPosition += lineHeight;
        }
      }

      // Add footer
      const pageCount = doc.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setFont('helvetica', 'italic');
        doc.text(
          `Generirano: ${new Date().toLocaleDateString('hr-HR')} - Stranica ${i} od ${pageCount}`,
          margin,
          pageHeight - 10
        );
      }

      // Convert PDF to blob
      const pdfBlob = doc.output('blob');
      
      // Upload to Supabase storage
      const fileExt = 'pdf';
      const fileName = `${filename}.${fileExt}`;
      const filePath = `documents/${fileName}`;
      
      const { error: uploadError } = await supabase.storage
        .from('documents')
        .upload(filePath, pdfBlob, {
          contentType: 'application/pdf',
          upsert: true
        });

      if (uploadError) {
        throw uploadError;
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('documents')
        .getPublicUrl(filePath);

      // Determine document type based on template
      let documentType = 'ugovor';
      if (selectedTemplate.id === 'power-of-attorney-contract') {
        documentType = 'punomoc';
      } else if (selectedTemplate.id === 'lawsuit-contract') {
        documentType = 'tuzba';
      }

      // Save document metadata to database
      const { error: dbError } = await supabase
        .from('documents')
        .insert({
          name: fileName,
          file_url: urlData.publicUrl,
          type: documentType,
          case_id: selectedCase?.id || null,
          size: pdfBlob.size,
          created_at: new Date().toISOString()
        });

      if (dbError) {
        throw dbError;
      }

      showToast('Dokument uspješno generiran i spremljen', 'success');
      
      if (onContractGenerated) {
        onContractGenerated(generatedContract, filename);
      }
      
      onClose();
      
    } catch (error) {
      console.error('Error generating and saving document:', error);
      showToast('Greška pri generiranju i spremanju dokumenta', 'error');
    } finally {
      setIsGenerating(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-card rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h3 className="text-lg font-semibold text-foreground">Generator ugovora</h3>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground transition-colors duration-200"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Template Selection */}
          <div>
            <h4 className="text-md font-medium text-foreground mb-3">Odaberite predložak ugovora</h4>
            <div className="grid grid-cols-1 gap-3">
              {templates.map((template) => (
                <div
                  key={template.id}
                  className={`border rounded-lg p-4 cursor-pointer transition-colors duration-200 ${
                    selectedTemplate?.id === template.id
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:border-primary/50'
                  }`}
                  onClick={() => handleTemplateSelect(template)}
                >
                  <div className="flex items-start space-x-3">
                    <div className="w-10 h-10 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center flex-shrink-0">
                      <FileText className="w-5 h-5 text-green-600 dark:text-green-400" />
                    </div>
                    <div className="flex-1">
                      <h5 className="text-sm font-medium text-foreground">{template.name}</h5>
                      <p className="text-sm text-muted-foreground mt-1">{template.description}</p>
                      <span className="inline-block mt-2 px-2 py-1 text-xs font-medium bg-muted text-muted-foreground rounded-full">
                        {template.category}
                      </span>
                    </div>
                    {selectedTemplate?.id === template.id && (
                      <FileCheck className="w-5 h-5 text-primary" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Contract Data Form */}
          {selectedTemplate && (
            <div>
              <h4 className="text-md font-medium text-foreground mb-3">Podaci za ugovor</h4>
              
              {/* Error Messages */}
              {errors.length > 0 && (
                <div className="mb-4 p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
                  <div className="flex items-start space-x-2">
                    <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-destructive font-medium text-sm">Molimo ispunite sljedeća polja:</p>
                      <ul className="text-destructive text-sm mt-1 list-disc list-inside">
                        {errors.map((error, index) => (
                          <li key={index}>{error}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Date */}
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">
                    <Calendar className="w-4 h-4 inline mr-1" />
                    Datum *
                  </label>
                  <input
                    type="text"
                    value={contractData.date}
                    onChange={(e) => handleInputChange('date', e.target.value)}
                    className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-ring focus:border-ring bg-input text-foreground"
                    placeholder="Datum sklapanja ugovora"
                  />
                </div>

                {/* Case Number */}
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">
                    <FileText className="w-4 h-4 inline mr-1" />
                    Broj predmeta *
                  </label>
                  <input
                    type="text"
                    value={contractData.case_number}
                    onChange={(e) => handleInputChange('case_number', e.target.value)}
                    className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-ring focus:border-ring bg-input text-foreground"
                    placeholder="Broj predmeta"
                  />
                </div>

                {/* Client Name */}
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">
                    <User className="w-4 h-4 inline mr-1" />
                    Ime klijenta *
                  </label>
                  <input
                    type="text"
                    value={contractData.client_name}
                    onChange={(e) => handleInputChange('client_name', e.target.value)}
                    className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-ring focus:border-ring bg-input text-foreground"
                    placeholder="Ime i prezime klijenta"
                  />
                </div>

                {/* Client Address */}
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">
                    <MapPin className="w-4 h-4 inline mr-1" />
                    Adresa klijenta *
                  </label>
                  <input
                    type="text"
                    value={contractData.client_address}
                    onChange={(e) => handleInputChange('client_address', e.target.value)}
                    className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-ring focus:border-ring bg-input text-foreground"
                    placeholder="Adresa klijenta"
                  />
                </div>

                {/* Law Firm Name */}
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">
                    <User className="w-4 h-4 inline mr-1" />
                    Naziv odvjetničkog ureda *
                  </label>
                  <input
                    type="text"
                    value={contractData.law_firm_name}
                    onChange={(e) => handleInputChange('law_firm_name', e.target.value)}
                    className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-ring focus:border-ring bg-input text-foreground"
                    placeholder="Naziv odvjetničkog ureda"
                  />
                </div>

                {/* Law Firm Address */}
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">
                    <MapPin className="w-4 h-4 inline mr-1" />
                    Adresa odvjetničkog ureda *
                  </label>
                  <input
                    type="text"
                    value={contractData.law_firm_address}
                    onChange={(e) => handleInputChange('law_firm_address', e.target.value)}
                    className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-ring focus:border-ring bg-input text-foreground"
                    placeholder="Adresa odvjetničkog ureda"
                  />
                </div>

                {/* Description */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-foreground mb-1">
                    <FileText className="w-4 h-4 inline mr-1" />
                    Opis predmeta *
                  </label>
                  <textarea
                    value={contractData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-ring focus:border-ring bg-input text-foreground"
                    placeholder="Opis predmeta zastupanja"
                  />
                </div>

                {/* Opposing Party - Only show for Punomoć and Tužba templates */}
                {(selectedTemplate.id === 'power-of-attorney-contract' || selectedTemplate.id === 'lawsuit-contract') && (
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-foreground mb-1">
                      <User className="w-4 h-4 inline mr-1" />
                      Protivna strana *
                    </label>
                    <input
                      type="text"
                      value={contractData.opposing_party || ''}
                      onChange={(e) => handleInputChange('opposing_party', e.target.value)}
                      className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-ring focus:border-ring bg-input text-foreground"
                      placeholder="Ime protivne strane"
                    />
                  </div>
                )}
              </div>

              {/* Generate Preview Button */}
              <div className="mt-4">
                <button
                  onClick={handleGeneratePreview}
                  className="flex items-center space-x-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors duration-200"
                >
                  <FileText className="w-4 h-4" />
                  <span>Generiraj pregled ugovora</span>
                </button>
              </div>
            </div>
          )}

          {/* Generated Contract Preview */}
          {generatedContract && (
            <div>
              <h4 className="text-md font-medium text-foreground mb-3">Pregled ugovora</h4>
              <div className="border border-border rounded-lg p-4 bg-muted/30">
                <pre className="whitespace-pre-wrap text-sm text-foreground font-mono leading-relaxed">
                  {generatedContract}
                </pre>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-border">
            <button
              onClick={onClose}
              className="px-4 py-2 text-muted-foreground bg-muted rounded-lg hover:bg-accent hover:text-accent-foreground transition-colors duration-200"
            >
              Odustani
            </button>
            
            {generatedContract && (
              <>
                <button
                  onClick={handleDownload}
                  className="flex items-center space-x-2 px-4 py-2 text-primary bg-primary/10 rounded-lg hover:bg-primary/20 transition-colors duration-200"
                >
                  <Download className="w-4 h-4" />
                  <span>Preuzmi TXT</span>
                </button>
                
                <button
                  onClick={handleDownloadPDF}
                  className="flex items-center space-x-2 px-4 py-2 text-primary bg-primary/10 rounded-lg hover:bg-primary/20 transition-colors duration-200"
                >
                  <Download className="w-4 h-4" />
                  <span>Preuzmi PDF</span>
                </button>
                
                <button
                  onClick={handleGenerateAndSave}
                  disabled={isGenerating}
                  className="flex items-center space-x-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isGenerating && <Loader2 className="w-4 h-4 animate-spin" />}
                  <span>{isGenerating ? 'Spremanje...' : 'Generiraj i spremi'}</span>
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

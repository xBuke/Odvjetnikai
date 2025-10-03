# Contract Templates System - User Guide

## Overview

The Contract Templates System allows law firms to generate professional legal documents using predefined templates with dynamic placeholders. The system supports multiple contract types and can generate documents in both text and PDF formats.

## Features

- **Multiple Contract Templates**: Pre-built templates for common legal documents
- **Dynamic Placeholders**: Fill in client and case information automatically
- **PDF Generation**: Export contracts as professional PDF documents
- **Text Export**: Download contracts as plain text files
- **Document Storage**: Save generated contracts directly to the document management system
- **Validation**: Ensure all required fields are completed before generation

## Available Templates

### 1. Ugovor o zastupanju (Legal Representation Contract)
- **Purpose**: Standard contract for representing clients in legal proceedings
- **Required Fields**: Date, client name, client address, law firm name, law firm address, case description, case number
- **Use Case**: When taking on a new client for legal representation

### 2. Punomoć (Power of Attorney)
- **Purpose**: Document granting power of attorney to the law firm
- **Required Fields**: Date, client name, birth date, OIB, client address, law firm name, law firm address, case description, case number, validity period
- **Use Case**: When client needs to grant specific powers to the law firm

### 3. Ugovor o konzultaciji (Legal Consultation Contract)
- **Purpose**: Contract for providing legal consultation services
- **Required Fields**: Date, client name, client address, law firm name, law firm address, consultation description, case number
- **Use Case**: For one-time or limited legal consultation services

## How to Use

### Step 1: Access Contract Templates
1. Navigate to the **Documents** page in your law firm application
2. Scroll down to the **Templates** section
3. You'll see available contract templates with descriptions

### Step 2: Generate a Contract
1. Click the **FileText** icon on any template card
2. The Contract Generator modal will open
3. Select the template you want to use (if not already selected)

### Step 3: Fill in Contract Data
1. Complete all required fields marked with asterisks (*):
   - **Date**: Contract signing date (auto-filled with current date)
   - **Client Name**: Full name of the client
   - **Client Address**: Complete address of the client
   - **Law Firm Name**: Your law firm's name
   - **Law Firm Address**: Your law firm's address
   - **Case Description**: Description of the legal matter
   - **Case Number**: Unique identifier for the case

2. For Power of Attorney template, additional fields:
   - **Client Birth Date**: Client's date of birth
   - **Client OIB**: Client's personal identification number
   - **Valid Until**: Expiration date of the power of attorney

### Step 4: Generate Preview
1. Click **"Generiraj pregled ugovora"** (Generate Contract Preview)
2. Review the generated contract in the preview section
3. Make any necessary adjustments to the form data

### Step 5: Export or Save
You have three options:

#### Option A: Download as Text File
- Click **"Preuzmi TXT"** to download as a plain text file
- Useful for further editing in word processors

#### Option B: Download as PDF
- Click **"Preuzmi PDF"** to generate and download a professional PDF
- Includes proper formatting, metadata, and page numbers
- Ready for printing and signing

#### Option C: Save to Document System
- Click **"Generiraj i spremi"** to save the contract to your document management system
- The contract will be stored in your documents with proper metadata
- Can be linked to cases and clients later

## Technical Details

### File Formats
- **Text Files**: Plain text with UTF-8 encoding (.txt)
- **PDF Files**: Professional PDF with proper formatting, metadata, and Croatian locale support

### Document Storage
- Generated contracts are stored in Supabase Storage
- Metadata is saved in the documents table
- Documents are automatically tagged with type "ugovor" (contract)

### Validation
- All required fields must be completed before generation
- Real-time validation with error messages
- Prevents generation of incomplete contracts

## Customization

### Adding New Templates
To add new contract templates:

1. Edit `src/lib/contractTemplates.ts`
2. Add your template to the `CONTRACT_TEMPLATES` array
3. Define the template content with placeholders using `{{placeholder_name}}` syntax
4. List all placeholders in the `placeholders` array

### Modifying Existing Templates
1. Edit the template content in `src/lib/contractTemplates.ts`
2. Update the `placeholders` array if you add/remove placeholders
3. The changes will be reflected immediately in the application

### Law Firm Information
Currently, law firm information is hardcoded in the component. To make it configurable:
1. Create a settings/preferences system
2. Store law firm information in the database
3. Pass the information to the ContractGenerator component

## Best Practices

### Data Entry
- Use consistent formatting for dates (Croatian locale)
- Ensure client addresses are complete and accurate
- Use descriptive case descriptions
- Generate unique case numbers

### Document Management
- Save contracts to the document system for proper tracking
- Link contracts to specific cases when possible
- Use descriptive filenames for downloaded documents
- Keep backups of important contracts

### Template Usage
- Choose the appropriate template for each situation
- Review generated contracts before finalizing
- Customize templates as needed for your practice areas
- Keep templates updated with current legal requirements

## Troubleshooting

### Common Issues

**"Greška pri generiranju ugovora" (Error generating contract)**
- Ensure all required fields are filled
- Check that the template is properly selected
- Verify that all placeholders have corresponding data

**PDF Generation Fails**
- Check browser compatibility (modern browsers required)
- Ensure sufficient memory for PDF generation
- Try generating a text file first to verify content

**Document Not Saving**
- Check internet connection
- Verify Supabase configuration
- Ensure user has proper permissions

### Support
For technical issues or feature requests, please contact your system administrator or development team.

## Future Enhancements

Planned improvements include:
- Digital signature integration
- Template versioning and history
- Bulk contract generation
- Advanced PDF formatting options
- Integration with case management
- Multi-language support
- Template sharing between law firms

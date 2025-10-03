# Database Migration Instructions

## Problem
The automatic migration system is having issues with duplicate timestamps. We need to manually add the new document types to the database.

## Solution
Run the following SQL in your Supabase SQL Editor:

### Step 1: Add New Document Types
```sql
-- Add new enum values if they don't exist
DO $$
BEGIN
    -- Add 'punomoc' if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'punomoc' AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'document_type')) THEN
        ALTER TYPE document_type ADD VALUE 'punomoc';
        RAISE NOTICE 'Added punomoc to document_type enum';
    ELSE
        RAISE NOTICE 'punomoc already exists in document_type enum';
    END IF;
    
    -- Add 'tuzba' if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'tuzba' AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'document_type')) THEN
        ALTER TYPE document_type ADD VALUE 'tuzba';
        RAISE NOTICE 'Added tuzba to document_type enum';
    ELSE
        RAISE NOTICE 'tuzba already exists in document_type enum';
    END IF;
END $$;
```

### Step 2: Verify the Changes
```sql
-- Check that the new enum values were added
SELECT enumlabel FROM pg_enum WHERE enumtypid = (SELECT oid FROM pg_type WHERE typname = 'document_type') ORDER BY enumsortorder;
```

### Step 3: Code Already Updated ✅
The ContractGenerator.tsx file has already been updated to use the correct document types:

```typescript
// In src/components/contracts/ContractGenerator.tsx, line ~285
let documentType = 'ugovor';
if (selectedTemplate.id === 'power-of-attorney-contract') {
  documentType = 'punomoc';
} else if (selectedTemplate.id === 'lawsuit-contract') {
  documentType = 'tuzba';
}
```

## How to Access Supabase SQL Editor
1. Go to your Supabase Dashboard
2. Navigate to your project
3. Go to "SQL Editor" in the left sidebar
4. Paste the SQL code above
5. Click "Run" to execute

## Testing
After applying the migration:
1. Go to the Documents page in your application
2. Click on any template to open the Contract Generator
3. You should see "Punomoć" and "Tužba" templates available
4. Test generating documents with the new templates
5. Verify that documents are saved with the correct type in the database

## Current Status
- ✅ Templates added to code
- ✅ Form updated with opposing_party field
- ✅ PDF generation enhanced
- ✅ Document saving logic implemented
- ⏳ Database migration pending (manual step required)

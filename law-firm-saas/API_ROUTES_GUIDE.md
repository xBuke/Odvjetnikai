# API Routes Implementation Guide

This document describes the implementation of safe API routes in Next.js with proper validation, error handling, and RLS-safe queries.

## Overview

The application now includes secure API routes for all major resources:
- `/api/clients` - Client management
- `/api/cases` - Case management  
- `/api/documents` - Document management
- `/api/billing` - Billing entries
- `/api/billing-entries` - Time-based billing entries

## Features

### ✅ Input Validation
- Uses Zod schemas for robust input validation
- Validates required fields, data types, and formats
- Provides clear error messages for validation failures

### ✅ Authentication & Authorization
- JWT token-based authentication
- RLS (Row Level Security) ensures users can only access their own data
- Automatic user context injection

### ✅ Error Handling
- Consistent error response format: `{ success: false, error: message }`
- Proper HTTP status codes
- Trial limit and subscription error handling
- Detailed error logging

### ✅ Type Safety
- Full TypeScript support
- Generated types from Supabase schema
- Type-safe API client

## API Routes

### Clients API (`/api/clients`)

#### GET `/api/clients`
Retrieve all clients for the authenticated user.

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "name": "John Doe",
      "email": "john@example.com",
      "phone": "+1234567890",
      "oib": "12345678901",
      "notes": "Client notes",
      "created_at": "2024-01-01T00:00:00Z",
      "updated_at": "2024-01-01T00:00:00Z"
    }
  ]
}
```

#### POST `/api/clients`
Create a new client.

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com", 
  "phone": "+1234567890",
  "oib": "12345678901",
  "notes": "Optional notes"
}
```

#### PUT `/api/clients`
Update an existing client.

**Request Body:**
```json
{
  "id": "client-uuid",
  "name": "John Smith",
  "email": "johnsmith@example.com"
}
```

#### DELETE `/api/clients?id=client-uuid`
Delete a client.

### Cases API (`/api/cases`)

#### GET `/api/cases`
Retrieve all cases with client information.

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "title": "Case Title",
      "client_id": "client-uuid",
      "status": "Open",
      "notes": "Case notes",
      "clients": {
        "name": "Client Name"
      }
    }
  ]
}
```

#### POST `/api/cases`
Create a new case.

**Request Body:**
```json
{
  "title": "Case Title",
  "client_id": "client-uuid",
  "status": "Open",
  "notes": "Optional notes",
  "case_type": "Optional type",
  "case_status": "Zaprimanje"
}
```

### Documents API (`/api/documents`)

#### GET `/api/documents`
Retrieve all documents with case information.

#### POST `/api/documents`
Create a new document.

**Request Body:**
```json
{
  "name": "Document Name",
  "file_url": "https://example.com/file.pdf",
  "case_id": "case-uuid",
  "file_size": 1024,
  "file_type": "application/pdf",
  "type": "ugovor"
}
```

### Billing API (`/api/billing`)

#### GET `/api/billing`
Retrieve all billing entries with client and case information.

#### POST `/api/billing`
Create a new billing entry.

**Request Body:**
```json
{
  "client_id": "client-uuid",
  "case_id": "case-uuid",
  "amount": 150.00,
  "description": "Legal consultation",
  "billing_date": "2024-01-01",
  "status": "pending"
}
```

### Billing Entries API (`/api/billing-entries`)

#### GET `/api/billing-entries`
Retrieve all time-based billing entries.

#### POST `/api/billing-entries`
Create a new time-based billing entry.

**Request Body:**
```json
{
  "client_id": "client-uuid",
  "case_id": "case-uuid",
  "hours": 2.5,
  "rate": 100.00,
  "notes": "Optional notes"
}
```

## Frontend Integration

### API Client Usage

```typescript
import { clientsApi, handleApiError, handleApiSuccess } from '@/lib/api-client';
import { useToast } from '@/components/ui/Toast';

function MyComponent() {
  const { showToast } = useToast();

  const createClient = async () => {
    try {
      const response = await clientsApi.create({
        name: 'John Doe',
        email: 'john@example.com',
        phone: '+1234567890',
        oib: '12345678901'
      });

      const newClient = handleApiSuccess(response, showToast, 'Client created successfully');
      console.log('New client:', newClient);
      
    } catch (error) {
      handleApiError(error, showToast);
    }
  };

  return (
    <button onClick={createClient}>
      Create Client
    </button>
  );
}
```

### Error Handling

The API client automatically handles:
- Authentication token management
- Request/response formatting
- Error message extraction
- Toast notifications

### Response Format

All API responses follow this format:

**Success:**
```json
{
  "success": true,
  "data": { /* response data */ }
}
```

**Error:**
```json
{
  "success": false,
  "error": "Error message"
}
```

## Validation Schemas

### Client Validation
- `name`: Required string, max 255 characters
- `email`: Valid email format
- `phone`: Required string
- `oib`: Exactly 11 characters
- `notes`: Optional string

### Case Validation
- `title`: Required string, max 255 characters
- `client_id`: Valid UUID
- `status`: Enum: 'Open', 'In Progress', 'Closed'
- `case_status`: Enum: 'Zaprimanje', 'Priprema', 'Ročište', 'Presuda'

### Document Validation
- `name`: Required string, max 255 characters
- `file_url`: Valid URL (optional)
- `case_id`: Valid UUID
- `type`: Enum of document types

## Security Features

### Row Level Security (RLS)
All database queries automatically include user context:
```sql
SELECT * FROM clients WHERE user_id = auth.uid()
```

### Authentication
- JWT token validation on every request
- Automatic user context extraction
- Token expiration handling

### Input Sanitization
- Zod schema validation prevents injection attacks
- Type checking ensures data integrity
- Required field validation

## Error Codes

| Status Code | Description |
|-------------|-------------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request (validation error) |
| 401 | Unauthorized (invalid token) |
| 404 | Not Found |
| 409 | Conflict (trial limit exceeded) |
| 500 | Internal Server Error |

## Migration from Direct Supabase Calls

### Before (Direct Supabase)
```typescript
const { data, error } = await supabase
  .from('clients')
  .insert([clientData])
  .select()
  .single();

if (error) {
  showToast('Error creating client', 'error');
  return;
}
```

### After (API Routes)
```typescript
try {
  const response = await clientsApi.create(clientData);
  const newClient = handleApiSuccess(response, showToast, 'Client created successfully');
} catch (error) {
  handleApiError(error, showToast);
}
```

## Benefits

1. **Centralized Validation**: All input validation happens in one place
2. **Consistent Error Handling**: Standardized error responses and user feedback
3. **Type Safety**: Full TypeScript support with generated types
4. **Security**: RLS enforcement and proper authentication
5. **Maintainability**: Clean separation of concerns
6. **Testing**: Easier to test API endpoints independently
7. **Documentation**: Self-documenting API with clear schemas

## Next Steps

1. **Add Pagination**: Implement pagination for large datasets
2. **Add Filtering**: Support query parameters for filtering
3. **Add Sorting**: Server-side sorting support
4. **Add Caching**: Implement response caching where appropriate
5. **Add Rate Limiting**: Implement rate limiting for API endpoints
6. **Add Logging**: Enhanced logging and monitoring

import { SupabaseClient } from '@supabase/supabase-js';

/**
 * Centralized Supabase operations with user context
 * All operations automatically include user_id filtering for multitenancy
 */

/**
 * Fetch the current authenticated user
 * @param supabase - Supabase client instance
 * @returns User object
 * @throws Error if no user is authenticated
 */
export async function getUserOrThrow(supabase: SupabaseClient) {
  const { data: { user }, error } = await supabase.auth.getUser();
  
  if (error) {
    console.error('Supabase auth error:', error);
    throw new Error(error.message ?? "Greška u Supabase upitu");
  }
  
  if (!user) {
    throw new Error("Niste prijavljeni.");
  }
  
  return user;
}

/**
 * Insert data into a table with automatic user_id inclusion
 * @param supabase - Supabase client instance
 * @param table - Table name
 * @param data - Data to insert (can be object or array of objects)
 * @returns Inserted data
 * @throws Error if operation fails
 */
export async function insertWithUserId(
  supabase: SupabaseClient, 
  table: string, 
  data: Record<string, unknown> | Record<string, unknown>[]
): Promise<Record<string, unknown>[]> {
  const user = await getUserOrThrow(supabase);
  
  // Ensure data is an array for consistent handling
  const dataArray = Array.isArray(data) ? data : [data];
  
  // Add user_id to each item
  const dataWithUserId = dataArray.map(item => ({
    ...item,
    user_id: user.id
  }));
  
  const { data: result, error } = await supabase
    .from(table)
    .insert(dataWithUserId)
    .select();
  
  if (error) {
    console.error(`Supabase insert error for table ${table}:`, error);
    throw new Error(error.message ?? "Greška u Supabase upitu");
  }
  
  return result || [];
}

/**
 * Select data from a table with automatic user_id filtering
 * @param supabase - Supabase client instance
 * @param table - Table name
 * @param filters - Additional filters to apply (optional)
 * @param selectColumns - Specific columns to select (defaults to '*')
 * @returns Selected data
 * @throws Error if operation fails
 */
export async function selectWithUserId(
  supabase: SupabaseClient, 
  table: string, 
  filters: Record<string, unknown> = {},
  selectColumns: string = '*'
): Promise<Record<string, unknown>[]> {
  const user = await getUserOrThrow(supabase);
  
  let query = supabase
    .from(table)
    .select(selectColumns)
    .eq('user_id', user.id);
  
  // Apply additional filters
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      query = query.eq(key, value);
    }
  });
  
  const { data, error } = await query;
  
  if (error) {
    console.error(`Supabase select error for table ${table}:`, error);
    throw new Error(error.message ?? "Greška u Supabase upitu");
  }
  
  return (data as unknown as Record<string, unknown>[]) || [];
}

export async function selectWithUserIdAndOrder(
  supabase: SupabaseClient, 
  table: string, 
  filters: Record<string, unknown> = {},
  selectColumns: string = '*',
  orderBy?: { column: string; ascending: boolean }
): Promise<Record<string, unknown>[]> {
  const user = await getUserOrThrow(supabase);
  
  let query = supabase
    .from(table)
    .select(selectColumns)
    .eq('user_id', user.id);
  
  // Apply additional filters
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      query = query.eq(key, value);
    }
  });
  
  // Apply ordering if provided
  if (orderBy) {
    query = query.order(orderBy.column, { ascending: orderBy.ascending });
  }
  
  const { data, error } = await query;
  
  if (error) {
    console.error(`Supabase select error for table ${table}:`, error);
    throw new Error(error.message ?? "Greška u Supabase upitu");
  }
  
  return (data as unknown as Record<string, unknown>[]) || [];
}

/**
 * Update a record with automatic user_id filtering
 * @param supabase - Supabase client instance
 * @param table - Table name
 * @param idField - Field name to match for the record ID
 * @param idValue - Value of the ID field
 * @param updates - Data to update
 * @returns Updated data
 * @throws Error if operation fails
 */
export async function updateWithUserId(
  supabase: SupabaseClient, 
  table: string, 
  idField: string, 
  idValue: string | number, 
  updates: Record<string, unknown>
): Promise<Record<string, unknown>[]> {
  const user = await getUserOrThrow(supabase);
  
  const { data, error } = await supabase
    .from(table)
    .update(updates)
    .eq(idField, idValue)
    .eq('user_id', user.id)
    .select();
  
  if (error) {
    console.error(`Supabase update error for table ${table}:`, error);
    throw new Error(error.message ?? "Greška u Supabase upitu");
  }
  
  return data || [];
}

/**
 * Delete a record with automatic user_id filtering
 * @param supabase - Supabase client instance
 * @param table - Table name
 * @param idField - Field name to match for the record ID
 * @param idValue - Value of the ID field
 * @returns Delete result
 * @throws Error if operation fails
 */
export async function deleteWithUserId(
  supabase: SupabaseClient, 
  table: string, 
  idField: string, 
  idValue: string | number
): Promise<Record<string, unknown>[]> {
  const user = await getUserOrThrow(supabase);
  
  const { data, error } = await supabase
    .from(table)
    .delete()
    .eq(idField, idValue)
    .eq('user_id', user.id)
    .select();
  
  if (error) {
    console.error(`Supabase delete error for table ${table}:`, error);
    throw new Error(error.message ?? "Greška u Supabase upitu");
  }
  
  return data || [];
}

/**
 * Select a single record with automatic user_id filtering
 * @param supabase - Supabase client instance
 * @param table - Table name
 * @param idField - Field name to match for the record ID
 * @param idValue - Value of the ID field
 * @param selectColumns - Specific columns to select (defaults to '*')
 * @returns Single record data
 * @throws Error if operation fails
 */
export async function selectSingleWithUserId(
  supabase: SupabaseClient, 
  table: string, 
  idField: string, 
  idValue: string | number,
  selectColumns: string = '*'
): Promise<Record<string, unknown>> {
  const user = await getUserOrThrow(supabase);
  
  const { data, error } = await supabase
    .from(table)
    .select(selectColumns)
    .eq(idField, idValue)
    .eq('user_id', user.id)
    .single();
  
  if (error) {
    console.error(`Supabase select single error for table ${table}:`, error);
    throw new Error(error.message ?? "Greška u Supabase upitu");
  }
  
  return data as unknown as Record<string, unknown>;
}

/**
 * Insert data and return the inserted record (useful for getting generated IDs)
 * @param supabase - Supabase client instance
 * @param table - Table name
 * @param data - Data to insert
 * @returns Inserted record
 * @throws Error if operation fails
 */
export async function insertAndReturnWithUserId(
  supabase: SupabaseClient, 
  table: string, 
  data: Record<string, unknown>
): Promise<Record<string, unknown>> {
  const user = await getUserOrThrow(supabase);
  
  const { data: result, error } = await supabase
    .from(table)
    .insert([{ ...data, user_id: user.id }])
    .select()
    .single();
  
  if (error) {
    console.error(`Supabase insert and return error for table ${table}:`, error);
    throw new Error(error.message ?? "Greška u Supabase upitu");
  }
  
  return result;
}

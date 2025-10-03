import { supabase } from './supabaseClient';

// TypeScript interfaces for user preferences
export type SortField = string;
export type SortDirection = 'asc' | 'desc';
export type PageType = 'cases' | 'clients' | 'documents';

export interface UserPreferences {
  id: string;
  user_id: string;
  page: PageType;
  sort_field: SortField;
  sort_direction: SortDirection;
  updated_at: string;
}

/**
 * Load user preferences for a specific page
 * @param page - The page type ('cases', 'clients', 'documents')
 * @returns Promise<UserPreferences | null>
 */
export async function loadUserPreferences(page: PageType): Promise<UserPreferences | null> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data, error } = await supabase
      .from('user_preferences')
      .select('*')
      .eq('user_id', user.id)
      .eq('page', page)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
      console.error(`Error loading user preferences for page ${page}:`, error);
      return null;
    }

    return data;
  } catch (err) {
    console.error(`Error loading user preferences for page ${page}:`, err);
    return null;
  }
}

/**
 * Save user preferences for a specific page
 * @param page - The page type ('cases', 'clients', 'documents')
 * @param sortField - The field to sort by
 * @param sortDirection - The sort direction
 * @returns Promise<boolean> - true if successful, false otherwise
 */
export async function saveUserPreferences(
  page: PageType, 
  sortField: SortField, 
  sortDirection: SortDirection
): Promise<boolean> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;

    const { error } = await supabase
      .from('user_preferences')
      .upsert({
        user_id: user.id,
        page: page,
        sort_field: sortField,
        sort_direction: sortDirection
      }, {
        onConflict: 'user_id,page'
      });

    if (error) {
      console.error(`Error saving user preferences for page ${page}:`, error);
      return false;
    }

    return true;
  } catch (err) {
    console.error(`Error saving user preferences for page ${page}:`, err);
    return false;
  }
}

/**
 * Get default sort preferences for a page
 * @param page - The page type
 * @returns Object with default sortField and sortDirection
 */
export function getDefaultSortPreferences(page: PageType): { sortField: SortField; sortDirection: SortDirection } {
  switch (page) {
    case 'cases':
      return { sortField: 'created_at', sortDirection: 'desc' };
    case 'clients':
      return { sortField: 'created_at', sortDirection: 'desc' };
    case 'documents':
      return { sortField: 'created_at', sortDirection: 'desc' };
    default:
      return { sortField: 'created_at', sortDirection: 'desc' };
  }
}

/**
 * Hook-like function to manage user preferences for a page
 * @param page - The page type
 * @param showToast - Toast function for error messages
 * @returns Object with preference management functions
 */
export function useUserPreferences(page: PageType, showToast: (message: string, type: 'success' | 'error') => void) {
  const loadPreferences = async (): Promise<{ sortField: SortField; sortDirection: SortDirection }> => {
    const preferences = await loadUserPreferences(page);
    if (preferences) {
      return {
        sortField: preferences.sort_field,
        sortDirection: preferences.sort_direction
      };
    }
    return getDefaultSortPreferences(page);
  };

  const savePreferences = async (sortField: SortField, sortDirection: SortDirection): Promise<void> => {
    const success = await saveUserPreferences(page, sortField, sortDirection);
    if (!success) {
      showToast(`Greška pri spremanju postavki sortiranja za ${page}`, 'error');
    }
  };

  return {
    loadPreferences,
    savePreferences,
    getDefaults: () => getDefaultSortPreferences(page)
  };
}

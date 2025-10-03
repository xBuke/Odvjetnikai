# Testing Cases Table Sorting with User Preferences

## Setup Instructions

1. **Create the user_preferences table in Supabase:**
   - Go to your Supabase Dashboard
   - Navigate to SQL Editor
   - Run the SQL script from `create-user-preferences-table.sql`

2. **Test the sorting functionality:**

### Test Cases

#### 1. Default Sorting
- **Expected:** Page loads with cases sorted by `created_at DESC` (newest first)
- **Action:** Load the cases page as a logged-in user
- **Verify:** Cases are sorted by creation date, newest first

#### 2. Column Header Sorting
- **Expected:** Clicking column headers should sort the table
- **Actions:**
  - Click "Naziv predmeta" (title) header → should sort alphabetically A-Z
  - Click "Naziv predmeta" again → should sort Z-A
  - Click "Klijent" (client) header → should sort by client name A-Z
  - Click "Status" header → should sort by status
  - Click "Datum kreiranja" (created date) header → should sort by date
  - Click "Datum ažuriranja" (updated date) header → should sort by update date

#### 3. UI Indicators
- **Expected:** Active sort column shows arrow icon (↑ or ↓)
- **Verify:** 
  - Active column shows colored arrow (primary color)
  - Inactive columns show neutral arrow (muted color)
  - Arrow direction matches sort direction

#### 4. Dropdown Sorting
- **Expected:** Dropdown should also update sorting and save preferences
- **Actions:**
  - Use the "Sort by" dropdown to change sorting
  - Verify table updates immediately
  - Verify preferences are saved

#### 5. Persistence Across Sessions
- **Expected:** User preferences persist across browser sessions
- **Actions:**
  - Set a specific sort (e.g., title A-Z)
  - Refresh the page
  - **Verify:** Same sort is applied
  - Log out and log back in
  - **Verify:** Same sort is still applied

#### 6. Cross-Device Persistence
- **Expected:** Preferences sync across devices
- **Actions:**
  - Set sorting on one device/browser
  - Log in on another device/browser
  - **Verify:** Same sorting preference is applied

#### 7. New User Default
- **Expected:** New users get default sorting (created_at DESC)
- **Actions:**
  - Create a new user account
  - Log in and go to cases page
  - **Verify:** Default sorting is applied (newest cases first)

### Error Handling Tests

#### 8. Network Error Handling
- **Expected:** App handles network errors gracefully
- **Actions:**
  - Disconnect internet
  - Try to change sorting
  - **Verify:** Error message is shown, app doesn't crash

#### 9. Database Error Handling
- **Expected:** App handles database errors gracefully
- **Actions:**
  - If possible, simulate database error
  - **Verify:** Error message is shown, app falls back to default sorting

## Success Criteria

✅ All column headers are clickable and sort the table
✅ Sort direction toggles when clicking the same column twice
✅ New columns default to ascending sort
✅ UI indicators show current sort state
✅ Preferences are saved to Supabase user_preferences table
✅ Preferences persist across browser sessions
✅ Preferences sync across devices
✅ New users get sensible defaults
✅ Error handling works gracefully
✅ No console errors during normal operation

## Database Verification

Check the `user_preferences` table in Supabase:
```sql
SELECT * FROM user_preferences ORDER BY updated_at DESC;
```

Should show:
- One row per user
- Correct `sort_field` and `sort_direction` values
- `updated_at` timestamp updates when preferences change

# 🧪 Cross-Page Sorting Preferences Test Guide

## 🗄️ **Database Setup**

1. **Run the SQL script** in your Supabase SQL Editor:
   ```sql
   -- Execute the contents of update-user-preferences-table.sql
   ```

2. **Verify the table structure**:
   ```sql
   SELECT * FROM user_preferences LIMIT 5;
   ```
   Should show columns: `id`, `user_id`, `page`, `sort_field`, `sort_direction`, `updated_at`

## 🎯 **Test Scenarios**

### **Test 1: New User Default Behavior**
- **Action**: Create a new user account and log in
- **Expected**: All pages load with default sorting (`created_at DESC`)
- **Verify**: 
  - Cases page: newest cases first
  - Clients page: newest clients first  
  - Documents page: newest documents first

### **Test 2: Cases Page Sorting**
- **Actions**:
  1. Go to Cases page
  2. Click "Naziv predmeta" header → should sort A-Z
  3. Click again → should sort Z-A
  4. Click "Klijent" header → should sort by client name A-Z
  5. Click "Status" header → should sort by status
  6. Click "Datum kreiranja" → should sort by date
  7. Click "Datum ažuriranja" → should sort by update date
- **Expected**: 
  - UI shows arrow indicators (↑/↓)
  - Table sorts immediately
  - Preferences saved to `user_preferences` with `page = 'cases'`

### **Test 3: Clients Page Sorting**
- **Actions**:
  1. Go to Clients page
  2. Click "Ime" header → should sort A-Z
  3. Click "Email" header → should sort A-Z
  4. Click "Telefon" header → should sort A-Z
  5. Click "Datum kreiranja" → should sort by date
  6. Click "Datum ažuriranja" → should sort by update date
- **Expected**: 
  - UI shows arrow indicators (↑/↓)
  - Table sorts immediately
  - Preferences saved to `user_preferences` with `page = 'clients'`

### **Test 4: Documents Page Sorting**
- **Actions**:
  1. Go to Documents page
  2. Click "Naziv dokumenta" header → should sort A-Z
  3. Click "Tip dokumenta" header → should sort A-Z
  4. Click "Predmet" header → should sort by case title A-Z
  5. Click "Datum kreiranja" → should sort by date
- **Expected**: 
  - UI shows arrow indicators (↑/↓)
  - Table sorts immediately
  - Preferences saved to `user_preferences` with `page = 'documents'`

### **Test 5: Cross-Page Persistence**
- **Actions**:
  1. Set Cases page to sort by "Naziv predmeta A-Z"
  2. Set Clients page to sort by "Email Z-A"
  3. Set Documents page to sort by "Tip dokumenta A-Z"
  4. Refresh the browser
- **Expected**: Each page maintains its own sorting preference

### **Test 6: Cross-Device Synchronization**
- **Actions**:
  1. Set different sorting on each page (as in Test 5)
  2. Log in from a different browser/device
  3. Navigate to each page
- **Expected**: All sorting preferences are restored from Supabase

### **Test 7: Dropdown Sorting**
- **Actions**:
  1. Use the "Sort by" dropdown on each page
  2. Change sorting options
- **Expected**: 
  - Table updates immediately
  - Preferences are saved
  - Arrow indicators update

### **Test 8: Error Handling**
- **Actions**:
  1. Disconnect internet
  2. Try to change sorting
- **Expected**: 
  - Error toast appears
  - Local state remains unchanged
  - UX is not blocked

## 🔍 **Database Verification**

Check the `user_preferences` table:
```sql
SELECT 
  user_id,
  page,
  sort_field,
  sort_direction,
  updated_at
FROM user_preferences 
ORDER BY updated_at DESC;
```

**Expected Results**:
- One row per page per user
- Correct `sort_field` and `sort_direction` values
- `updated_at` timestamps update when preferences change
- Unique constraint on `(user_id, page)` prevents duplicates

## ✅ **Success Criteria**

- [ ] All column headers are clickable and sort the table
- [ ] Sort direction toggles when clicking the same column twice
- [ ] New columns default to ascending sort
- [ ] UI indicators show current sort state
- [ ] Preferences are saved to Supabase with correct page values
- [ ] Preferences persist across browser sessions
- [ ] Preferences sync across devices
- [ ] Each page maintains independent sorting preferences
- [ ] Error handling works gracefully
- [ ] No console errors during normal operation

## 🐛 **Troubleshooting**

### **Common Issues**:

1. **Sorting not working**:
   - Check browser console for errors
   - Verify Supabase connection
   - Check if `user_preferences` table exists

2. **Preferences not persisting**:
   - Verify RLS policies are correct
   - Check if user is authenticated
   - Verify `onConflict: 'user_id,page'` in upsert

3. **Cross-page interference**:
   - Verify each page uses correct `page` parameter
   - Check that `loadPreferences` and `savePreferences` use the right page

4. **UI indicators not showing**:
   - Check if `getSortIcon` function is working
   - Verify `sortField` state matches column field names

## 📊 **Performance Notes**

- **Database sorting**: Used for direct columns (name, email, created_at, etc.)
- **JavaScript sorting**: Used for joined fields (client_name, case_title)
- **Efficient queries**: Only loads data after preferences are loaded
- **Optimized state**: Local state for immediate UI updates, async preference saving

---

## 🎉 **Implementation Complete!**

The cross-page sorting preferences system is now fully implemented with:
- ✅ **Generalized preferences** with page-specific storage
- ✅ **Cases page** sorting (5 sortable columns)
- ✅ **Clients page** sorting (5 sortable columns)  
- ✅ **Documents page** sorting (5 sortable columns)
- ✅ **Shared utility functions** for consistent behavior
- ✅ **Cross-page persistence** with independent preferences
- ✅ **Error handling** with graceful fallbacks
- ✅ **Cross-device synchronization** via Supabase

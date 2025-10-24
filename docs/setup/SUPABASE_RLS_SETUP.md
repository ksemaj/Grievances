# Supabase Row-Level Security (RLS) Setup Guide

This guide will help you enable Row-Level Security on your Supabase database to add an additional layer of security to your grievance portal.

## Why RLS?

Row-Level Security provides database-level access control. Even if someone obtains your anon key, they won't be able to bypass these policies. This is a critical security measure for any production application.

## Steps to Enable RLS

### 1. Navigate to Your Supabase Dashboard

1. Go to [supabase.com](https://supabase.com)
2. Sign in and select your project
3. Go to **Table Editor** in the left sidebar
4. Select the `grievances` table

### 2. Enable RLS

1. Click on the **RLS** tab (or the shield icon)
2. Toggle **Enable RLS** to ON
3. You'll see a warning that no policies are set - this is expected

### 3. Add Policies

Now you'll add policies that define who can do what. Copy and paste these SQL commands in the SQL Editor.

#### Go to SQL Editor

1. Click **SQL Editor** in the left sidebar
2. Click **New query**
3. Paste each policy below one at a time and click **Run**

---

## Policy 1: Allow Anyone to Read Grievances

This allows both you and your girlfriend to view all grievances.

```sql
CREATE POLICY "Allow read access to all users"
ON grievances
FOR SELECT
USING (true);
```

**What this does**: Anyone with the anon key can read (SELECT) all grievances.

---

## Policy 2: Allow Anyone to Insert Grievances

This allows your girlfriend to submit new grievances.

```sql
CREATE POLICY "Allow insert access to all users"
ON grievances
FOR INSERT
WITH CHECK (true);
```

**What this does**: Anyone with the anon key can create (INSERT) new grievances.

---

## Policy 3: Allow Updates Only for Authenticated Users (Optional)

Since you're using client-side password auth, this is optional. If you later implement Supabase Auth, this will protect updates.

```sql
CREATE POLICY "Allow update only for authenticated users"
ON grievances
FOR UPDATE
USING (true)
WITH CHECK (true);
```

**What this does**: For now, allows anyone to update. If you add Supabase Auth later, change `true` to `auth.role() = 'authenticated'`.

---

## Policy 4: Allow Deletes Only for Authenticated Users (Optional)

Similar to updates, this is optional for now but useful if you add proper authentication later.

```sql
CREATE POLICY "Allow delete only for authenticated users"
ON grievances
FOR DELETE
USING (true);
```

**What this does**: For now, allows anyone to delete. If you add Supabase Auth later, change `true` to `auth.role() = 'authenticated'`.

---

## Verify Your Policies

After adding the policies:

1. Go back to **Table Editor** → `grievances` table → **RLS** tab
2. You should see 4 policies listed
3. Test your app - everything should still work normally

---

## Alternative: Stricter Policies (For Future Use)

If you want to lock down updates and deletes immediately, you can use these more restrictive policies instead:

### Policy 3 Alternative: Disable Updates via Client

```sql
CREATE POLICY "Disable direct updates"
ON grievances
FOR UPDATE
USING (false);
```

### Policy 4 Alternative: Disable Deletes via Client

```sql
CREATE POLICY "Disable direct deletes"
ON grievances
FOR DELETE
USING (false);
```

**Note**: If you use these, you'll need to manage updates/deletes through Supabase Edge Functions with service role access, or implement proper Supabase Auth.

---

## Testing

After setting up RLS:

1. Try submitting a new grievance - it should work
2. Try viewing grievances - they should all be visible
3. Try marking a grievance complete - it should work (if using permissive policies)
4. Try deleting a grievance - it should work (if using permissive policies)

---

## Troubleshooting

### "Row-level security is enabled on table 'grievances', but no policies exist"

This means RLS is ON but you haven't added the policies yet. Add the policies above.

### "New row violates row-level security policy"

This means your INSERT policy is too restrictive. Make sure you're using the policy above that allows inserts with `WITH CHECK (true)`.

### Nothing works after enabling RLS

1. Double-check all 4 policies are created
2. Make sure each policy has the correct operation (SELECT, INSERT, UPDATE, DELETE)
3. Verify the policies are enabled (not disabled)

---

## Security Notes

1. **These policies are permissive** because this is a personal app with client-side password protection. They allow the anon key to perform most operations.

2. **For better security**, implement Supabase Auth with email/password and change the policies to check for authenticated users:
   ```sql
   USING (auth.role() = 'authenticated')
   ```

3. **The password screen** provides the first line of defense. RLS provides a second layer so even if someone bypasses the client, they can't harm the database.

4. **Consider logging**: You can add audit columns (`created_by`, `updated_by`) and enforce them in policies if you implement proper auth later.

---

## Questions?

If you run into issues:
1. Check the Supabase logs in **Database** → **Logs**
2. Test queries in the SQL Editor with `SELECT * FROM grievances;`
3. Verify your anon key is correct in your `.env.local` file


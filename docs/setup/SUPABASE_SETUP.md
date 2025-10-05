# Supabase Setup for File Manager

This guide will help you set up Supabase Storage for the admin file manager.

## Quick Start Checklist

- [ ] Add environment variables to `.env.local`
- [ ] Create the `documents` storage bucket in Supabase
- [ ] Set up Row Level Security (RLS) policies
- [ ] Assign admin role to at least one user
- [ ] Test file upload, folder creation, and deletion

## Environment Variables

Add the following environment variables to your `.env.local` file:

```env
# Supabase Configuration
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# Supabase Storage Configuration
VITE_SUPABASE_STORAGE_BUCKET=documents
VITE_SUPABASE_MAX_FILE_SIZE=52428800
```

### How to Get Your Supabase Credentials:

1. Go to your [Supabase Dashboard](https://app.supabase.com/)
2. Select your project
3. Go to **Settings** → **API**
4. Copy the following:
   - **Project URL** → `VITE_SUPABASE_URL`
   - **anon/public** key → `VITE_SUPABASE_ANON_KEY`

**Configuration Details:**

- `VITE_SUPABASE_URL`: Your Supabase project URL
- `VITE_SUPABASE_ANON_KEY`: Your Supabase anonymous/public API key
- `VITE_SUPABASE_STORAGE_BUCKET`: The name of the storage bucket (default: `documents`)
- `VITE_SUPABASE_MAX_FILE_SIZE`: Maximum file size in bytes (default: 52428800 = 50MB)

**Note:** The `VITE_SUPABASE_STORAGE_BUCKET=documents` should match the bucket name you create in the next step. The file size limit will be validated both client-side and server-side.

## Storage Bucket Setup

### 1. Create the Documents Bucket

In your Supabase Dashboard:

1. Go to **Storage** section
2. Click **New Bucket**
3. Set the following:
   - **Name**: `documents`
   - **Public**: No (private bucket)
   - **File size limit**: 50 MB (52428800 bytes)

### 2. Set Storage Policies (RLS)

Go to **Storage > Policies** and create the following policies for the `documents` bucket:

#### Policy 1: Allow authenticated users to upload files
```sql
CREATE POLICY "Allow authenticated users to upload"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'documents');
```

#### Policy 2: Allow authenticated users to read files
```sql
CREATE POLICY "Allow authenticated users to read"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'documents');
```

#### Policy 3: Allow admin users to delete files
```sql
CREATE POLICY "Allow admin users to delete"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'documents' AND
  (auth.jwt() -> 'user_metadata' ->> 'role' = 'admin' OR
   auth.jwt() -> 'app_metadata' ->> 'role' = 'admin')
);
```

#### Policy 4: Allow authenticated users to list files
```sql
CREATE POLICY "Allow authenticated users to list"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'documents');
```

## User Roles Setup (Optional - if using separate table)

If you prefer using a separate `user_roles` table instead of metadata:

```sql
-- Create user_roles table
CREATE TABLE user_roles (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  is_admin boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now()
);

-- Enable RLS
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;

-- Policy: Users can read their own role
CREATE POLICY "Users can read own role"
ON user_roles FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Policy: Only admins can update roles
CREATE POLICY "Only admins can update roles"
ON user_roles FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_id = auth.uid() AND is_admin = true
  )
);
```

## Setting Admin Users

### Method 1: Using User Metadata (Recommended)

Run this SQL in Supabase SQL Editor to set a user as admin:

```sql
-- Replace 'admin@example.com' with the actual admin email
UPDATE auth.users
SET raw_user_meta_data = raw_user_meta_data || '{"role": "admin"}'::jsonb
WHERE email = 'admin@example.com';
```

### Method 2: Using App Metadata (More Secure)

```sql
-- Replace 'admin@example.com' with the actual admin email
UPDATE auth.users
SET raw_app_meta_data = raw_app_meta_data || '{"role": "admin"}'::jsonb
WHERE email = 'admin@example.com';
```

### Method 3: Using user_roles table (if created)

```sql
-- Insert admin role
INSERT INTO user_roles (user_id, is_admin)
SELECT id, true
FROM auth.users
WHERE email = 'admin@example.com'
ON CONFLICT (user_id) DO UPDATE SET is_admin = true;
```

## Testing

After setup, test the following:

1. **Upload files**: Admin users should be able to upload files
2. **Create folders**: Admin users should be able to create folders
3. **Delete files**: Admin users should be able to delete files
4. **Navigate folders**: Users should be able to navigate through folders
5. **View files**: All authenticated users should see files

## Troubleshooting

### "Bucket not found" error
- Make sure the bucket name is exactly `documents`
- Check that the bucket was created successfully

### "Permission denied" errors
- Verify RLS policies are set up correctly
- Check that the user's role is set properly
- Verify the user is authenticated

### Files not showing up
- Check browser console for errors
- Verify Supabase connection in `.env.local`
- Make sure the bucket is not empty (create a test folder)

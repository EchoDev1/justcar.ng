# Fix Supabase RLS (Row Level Security) Policy Error

You're getting a "new row violates row-level security policy" error because your Supabase storage buckets need proper access policies.

## Steps to Fix:

### 1. Go to Supabase Dashboard
- Open your project at https://supabase.com/dashboard
- Navigate to **Storage** in the left sidebar

### 2. Configure Storage Buckets

You need to create/configure these buckets:
- `car-images`
- `car-videos`

### 3. Set RLS Policies for Each Bucket

For each bucket, click on it, then go to **Policies** tab:

#### Policy for `car-images` bucket:

**Policy Name:** Allow authenticated users to upload
**Policy Command:** INSERT
**Target roles:** authenticated
**WITH CHECK expression:**
```sql
true
```

**Policy Name:** Allow public read access
**Policy Command:** SELECT
**Target roles:** public
**USING expression:**
```sql
true
```

**Policy Name:** Allow authenticated users to update
**Policy Command:** UPDATE
**Target roles:** authenticated
**USING expression:**
```sql
true
```

**Policy Name:** Allow authenticated users to delete
**Policy Command:** DELETE
**Target roles:** authenticated
**USING expression:**
```sql
true
```

#### Repeat the same policies for `car-videos` bucket

### 4. Make Buckets Public (Optional)

For easier public access to images:
- Click on the bucket
- Click **Settings** or the three dots menu
- Select **Make Public**

### Alternative: Quick SQL Script

You can also run this SQL in the SQL Editor:

```sql
-- Allow authenticated users to upload car images
CREATE POLICY "Allow authenticated uploads"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'car-images');

-- Allow public read access to car images
CREATE POLICY "Allow public read"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'car-images');

-- Allow authenticated users to update car images
CREATE POLICY "Allow authenticated updates"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'car-images');

-- Allow authenticated users to delete car images
CREATE POLICY "Allow authenticated deletes"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'car-images');

-- Repeat for car-videos bucket
CREATE POLICY "Allow authenticated video uploads"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'car-videos');

CREATE POLICY "Allow public video read"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'car-videos');

CREATE POLICY "Allow authenticated video updates"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'car-videos');

CREATE POLICY "Allow authenticated video deletes"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'car-videos');
```

### 5. Verify Bucket Exists

Make sure the buckets are created:
- Go to Storage
- Click **New bucket**
- Create `car-images` with **Public bucket** checked
- Create `car-videos` with **Public bucket** checked

After applying these policies, your image upload should work without RLS errors!

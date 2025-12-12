# 🎯 Simple Storage Bucket Setup (5 Minutes)

## The SQL Error Explained
The error `must be owner of table buckets` means you can't create storage buckets via SQL in Supabase. You **MUST** use the Dashboard UI instead.

**Don't worry - the Dashboard method is actually easier!**

---

## ✅ Step-by-Step: Create Storage Buckets

### **Step 1: Go to Storage Section**
1. Open https://supabase.com/dashboard
2. Select your project: `bgwxyqjrljfieqifyeqf`
3. Click **"Storage"** in the left sidebar
4. You should see "No buckets" or an empty list

---

### **Step 2: Create car-images Bucket**

Click **"New Bucket"** button (top right)

Fill in the form:
```
Name:           car-images
Public bucket:  ✅ CHECKED (IMPORTANT!)
File size limit: 50 MB (optional)
Allowed MIME types: (leave blank or enter: image/*)
```

Click **"Create bucket"**

You should see `car-images` bucket appear in the list ✅

---

### **Step 3: Create car-videos Bucket**

Click **"New Bucket"** button again

Fill in the form:
```
Name:           car-videos
Public bucket:  ✅ CHECKED (IMPORTANT!)
File size limit: 200 MB (optional)
Allowed MIME types: (leave blank or enter: video/*)
```

Click **"Create bucket"**

You should see `car-videos` bucket appear in the list ✅

---

### **Step 4: Set Bucket Policies (IMPORTANT!)**

For **EACH bucket** (`car-images` and `car-videos`), do this:

1. Click on the bucket name (e.g., `car-images`)
2. Click **"Policies"** tab
3. Click **"New Policy"** button

#### **Policy 1: Public Read Access (Anyone can view)**
```
Policy name: Public read access
Allowed operation: SELECT
Target roles: public (or leave blank)

USING expression:
true
```
Click **"Review"** → **"Save policy"**

#### **Policy 2: Authenticated Upload (Logged-in users can upload)**
```
Policy name: Authenticated upload
Allowed operation: INSERT
Target roles: authenticated

WITH CHECK expression:
auth.role() = 'authenticated'
```
Click **"Review"** → **"Save policy"**

#### **Policy 3: Authenticated Delete (Logged-in users can delete)**
```
Policy name: Authenticated delete
Allowed operation: DELETE
Target roles: authenticated

USING expression:
auth.role() = 'authenticated'
```
Click **"Review"** → **"Save policy"**

**Repeat these 3 policies for BOTH buckets!**

---

## 🚀 Alternative: Quick Policies via SQL (After Creating Buckets)

**IMPORTANT**: Only run this SQL **AFTER** you've created the buckets via the Dashboard!

Go to Supabase Dashboard → **SQL Editor** → Run this:

```sql
-- =====================================================
-- Storage Policies (Run AFTER creating buckets via UI)
-- =====================================================

-- Policies for car-images
CREATE POLICY "Public read car images"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'car-images');

CREATE POLICY "Authenticated upload car images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'car-images');

CREATE POLICY "Authenticated delete car images"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'car-images');

-- Policies for car-videos
CREATE POLICY "Public read car videos"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'car-videos');

CREATE POLICY "Authenticated upload car videos"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'car-videos');

CREATE POLICY "Authenticated delete car videos"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'car-videos');
```

---

## ✅ How to Verify It's Working

### Test 1: Check buckets exist
In Supabase Dashboard → **Storage**, you should see:
```
✅ car-images (public)
✅ car-videos (public)
```

### Test 2: Try uploading a test file
1. Click on `car-images` bucket
2. Click **"Upload file"** button
3. Upload any image from your computer
4. Should upload successfully ✅
5. You can delete it after testing

### Test 3: Test car creation on your site
1. Go to `/admin/cars/new` or `/dealer/cars/new`
2. Fill in car details
3. Upload 2-3 images
4. Click **"Create Car"**
5. Should save in **3-5 seconds** ✅
6. Should show success message!

---

## 🐛 Troubleshooting

### If upload still fails:

**Check browser console (F12):**
- Look for errors mentioning "bucket" or "storage"
- Common errors:
  - `bucket 'car-images' not found` → Bucket not created
  - `403 Forbidden` → Policies not set correctly
  - `413 Payload Too Large` → File size limit exceeded

**Check Network tab:**
- Filter for "storage"
- Look for POST requests
- Status should be `200 OK` ✅ (not 404 or 403)

### If policies aren't working:

Try this simpler policy set via SQL:

```sql
-- Emergency: Wide-open policies (use temporarily for testing)
DROP POLICY IF EXISTS "Public read car images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated upload car images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated delete car images" ON storage.objects;

CREATE POLICY "Allow all car-images"
ON storage.objects
FOR ALL
TO authenticated, anon
USING (bucket_id = 'car-images')
WITH CHECK (bucket_id = 'car-images');

-- Repeat for car-videos
DROP POLICY IF EXISTS "Public read car videos" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated upload car videos" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated delete car videos" ON storage.objects;

CREATE POLICY "Allow all car-videos"
ON storage.objects
FOR ALL
TO authenticated, anon
USING (bucket_id = 'car-videos')
WITH CHECK (bucket_id = 'car-videos');
```

---

## 📋 Quick Checklist

Before testing car creation:

- [ ] Created `car-images` bucket via Dashboard
- [ ] Created `car-videos` bucket via Dashboard
- [ ] Both buckets marked as **PUBLIC** ✅
- [ ] Set up policies (either via UI or SQL)
- [ ] Tested uploading a file in Dashboard
- [ ] Vercel deployment finished (check https://vercel.com/dashboard)
- [ ] Applied database indexes (optional but recommended)

---

## 📞 Still Having Issues?

After creating the buckets, if car creation still fails:

1. **Share the error message** from browser console
2. **Check browser Network tab** for failed requests
3. **Verify bucket policies** are set correctly

The most common issue is forgetting to:
- ✅ Mark buckets as **PUBLIC**
- ✅ Add the three policies (SELECT, INSERT, DELETE)

---

**Once buckets are created with correct policies, everything will work instantly!** 🎉

The parallel upload code is already in place, so saves will be super fast (3-5 seconds).

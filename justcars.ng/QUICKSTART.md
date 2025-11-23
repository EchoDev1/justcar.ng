# Quick Start Guide - JustCars.ng

Get your Nigerian car marketplace up and running in 10 minutes!

## ⚡ Fast Setup (Copy & Paste)

### Step 1: Install Dependencies
```bash
npm install
```

### Step 2: Configure Supabase

1. Create a Supabase account at [supabase.com](https://supabase.com)
2. Create a new project
3. Copy your credentials from **Project Settings → API**
4. Update `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Step 3: Setup Database

Go to **SQL Editor** in Supabase and run:
1. Copy & paste entire `supabase-schema.sql` → Run
2. Copy & paste entire `sample-data.sql` → Run

### Step 4: Create Storage Buckets

In Supabase Dashboard → **Storage** → **New Bucket**:
- Create `car-images` (Public ✅)
- Create `car-videos` (Public ✅)

### Step 5: Create Admin User

**Authentication → Users → Add User:**
- Email: `admin@justcars.ng`
- Password: `Admin@123456`
- Auto Confirm: ✅

**Copy the User ID, then run in SQL Editor:**
```sql
INSERT INTO admins (id, email, role)
VALUES ('paste-user-id-here', 'admin@justcars.ng', 'super_admin');
```

### Step 6: Run the App
```bash
npm run dev
```

Visit:
- Homepage: http://localhost:3000
- Admin: http://localhost:3000/login

## 🎯 Default Credentials

**Admin Login:**
- Email: `admin@justcars.ng`
- Password: `Admin@123456`

⚠️ **Change this immediately in production!**

## 📦 What's Included

With sample data, you get:
- 5 Dealers (4 verified)
- 10 Sample cars (realistic Nigerian data)
- 4 Featured cars
- Ready-to-use admin panel

## 🚀 Next Steps

1. Login to admin panel
2. Upload real car images
3. Customize branding/colors
4. Deploy to Vercel

## 🆘 Need Help?

Check the main `README.md` for:
- Detailed setup instructions
- Troubleshooting guide
- Deployment instructions
- Configuration options

## ⚙️ Common Issues

**Can't login?**
- Check if admin user exists in Supabase Auth
- Verify admin profile in `admins` table
- Clear browser cookies

**No data showing?**
- Check `.env.local` credentials
- Verify SQL scripts ran successfully
- Check browser console for errors

**Images not uploading?**
- Check storage buckets exist
- Verify buckets are set to Public
- Check file size (max 5MB for images)

---

That's it! You're ready to start selling cars in Nigeria! 🚗

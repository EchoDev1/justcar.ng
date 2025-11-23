# JustCars.ng - Nigerian Car Marketplace

A complete, production-ready car marketplace web application built specifically for the Nigerian market. Features include advanced search & filtering, verified dealers, inspection reports, and WhatsApp integration.

![Next.js](https://img.shields.io/badge/Next.js-16.0-black)
![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-green)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-4.0-blue)

## 🚀 Features

### User-Facing Features
- **Homepage** with hero section, search bar, and featured cars
- **Advanced Search & Filtering** by make, model, price, location, year, and more
- **Car Listings** with grid view, sorting, and pagination
- **Detailed Car Pages** with image gallery, specifications, and dealer info
- **WhatsApp Integration** for instant dealer contact
- **Verified Badges** for trusted cars and dealers
- **Inspection Reports** for transparency
- **Mobile-Responsive Design** optimized for Nigerian users

### Admin Panel Features
- **Dashboard** with statistics and recent activity
- **Car Management** - Add, edit, delete car listings
- **Dealer Management** - Manage dealer profiles
- **Image Upload** - Drag-and-drop multiple images with primary selection
- **Video Upload** - Support for car videos
- **Verification System** - Mark cars and dealers as verified
- **Featured Listings** - Highlight premium cars

### Technical Features
- **Server-Side Rendering** with Next.js 14+ App Router
- **Authentication** with Supabase Auth
- **Row Level Security** for data protection
- **Image Optimization** with next/image
- **Real-time Search** with debouncing
- **Nigerian Naira Formatting** (₦)
- **Nigerian States** integration

## 📋 Prerequisites

Before you begin, ensure you have:
- **Node.js** 18.0 or higher
- **npm** or **yarn** package manager
- **Supabase Account** (free tier is fine)
- **Git** (optional, for version control)

## 🛠️ Installation

### 1. Install Dependencies

```bash
npm install
```

This will install:
- Next.js 16.0
- Supabase client libraries (@supabase/supabase-js, @supabase/ssr)
- Lucide React icons
- Tailwind CSS

### 2. Set Up Supabase

#### A. Create a Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Click "Start your project"
3. Create a new project (choose a name, password, and region closest to Nigeria)
4. Wait for the project to be ready (~2 minutes)

#### B. Get Your Supabase Credentials

1. Go to **Project Settings** → **API**
2. Copy the following:
   - `Project URL`
   - `anon public` key
   - `service_role` key (keep this secret!)

#### C. Configure Environment Variables

1. Open `.env.local` file in the project root
2. Replace the placeholder values:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
```

⚠️ **Important**: Never commit `.env.local` to version control!

### 3. Set Up Database

#### A. Run the Schema SQL

1. Go to your Supabase Dashboard
2. Click **SQL Editor** in the left sidebar
3. Click **New Query**
4. Copy the entire contents of `supabase-schema.sql`
5. Paste into the query editor
6. Click **Run** or press `Ctrl+Enter`

This will create:
- All database tables (dealers, cars, car_images, car_videos, admins)
- Indexes for performance
- Row Level Security (RLS) policies
- Helper functions and triggers

#### B. Create Storage Buckets

1. Go to **Storage** in the Supabase Dashboard
2. Click **New Bucket**

**Create bucket for car images:**
- Name: `car-images`
- Public: ✅ Yes
- File size limit: 5MB
- Allowed MIME types: `image/jpeg, image/png, image/webp`

**Create bucket for car videos:**
- Name: `car-videos`
- Public: ✅ Yes
- File size limit: 50MB
- Allowed MIME types: `video/mp4, video/quicktime`

#### C. Insert Sample Data (Optional)

1. Go back to **SQL Editor**
2. Create a **New Query**
3. Copy contents of `sample-data.sql`
4. Paste and **Run**

This adds 5 dealers and 10 sample cars with realistic Nigerian data.

### 4. Create Admin User

#### A. Create Auth User

1. Go to **Authentication** → **Users** in Supabase Dashboard
2. Click **Add user** → **Create new user**
3. Enter:
   - Email: `admin@justcars.ng`
   - Password: `Admin@123456` (change this later!)
   - Auto-confirm: ✅ Yes
4. Click **Create user**
5. Copy the **User ID** (UUID)

#### B. Add Admin Profile

1. Go to **SQL Editor**
2. Create a new query with the following (replace `USER-UUID-HERE` with the actual UUID):

```sql
INSERT INTO admins (id, email, role)
VALUES ('USER-UUID-HERE', 'admin@justcars.ng', 'super_admin');
```

3. Run the query

### 5. Run the Development Server

```bash
npm run dev
```

Visit:
- **Homepage**: http://localhost:3000
- **Admin Login**: http://localhost:3000/login
- **Browse Cars**: http://localhost:3000/cars

### 6. Log In to Admin Panel

1. Go to http://localhost:3000/login
2. Enter:
   - Email: `admin@justcars.ng`
   - Password: `Admin@123456`
3. You'll be redirected to the admin dashboard

## 📁 Project Structure

```
justcars.ng/
├── app/                          # Next.js App Router
│   ├── (auth)/
│   │   └── login/               # Login page
│   ├── admin/                   # Admin panel (protected)
│   │   ├── cars/               # Car management
│   │   ├── dealers/            # Dealer management
│   │   ├── layout.js           # Admin layout with sidebar
│   │   └── page.js             # Dashboard
│   ├── cars/                    # Public car pages
│   │   ├── [id]/               # Car detail page
│   │   └── page.js             # Car listing page
│   ├── layout.js                # Root layout
│   ├── page.js                  # Homepage
│   └── globals.css              # Global styles
├── components/
│   ├── admin/                   # Admin components
│   │   ├── CarForm.js
│   │   ├── DealerForm.js
│   │   ├── ImageUploader.js
│   │   └── Sidebar.js
│   ├── cars/                    # Car-related components
│   │   ├── CarCard.js
│   │   ├── CarGrid.js
│   │   ├── FilterSidebar.js
│   │   ├── ImageGallery.js
│   │   └── SearchBar.js
│   ├── layout/                  # Layout components
│   │   ├── Header.js
│   │   └── Footer.js
│   └── ui/                      # Reusable UI components
│       ├── Badge.js
│       ├── Button.js
│       ├── Input.js
│       ├── Loading.js
│       ├── Modal.js
│       └── Select.js
├── lib/
│   ├── supabase/               # Supabase clients
│   │   ├── client.js           # Client-side
│   │   ├── server.js           # Server-side
│   │   └── admin.js            # Admin (service role)
│   └── utils.js                # Utility functions
├── public/                      # Static assets
├── .env.local                   # Environment variables
├── middleware.js                # Auth middleware
├── supabase-schema.sql          # Database schema
├── sample-data.sql              # Sample data
└── README.md                    # This file
```

## 🎨 Key Components Explained

### Supabase Clients

- **`lib/supabase/client.js`** - For client components (browser)
- **`lib/supabase/server.js`** - For server components and API routes
- **`lib/supabase/admin.js`** - For admin operations (bypasses RLS)

### Utils (`lib/utils.js`)

- `formatNaira(price)` - Formats prices as ₦15,500,000
- `formatNumber(num)` - Adds comma separators
- `generateWhatsAppLink(car, phone)` - Creates WhatsApp chat links
- `NIGERIAN_STATES` - Array of all Nigerian states
- `CAR_MAKES` - Popular car makes in Nigeria
- And more...

### Middleware (`middleware.js`)

- Protects `/admin/*` routes
- Requires authentication
- Refreshes session tokens
- Redirects unauthenticated users to login

## 🚢 Deployment to Vercel

### Prerequisites
- Vercel account (free)
- GitHub account (recommended)

### Steps

1. **Push to GitHub** (recommended)
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/your-username/justcars-ng.git
   git push -u origin main
   ```

2. **Deploy to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Click "Import Project"
   - Select your GitHub repository
   - Configure:
     - Framework: Next.js (auto-detected)
     - Build Command: `npm run build`
     - Output Directory: `.next`
   - Add Environment Variables:
     ```
     NEXT_PUBLIC_SUPABASE_URL=your-url
     NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
     SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
     ```
   - Click "Deploy"

3. **Update Supabase URL Redirect**
   - Go to Supabase Dashboard
   - **Authentication** → **URL Configuration**
   - Add your Vercel URL to **Redirect URLs**:
     ```
     https://your-app.vercel.app/**
     ```

4. **Test Your Deployment**
   - Visit your Vercel URL
   - Test login, browsing, and admin panel

## 🐛 Troubleshooting

### Issue: "Invalid login credentials"

**Solution:**
- Verify email and password are correct
- Check if user exists in Supabase Auth dashboard
- Ensure user is confirmed (not pending)
- Check if admin profile exists in `admins` table

### Issue: "Failed to fetch cars" / No data showing

**Solution:**
- Check Supabase URL and keys in `.env.local`
- Verify database schema was created successfully
- Check RLS policies are enabled
- Look for errors in browser console
- Check Supabase logs in dashboard

### Issue: Image upload fails

**Solution:**
- Verify storage buckets exist: `car-images` and `car-videos`
- Ensure buckets are set to **Public**
- Check file size limits (5MB for images, 50MB for videos)
- Verify MIME types are allowed
- Check storage policies in Supabase

### Issue: Middleware redirect loop

**Solution:**
- Clear browser cookies
- Check middleware.js configuration
- Ensure `/login` is not in the middleware matcher
- Verify Supabase session is being set correctly

### Issue: "Module not found" errors

**Solution:**
```bash
# Delete node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

## 🔧 Configuration

### Change Default Admin Email

1. Create new user in Supabase Auth
2. Add profile to `admins` table
3. Update login credentials
4. Delete old admin user

### Customize Styling

- Edit `app/globals.css` for global styles
- Modify Tailwind classes in components
- Update color scheme in `tailwind.config.js`

### Add More Car Makes

Edit `lib/utils.js`:
```javascript
export const CAR_MAKES = [
  'Toyota', 'Honda', 'Mercedes-Benz',
  // Add more makes here
  'Your New Make'
]
```

## 📊 Database Schema Overview

### Tables

- **dealers** - Dealer profiles and contact info
- **cars** - Car listings with all details
- **car_images** - Car photos with display order
- **car_videos** - Car video files
- **admins** - Admin user profiles

### Key Relationships

- `cars.dealer_id` → `dealers.id` (Many-to-One)
- `car_images.car_id` → `cars.id` (Many-to-One)
- `car_videos.car_id` → `cars.id` (Many-to-One)
- `admins.id` → `auth.users.id` (One-to-One)

## 🔒 Security

### Row Level Security (RLS)

All tables have RLS enabled:
- **Public** can READ all data
- **Authenticated** admins can CREATE, UPDATE, DELETE
- Service role bypasses RLS for admin operations

### Best Practices

- Never expose `SUPABASE_SERVICE_ROLE_KEY` to client
- Use authenticated client for admin operations
- Validate user inputs on both client and server
- Use HTTPS in production
- Rotate admin passwords regularly

## 📱 Nigerian-Specific Features

- ✅ Naira (₦) currency formatting
- ✅ All 36 states + FCT dropdown
- ✅ WhatsApp integration (most popular messaging app)
- ✅ Mobile-first design (80%+ mobile users)
- ✅ "Nigerian Used" vs "Foreign Used" conditions
- ✅ Popular car makes in Nigeria
- ✅ Local phone number formats

## 🎉 You're Ready!

Your Nigerian Car Marketplace is now set up and running!

**Next steps:**
1. Change default admin password
2. Add real car listings
3. Upload car images
4. Customize branding and colors
5. Deploy to production
6. Add your custom domain
7. Start selling cars!

---

**Built with ❤️ for the Nigerian automotive market**

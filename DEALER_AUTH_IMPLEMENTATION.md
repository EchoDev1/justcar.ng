# Dealer Authentication System Implementation

## Overview
This document describes the new dealer authentication system where dealers create their own private passwords, and admin verifies dealers from the admin portal (not Supabase).

## System Architecture

### Authentication Flow
```
1. Dealer Registration (Public)
   ↓
2. Admin Verification (Admin Portal)
   ↓
3. Dealer Password Setup (Email Link)
   ↓
4. Dealer Login (Email + Password)
   ↓
5. Dealer Dashboard Access
```

## Files Created/Modified

### 1. Database Migration
**File:** `supabase/migrations/20251205000001_dealer_auth_system.sql`

**Features:**
- Adds `status` column to dealers table (pending, verified, active, suspended)
- Adds `password_hash` column (bcrypt hashed passwords)
- Adds `setup_token` and `setup_token_expires_at` for password creation
- Creates `dealer_auth_logs` table for security auditing
- Creates `dealer_sessions` table for custom session management
- Creates `dealer_password_resets` table for password recovery
- Adds helper functions for dealer verification

**Status Fields:**
- `pending` - Dealer registered, waiting for admin verification
- `verified` - Admin approved, waiting for password setup
- `active` - Password set, can login
- `suspended` - Account suspended by admin

### 2. API Routes

#### `/api/dealer/register` (POST)
- **Purpose:** Public dealer registration
- **Access:** Public (no auth required)
- **Input:** business_name, email, phone, whatsapp, location, address, business_registration_number
- **Output:** Creates dealer with status='pending'

#### `/api/dealer/login` (POST)
- **Purpose:** Dealer authentication with email + password
- **Access:** Public
- **Input:** email, password
- **Output:** Session cookie + dealer info
- **Features:**
  - Password verification using bcrypt
  - Login attempt tracking (locks after 5 failed attempts)
  - Session token creation
  - Status validation (pending/verified/suspended)

#### `/api/dealer/setup-password` (POST)
- **Purpose:** Verified dealers create their password
- **Access:** Public (requires setup token)
- **Input:** email, setupToken, password, confirmPassword
- **Output:** Updates dealer status to 'active'
- **Password Requirements:**
  - Minimum 8 characters
  - At least one uppercase letter
  - At least one lowercase letter
  - At least one number

#### `/api/dealer/logout` (POST)
- **Purpose:** End dealer session
- **Access:** Authenticated dealers
- **Output:** Clears session cookie and database record

#### `/api/admin/verify-dealer` (POST)
- **Purpose:** Admin verifies pending dealers
- **Access:** Authenticated admin only
- **Input:** dealerId, notes (optional)
- **Output:** Changes status to 'verified', generates setup token, returns setup link
- **Features:**
  - Generates unique setup token (expires in 7 days)
  - Logs verification action
  - Returns email setup link

### 3. User Interface Pages

#### `/dealer/register` (Public)
**File:** `app/dealer/register/page.js`
- Public dealer registration form
- Collects business information
- Shows success message with next steps
- Explains verification process

#### `/dealer/setup` (Public with Token)
**File:** `app/dealer/setup/page.js`
- Password creation form for verified dealers
- Accessed via email link with setup token
- Password strength indicators
- Real-time validation
- Auto-redirects to login after success

#### `/dealer/login` (To be updated)
**File:** `app/dealer/login/page.js`
- **Status:** Needs update to use new auth system
- Should call `/api/dealer/login` instead of Supabase Auth
- Handle different account statuses:
  - pending: Show "waiting for verification" message
  - verified: Show "please set up password" message with link
  - suspended: Show "account suspended" message
  - active: Login normally

#### Admin Dealer Management (To be updated)
**Files:**
- `app/admin/dealers/page.js` - Dealer list
- `app/admin/dealers/[id]/edit/page.js` - Edit dealer

**Needed Features:**
- "Verify Dealer" button for pending dealers
- Call `/api/admin/verify-dealer` endpoint
- Display setup link for verified dealers
- Show dealer status badges (pending/verified/active/suspended)
- Action buttons (suspend/reactivate)

## Security Features

### Password Security
- Bcrypt hashing with salt (10 rounds)
- Strong password requirements enforced
- Passwords never stored in plain text
- Admin cannot see dealer passwords

### Session Management
- Custom session tokens (not Supabase Auth)
- Session stored in database
- HttpOnly cookies
- 7-day expiration
- IP and user agent tracking

### Login Protection
- Failed attempt tracking
- Account lock after 5 failed attempts (30 minutes)
- Audit logging for all auth events

### Token Security
- Setup tokens expire in 7 days
- One-time use only
- Cryptographically secure random generation

## Remaining Tasks

### 1. Update Dealer Login Page
- Replace Supabase Auth with custom auth
- Call `/api/dealer/login` endpoint
- Handle all status cases properly

### 2. Update Admin Dealer Management
- Add "Verify Dealer" button in dealer list
- Add "Send Setup Link" for verified dealers
- Display dealer status clearly
- Add suspend/reactivate actions

### 3. Run Database Migration
```bash
# In Supabase dashboard or CLI
psql -U postgres -d your_database -f supabase/migrations/20251205000001_dealer_auth_system.sql
```

### 4. Testing Checklist
- [ ] Dealer can register successfully
- [ ] Admin can see pending dealers
- [ ] Admin can verify dealer
- [ ] Verified dealer receives setup link
- [ ] Dealer can create password
- [ ] Dealer can login with email + password
- [ ] Failed login attempts are tracked
- [ ] Account locks after 5 failed attempts
- [ ] Sessions work correctly
- [ ] Logout works correctly

## Email Templates Needed

### 1. Dealer Verification Email
**Subject:** Your JustCars.ng Dealer Account Has Been Verified!

```
Hi [Business Name],

Great news! Your dealer account on JustCars.ng has been verified by our admin team.

Click the link below to create your secure password and activate your account:

[Setup Link]

This link will expire in 7 days.

Best regards,
JustCars.ng Team
```

### 2. Welcome Email After Registration
**Subject:** Welcome to JustCars.ng - Verification Pending

```
Hi [Business Name],

Thank you for registering as a dealer on JustCars.ng!

Your application is currently being reviewed by our team. You'll receive another email once your account has been verified (usually within 24-48 hours).

What happens next:
1. Our admin team reviews your application
2. You'll receive a verification email
3. Create your password using the link in the email
4. Start listing your cars!

Need help? Contact us at support@justcars.ng

Best regards,
JustCars.ng Team
```

## Admin Actions Guide

### How Admin Verifies a Dealer
1. Go to `/admin/dealers`
2. Find dealer with "Pending" status
3. Click "Verify" button
4. (Optional) Add verification notes
5. System generates setup link
6. Send link to dealer via email

### How Admin Manages Dealers
- **Suspend:** Change status to 'suspended', dealer cannot login
- **Reactivate:** Change status back to 'active'
- **View Auth Logs:** See all login attempts and security events

## Environment Variables
No new environment variables needed. Uses existing:
- `NEXT_PUBLIC_SITE_URL` - For generating setup links
- Supabase credentials (existing)

## Dependencies
- `bcryptjs` - Password hashing (already installed)
- `crypto` - Token generation (Node.js built-in)

## Next Steps for Developer

1. **Update dealer login page** to use new `/api/dealer/login` endpoint
2. **Add admin verification UI** with verify button and status management
3. **Run the database migration** in your Supabase instance
4. **Set up email notifications** (optional but recommended)
5. **Test the complete flow** from registration to login

---

## Quick Test Script

```javascript
// Test dealer registration
await fetch('/api/dealer/register', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    business_name: 'Test Motors',
    email: 'test@testmotors.com',
    phone: '+234 800 000 0000',
    location: 'Lagos',
    address: 'Test Address'
  })
})

// Admin verifies dealer (logged in as admin)
await fetch('/api/admin/verify-dealer', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    dealerId: 'dealer-uuid-here'
  })
})

// Dealer sets password
await fetch('/api/dealer/setup-password', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'test@testmotors.com',
    setupToken: 'token-from-verification',
    password: 'TestPass123',
    confirmPassword: 'TestPass123'
  })
})

// Dealer logs in
await fetch('/api/dealer/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'test@testmotors.com',
    password: 'TestPass123'
  })
})
```

---

**Implementation Status:** ✅ Core system complete, awaiting final integration and testing

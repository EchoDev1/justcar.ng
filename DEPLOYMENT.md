# JustCars.ng - Deployment Checklist & Guide

## Pre-Deployment Checklist ✅

### 1. Environment Variables
- [ ] Copy `.env.example` to `.env.local` (or `.env.production` on server)
- [ ] Set `NEXT_PUBLIC_SUPABASE_URL` with your Supabase project URL
- [ ] Set `NEXT_PUBLIC_SUPABASE_ANON_KEY` with your Supabase anonymous key
- [ ] Set `SUPABASE_SERVICE_ROLE_KEY` with your Supabase service role key (keep secret!)
- [ ] Set `NEXT_PUBLIC_APP_URL` to your production domain
- [ ] Set `NODE_ENV=production`

### 2. Database Setup (Supabase)
- [ ] Ensure all tables are created (dealers, cars, car_images, etc.)
- [ ] Verify RLS (Row Level Security) policies are configured
- [ ] Check that storage buckets exist for car images
- [ ] Test database connections and queries
- [ ] Verify dealer authentication tables exist (dealer_auth_logs, dealer_sessions)

### 3. Code Quality
- [x] Fixed syntax error in `/app/api/cars/premium/route.js`
- [x] Removed console.logs in production (configured in next.config.ts)
- [x] No hardcoded secrets or API keys in code
- [x] All API routes tested and working
- [x] Production build completed successfully

### 4. Security
- [x] Passwords are hashed with bcrypt
- [x] Service role client used only in API routes (server-side)
- [x] No credentials in client-side code
- [x] CORS properly configured
- [x] XSS protection enabled
- [ ] Configure rate limiting (if using middleware)
- [ ] Set up SSL certificate (done by hosting provider)

### 5. Performance Optimization
- [x] Images optimized (AVIF, WebP formats configured)
- [x] CSS optimization enabled
- [x] Lucide React icons optimized
- [x] Compression enabled
- [x] Production source maps disabled
- [x] Console logs removed in production

### 6. Testing
- [x] Homepage loads successfully
- [x] Premium cars API endpoint working
- [x] Latest cars API endpoint working
- [x] Dealer registration flow tested
- [x] Dealer login flow tested
- [ ] Test all critical user journeys
- [ ] Test on multiple browsers
- [ ] Test mobile responsiveness

---

## Deployment Options

### Option 1: Vercel (Recommended)

#### Automatic Deployment from GitHub:
1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com)
3. Click "Import Project"
4. Select your GitHub repository
5. Configure environment variables:
   - Add all variables from `.env.example`
   - Set production values
6. Click "Deploy"

#### Manual Deployment:
```bash
# Install Vercel CLI
npm install -g vercel

# Login to Vercel
vercel login

# Deploy
vercel --prod
```

**Post-Deployment on Vercel:**
- Set custom domain in Vercel dashboard
- Configure environment variables in Settings > Environment Variables
- Enable automatic deployments from main branch

---

### Option 2: Netlify

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Login
netlify login

# Build and deploy
npm run build
netlify deploy --prod --dir=.next
```

**Netlify Configuration:**
- Build command: `npm run build`
- Publish directory: `.next`
- Add environment variables in Site Settings > Environment Variables

---

### Option 3: Docker + Cloud Provider (AWS, GCP, DigitalOcean)

#### Create Dockerfile:
```dockerfile
FROM node:20-alpine AS base

# Install dependencies
FROM base AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci

# Build application
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# Production image
FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs
EXPOSE 3000
ENV PORT=3000
CMD ["node", "server.js"]
```

#### Deploy:
```bash
# Build Docker image
docker build -t justcars-ng .

# Run container
docker run -p 3000:3000 --env-file .env.production justcars-ng
```

---

### Option 4: VPS (Ubuntu Server)

#### Prerequisites:
- Ubuntu 20.04+ server
- Node.js 20+ installed
- Nginx installed
- Domain pointed to server

#### Steps:

1. **Install Node.js:**
```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs
```

2. **Clone and Build:**
```bash
git clone https://github.com/yourusername/justcars.ng.git
cd justcars.ng
npm install
npm run build
```

3. **Set up PM2:**
```bash
sudo npm install -g pm2
pm2 start npm --name "justcars" -- start
pm2 startup
pm2 save
```

4. **Configure Nginx:**
```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

5. **Enable SSL with Let's Encrypt:**
```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

---

## Post-Deployment Tasks

### 1. Verify Deployment
- [ ] Visit your production URL
- [ ] Test homepage loads
- [ ] Test car browsing functionality
- [ ] Test dealer registration
- [ ] Test dealer login
- [ ] Test admin login
- [ ] Verify images load correctly
- [ ] Check API endpoints respond correctly

### 2. Monitoring Setup
- [ ] Set up error tracking (Sentry, LogRocket, etc.)
- [ ] Configure uptime monitoring
- [ ] Set up performance monitoring
- [ ] Enable analytics (Google Analytics, Plausible, etc.)

### 3. Backups
- [ ] Set up automated database backups in Supabase
- [ ] Configure storage bucket backups
- [ ] Document backup restoration procedure

### 4. Security
- [ ] Enable 2FA for admin accounts
- [ ] Review and update security headers
- [ ] Configure WAF rules (if applicable)
- [ ] Set up security monitoring alerts

### 5. Performance
- [ ] Run Lighthouse audit
- [ ] Test Core Web Vitals
- [ ] Monitor server response times
- [ ] Check CDN configuration

---

## Environment-Specific Notes

### Production Checklist
- `NODE_ENV=production`
- All console.logs removed (automatic)
- Source maps disabled
- Compression enabled
- Rate limiting active
- Error tracking enabled

### Staging Checklist
- Use separate Supabase project
- `NODE_ENV=production` (but different database)
- Error tracking to separate project
- Test payment integrations in sandbox mode

---

## Troubleshooting

### Build Fails
- Check Node.js version (should be 20+)
- Verify all dependencies installed: `npm ci`
- Check for syntax errors: `npm run lint`
- Review build logs for specific errors

### 500 Errors in Production
- Verify environment variables are set correctly
- Check Supabase service role key is valid
- Review API route logs
- Verify database connection

### Images Not Loading
- Check Supabase storage bucket permissions
- Verify `remotePatterns` in next.config.ts
- Ensure image URLs are correct format

### Slow Performance
- Enable CDN for static assets
- Check database query performance
- Review API caching strategies
- Optimize image sizes

---

## Rollback Procedure

### Vercel
```bash
vercel rollback
```

### VPS/Docker
```bash
# Revert to previous commit
git reset --hard HEAD~1
npm install
npm run build
pm2 restart justcars
```

---

## Support & Contact

- **Issues:** Create issue on GitHub repository
- **Email:** admin@justcars.ng
- **Documentation:** See README.md

---

## Version History

- **v1.0.0** - Initial production release
- Fixed premium cars API syntax error
- Added comprehensive deployment documentation
- Optimized for production deployment

# MomentMatcher - Deployment Guide

Complete guide for deploying MomentMatcher to production.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Environment Setup](#environment-setup)
3. [Database Setup](#database-setup)
4. [Twelve Labs Setup](#twelve-labs-setup)
5. [OpenAI Setup](#openai-setup)
6. [Local Development](#local-development)
7. [Production Deployment (Vercel)](#production-deployment-vercel)
8. [Alternative Deployment Options](#alternative-deployment-options)
9. [Post-Deployment](#post-deployment)
10. [Troubleshooting](#troubleshooting)

---

## Prerequisites

### Required Accounts

- [ ] GitHub account (for code repository)
- [ ] Vercel account (recommended for deployment)
- [ ] Neon account (for PostgreSQL database)
- [ ] Twelve Labs account (for video analysis)
- [ ] OpenAI account (for product recommendations)

### Required Tools

- [ ] Node.js 18+ and npm
- [ ] Git
- [ ] Code editor (VS Code recommended)
- [ ] Terminal/Command Line access

### Cost Estimates

- **Neon Database**: Free tier available (sufficient for MVP)
- **Twelve Labs**: ~$0.05-0.15 per minute of video indexed
- **OpenAI GPT-4**: ~$0.01-0.03 per API call
- **Vercel Hosting**: Free tier available (sufficient for small-medium traffic)

**Estimated monthly costs for 100 videos (5 min avg):**

- Twelve Labs: ~$25-75
- OpenAI: ~$20-50
- Database + Hosting: $0 (free tiers)
- **Total: ~$45-125/month**

---

## Environment Setup

### 1. Clone Repository

```bash
git clone https://github.com/yourusername/momentmatcher.git
cd momentmatcher
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Create Environment File

Create a `.env.local` file in the project root:

```bash
cp .env.example .env.local
```

Or create manually with these variables:

```env
# Database Configuration
DATABASE_URL="postgresql://[user]:[password]@[host]/[database]?sslmode=require"

# Twelve Labs API
TWELVE_LABS_API_KEY="your_twelve_labs_api_key"
TWELVE_LABS_INDEX_ID="your_index_id"

# OpenAI API
OPENAI_API_KEY="your_openai_api_key"

# Optional: Node Environment
NODE_ENV="development"
```

---

## Database Setup

### Option 1: Neon (Recommended for Vercel)

#### Step 1: Create Neon Account

1. Go to https://neon.tech
2. Sign up with GitHub (easiest)
3. Create a new project

#### Step 2: Get Database Connection String

1. In Neon dashboard, go to your project
2. Click "Connection Details"
3. Copy the connection string
4. It should look like:
   ```
   postgresql://user:password@ep-xxx.us-east-2.aws.neon.tech/neondb?sslmode=require
   ```

#### Step 3: Add to Environment

```env
DATABASE_URL="postgresql://user:password@ep-xxx.us-east-2.aws.neon.tech/neondb?sslmode=require"
```

#### Step 4: Initialize Database Schema

```bash
# Generate migration files (already done)
npm run db:generate

# Push schema to database
npm run db:push
```

#### Step 5: Verify Database

```bash
# Open Drizzle Studio to browse your database
npm run db:studio
```

This opens a web interface at http://localhost:4983

### Option 2: Other PostgreSQL Providers

MomentMatcher works with any PostgreSQL 12+ database:

**Supabase**:

```env
DATABASE_URL="postgresql://postgres:[password]@db.[project].supabase.co:5432/postgres"
```

**Railway**:

```env
DATABASE_URL="postgresql://postgres:[password]@[host].railway.app:[port]/railway"
```

**Self-hosted**:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/momentmatcher"
```

After setting up, always run:

```bash
npm run db:push
```

---

## Twelve Labs Setup

### Step 1: Create Account

1. Go to https://twelvelabs.io
2. Sign up for an account
3. Choose a plan (Start with free tier or trial)

### Step 2: Generate API Key

1. Go to Dashboard → API Keys
2. Click "Create New Key"
3. Copy the key (starts with `tlk_`)
4. Save it securely

### Step 3: Create Video Index

1. Go to Dashboard → Indexes
2. Click "Create Index"
3. Settings:
   - **Name**: "MomentMatcher Videos" (or your choice)
   - **Engine**: Select "Marengo 2.6"
   - **Options**: Enable all modalities:
     - ✅ Visual
     - ✅ Conversation
     - ✅ Text in video
     - ✅ Logo
4. Click "Create"
5. Copy the Index ID (starts with `65...`)

### Step 4: Add to Environment

```env
TWELVE_LABS_API_KEY="tlk_xxxxxxxxxxxxx"
TWELVE_LABS_INDEX_ID="65f4e1xxxxxxxxxxxxx"
```

### Step 5: Verify Connection

```bash
# Test upload (if you have a test video)
npm run upload-video

# Or verify index
npm run verify-index
```

---

## OpenAI Setup

### Step 1: Create Account

1. Go to https://platform.openai.com
2. Sign up or log in
3. Add payment method (required for API access)

### Step 2: Generate API Key

1. Go to https://platform.openai.com/api-keys
2. Click "Create new secret key"
3. Name it "MomentMatcher"
4. Copy the key (starts with `sk-proj-` or `sk-`)
5. Save it securely (you can't see it again!)

### Step 3: Set Usage Limits (Recommended)

1. Go to Settings → Limits
2. Set monthly spending limit (e.g., $50)
3. Set email notifications

### Step 4: Add to Environment

```env
OPENAI_API_KEY="sk-proj-xxxxxxxxxxxxx"
```

### Step 5: Verify Access

The API will be tested when you run your first analysis. Check usage at:
https://platform.openai.com/usage

---

## Local Development

### 1. Verify Environment Variables

```bash
# Check if all variables are set
node -e "console.log(process.env.DATABASE_URL ? '✅ DATABASE_URL' : '❌ DATABASE_URL')"
node -e "console.log(process.env.TWELVE_LABS_API_KEY ? '✅ TWELVE_LABS_API_KEY' : '❌ TWELVE_LABS_API_KEY')"
node -e "console.log(process.env.OPENAI_API_KEY ? '✅ OPENAI_API_KEY' : '❌ OPENAI_API_KEY')"
```

### 2. Start Development Server

```bash
npm run dev
```

Application will be available at: http://localhost:3000

### 3. Test the Application

#### Test 1: Landing Page

- Open http://localhost:3000
- Should see the MomentMatcher landing page

#### Test 2: Video Library

- Go to http://localhost:3000/analyze
- Click "Select from Library"
- Should connect to Twelve Labs and show any indexed videos

#### Test 3: Upload Video (Optional)

- Click "Upload New Video"
- Upload a short test video (< 1 minute recommended)
- Wait for processing (1-5 minutes)
- Should see analysis results

### 4. Development Tools

```bash
# TypeScript type checking
npm run type-check

# Linting
npm run lint

# Database studio
npm run db:studio

# Check database contents
npm run check-db

# Clear analysis data (keep videos)
npm run clear-analysis

# Full database reset
npm run db:reset
```

---

## Production Deployment (Vercel)

Vercel is the recommended deployment platform for Next.js applications.

### Step 1: Prepare Repository

Ensure your code is in a Git repository:

```bash
# Initialize git (if not already done)
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit"

# Push to GitHub (create repo first on github.com)
git remote add origin https://github.com/yourusername/momentmatcher.git
git branch -M main
git push -u origin main
```

### Step 2: Deploy to Vercel

#### Option A: Vercel CLI (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel

# Follow prompts:
# - Link to existing project? No
# - What's your project's name? momentmatcher
# - In which directory is your code located? ./
# - Want to modify settings? No
```

#### Option B: Vercel Dashboard

1. Go to https://vercel.com
2. Click "New Project"
3. Import your Git repository
4. Configure:
   - **Framework Preset**: Next.js (auto-detected)
   - **Root Directory**: ./
   - **Build Command**: `npm run build` (default)
   - **Output Directory**: `.next` (default)

### Step 3: Configure Environment Variables

In Vercel Dashboard:

1. Go to your project
2. Settings → Environment Variables
3. Add each variable:

```
DATABASE_URL = postgresql://user:password@host/db?sslmode=require
TWELVE_LABS_API_KEY = tlk_xxxxxxxxxxxxx
TWELVE_LABS_INDEX_ID = 65f4e1xxxxxxxxxxxxx
OPENAI_API_KEY = sk-proj-xxxxxxxxxxxxx
NODE_ENV = production
```

**Important**:

- Add to all environments (Production, Preview, Development)
- Use Neon's serverless connection string (not pooled)

### Step 4: Deploy

#### If using CLI:

```bash
# Deploy to production
vercel --prod
```

#### If using Dashboard:

- Push to main branch on GitHub
- Vercel auto-deploys on every push

### Step 5: Verify Deployment

1. Visit your deployment URL (e.g., `https://momentmatcher.vercel.app`)
2. Test video upload
3. Test video analysis
4. Check Vercel logs for any errors

---

## Alternative Deployment Options

### Deploy to Railway

1. Go to https://railway.app
2. Click "New Project" → "Deploy from GitHub"
3. Select repository
4. Add environment variables
5. Railway will auto-deploy

**Pros**: Includes database, simple setup
**Cons**: Higher costs than Vercel + Neon

### Deploy to Render

1. Go to https://render.com
2. New → Web Service
3. Connect repository
4. Settings:
   - Environment: Node
   - Build: `npm install && npm run build`
   - Start: `npm run start`
5. Add environment variables

### Deploy to DigitalOcean App Platform

1. Go to https://cloud.digitalocean.com/apps
2. Create App → GitHub
3. Select repository
4. Configure:
   - Type: Web Service
   - Build: `npm run build`
   - Run: `npm start`
5. Add environment variables

### Self-Hosted (Docker)

Create `Dockerfile`:

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]
```

Build and run:

```bash
docker build -t momentmatcher .
docker run -p 3000:3000 --env-file .env momentmatcher
```

---

## Post-Deployment

### 1. Database Migration (Production)

If you update the database schema:

```bash
# Generate new migration
npm run db:generate

# Apply to production (do this carefully!)
# Option 1: Push directly
npm run db:push

# Option 2: Use Drizzle Studio on production
DATABASE_URL="production_url" npm run db:studio
```

**Caution**: Test migrations on a staging database first!

### 2. Monitor Performance

#### Vercel Analytics

1. Enable in Vercel Dashboard
2. Settings → Analytics → Enable
3. View real-time metrics

#### Application Logs

```bash
# View logs in real-time
vercel logs --follow

# Or in Vercel Dashboard
# Deployments → [Your Deployment] → Runtime Logs
```

#### Database Monitoring

- Neon Dashboard → Monitoring
- Watch connection count, query performance

#### API Usage Monitoring

- **Twelve Labs**: Dashboard → Usage
- **OpenAI**: https://platform.openai.com/usage

### 3. Set Up Alerts

#### Vercel

- Settings → Integrations → Add Slack/Discord
- Get notified on deployment failures

#### OpenAI

- Settings → Limits → Email notifications
- Alert when approaching spending limit

### 4. Backup Strategy

#### Database Backups

Neon provides automatic backups on paid plans. For free tier:

```bash
# Manual backup
pg_dump DATABASE_URL > backup.sql

# Restore
psql DATABASE_URL < backup.sql
```

#### Code Backups

- Ensure GitHub repo is up to date
- Use protected branches (main)
- Tag releases: `git tag v1.0.0`

### 5. Performance Optimization

#### Enable Caching

In `next.config.ts`, ensure caching is configured:

```typescript
export default {
  // ... other config
  experimental: {
    serverActions: {
      bodySizeLimit: "10mb",
    },
  },
  // Cache static assets
  headers: async () => [
    {
      source: "/static/:path*",
      headers: [
        {
          key: "Cache-Control",
          value: "public, max-age=31536000, immutable",
        },
      ],
    },
  ],
};
```

#### Database Optimization

```sql
-- Add indexes for common queries
CREATE INDEX IF NOT EXISTS idx_videos_status ON videos(status);
CREATE INDEX IF NOT EXISTS idx_ad_moments_video_id ON ad_moments(video_id);
CREATE INDEX IF NOT EXISTS idx_brand_mentions_video_id ON brand_mentions(video_id);
```

Run in Drizzle Studio or via migration.

---

## Troubleshooting

### Issue: "Failed to connect to database"

**Solution**:

1. Check DATABASE_URL is correct
2. Ensure `?sslmode=require` is at the end
3. Verify database is running (check Neon dashboard)
4. Test connection:
   ```bash
   npx tsx -e "import { db } from './src/lib/db/index.ts'; db.execute('SELECT 1').then(() => console.log('✅ Connected')).catch(e => console.error('❌ Failed:', e))"
   ```

### Issue: "Twelve Labs API error"

**Solution**:

1. Verify API key is correct
2. Check index exists and is active
3. Verify account has credits/active subscription
4. Test API:
   ```bash
   curl https://api.twelvelabs.io/v1.2/indexes \
     -H "x-api-key: YOUR_API_KEY"
   ```

### Issue: "OpenAI API error"

**Solution**:

1. Check API key is valid
2. Verify billing is set up
3. Check usage limits not exceeded
4. Test API:
   ```bash
   curl https://api.openai.com/v1/models \
     -H "Authorization: Bearer YOUR_API_KEY"
   ```

### Issue: "Video upload fails"

**Causes**:

- File too large (>2GB)
- Unsupported format
- Network timeout

**Solution**:

1. Check file size and format
2. Try shorter video first
3. Check Twelve Labs dashboard for upload status
4. Increase timeout in `next.config.ts`:
   ```typescript
   export default {
     api: {
       bodyParser: {
         sizeLimit: "10mb",
       },
       responseLimit: false,
     },
   };
   ```

### Issue: "Analysis taking too long"

**Expected Times**:

- Video indexing: 1-5 minutes
- Analysis: 30 seconds - 2 minutes

**If taking longer**:

1. Check video is fully indexed (Twelve Labs dashboard)
2. Check OpenAI API rate limits
3. Monitor server logs for errors
4. Ensure 500ms delays between API calls are working

### Issue: "Premium spots not showing"

**Solution**:

1. Check console logs for tier distribution
2. Verify video has high-energy moments
3. Re-run analysis: `npm run clear-analysis` then re-analyze
4. Check spot calculator logic in console

### Issue: "Build fails on Vercel"

**Common causes**:

- TypeScript errors
- Missing dependencies
- Environment variables not set

**Solution**:

```bash
# Test build locally
npm run build

# Check for type errors
npm run type-check

# Ensure all deps are in package.json
npm install
```

### Issue: "Database queries slow"

**Solution**:

1. Add indexes (see Performance Optimization above)
2. Check Neon connection pooling
3. Use Neon's connection pooler:
   ```env
   DATABASE_URL="postgresql://user:password@host/db?sslmode=require&pgbouncer=true"
   ```

---

## Security Checklist

Before going to production:

- [ ] All API keys in environment variables (not in code)
- [ ] `.env.local` in `.gitignore`
- [ ] Database uses SSL/TLS connections
- [ ] CORS configured properly
- [ ] Rate limiting on API routes (if high traffic expected)
- [ ] Input validation on all forms
- [ ] SQL injection protection (Drizzle ORM handles this)
- [ ] No console.logs with sensitive data in production
- [ ] Environment variables set in Vercel for all environments

---

## Maintenance

### Weekly

- Check API usage and costs
- Review error logs
- Monitor database size

### Monthly

- Update dependencies: `npm update`
- Review and rotate API keys
- Check for security updates

### As Needed

- Backup database before major changes
- Test new features in preview deployments
- Monitor user feedback and errors

---

## Getting Help

### Documentation

- **Next.js**: https://nextjs.org/docs
- **Twelve Labs**: https://docs.twelvelabs.io
- **OpenAI**: https://platform.openai.com/docs
- **Drizzle ORM**: https://orm.drizzle.team/docs
- **Neon**: https://neon.tech/docs

### Community

- Twelve Labs Discord: https://discord.gg/twelvelabs
- Next.js Discord: https://nextjs.org/discord
- OpenAI Community: https://community.openai.com

### Support

- Twelve Labs Support: support@twelvelabs.io
- OpenAI Support: https://help.openai.com
- Vercel Support: https://vercel.com/support

---

## Success! 🎉

Your MomentMatcher application should now be:

- ✅ Connected to database
- ✅ Integrated with Twelve Labs
- ✅ Integrated with OpenAI
- ✅ Deployed to production
- ✅ Monitored and maintained

Next steps:

1. Test with real video content
2. Gather user feedback
3. Monitor costs and optimize
4. Add custom features
5. Scale as needed

Happy deploying! 🚀

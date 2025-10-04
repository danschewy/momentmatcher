# 🚀 Deployment Guide

Deploy MomentMatch AI to production with Vercel, Railway, or any Node.js hosting platform.

## Vercel Deployment (Recommended) ⚡

Vercel is the fastest and easiest way to deploy Next.js applications.

### Step 1: Prepare Your Repository

```bash
# Initialize git if not already done
git init
git add .
git commit -m "Initial commit: MomentMatch AI"

# Push to GitHub/GitLab/Bitbucket
git remote add origin <your-repo-url>
git push -u origin main
```

### Step 2: Deploy with Vercel

#### Option A: Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel

# Deploy to production
vercel --prod
```

#### Option B: Vercel Dashboard

1. Visit [vercel.com](https://vercel.com)
2. Click "Import Project"
3. Connect your Git repository
4. Vercel will auto-detect Next.js
5. Add environment variables (see below)
6. Click "Deploy"

### Step 3: Configure Environment Variables

In your Vercel project settings, add:

```env
DATABASE_URL=your_neondb_connection_string
TWELVE_LABS_API_KEY=your_twelve_labs_key
OPENAI_API_KEY=your_openai_key
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
```

### Step 4: Set Up Database

Your NeonDB database should already be set up. If not:

```bash
# From your local machine
npx drizzle-kit push
```

---

## Alternative Platforms

### Railway 🚂

1. Visit [railway.app](https://railway.app)
2. Create a new project
3. Add NeonDB from the marketplace
4. Deploy from GitHub
5. Add environment variables
6. Railway will auto-deploy on every push

### DigitalOcean App Platform 🌊

1. Create a new app from your repository
2. Select Node.js environment
3. Set build command: `npm run build`
4. Set run command: `npm start`
5. Add environment variables
6. Deploy

### AWS Amplify ☁️

1. Connect your Git repository
2. Amplify auto-detects Next.js
3. Configure build settings
4. Add environment variables
5. Deploy

---

## Production Checklist ✅

### Before Deployment

- [ ] All API keys are valid and have proper permissions
- [ ] Database schema is up to date
- [ ] Environment variables are documented
- [ ] .env files are in .gitignore
- [ ] Tests pass (if applicable)
- [ ] Build runs without errors: `npm run build`

### Security

- [ ] API keys are never committed to Git
- [ ] Database connection uses SSL
- [ ] API routes have rate limiting (consider adding)
- [ ] CORS is properly configured (for API endpoints)
- [ ] Environment variables are encrypted in hosting platform

### Performance

- [ ] Images are optimized
- [ ] Videos are served via CDN (consider Cloudinary, Mux)
- [ ] Database queries are indexed
- [ ] API responses are cached where appropriate

### Monitoring

Consider adding:

- Error tracking (Sentry)
- Analytics (Vercel Analytics, Google Analytics)
- Performance monitoring (Vercel Speed Insights)
- Uptime monitoring (UptimeRobot)

---

## Database Scaling 📊

### NeonDB Production

NeonDB scales automatically, but for production:

1. **Upgrade Plan**: Move from free tier to paid for better performance
2. **Connection Pooling**: Enable in NeonDB settings
3. **Read Replicas**: Add for high-traffic scenarios
4. **Branching**: Use for staging/production separation

---

## Video Storage 🎬

For production, store videos in dedicated services:

### Cloudinary

```bash
npm install cloudinary
```

```typescript
// Add to your upload route
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});
```

### AWS S3

```bash
npm install @aws-sdk/client-s3
```

### Mux (Recommended for Video)

```bash
npm install @mux/mux-node
```

---

## CI/CD Pipeline 🔄

### GitHub Actions Example

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: "18"
      - run: npm install
      - run: npm run build
      - run: npm test
      - uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
```

---

## Domain Setup 🌐

### Custom Domain on Vercel

1. Go to your project settings
2. Click "Domains"
3. Add your custom domain
4. Update DNS records as instructed
5. SSL certificate is auto-generated

---

## Monitoring & Logs 📈

### View Logs

```bash
# Vercel CLI
vercel logs

# Railway
railway logs

# Docker
docker logs <container-id>
```

### Set Up Alerts

1. **Vercel**: Integrations → Add monitoring service
2. **Railway**: Built-in metrics and logs
3. **Custom**: Use services like Better Stack, Datadog

---

## Rollback Strategy 🔄

### Vercel

- Instant rollback in dashboard
- Or: `vercel rollback`

### Git-based

```bash
git revert HEAD
git push
```

---

## Cost Optimization 💰

### Free Tier Limits

**Vercel Free:**

- 100GB bandwidth/month
- 100 hours serverless execution
- Unlimited deployments

**NeonDB Free:**

- 0.5GB storage
- Compute scales to zero
- Perfect for MVP/demo

**Twelve Labs:**

- Check current pricing
- Cache results to reduce API calls

**OpenAI:**

- Set spending limits
- Cache recommendations
- Use GPT-4o-mini for cost savings

### Scaling Costs

For 1000 monthly users:

- Vercel Pro: $20/month
- NeonDB Scale: ~$24/month
- Twelve Labs: Variable (usage-based)
- OpenAI: ~$50-200/month (depending on usage)

**Total estimated: $100-300/month** for moderate traffic

---

## Support & Maintenance 🛠️

### Regular Tasks

- Monitor API usage and costs
- Review error logs weekly
- Update dependencies monthly
- Backup database regularly
- Test API integrations

### Emergency Contacts

- Vercel Support: [vercel.com/support](https://vercel.com/support)
- NeonDB Support: support@neon.tech
- Twelve Labs: [twelvelabs.io/contact](https://twelvelabs.io/contact)
- OpenAI: help.openai.com

---

## Production URLs 🌍

After deployment, update:

1. `NEXT_PUBLIC_APP_URL` in environment
2. Twelve Labs webhook URLs (if using)
3. OAuth redirect URLs (if adding auth)
4. CORS allowed origins

---

**Congratulations! Your MomentMatch AI app is now in production! 🎉**

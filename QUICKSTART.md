# 🚀 Quick Start Guide

Get MomentMatch AI up and running in 5 minutes!

## Step 1: Prerequisites ✅

Make sure you have:

- [x] Node.js 18+ installed ([download](https://nodejs.org/))
- [x] npm or yarn
- [x] A code editor (VS Code recommended)

## Step 2: Get API Keys 🔑

### NeonDB (Database)

1. Visit [neon.tech](https://neon.tech)
2. Sign up for a free account
3. Create a new project
4. Copy your connection string (starts with `postgresql://`)

### Twelve Labs (Video AI)

1. Visit [twelvelabs.io](https://twelvelabs.io)
2. Sign up and get your API key
3. You may get free credits for testing!

### OpenAI (Ad Recommendations)

1. Visit [platform.openai.com](https://platform.openai.com)
2. Create an account
3. Generate an API key from the API Keys section
4. Add some credits to your account

## Step 3: Setup 🛠️

### Option A: Automatic Setup (Recommended)

```bash
# Clone the repository
git clone <your-repo-url>
cd momentmatcher

# Run the setup script
chmod +x scripts/setup.sh
./scripts/setup.sh
```

### Option B: Manual Setup

```bash
# Install dependencies
npm install

# Create environment file
cp .env.example .env.local

# Edit .env.local with your API keys
# Then set up the database
npx drizzle-kit generate
npx drizzle-kit push
```

## Step 4: Configure Environment Variables 📝

Edit `.env.local`:

```env
# Your NeonDB connection string
DATABASE_URL=postgresql://user:password@ep-xxx.neon.tech/neondb?sslmode=require

# Your Twelve Labs API key
TWELVE_LABS_API_KEY=tlk_xxxxxxxxxxxxx

# Your OpenAI API key
OPENAI_API_KEY=sk-xxxxxxxxxxxxx

# App URL (default is fine for local development)
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## Step 5: Run the App 🎯

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

You should see the beautiful MomentMatch AI landing page!

## Step 6: Test It Out 🎬

1. **Upload a Video**: Click "Upload Your Video" or visit the `/analyze` page
2. **Select a File**: Choose any MP4, MOV, or AVI video (up to 2GB)
3. **Start Analysis**: Click "Start Analysis" and watch the magic happen!
4. **Review Moments**: Explore the detected ad moments on the timeline
5. **Check Recommendations**: See AI-powered ad suggestions for each moment
6. **Export Report**: Download a CSV with all your ad placements

## Demo Mode 🎭

The app includes demo data, so you can see how it works even without setting up the APIs! Just upload any video and start the analysis.

## Troubleshooting 🔧

### Port Already in Use

```bash
# Use a different port
PORT=3001 npm run dev
```

### Database Connection Issues

- Verify your `DATABASE_URL` is correct
- Make sure your NeonDB project is active
- Check that SSL mode is included in the connection string

### API Key Issues

- Double-check all API keys are correctly copied
- Ensure no extra spaces or quotes around keys
- Verify API keys have the correct permissions

### Module Not Found

```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

## What's Next? 🌟

- Explore the interactive timeline
- Try different video types
- Check out the ad recommendations
- Export your first report
- Customize the categories and emotions

## Need Help? 💬

- Check the main [README.md](./README.md) for detailed documentation
- Review the code in `/src` to understand the architecture
- Open an issue if you find bugs

## Hackathon Tips 🏆

For judges and evaluators:

1. **Quick Demo**: Use the demo mode with any video file
2. **Key Features**: Focus on the timeline, moment cards, and AI recommendations
3. **Tech Stack**: Next.js 15, NeonDB, Twelve Labs, OpenAI
4. **Scalability**: Serverless architecture, ready for production

---

**Happy coding! 🎉**

# 🎯 MomentMatch AI

**Transform Videos Into Revenue Machines**

MomentMatch AI is an intelligent video ad placement platform that analyzes video content to identify optimal moments for advertisement insertion. Using advanced AI from Twelve Labs and OpenAI, it provides context-aware, emotion-driven ad recommendations that maximize engagement and ROI.

## 🚀 Features

- **🎥 Deep Video Analysis**: Powered by Twelve Labs' Marengo 2.7 engine for comprehensive video understanding
- **📚 Video Library**: Browse and analyze previously uploaded videos from your Twelve Labs indexes without re-uploading
- **🎯 Smart Moment Detection**: Identifies optimal ad placement opportunities based on context, emotion, and viewer engagement
- **🤖 AI-Powered Ad Matching**: OpenAI integration finds relevant products and brands for each moment
- **📊 Interactive Timeline**: Visual representation of ad moments with emotional tone indicators
- **📈 Detailed Analytics**: Confidence scores, emotional analysis, and category classification
- **📤 Export Reports**: Generate CSV reports with timestamps, context, and ad recommendations
- **🎨 Beautiful UI**: Modern, dark-mode interface built with Next.js and Tailwind CSS

## 🛠️ Technology Stack

- **Frontend**: Next.js 15, React 19, TypeScript, Tailwind CSS
- **Database**: NeonDB (Serverless PostgreSQL) with Drizzle ORM
- **AI/ML**:
  - Twelve Labs API (Video Intelligence)
  - OpenAI GPT-4 with Web Search (Ad Recommendations)
- **Icons**: Lucide React
- **Export**: jsPDF for report generation

## 📋 Prerequisites

- Node.js 18+
- npm or yarn
- NeonDB account ([neon.tech](https://neon.tech))
- Twelve Labs API key ([twelvelabs.io](https://twelvelabs.io))
- OpenAI API key ([platform.openai.com](https://platform.openai.com))

## 🏃‍♂️ Quick Start

### 1. Clone the repository

```bash
git clone https://github.com/yourusername/momentmatcher.git
cd momentmatcher
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up environment variables

Create a `.env.local` file in the root directory:

```env
# Database
DATABASE_URL=postgresql://user:password@host/database?sslmode=require

# Twelve Labs API
TWELVE_LABS_API_KEY=your_twelve_labs_api_key_here

# OpenAI API
OPENAI_API_KEY=your_openai_api_key_here

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 4. Set up the database

```bash
# Generate migration
npx drizzle-kit generate

# Push schema to database
npx drizzle-kit push
```

### 5. Run the development server

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) to see the app in action!

## 📁 Project Structure

```
momentmatcher/
├── src/
│   ├── app/
│   │   ├── api/              # API routes
│   │   │   ├── upload/       # Video upload endpoint
│   │   │   ├── analyze/      # Video analysis endpoint
│   │   │   └── moments/      # Moments retrieval endpoint
│   │   ├── analyze/          # Video analysis page
│   │   ├── layout.tsx        # Root layout
│   │   ├── page.tsx          # Landing page
│   │   └── globals.css       # Global styles
│   ├── components/
│   │   ├── VideoTimeline.tsx # Interactive timeline component
│   │   └── MomentCard.tsx    # Ad moment card component
│   ├── lib/
│   │   ├── db/               # Database configuration
│   │   │   ├── index.ts
│   │   │   └── schema.ts     # Drizzle schema
│   │   ├── twelvelabs.ts     # Twelve Labs integration
│   │   └── openai-search.ts  # OpenAI integration
│   └── types/
│       └── index.ts          # TypeScript types
├── drizzle.config.ts         # Drizzle configuration
├── package.json
└── README.md
```

## 🎯 How It Works

### 1. Upload Video

Users upload their video content through a beautiful drag-and-drop interface.

### 2. AI Analysis

- **Twelve Labs** analyzes the video for:
  - Visual content understanding
  - Speech and conversation analysis
  - Text-in-video detection
  - Emotional tone analysis
- The system identifies key moments suitable for ad placement based on:
  - Content transitions
  - Emotional peaks
  - Product mentions
  - Topic changes

### 3. Ad Recommendations

- **OpenAI** with web search finds relevant products and brands for each moment
- Recommendations include:
  - Product/Brand name
  - Description
  - Reasoning for fit
  - Relevance score
  - Direct product links

### 4. Interactive Review

Users can:

- View all detected moments on an interactive timeline
- Review context and emotional tone for each moment
- Browse AI-recommended ads
- Select preferred ad placements

### 5. Export

Generate comprehensive CSV reports with:

- Timestamp ranges
- Moment descriptions
- Emotional tone analysis
- Selected ad recommendations

## 🎨 UI/UX Highlights

- **Dark Mode First**: Sophisticated, modern aesthetic optimized for long sessions
- **Responsive Design**: Works beautifully on desktop and mobile
- **Real-time Feedback**: Live progress indicators during video processing
- **Color-Coded Timeline**: Visual emotional tone indicators (excited 🟡, positive 🟢, neutral 🔵)
- **Smooth Animations**: Polished transitions and hover effects
- **Accessibility**: Semantic HTML and keyboard navigation support

## 🔑 Key Components

### VideoTimeline

Interactive timeline showing all detected ad moments with:

- Time-based positioning
- Emotional tone color coding
- Current playback indicator
- Hover tooltips with timestamps

### MomentCard

Detailed view of each ad opportunity featuring:

- Timestamp and duration
- Emotional tone emoji
- Context description
- Confidence score
- Ad recommendation count

## 📊 Database Schema

### Videos

- `id`: UUID primary key
- `filename`: Original file name
- `uploadedAt`: Upload timestamp
- `status`: Processing status
- `videoUrl`: Storage URL
- `duration`: Video length in seconds

### Ad Moments

- `id`: UUID primary key
- `videoId`: Foreign key to videos
- `startTime`: Moment start (seconds)
- `endTime`: Moment end (seconds)
- `context`: Description of the moment
- `emotionalTone`: Detected emotion
- `category`: Content category
- `confidence`: Detection confidence (0-100)

### Ad Recommendations

- `id`: UUID primary key
- `momentId`: Foreign key to ad_moments
- `productName`: Recommended product
- `brandName`: Brand/company name
- `description`: Product description
- `productUrl`: Direct product link
- `reasoning`: Why this ad fits
- `relevanceScore`: Match quality (0-100)
- `selected`: User selection status

## 🚀 Deployment

### Vercel (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

### Environment Variables

Don't forget to set your environment variables in your deployment platform!

## 🤝 Contributing

This is a hackathon project, but contributions are welcome! Please feel free to submit issues or pull requests.

## 📝 License

MIT License - feel free to use this project for your own purposes.

## 🎓 Hackathon Information

**Built for**: [Hackathon Name]
**Team**: [Your Team Name]
**Date**: October 2025

### Judges & CMOs: Why MomentMatch AI?

1. **Real Business Value**: Solves the genuine problem of low engagement with generic pre-roll ads
2. **Technical Excellence**: Leverages cutting-edge AI (Twelve Labs, OpenAI) with modern web technologies
3. **Scalable Architecture**: Serverless database, API-first design, ready for production
4. **Market Ready**: Could monetize through SaaS model, API access, or partnership with ad networks
5. **Measurable Impact**: Higher engagement rates, better ROI for advertisers, increased revenue for creators

## 🌟 Future Enhancements

- [ ] Real-time video streaming analysis
- [ ] A/B testing framework for ad performance
- [ ] Integration with ad networks (Google Ads, Facebook Ads)
- [ ] Advanced analytics dashboard
- [ ] Multi-user support with team collaboration
- [ ] Video editing with embedded ad preview
- [ ] Machine learning model for ad performance prediction
- [ ] Mobile app for on-the-go analysis

## 📞 Contact

For questions or feedback, reach out to [your-email@example.com]

---

**Made with ❤️ using Next.js, NeonDB, Twelve Labs, and OpenAI**

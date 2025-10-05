# MomentMatcher - Technical Architecture Overview

## Table of Contents

1. [System Overview](#system-overview)
2. [Technology Stack](#technology-stack)
3. [Architecture Components](#architecture-components)
4. [Data Flow](#data-flow)
5. [Database Schema](#database-schema)
6. [API Endpoints](#api-endpoints)
7. [AI/ML Integration](#aiml-integration)
8. [Security & Performance](#security--performance)

---

## System Overview

MomentMatcher is an AI-powered video advertising platform that analyzes video content to identify optimal ad placement opportunities and recommend contextually relevant products. The system uses multimodal AI to understand video content (visual, audio, text) and matches it with advertising opportunities.

### Key Features

- **Video Analysis**: Multimodal content understanding using Twelve Labs API
- **Ad Moment Detection**: Semantic search for ideal advertising placement times
- **Product Recommendations**: AI-powered contextual product matching using OpenAI GPT-4
- **Ad Spot Valuation**: Industry-standard CPM calculation based on engagement metrics
- **Publisher Dashboard**: Real-time analytics and inventory management
- **HLS Video Streaming**: Scalable video playback with time-synchronized analysis

---

## Technology Stack

### Frontend

- **Framework**: Next.js 15.5.4 (App Router)
- **UI Library**: React 19.1.0
- **Styling**: Tailwind CSS 4.0
- **Icons**: Lucide React
- **Video Player**: HLS.js for adaptive streaming
- **Export**: jsPDF for report generation

### Backend

- **Runtime**: Node.js with Next.js API Routes
- **API Framework**: Next.js Server Actions & Route Handlers
- **Type Safety**: TypeScript 5.x

### Database

- **Primary Database**: PostgreSQL (Neon Serverless)
- **ORM**: Drizzle ORM 0.38.0
- **Connection**: @neondatabase/serverless (HTTP-based, serverless-optimized)
- **Migrations**: Drizzle Kit for schema management

### AI/ML Services

- **Video Understanding**: Twelve Labs Multimodal Video API
  - Marengo 2.6 engine for video indexing
  - Visual, audio, conversation, text-in-video analysis
  - Semantic search capabilities
- **Product Recommendations**: OpenAI GPT-4
  - Natural language understanding
  - Context-aware product matching
  - Revenue projection calculations

### Infrastructure

- **Hosting**: Vercel (recommended) or any Node.js hosting
- **Database**: Neon PostgreSQL (serverless)
- **Video Storage**: Twelve Labs Cloud Storage
- **Video Delivery**: HLS streaming via Twelve Labs CDN

---

## Architecture Components

### 1. Frontend Application (`src/app/`)

#### Pages

- **Landing Page** (`page.tsx`)

  - Product overview and feature showcase
  - Call-to-action for video analysis

- **Analyze Page** (`analyze/page.tsx`)

  - Video upload interface
  - Video library selection
  - Real-time analysis status
  - Interactive video player with timeline
  - Tabbed view for brand mentions and ad moments
  - Product recommendation display

- **Dashboard Page** (`dashboard/[videoId]/page.tsx`)
  - Publisher-focused analytics
  - Ad inventory metrics
  - CPM and revenue projections
  - Product recommendation aggregation
  - CSV export functionality

#### Components (`src/components/`)

- **VideoTimeline.tsx**: Visual timeline showing premium/standard/basic ad spots
- **HLSVideoPlayer.tsx**: Custom HLS video player with time tracking
- **MomentCard.tsx**: Display card for individual ad moments
- **VideoLibrary.tsx**: Grid view of uploaded videos
- **ProcessingAnimation.tsx**: Loading states during video analysis
- **InfoTooltip.tsx**: Educational tooltips for metrics

### 2. Backend API (`src/app/api/`)

#### Core Endpoints

**Video Management**

- `POST /api/upload` - Upload video to Twelve Labs
- `GET /api/indexes` - List video indexes
- `GET /api/indexes/[indexId]/videos` - List videos in index
- `GET /api/indexes/[indexId]/videos/[videoId]` - Get video details
- `GET /api/videos/[videoId]/status` - Check video processing status

**Analysis**

- `POST /api/analyze` - Analyze video for ad moments and recommendations
  - Semantic search for ad moments
  - Brand mention detection
  - Product recommendation generation
  - Spot quality calculation
  - Database persistence

**Data Retrieval**

- `GET /api/moments/[videoId]` - Get all moments and recommendations for a video

### 3. Business Logic (`src/lib/`)

#### Twelve Labs Integration (`twelvelabs.ts`)

```typescript
- analyzeForAdMoments(): Semantic search across video
- detectBrandMentions(): Identify brand references and opportunities
- Video indexing with Marengo 2.6 engine
```

#### OpenAI Integration (`openai-search.ts`)

```typescript
- findRelevantProducts(): Context-aware product matching
- calculateRevenue(): Revenue projection algorithms
- Structured output with relevance scoring
```

#### Spot Value Calculator (`spot-value-calculator.ts`)

```typescript
- calculateSpotQuality(): Engagement & attention scoring
- determinePlacementTier(): Premium/Standard/Basic classification
- calculateCpmRange(): Industry-standard CPM calculation by category
- detectCategories(): Content categorization
```

---

## Data Flow

### Video Upload & Analysis Flow

```
┌─────────────┐
│   User      │
└──────┬──────┘
       │ 1. Upload Video
       ▼
┌─────────────────────────────────────────┐
│  Next.js Frontend (Upload Interface)    │
└──────┬──────────────────────────────────┘
       │ 2. POST /api/upload
       ▼
┌─────────────────────────────────────────┐
│  API Route Handler                       │
│  - Validate video                        │
│  - Forward to Twelve Labs                │
└──────┬──────────────────────────────────┘
       │ 3. Upload to Twelve Labs
       ▼
┌─────────────────────────────────────────┐
│  Twelve Labs Cloud                       │
│  - Store video                           │
│  - Index with Marengo 2.6               │
│  - Extract features (visual, audio, text)│
└──────┬──────────────────────────────────┘
       │ 4. Return video ID & status
       ▼
┌─────────────────────────────────────────┐
│  Database (PostgreSQL)                   │
│  - Save video metadata                   │
│  - Status: processing → completed        │
└──────────────────────────────────────────┘
```

### Analysis & Recommendation Flow

```
┌─────────────┐
│   User      │
└──────┬──────┘
       │ 1. Analyze Video
       ▼
┌─────────────────────────────────────────┐
│  POST /api/analyze                       │
└──────┬──────────────────────────────────┘
       │
       ├── 2a. Detect Brand Mentions
       │   ▼
       │   ┌──────────────────────────────┐
       │   │ Twelve Labs Generate API     │
       │   │ - Gist detection            │
       │   │ - Topics extraction         │
       │   └──────┬───────────────────────┘
       │          │ 3a. Get recommendations
       │          ▼
       │   ┌──────────────────────────────┐
       │   │ OpenAI GPT-4                │
       │   │ - Product matching          │
       │   │ - Revenue calculation       │
       │   └──────┬───────────────────────┘
       │          │ 4a. Calculate spot quality
       │          ▼
       │   ┌──────────────────────────────┐
       │   │ Spot Value Calculator        │
       │   │ - Engagement scoring        │
       │   │ - CPM calculation           │
       │   └──────┬───────────────────────┘
       │          │
       └──────────┼── 2b. Search Ad Moments
                  │   ▼
                  │   ┌──────────────────────────────┐
                  │   │ Twelve Labs Search API       │
                  │   │ - Semantic queries          │
                  │   │ - Scene detection           │
                  │   └──────┬───────────────────────┘
                  │          │ 3b. Get recommendations
                  │          ▼
                  │   ┌──────────────────────────────┐
                  │   │ OpenAI GPT-4                │
                  │   └──────┬───────────────────────┘
                  │          │ 4b. Calculate spot quality
                  │          ▼
                  │   ┌──────────────────────────────┐
                  │   │ Spot Value Calculator        │
                  │   └──────┬───────────────────────┘
                  │          │
                  ▼          ▼
           ┌─────────────────────────────────────────┐
           │  Database (PostgreSQL)                   │
           │  - Save ad moments                       │
           │  - Save brand mentions                   │
           │  - Save recommendations                  │
           │  - Save spot quality metrics             │
           └──────┬──────────────────────────────────┘
                  │ 5. Return analysis results
                  ▼
           ┌─────────────────────────────────────────┐
           │  Frontend Display                        │
           │  - Timeline visualization                │
           │  - Product recommendations               │
           │  - Analytics dashboard                   │
           └─────────────────────────────────────────┘
```

---

## Database Schema

### Tables Overview

#### `videos`

Primary video metadata table

```sql
- id: TEXT (PK) - Twelve Labs video ID
- filename: TEXT - Original filename
- uploaded_at: TIMESTAMP - Upload time
- status: TEXT - processing | completed | failed
- twelve_labs_data: JSONB - Raw Twelve Labs response
- video_url: TEXT - HLS streaming URL
- duration: INTEGER - Video length in seconds
```

#### `ad_moments`

Detected advertising placement opportunities

```sql
- id: UUID (PK)
- video_id: TEXT (FK → videos.id)
- start_time: INTEGER - Moment start (seconds)
- end_time: INTEGER - Moment end (seconds)
- context: TEXT - Video context description
- emotional_tone: TEXT - excited, happy, neutral, etc.
- category: TEXT - sports, tech, lifestyle, etc.
- confidence: INTEGER - AI confidence (0-100)
- clip_url: TEXT - Video clip URL
- thumbnail_url: TEXT - Thumbnail image URL
- engagement_score: INTEGER - Engagement metric (0-100)
- attention_score: INTEGER - Attention metric (0-100)
- placement_tier: TEXT - premium | standard | basic
- estimated_cpm_min: INTEGER - Min CPM in cents
- estimated_cpm_max: INTEGER - Max CPM in cents
- category_tags: TEXT - Comma-separated categories
```

#### `ad_recommendations`

Product recommendations for ad moments

```sql
- id: UUID (PK)
- moment_id: UUID (FK → ad_moments.id)
- product_name: TEXT
- brand_name: TEXT
- description: TEXT
- product_url: TEXT
- image_url: TEXT
- reasoning: TEXT - Why this product fits
- relevance_score: INTEGER - Match quality (0-100)
- selected: BOOLEAN - User selection status
- estimated_cpm: INTEGER - Product CPM
- estimated_ctr: INTEGER - CTR × 10 (2.5% = 25)
- projected_revenue: INTEGER - Revenue in cents
```

#### `brand_mentions`

AI-detected brand references and opportunities

```sql
- id: UUID (PK)
- video_id: TEXT (FK → videos.id)
- timestamp: TEXT - MM:SS format
- time_in_seconds: INTEGER
- description: TEXT - What was detected
- type: TEXT - brand_mention | ad_opportunity
- engagement_score: INTEGER (0-100)
- attention_score: INTEGER (0-100)
- placement_tier: TEXT
- estimated_cpm_min: INTEGER (cents)
- estimated_cpm_max: INTEGER (cents)
- category_tags: TEXT
```

#### `brand_mention_recommendations`

Product recommendations for brand mentions

```sql
- id: UUID (PK)
- brand_mention_id: UUID (FK → brand_mentions.id)
- [Same fields as ad_recommendations]
```

### Relationships

```
videos (1) ──< (N) ad_moments
videos (1) ──< (N) brand_mentions
ad_moments (1) ──< (N) ad_recommendations
brand_mentions (1) ──< (N) brand_mention_recommendations
```

---

## API Endpoints

### Video Management APIs

#### Upload Video

```http
POST /api/upload
Content-Type: multipart/form-data

Body: FormData with 'file' field

Response:
{
  "success": true,
  "videoId": "65f4e2...",
  "indexId": "65f4e1...",
  "status": "processing",
  "estimatedTime": "1-5 minutes"
}
```

#### List Videos

```http
GET /api/indexes/[indexId]/videos

Response:
{
  "videos": [
    {
      "_id": "65f4e2...",
      "metadata": {
        "filename": "video.mp4",
        "duration": 180
      },
      "hls": {
        "video_url": "https://..."
      }
    }
  ]
}
```

#### Get Video Status

```http
GET /api/videos/[videoId]/status

Response:
{
  "status": "completed",
  "videoId": "65f4e2...",
  "duration": 180,
  "hasAnalysis": true
}
```

### Analysis APIs

#### Analyze Video

```http
POST /api/analyze
Content-Type: application/json

Body:
{
  "videoId": "65f4e2...",
  "indexId": "65f4e1..."
}

Response:
{
  "success": true,
  "moments": [
    {
      "id": "uuid-...",
      "startTime": 10,
      "endTime": 15,
      "context": "Product demonstration...",
      "emotionalTone": "excited",
      "confidence": 85,
      "placementTier": "premium",
      "engagementScore": 92,
      "estimatedCpmMin": 2000,
      "estimatedCpmMax": 3500,
      "recommendations": [...]
    }
  ],
  "brandMentions": [...]
}
```

#### Get Moments

```http
GET /api/moments/[videoId]

Response:
{
  "moments": [...],
  "brandMentions": [...]
}
```

---

## AI/ML Integration

### Twelve Labs Video Understanding

**Engine**: Marengo 2.6

- **Modalities**: Visual, audio, conversation, text-in-video
- **Capabilities**:
  - Scene detection
  - Object recognition
  - Speech transcription
  - Text extraction (OCR)
  - Emotion detection
  - Topic classification

**API Operations**:

1. **Index Creation**: Create video index for a project
2. **Video Upload**: Upload with `enable_video_stream=true` for HLS
3. **Status Polling**: Monitor indexing progress
4. **Generate API**: Extract topics, gists, chapters
5. **Search API**: Semantic search across video content

**Search Queries Used**:

```javascript
[
  "natural breaks or transitions between topics",
  "exciting or emotional moments perfect for ads",
  "product demonstrations or reviews",
  "calls to action or conclusions",
  // ... 15+ semantic queries
];
```

### OpenAI GPT-4 Integration

**Model**: gpt-4-turbo
**Features**:

- Structured JSON outputs
- Context-aware reasoning
- Product-context matching

**Prompt Engineering**:

```
Context: [Video moment description]
Emotional Tone: [excited/happy/neutral/etc]
Category: [product/general/sports/etc]

Task: Find 5 relevant products that fit this video moment.
Consider: Context alignment, emotional resonance, category fit
```

**Output Structure**:

```typescript
{
  productName: string;
  brandName: string;
  description: string;
  productUrl: string;
  reasoning: string;
  relevanceScore: number; // 0-100
  estimatedCPM: number;
  estimatedCTR: number;
  projectedRevenue: number;
}
```

### Spot Value Calculator

**Algorithm**: Multi-factor quality scoring

**Inputs**:

- Video context (text)
- Emotional tone
- AI confidence score

**Calculations**:

1. **Category Detection**

   ```typescript
   detectCategories(context) → ["finance", "tech", ...]
   ```

2. **Engagement Score** (0-100)

   ```
   engagement = (emotionIntensity × 0.6) + (confidence × 0.4)
   ```

3. **Attention Score** (0-100)

   ```
   attention = (confidence × 0.7) + (emotionIntensity × 0.3)
   ```

4. **Placement Tier**

   ```
   avgScore = (engagement + attention) / 2

   if avgScore ≥ 80: tier = "premium"
   else if avgScore ≥ 60: tier = "standard"
   else: tier = "basic"
   ```

5. **CPM Range**

   ```
   baseCPM = categoryRates[category]  // e.g., Finance: $20-40

   multiplier = {
     premium: 1.3 (+30%)
     standard: 1.0 (base)
     basic: 0.7 (-30%)
   }

   finalCPM = baseCPM × multiplier
   ```

**Industry CPM Rates**:

```typescript
{
  finance: { min: 20, max: 40 },
  insurance: { min: 18, max: 35 },
  technology: { min: 10, max: 22 },
  gaming: { min: 8, max: 15 },
  sports: { min: 10, max: 18 },
  // ... 20+ categories
}
```

---

## Security & Performance

### Security Measures

**API Keys**:

- Environment variables for all secrets
- No client-side exposure of API keys
- Server-side API calls only

**Data Validation**:

- File size limits (2GB max)
- Video format validation
- Input sanitization on all forms

**Database Security**:

- Parameterized queries via Drizzle ORM (SQL injection protection)
- Connection pooling with Neon serverless
- HTTPS-only connections

### Performance Optimizations

**Frontend**:

- Next.js App Router with React Server Components
- Automatic code splitting
- Image optimization
- HLS adaptive streaming for videos

**Backend**:

- Edge runtime support
- Serverless function optimization
- Database connection pooling
- Efficient SQL queries with indexes

**Caching Strategy**:

- Video analysis results cached in database
- Re-use existing analysis when available
- HLS video segments cached by CDN

**Rate Limiting**:

- 500ms delay between OpenAI API calls
- Polling intervals: 5 seconds for video status
- Batch processing for multiple recommendations

### Scalability

**Database**: Neon serverless PostgreSQL

- Auto-scaling connections
- Pay-per-usage pricing
- Global edge network

**Video Processing**: Twelve Labs Cloud

- Distributed processing infrastructure
- Parallel video indexing
- CDN delivery for HLS streams

**Deployment**: Vercel (recommended)

- Edge network deployment
- Automatic scaling
- Zero-config CI/CD

---

## Development Tools

### Scripts

```bash
npm run dev           # Start development server (Turbopack)
npm run build         # Production build
npm run start         # Start production server
npm run lint          # Run ESLint
npm run db:generate   # Generate database migrations
npm run db:push       # Push schema to database
npm run db:studio     # Open Drizzle Studio
npm run db:reset      # Reset database
npm run type-check    # TypeScript type checking
```

### Database Management

- **Drizzle Studio**: Visual database browser
- **Drizzle Kit**: Schema migrations
- **Reset Script**: Clear analysis data for re-testing

### Monitoring

- Console logging for all major operations
- Error tracking with detailed stack traces
- Video processing status polling
- API response validation

---

## Technical Constraints

### Video Requirements

- **Max Size**: 2GB per video
- **Resolution**: 360x360 to 3840x2160 (4K)
- **Formats**: MP4, MOV, AVI, WebM
- **Duration**: No hard limit, but longer videos = longer indexing time

### API Limits

- **Twelve Labs**: Based on subscription plan
- **OpenAI**: GPT-4 rate limits apply
- **Database**: Neon free tier limits apply

### Processing Times

- **Video Indexing**: 1-5 minutes (depends on length)
- **Analysis**: 30 seconds - 2 minutes (depends on complexity)
- **Product Recommendations**: ~1 second per moment

---

## Future Architecture Considerations

### Potential Enhancements

1. **Real-time Analysis**: WebSocket updates during processing
2. **Batch Upload**: Multiple video analysis queue
3. **Custom Product Catalog**: User-managed product database
4. **A/B Testing**: Multiple recommendation strategies
5. **Analytics Dashboard**: Aggregated metrics across all videos
6. **API Authentication**: JWT-based user authentication
7. **CDN Integration**: Self-hosted video delivery
8. **Machine Learning Pipeline**: Custom ML models for spot detection

### Scalability Improvements

1. **Redis Caching**: Cache frequently accessed data
2. **Background Jobs**: Queue-based video processing
3. **Microservices**: Separate analysis service
4. **Load Balancing**: Multi-region deployment
5. **Database Sharding**: Scale database horizontally

---

## Conclusion

MomentMatcher's architecture is designed for rapid development, easy deployment, and future scalability. The serverless-first approach minimizes operational complexity while leveraging best-in-class AI services for video understanding and product recommendations.

**Key Architectural Strengths**:

- ✅ Serverless & scalable from day one
- ✅ Modular AI integration (easy to swap providers)
- ✅ Type-safe end-to-end (TypeScript + Drizzle)
- ✅ Modern React with Server Components
- ✅ Cost-effective for startups (pay-per-use)
- ✅ Production-ready deployment (Vercel)

For deployment instructions, see [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md).

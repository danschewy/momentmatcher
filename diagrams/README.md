# MomentMatcher Architecture Diagrams

This directory contains generated diagram images from the Mermaid code in `ARCHITECTURE_DIAGRAM.md`.

## 📊 Available Diagrams

### 1. System Architecture Overview
**Files**: `01-system-architecture.png` / `01-system-architecture.svg`

High-level overview of the entire MomentMatcher system showing:
- User interface layer
- Next.js application components
- Business logic services
- External AI services (Twelve Labs, OpenAI)
- Data persistence layer
- Storage and CDN infrastructure

### 2. Video Upload and Analysis Flow
**Files**: `02-video-analysis-flow.png` / `02-video-analysis-flow.svg`

Sequence diagram showing the complete flow from video upload through analysis:
- User uploads video to frontend
- API forwards to Twelve Labs for indexing
- Polling for video processing status
- Parallel analysis: brand mentions + ad moments
- Product recommendations via OpenAI
- Spot quality calculation
- Database persistence

### 3. Database Schema Relationships
**Files**: `03-database-schema.png` / `03-database-schema.svg`

Entity-relationship diagram (ERD) showing:
- Videos table (primary entity)
- Ad moments with quality metrics
- Brand mentions and opportunities
- Product recommendations for both
- All relationships and foreign keys

### 4. Ad Spot Quality Calculation Flow
**Files**: `04-spot-quality-calculation.png` / `04-spot-quality-calculation.svg`

Detailed flowchart of the spot quality algorithm:
- Feature extraction from video moments
- Category detection
- Emotion intensity calculation
- Engagement and attention scoring
- Tier classification (Premium/Standard/Basic)
- CPM calculation with multipliers
- Final quality metrics output

### 5. Component Interaction Diagram
**Files**: `05-component-interaction.png` / `05-component-interaction.svg`

Shows how frontend and backend components interact:
- Frontend components (VideoTimeline, MomentCard, etc.)
- Page components (Landing, Analyze, Dashboard)
- API routes (Upload, Analyze, Moments, Videos)
- Backend services (Twelve Labs, OpenAI, Database)

### 6. Deployment Architecture (Vercel)
**Files**: `06-deployment-architecture.png` / `06-deployment-architecture.svg`

Production deployment topology:
- Vercel Edge Network with global CDN
- Edge and serverless functions
- Next.js application layers
- External services (Neon, Twelve Labs, OpenAI)
- HLS video streaming delivery

### 7. Timeline Visualization Data Flow
**Files**: `07-timeline-visualization.png` / `07-timeline-visualization.svg`

How the interactive timeline is rendered:
- API response parsing
- Tier classification
- Visual styling (height, color, effects)
- Position calculation
- Interactive elements (tooltips, clicks)

### 8. API Rate Limiting Strategy
**Files**: `08-rate-limiting.png` / `08-rate-limiting.svg`

Flow showing how API rate limiting prevents overuse:
- Cached analysis check
- Sequential processing with delays
- 500ms delays between API calls
- Brand mention and ad moment processing loops

### 9. Spot Quality Scoring Algorithm
**Files**: `09-spot-quality-scoring.png` / `09-spot-quality-scoring.svg`

Detailed algorithm for calculating spot value:
- Input processing (context, emotion, confidence)
- Category matching with CPM ranges
- Emotion intensity calculation
- Engagement and attention formulas
- Tier multiplier application
- Final CPM calculation

---

## 🎨 File Formats

Each diagram is available in two formats:

- **PNG** - Raster image (1920x1080 resolution, transparent background)
  - Best for: Presentations, documents, embedding in non-web contexts
  - File size: 57KB - 204KB

- **SVG** - Vector image (scalable, transparent background)
  - Best for: Web use, printing, infinite scaling without quality loss
  - File size: 24KB - 164KB

---

## 🔄 Regenerating Diagrams

To regenerate all diagrams after updating the source Mermaid code:

```bash
# Run the generation script
./scripts/generate-diagrams.sh
```

**Requirements**:
- Node.js and npm installed
- Mermaid CLI installed: `npm install -g @mermaid-js/mermaid-cli`

---

## 📝 Source Files

All diagram source files are located in `diagrams/source/`:
- `01-system-architecture.mmd`
- `02-video-analysis-flow.mmd`
- `03-database-schema.mmd`
- `04-spot-quality-calculation.mmd`
- `05-component-interaction.mmd`
- `06-deployment-architecture.mmd`
- `07-timeline-visualization.mmd`
- `08-rate-limiting.mmd`
- `09-spot-quality-scoring.mmd`

These `.mmd` files contain the raw Mermaid syntax and can be:
- Edited directly to modify diagrams
- Previewed at [mermaid.live](https://mermaid.live)
- Used with any Mermaid-compatible tool

---

## 🖼️ Using the Diagrams

### In Documentation
```markdown
![System Architecture](./diagrams/01-system-architecture.png)
```

### In Presentations
- Use PNG files for PowerPoint, Keynote, Google Slides
- Transparent background works well on any slide background

### On Websites
```html
<img src="diagrams/01-system-architecture.svg" alt="System Architecture" />
```

### In GitHub/GitLab
Both PNG and SVG work great in markdown on GitHub:
```markdown
![Diagram](./diagrams/01-system-architecture.svg)
```

---

## 📐 Diagram Dimensions

All PNG diagrams are generated at:
- **Width**: 1920px
- **Height**: 1080px (or as needed to fit content)
- **Background**: Transparent
- **Format**: PNG with transparency

SVG diagrams are:
- **Scalable**: Infinite resolution
- **Background**: Transparent
- **Format**: SVG vector graphics

---

## 🎨 Color Legend

The diagrams use consistent colors for different components:

- 🔵 **Blue (#4A90E2)** - User-facing components, standard tier
- 🟢 **Green (#50C878)** - External services, AI, success states
- 🔴 **Red (#FF6B6B)** - Database, data persistence
- 🟡 **Gold (#FFD700)** - Premium tier, CDN, high-value components
- ⚫ **Gray (#808080)** - Basic tier, low-priority components

---

## 📚 Related Documentation

- **[ARCHITECTURE_DIAGRAM.md](../ARCHITECTURE_DIAGRAM.md)** - Original Mermaid code with GitHub rendering
- **[TECHNICAL_ARCHITECTURE.md](../TECHNICAL_ARCHITECTURE.md)** - Detailed technical documentation
- **[DOCUMENTATION_INDEX.md](../DOCUMENTATION_INDEX.md)** - Complete documentation index

---

**Generated on**: 2025-01-06  
**Total diagrams**: 9  
**Total file size**: ~1.2MB (all formats)


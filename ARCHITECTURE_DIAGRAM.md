# MomentMatcher - Architecture Diagrams

This document contains Mermaid diagrams visualizing the MomentMatcher system architecture.

## System Architecture Overview

```mermaid
graph TB
    subgraph "User Interface"
        A[Web Browser]
        A1[Landing Page]
        A2[Analyze Page]
        A3[Dashboard Page]
    end

    subgraph "Next.js Application Layer"
        B[Next.js App Router]
        B1[Server Components]
        B2[Client Components]
        B3[API Routes]
    end

    subgraph "Business Logic Layer"
        C1[Video Manager]
        C2[Analysis Engine]
        C3[Spot Value Calculator]
        C4[Recommendation Engine]
    end

    subgraph "External AI Services"
        D1[Twelve Labs API]
        D1a[Video Indexing]
        D1b[Semantic Search]
        D1c[Content Generation]
        D2[OpenAI GPT-4]
        D2a[Product Matching]
        D2b[Revenue Projection]
    end

    subgraph "Data Layer"
        E1[PostgreSQL Database]
        E2[Drizzle ORM]
        E3[Neon Serverless]
    end

    subgraph "Storage & CDN"
        F1[Twelve Labs Storage]
        F2[HLS Video CDN]
    end

    A --> A1 & A2 & A3
    A1 & A2 & A3 --> B
    B --> B1 & B2 & B3
    B3 --> C1 & C2 & C3 & C4

    C1 --> D1a
    C2 --> D1b & D1c
    C4 --> D2a & D2b
    C3 --> C3

    C1 & C2 & C4 --> E2
    E2 --> E1
    E1 -.-> E3

    D1a & D1b & D1c --> F1
    F1 --> F2
    F2 -.-> A

    style A fill:#4A90E2
    style D1 fill:#50C878
    style D2 fill:#50C878
    style E1 fill:#FF6B6B
    style F1 fill:#FFD700
```

## Video Upload and Analysis Flow

```mermaid
sequenceDiagram
    participant U as User
    participant F as Frontend
    participant API as Next.js API
    participant TL as Twelve Labs
    participant DB as PostgreSQL
    participant OAI as OpenAI
    participant SVC as Spot Calculator

    %% Upload Phase
    U->>F: Upload video file
    F->>API: POST /api/upload
    API->>TL: Upload video to index
    TL->>TL: Index video (1-5 min)
    TL-->>API: Return video ID
    API->>DB: Save video metadata
    DB-->>API: Confirm save
    API-->>F: Return video ID & status
    F->>F: Poll status every 5s

    %% Analysis Phase
    F->>API: POST /api/analyze

    par Brand Mention Detection
        API->>TL: Generate gist/topics
        TL-->>API: Return brand mentions
        loop For each mention
            API->>OAI: Get product recommendations
            OAI-->>API: Return products
            API->>SVC: Calculate spot quality
            SVC-->>API: Return tier & CPM
            API->>DB: Save mention + recommendations
        end
    and Ad Moment Search
        API->>TL: Semantic search queries
        TL-->>API: Return matching moments
        loop For each moment
            API->>OAI: Get product recommendations
            OAI-->>API: Return products
            API->>SVC: Calculate spot quality
            SVC-->>API: Return tier & CPM
            API->>DB: Save moment + recommendations
        end
    end

    DB-->>API: Confirm all saves
    API-->>F: Return complete analysis
    F->>U: Display results + timeline
```

## Database Schema Relationships

```mermaid
erDiagram
    VIDEOS ||--o{ AD_MOMENTS : contains
    VIDEOS ||--o{ BRAND_MENTIONS : contains
    AD_MOMENTS ||--o{ AD_RECOMMENDATIONS : has
    BRAND_MENTIONS ||--o{ BRAND_MENTION_RECOMMENDATIONS : has

    VIDEOS {
        text id PK
        text filename
        timestamp uploaded_at
        text status
        jsonb twelve_labs_data
        text video_url
        integer duration
    }

    AD_MOMENTS {
        uuid id PK
        text video_id FK
        integer start_time
        integer end_time
        text context
        text emotional_tone
        text category
        integer confidence
        text clip_url
        text thumbnail_url
        integer engagement_score
        integer attention_score
        text placement_tier
        integer estimated_cpm_min
        integer estimated_cpm_max
        text category_tags
    }

    AD_RECOMMENDATIONS {
        uuid id PK
        uuid moment_id FK
        text product_name
        text brand_name
        text description
        text product_url
        text image_url
        text reasoning
        integer relevance_score
        boolean selected
        integer estimated_cpm
        integer estimated_ctr
        integer projected_revenue
    }

    BRAND_MENTIONS {
        uuid id PK
        text video_id FK
        text timestamp
        integer time_in_seconds
        text description
        text type
        integer engagement_score
        integer attention_score
        text placement_tier
        integer estimated_cpm_min
        integer estimated_cpm_max
        text category_tags
    }

    BRAND_MENTION_RECOMMENDATIONS {
        uuid id PK
        uuid brand_mention_id FK
        text product_name
        text brand_name
        text description
        text product_url
        text image_url
        text reasoning
        integer relevance_score
        integer estimated_cpm
        integer estimated_ctr
        integer projected_revenue
    }
```

## Ad Spot Quality Calculation Flow

```mermaid
flowchart TD
    A[Video Moment] --> B[Extract Features]
    B --> C{Analyze Context}
    C -->|Text Content| D[Detect Categories]
    C -->|Emotional Tone| E[Calculate Emotion Intensity]
    C -->|AI Confidence| F[Get Confidence Score]

    D --> G[Category Tags]
    E --> H[Emotion Score 0-100]
    F --> I[Confidence 0-100]

    H --> J[Calculate Engagement]
    I --> J
    J --> K[Engagement Score]

    I --> L[Calculate Attention]
    H --> L
    L --> M[Attention Score]

    K --> N{Average Score}
    M --> N

    N -->|≥80| O[Premium Tier]
    N -->|60-79| P[Standard Tier]
    N -->|<60| Q[Basic Tier]

    O --> R[+30% CPM Multiplier]
    P --> S[Base CPM]
    Q --> T[-30% CPM Multiplier]

    G --> U[Get Category CPM]
    U --> V[Base CPM Range]

    V --> R
    V --> S
    V --> T

    R --> W[Final CPM Min/Max]
    S --> W
    T --> W

    O --> X[Placement Tier]
    P --> X
    Q --> X

    W --> Y[Complete Spot Quality]
    X --> Y
    K --> Y
    M --> Y
    G --> Y

    style O fill:#FFD700
    style P fill:#4A90E2
    style Q fill:#808080
    style Y fill:#50C878
```

## Component Interaction Diagram

```mermaid
graph LR
    subgraph "Frontend Components"
        VC[VideoTimeline]
        MC[MomentCard]
        HP[HLSVideoPlayer]
        VL[VideoLibrary]
        IT[InfoTooltip]
    end

    subgraph "Page Components"
        AP[Analyze Page]
        DP[Dashboard Page]
        LP[Landing Page]
    end

    subgraph "API Routes"
        UPL[Upload Route]
        ANL[Analyze Route]
        MOM[Moments Route]
        VID[Videos Route]
    end

    subgraph "Services"
        TLS[Twelve Labs Service]
        OAS[OpenAI Service]
        SCS[Spot Calculator]
        DBS[Database Service]
    end

    LP --> VL
    AP --> VL & HP & VC & MC & IT
    DP --> IT

    AP --> UPL & ANL
    DP --> MOM
    VL --> VID

    UPL --> TLS & DBS
    ANL --> TLS & OAS & SCS & DBS
    MOM --> DBS
    VID --> TLS

    style AP fill:#4A90E2
    style DP fill:#4A90E2
    style TLS fill:#50C878
    style OAS fill:#50C878
    style DBS fill:#FF6B6B
```

## Deployment Architecture (Vercel)

```mermaid
graph TB
    subgraph "Vercel Edge Network"
        A[Global CDN]
        B[Edge Functions]
        C[Serverless Functions]
    end

    subgraph "Application"
        D[Next.js App]
        D1[Static Pages]
        D2[Server Components]
        D3[API Routes]
    end

    subgraph "External Services"
        E1[Neon PostgreSQL]
        E2[Twelve Labs API]
        E3[OpenAI API]
    end

    subgraph "Client"
        F[User Browser]
    end

    F -->|HTTPS| A
    A --> B
    B --> D1
    A --> C
    C --> D2 & D3

    D3 --> E1 & E2 & E3

    E2 -->|HLS Stream| A
    A -->|Video| F

    style A fill:#FFD700
    style E1 fill:#FF6B6B
    style E2 fill:#50C878
    style E3 fill:#50C878
```

## Data Flow for Timeline Visualization

```mermaid
flowchart LR
    A[API Response] --> B[Parse Moments]
    B --> C[Extract Placement Tiers]

    C --> D{Tier Classification}

    D -->|Premium| E[Height: 96px<br/>Color: Gold<br/>Effects: Pulse + Shimmer]
    D -->|Standard| F[Height: 64px<br/>Color: Blue<br/>Effects: Glow]
    D -->|Basic| G[Height: 44px<br/>Color: Gray<br/>Effects: None]

    E --> H[Calculate Timeline Position]
    F --> H
    G --> H

    H --> I[startTime / maxTime * 100%]
    H --> J[width = duration / maxTime * 100%]

    I --> K[Render Timeline Bar]
    J --> K

    K --> L[Add Hover Tooltip]
    K --> M[Add Click Handler]

    L --> N[Display in Timeline]
    M --> N

    style E fill:#FFD700
    style F fill:#4A90E2
    style G fill:#808080
    style N fill:#50C878
```

## API Rate Limiting Strategy

```mermaid
flowchart TD
    A[Start Analysis] --> B{Has Cached Analysis?}
    B -->|Yes| C[Return Cached Data]
    B -->|No| D[Begin Fresh Analysis]

    D --> E[Process Brand Mentions]
    E --> F{More Mentions?}
    F -->|Yes| G[Get Recommendations]
    G --> H[500ms Delay]
    H --> F
    F -->|No| I[Process Ad Moments]

    I --> J{More Moments?}
    J -->|Yes| K[Get Recommendations]
    K --> L[500ms Delay]
    L --> J
    J -->|No| M[Save to Database]

    M --> N[Return Results]
    C --> N

    style C fill:#50C878
    style H fill:#FFD700
    style L fill:#FFD700
```

## Spot Quality Scoring Algorithm

```mermaid
graph TD
    A[Input: Context + Emotion + Confidence] --> B[Detect Categories]

    B --> C{Category Match?}
    C -->|Finance| D1[CPM: $20-40]
    C -->|Tech| D2[CPM: $10-22]
    C -->|Sports| D3[CPM: $10-18]
    C -->|Other| D4[CPM: $7-14]

    A --> E{Emotional Tone}
    E -->|Excited/Passionate| F1[Intensity: 90]
    E -->|Happy/Positive| F2[Intensity: 70]
    E -->|Neutral/Calm| F3[Intensity: 50]

    A --> G[Confidence Score]

    F1 & F2 & F3 --> H[Emotion Intensity]
    G --> I[Confidence Value]

    H --> J[Engagement = Emotion×0.6 + Confidence×0.4]
    I --> J

    I --> K[Attention = Confidence×0.7 + Emotion×0.3]
    H --> K

    J --> L[Engagement Score]
    K --> M[Attention Score]

    L --> N{Avg Score}
    M --> N

    N -->|≥80| O[Premium: 1.3×]
    N -->|60-79| P[Standard: 1.0×]
    N -->|<60| Q[Basic: 0.7×]

    D1 & D2 & D3 & D4 --> R[Base CPM]
    O & P & Q --> S[Multiplier]

    R --> T[Final CPM = Base × Multiplier]
    S --> T

    style O fill:#FFD700
    style P fill:#4A90E2
    style Q fill:#808080
```

---

## How to Use These Diagrams

### Viewing in GitHub/GitLab

These Mermaid diagrams will render automatically in GitHub and GitLab markdown viewers.

### Viewing Locally

1. Use a Mermaid-compatible markdown viewer:
   - VS Code: Install "Markdown Preview Mermaid Support" extension
   - Browser: Use Mermaid Live Editor (https://mermaid.live)
   - Documentation tools: MkDocs, Docusaurus, etc.

### Exporting to Images

Visit https://mermaid.live and paste any diagram to export as PNG/SVG.

### Editing

Use the Mermaid syntax to modify diagrams. Documentation: https://mermaid.js.org/

---

## Diagram Legend

### Colors

- 🔵 **Blue** - User-facing components, standard tier
- 🟢 **Green** - External services, AI components, success states
- 🔴 **Red** - Database, data persistence
- 🟡 **Gold** - Premium tier, CDN, high-value components
- ⚫ **Gray** - Basic tier, low-priority components

### Symbols

- **Rectangle** - Process, component, service
- **Diamond** - Decision point, conditional logic
- **Cylinder** - Database, data storage
- **Cloud** - External service, API
- **Arrow** - Data flow, dependency
- **Dashed Line** - Indirect relationship, CDN delivery

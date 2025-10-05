# Information Tooltip Locations Guide

## 🎯 Analyze Page (`/analyze`)

### Brand Mentions Tab

```
┌─────────────────────────────────────────────────────────────┐
│ Brand Mentions (5)                                          │
├─────────────────────────────────────────────────────────────┤
│ ✨ AI-detected moments where brands, products, or high-    │
│ energy opportunities were identified. Premium spots (gold)  │
│ have 80%+ engagement. [ℹ️]  ← Tab Description Tooltip      │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ ┌─ Brand Mention ─────────────────────────────────────┐   │
│ │ 🏷️ Brand Mention | ⭐ PREMIUM [ℹ️] | 1:23          │   │
│ │                     ↑ Placement Tier Tooltip         │   │
│ │ Engagement: 85% [ℹ️]  CPM: $15-$25 [ℹ️]             │   │
│ │              ↑              ↑                        │   │
│ │      Engagement         CPM Tooltip                  │   │
│ │      Score Tooltip                                   │   │
│ │                                                      │   │
│ │ 💡 Recommended Products (3) [ℹ️]                     │   │
│ │                             ↑                        │   │
│ │                     Product Recs Tooltip             │   │
│ │                                                      │   │
│ │   Product Name                    95% [ℹ️]          │   │
│ │   Brand Name                       ↑                │   │
│ │                           Relevance Score Tooltip   │   │
│ └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘

Total Tooltips on Brand Mentions Tab: 6 per mention
```

### Ad Moments Tab

```
┌─────────────────────────────────────────────────────────────┐
│ 📺 Ad Moments (8)                                           │
├─────────────────────────────────────────────────────────────┤
│ 📺 Contextual ad placement opportunities based on video     │
│ analysis. Each moment includes emotional tone, category,    │
│ and confidence score. Premium spots (gold) have 80%+        │
│ engagement. [ℹ️]  ← Ad Moments Tab Description Tooltip     │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ [Timeline visualization with moment markers]                │
│                                                             │
│ [Grid of Moment Cards - see MomentCard component]          │
│                                                             │
└─────────────────────────────────────────────────────────────┘

Total Tooltips on Ad Moments Tab: 1 (tab description)
```

---

## 📊 Dashboard Page (`/dashboard/[videoId]`)

### Key Metrics Section

```
┌─────────────────────────────────────────────────────────────┐
│ Publisher Ad Inventory Dashboard                            │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ ┏━━━━━━━━━━━━━━┓  ┏━━━━━━━━━━━━━━┓                       │
│ ┃ Total Ad     ┃  ┃ Avg          ┃                       │
│ ┃ Spots [ℹ️]    ┃  ┃ Engagement[ℹ️]┃                       │
│ ┃      25      ┃  ┃     78%      ┃                       │
│ ┃ 8 Premium    ┃  ┃ Attention:75%┃                       │
│ ┗━━━━━━━━━━━━━━┛  ┗━━━━━━━━━━━━━━┛                       │
│                                                             │
│ ┏━━━━━━━━━━━━━━┓  ┏━━━━━━━━━━━━━━┓                       │
│ ┃ Avg CPM      ┃  ┃ Total        ┃                       │
│ ┃ Range [ℹ️]    ┃  ┃ Inventory [ℹ️]┃                       │
│ ┃ $12-$22      ┃  ┃ $300-$550    ┃                       │
│ ┃ Per spot     ┃  ┃ Estimated    ┃                       │
│ ┗━━━━━━━━━━━━━━┛  ┗━━━━━━━━━━━━━━┛                       │
│                                                             │
└─────────────────────────────────────────────────────────────┘

Total Tooltips in Key Metrics: 4
```

### Ad Placement Quality Analysis

```
┌─────────────────────────────────────────────────────────────┐
│ 🎯 Ad Placement Quality Analysis [ℹ️]                       │
│    Spot value based on engagement, attention, and category  │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ ┌─ PREMIUM ─┐  ┌─ STANDARD ─┐  ┌─ BASIC ─┐  ┌─ AVG ─┐   │
│ │ ⭐         │  │ ⚡          │  │ ○        │  │ VALUE  │   │
│ │ 8 spots   │  │ 12 spots   │  │ 5 spots  │  │ $17    │   │
│ │ >80%      │  │ 60-80%     │  │ <60%     │  │ CPM    │   │
│ │ +30% CPM  │  │ Base CPM   │  │ -30% CPM │  │        │   │
│ └───────────┘  └────────────┘  └──────────┘  └────────┘   │
│                                                             │
└─────────────────────────────────────────────────────────────┘

Total Tooltips: 1 (section header)
```

### Recommended Products

```
┌─────────────────────────────────────────────────────────────┐
│ Recommended Products & Brands [ℹ️]                          │
│ 15 unique products optimized for your content               │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ ┌─ Product Card ──────────────────────────────────────┐   │
│ │ Product Name                           95% Match    │   │
│ │ Brand Name                                          │   │
│ │                                                      │   │
│ │ Description text here...                            │   │
│ │ 💡 Reasoning text here...                           │   │
│ │                                                      │   │
│ │ CPM: $15.50 [ℹ️]  CTR: 1.2% [ℹ️]  Revenue: $2.50[ℹ️]│   │
│ │        ↑              ↑                  ↑          │   │
│ │   Product CPM    CTR Tooltip    Projected Revenue  │   │
│ │   Tooltip        Tooltip        Tooltip            │   │
│ └──────────────────────────────────────────────────────┘   │
│                                                             │
└─────────────────────────────────────────────────────────────┘

Total Tooltips per Product: 4 (section header + 3 metrics)
```

---

## 📱 Tooltip Interaction Guide

### Desktop
- **Hover:** Tooltip appears immediately
- **Click:** Toggles tooltip on/off
- **Move Away:** Tooltip disappears

### Mobile/Touch
- **Tap:** Toggles tooltip on/off
- **Tap Outside:** Closes tooltip

---

## 🎨 Tooltip Visual Design

```
┌────────────────────────────────────┐
│ ℹ️ Metric Name                     │
│                                    │
│ What it means:                     │
│ Clear description in white text    │
│                                    │
│ How it's calculated:               │
│ Technical details in purple text   │
│                                    │
│ Why it matters:                    │
│ Business value in green text       │
└────────────────────────────────────┘
                ▼  ← Arrow points to source icon
```

---

## 📊 Tooltip Count Summary

| Page | Section | Tooltip Count |
|------|---------|---------------|
| Analyze | Brand Mentions Tab Header | 1 |
| Analyze | Per Brand Mention (Engagement, CPM, Placement, Products, Relevance) | 5 per mention |
| Analyze | Ad Moments Tab Header | 1 |
| Dashboard | Key Metrics Cards | 4 |
| Dashboard | Quality Analysis Section | 1 |
| Dashboard | Product Recommendations Section | 1 |
| Dashboard | Per Product (CPM, CTR, Revenue) | 3 per product |

**Total Unique Tooltip Types:** 16

---

## 🔧 Technical Notes

### Component Usage Pattern

```tsx
import InfoTooltip from "@/components/InfoTooltip";

<InfoTooltip
  title="Metric Name"
  description="What it means..."
  calculation="How it's calculated..."
  justification="Why it matters..."
  size="sm"  // or "md"
/>
```

### Props
- `title` (required): Short title for the tooltip
- `description` (required): Main explanation
- `calculation` (optional): Technical calculation details
- `justification` (optional): Business value explanation
- `size` (optional): "sm" (default) or "md"

### Styling
- Positioned above the info icon
- 320px width (w-80)
- Z-index: 50
- Indigo border and accents
- Dark background (bg-gray-900)

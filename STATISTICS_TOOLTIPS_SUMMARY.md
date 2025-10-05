# Statistics Explanation Tooltips - Implementation Summary

## Overview
Added comprehensive information tooltips (ℹ️) throughout the application to explain all statistics, how they're calculated, and why they matter. Users can hover over or click these info icons to get detailed explanations.

## New Component: InfoTooltip

**Location:** `src/components/InfoTooltip.tsx`

A reusable tooltip component that displays:
- **What it means:** Clear description of the metric
- **How it's calculated:** Technical explanation of the calculation method
- **Why it matters:** Business justification and practical implications

Features:
- Hover and click interactions
- Responsive positioning
- Accessible with ARIA labels
- Two sizes: small (sm) and medium (md)

---

## Analyze Page Tooltips

### Brand Mentions & Ad Opportunities Tab

#### 1. **Brand Mentions & Ad Opportunities** (Tab Description)
- **What:** AI-detected moments showing brand mentions or high-potential ad placements
- **How:** Uses Twelve Labs' multimodal AI analyzing visual content, audio transcripts, on-screen text, and emotional context
- **Why:** Shows where products are organically featured and identifies valuable moments for sponsored content

#### 2. **Engagement Score**
- **What:** Measures how engaging and emotionally compelling a moment is (0-100%)
- **How:** Calculated as: (Emotional Intensity × 60%) + (AI Confidence × 40%)
  - Excited = 90%, Happy = 70%, Neutral = 50%
- **Why:** High engagement moments are more valuable because viewers actively pay attention and respond better to ads

#### 3. **CPM (Cost Per Mille)**
- **What:** Estimated advertising rate per 1,000 impressions for this spot
- **How:** Based on industry-standard CPM rates by category with quality multipliers:
  - Finance: $20-40, Tech: $10-22, Sports: $10-18, etc.
  - Premium spots (+80% engagement): +30%
  - Standard spots (60-80%): base rate
  - Basic spots (<60%): -30%
- **Why:** Reflects market value of ad placement; higher quality content commands premium rates

#### 4. **Placement Tier** (Premium/Standard/Basic)
- **What:** Quality rating determining advertising value
- **How:** Based on average of Engagement and Attention scores:
  - Premium: 80%+
  - Standard: 60-80%
  - Basic: <60%
- **Why:** Advertisers pay premium rates for high-quality placements; helps identify most valuable content moments

#### 5. **Product Recommendations**
- **What:** AI-suggested products contextually relevant to the video moment
- **How:** GPT-4 with Twelve Labs' analysis matches products based on context, emotional tone, and category alignment
- **Why:** Contextually relevant placements perform significantly better; helps find suitable sponsorship opportunities

#### 6. **Relevance Score**
- **What:** How well a product matches the video content (0-100%)
- **How:** AI-generated score based on semantic similarity, emotional tone alignment, and audience demographic fit
- **Why:** Relevant placements lead to higher click-through rates; 90%+ indicates excellent match viewers find natural

### Ad Moments Tab

#### 7. **Ad Moments**
- **What:** Time segments ideal for advertising based on content breaks and emotional peaks
- **How:** Twelve Labs' video understanding detects scene transitions, topic changes, and high-engagement moments
- **Why:** Strategic placement during natural breaks maximizes viewer retention and ad effectiveness

---

## Dashboard Page Tooltips

### Key Metrics Cards

#### 1. **Total Ad Spots**
- **What:** Total advertising opportunities in the video
- **How:** Sum of all detected brand mentions and high-engagement ad placement opportunities
- **Why:** More spots mean more inventory to monetize; quality tier breakdown shows engagement distribution

#### 2. **Average Engagement**
- **What:** Mean engagement score across all ad spots indicating content quality
- **How:** 
  - Engagement = (Emotional Intensity × 60%) + (AI Confidence × 40%)
  - Attention = (AI Confidence × 70%) + (Emotional Intensity × 30%)
- **Why:** Higher average (70%+) means consistently interesting content, commanding premium advertising rates

#### 3. **Average CPM Range**
- **What:** Average Cost Per Mille across all ad spots
- **How:** Average of all spot CPM values based on industry-standard rates by category, adjusted by quality tier multipliers
- **Why:** CPM directly determines revenue potential; higher average means more valuable ad inventory

#### 4. **Total Inventory Value**
- **What:** Estimated total advertising revenue potential if all spots are sold
- **How:** Sum of all individual spot CPM values (min and max ranges); assumes 1,000 impressions per spot
- **Why:** Shows complete revenue opportunity; with sufficient views, represents maximum potential advertising income

### Ad Placement Quality Analysis

#### 5. **Ad Placement Quality Analysis** (Section Header)
- **What:** Breakdown of ad inventory by quality tier
- **How:** 
  - Premium (80%+ engagement/attention): +30% CPM
  - Standard (60-80%): base CPM
  - Basic (<60%): -30% CPM
- **Why:** Understanding distribution helps optimize content strategy; more premium spots = higher revenue

### Product Recommendations

#### 6. **Product Recommendations** (Section Header)
- **What:** Curated products/brands matching video content
- **How:** Aggregates all recommendations using GPT-4 analysis of video content, emotional context, and category alignment
- **Why:** Contextually relevant sponsorships perform 3-5x better than generic ads

#### 7. **Product CPM**
- **What:** Expected advertising rate for specific product placement
- **How:** Based on product category, brand tier, and relevance to content
- **Why:** Helps evaluate which sponsorships offer best financial return

#### 8. **Click-Through Rate (CTR)**
- **What:** Estimated percentage of viewers who will click (industry avg: 0.5-2%)
- **How:** Projected based on relevance score, spot engagement, and historical performance data
- **Why:** CTR impacts conversion and advertiser ROI; higher CTR attracts better sponsor rates

#### 9. **Projected Revenue**
- **What:** Estimated earnings from product placement
- **How:** (CPM × Expected Impressions / 1000) + (CTR × Impressions × Avg. Commission Rate)
  - Assumes baseline 1,000 impressions; scales with actual views
- **Why:** Concrete revenue estimate helps prioritize sponsorships and negotiate rates

---

## Technical Implementation

### Calculation Methodologies

All statistics are derived from:

1. **Twelve Labs Video Understanding API**
   - Multimodal analysis (visual, audio, text, OCR)
   - Scene detection and emotional analysis
   - Confidence scoring

2. **OpenAI GPT-4**
   - Product matching and recommendations
   - Context analysis
   - Relevance scoring

3. **Industry-Standard CPM Rates**
   - Category-based baseline rates (see `src/lib/spot-value-calculator.ts`)
   - Quality tier multipliers
   - Market-validated pricing

### Files Modified

1. **Created:** `src/components/InfoTooltip.tsx` - Reusable tooltip component
2. **Updated:** `src/app/analyze/page.tsx` - Added 7 tooltip integrations
3. **Updated:** `src/app/dashboard/[videoId]/page.tsx` - Added 9 tooltip integrations

### User Experience

- **Hover:** Shows tooltip immediately
- **Click:** Toggles tooltip (useful for mobile)
- **Visual Design:** 
  - Indigo accent matching brand
  - Arrow pointing to source element
  - Color-coded sections (white, purple, green)
  - Responsive 320px width

---

## Benefits

### For Content Creators
- Understand how their content is valued
- Identify optimization opportunities
- Make informed pricing decisions
- Learn industry standards

### For Advertisers/Sponsors
- Transparency in pricing methodology
- Data-driven placement selection
- ROI justification
- Quality metrics validation

### For the Platform
- Reduced support questions
- Increased user confidence
- Educational value
- Professional credibility

---

## Future Enhancements

Potential additions:
- Video tutorials linked from tooltips
- "Learn More" links to documentation
- Historical benchmark comparisons
- Industry report references
- A/B testing data integration

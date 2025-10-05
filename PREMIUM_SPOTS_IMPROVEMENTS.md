# Premium Ad Spots Timeline Improvements

## Changes Made

### 1. Enhanced VideoTimeline Component

- **Increased visual prominence** of premium spots:

  - Premium spots now render at **96px height** (vs 64px standard, 44px basic)
  - Added **pulsing animation** to premium spots for maximum visibility
  - Maintained shimmer effect on premium spots
  - Increased minimum width of all spots from 1% to 1.5%

- **Improved debug logging**:
  - Console now shows breakdown of tier counts
  - Displays sample moment data for troubleshooting
  - Clear "VideoTimeline Debug" section in console

### 2. Enhanced Analyze Page

- **Added timeline to Brand Mentions tab**:

  - Brand mentions now have their own visual timeline
  - Shows premium, standard, and basic tier classification
  - All brand mentions with placementTier data are visualized

- **Updated descriptions**:
  - Both tabs now explain that premium spots = 80%+ engagement
  - Clear messaging about gold color indicating premium spots

### 3. How Premium Spots Are Calculated

Premium spots require an **average engagement + attention score ≥ 80%**:

**For Ad Moments (from Twelve Labs analysis):**

- `engagementScore = emotionIntensity * 0.6 + confidence * 0.4`
- `attentionScore = confidence * 0.7 + emotionIntensity * 0.3`
- Requires high emotion (excited, thrilled, energetic, passionate) AND high confidence

**For Brand Mentions:**

- Ad opportunities get "excited" emotion → typically premium tier
- Brand mentions get "positive" emotion → typically standard tier
- Both use 75% default confidence

### 4. Visual Indicators

**Premium Tier (Gold):**

- 🌟 Yellow/amber gradient with gold glow
- 96px tall bars
- Pulsing + shimmer effects
- Star icon (⭐) in badges
- +30% CPM boost

**Standard Tier (Blue):**

- ⚡ Blue/indigo gradient
- 64px tall bars
- Medium shadow
- Lightning icon
- Base CPM

**Basic Tier (Gray):**

- ○ Gray gradient
- 44px tall bars
- No special effects
- Circle icon
- -30% CPM reduction

## Where to See Premium Spots

1. **Analyze Page → Brand Mentions Tab**:

   - Look for the **visual timeline** above the list
   - Gold (yellow) bars = premium spots
   - Also check the **tier badges** in the list items

2. **Analyze Page → Ad Moments Tab**:

   - Visual timeline shows all ad moments
   - Gold bars indicate premium placement opportunities
   - MomentCard components also show tier badges

3. **Browser Console**:
   - Open DevTools (F12)
   - Check for "=== VideoTimeline Debug ===" logs
   - Shows exact count of premium/standard/basic spots

## Troubleshooting

If you don't see premium spots:

1. **Check the console logs** - Does it show "Premium spots: 0"?
2. **Video content matters**:

   - Premium spots need high emotion (excited, energetic, passionate)
   - AND high confidence in the detection
   - Low-energy or calm videos may not generate premium spots

3. **Brand mentions vs Ad moments**:

   - "Ad opportunities" in brand mentions → usually premium
   - "Brand mentions" → usually standard
   - Ad moments from Twelve Labs → depends on video content

4. **Re-analyze if needed**:
   - Delete the video analysis from database
   - Re-analyze to recalculate spot quality
   - New analysis will use latest spot calculator logic

## Example Premium Spot Criteria

A moment becomes **premium** when:

- Video shows **high energy** (excited, passionate, intense emotion)
- AI has **high confidence** (75%+) in detection
- Example: Product launch announcement, victory celebration, exciting reveal

A moment is **standard** when:

- Video has **moderate energy** (happy, positive, motivated)
- Confidence is good (60-80%)
- Example: Casual product discussion, interview segments

A moment is **basic** when:

- Video is **low energy** (neutral, calm, relaxed)
- Or confidence is lower (<60%)
- Example: Background footage, transitions, B-roll

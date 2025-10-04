# Confidence Field Type Conversion Fix

## Issue

**Error**: `invalid input syntax for type integer: "low"`

**Location**: `src/app/api/analyze/route.ts:61`

**Cause**: Twelve Labs API returns confidence as a string (`"low"`, `"medium"`, `"high"`) but our database schema expects an integer.

```sql
-- Database schema
confidence: integer -- 0-100
```

```json
// Twelve Labs API response
{
  "confidence": "low" // ❌ String, not number
}
```

## Solution

Added `convertConfidence()` method in `src/lib/twelvelabs.ts` to convert string confidence values to integers:

```typescript
private convertConfidence(confidence: unknown): number {
  // Twelve Labs returns confidence as string ("low", "medium", "high")
  // or as a number - convert to integer 0-100
  if (typeof confidence === "number") {
    return Math.round(confidence);
  }

  if (typeof confidence === "string") {
    const lower = confidence.toLowerCase();
    if (lower === "high" || lower === "h") return 90;
    if (lower === "medium" || lower === "mid" || lower === "m") return 70;
    if (lower === "low" || lower === "l") return 50;
  }

  // Default fallback
  return 75;
}
```

## Mapping

| Twelve Labs Value              | Converted Integer | Percentage    |
| ------------------------------ | ----------------- | ------------- |
| `"high"` or `"h"`              | 90                | 90%           |
| `"medium"` or `"mid"` or `"m"` | 70                | 70%           |
| `"low"` or `"l"`               | 50                | 50%           |
| Numeric value                  | Rounded           | As-is         |
| Unknown/null                   | 75                | 75% (default) |

## Usage

The conversion happens automatically in `analyzeForAdMoments()`:

```typescript
allMoments.push({
  start: (result.start as number) || 0,
  end: (result.end as number) || 0,
  text: metadata?.text || query,
  confidence: this.convertConfidence(result.confidence), // ✅ Converts here
  emotion: this.detectEmotion(metadata?.text || ""),
  category: this.categorizeContent(query),
});
```

## Testing

The fix ensures that:

- ✅ String confidence values are converted to integers
- ✅ Numeric confidence values are preserved (rounded)
- ✅ Null/undefined values default to 75
- ✅ Database inserts succeed without type errors
- ✅ UI can display confidence as percentages

## Related Files

- `src/lib/twelvelabs.ts` - Contains the conversion logic
- `src/lib/db/schema.ts` - Database schema with integer confidence
- `src/app/api/analyze/route.ts` - Where the error occurred
- `src/components/MomentCard.tsx` - Displays confidence percentages

## Build Status

✅ Build passes successfully  
✅ No type errors  
✅ All tests pass

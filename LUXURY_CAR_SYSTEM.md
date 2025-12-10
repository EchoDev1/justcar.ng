# Luxury Car Classification System

## Overview
Automatic luxury car classification and tagging system for high-value vehicles (≥₦150 Million).

## How It Works

### Automatic Classification
- **Price Threshold**: ₦150,000,000 (150 Million Naira)
- **Automatic Detection**: Any car with `price >= 150000000` is automatically classified as luxury
- **No Manual Flag Required**: Classification happens automatically based on price

### Display Behavior

#### On Luxury Page (`/luxury`)
- Shows ALL cars priced ≥ ₦150M
- Each car displays **"LUXURY"** tag (gold gradient with crown icon)
- No "PREMIUM" tags appear on luxury page
- Cars are sorted by price (highest first)

#### On Other Pages (Homepage, Browse, Search)
- Cars ≥ ₦150M display **"LUXURY"** tag
- Cars < ₦150M with `is_premium_verified=true` display **"PREMIUM"** tag
- Luxury tag takes priority over Premium tag

## Visual Design

### LUXURY Badge
- **Icon**: Crown (filled)
- **Colors**: Gold gradient (`from-yellow-500 via-orange-500 to-yellow-600`)
- **Border**: Yellow-400
- **Animation**: Slow pulse effect
- **Position**: Bottom-right of car image

### PREMIUM Badge (for cars < ₦150M)
- **Icon**: Star (filled)
- **Colors**: Yellow-orange gradient (`from-yellow-400 to-orange-500`)
- **Border**: Yellow-300
- **Animation**: None
- **Position**: Bottom-right of car image

## Technical Implementation

### API Endpoint
```
GET /api/cars/luxury?limit=12
```

**Query**:
- Fetches active cars with `price >= 150000000`
- Orders by price DESC
- Includes dealer and image data

### Components Updated

1. **app/luxury/page.js**
   - Uses `/api/cars/luxury` API
   - Adds `is_luxury_page` flag to cars
   - Ensures luxury tag display

2. **components/cars/CarCard.js**
   - Line 186-191: Luxury badge logic
   - Line 194-199: Premium badge logic (only for < 150M)
   - Line 204: Heart button repositioning

## Business Rules

| Price Range | Tag Displayed | Icon | Page |
|------------|---------------|------|------|
| ≥ ₦150M | LUXURY | Crown | All pages + Luxury page |
| < ₦150M + Premium Verified | PREMIUM | Star | All pages except Luxury |
| < ₦150M + Not Premium | None | - | Homepage, Browse |

## Benefits

1. **Automatic**: No manual intervention needed - price determines classification
2. **Consistent**: Same logic across all pages
3. **Scalable**: New luxury cars automatically appear when added
4. **Clear Distinction**: Visual differentiation between luxury and premium tiers
5. **SEO Friendly**: Dedicated `/luxury` page for high-end inventory

## Examples

### Luxury Car (₦200M Rolls Royce)
- ✅ Shows on `/luxury` page
- ✅ Displays "LUXURY" tag with crown
- ✅ Gold gradient badge
- ❌ Never shows "PREMIUM" tag

### Premium Car (₦80M BMW with verification)
- ❌ Does NOT show on `/luxury` page
- ✅ Displays "PREMIUM" tag with star
- ❌ Never shows "LUXURY" tag

### Standard Car (₦50M Mercedes without verification)
- ❌ Does NOT show on `/luxury` page
- ❌ No special tags
- ✅ Shows on homepage and browse pages

## Testing

To verify the system works:

1. **Add a car priced at ₦150M or more**
2. **Check `/luxury` page** - Car should appear automatically
3. **Verify badge** - Should show "LUXURY" with crown icon
4. **Check other pages** - Car should have luxury badge everywhere
5. **Test lower price** - Change to < ₦150M, luxury tag should disappear

## Database Query
```sql
-- Get all luxury cars
SELECT * FROM cars
WHERE price >= 150000000
AND status = 'active'
ORDER BY price DESC;
```

## Future Enhancements
- [ ] Add luxury car count to homepage stats
- [ ] Create luxury car newsletter
- [ ] Add luxury concierge contact form
- [ ] Implement luxury car comparison tool
- [ ] Add luxury dealer verification tier

---
**Last Updated**: 2025-12-10
**Commit**: 64cba79
**Status**: ✅ Production Ready

# Pricing Structure

## Fixed Pricing Tiers

| Credits | Price | Label | Rate per 100 Credits |
|---------|-------|-------|---------------------|
| 100 | $2.00 | Starter | $2.00 |
| 300 | $5.00 | Basic | $1.67 |
| 500 | $7.00 | Pro | $1.40 |
| 1000 | $10.00 | Premium | $1.00 |

## Custom Amount Pricing

Users can enter any custom credit amount (minimum 10 credits). The price is calculated using a progressive rate based on the tiers:

### Calculation Logic:
- **0-100 credits**: Linear interpolation at $2.00 per 100 credits
- **101-300 credits**: Base $2.00 + $3.00 for next 200 credits
- **301-500 credits**: Base $5.00 + $2.00 for next 200 credits
- **501-1000 credits**: Base $7.00 + $3.00 for next 500 credits
- **1000+ credits**: Base $10.00 + $1.00 per 100 credits

### Examples:
- **50 credits** = $1.00 (50/100 × $2.00)
- **150 credits** = $2.75 ($2.00 + 50/200 × $3.00)
- **400 credits** = $6.00 ($5.00 + 100/200 × $2.00)
- **750 credits** = $8.50 ($7.00 + 250/500 × $3.00)
- **1500 credits** = $15.00 ($10.00 + 500/100 × $1.00)

## Features Included (All Tiers)
- ✅ Generate standard images (~1 credit per image)
- ✅ Create short videos (~10 credits per video)
- ✅ Priority processing
- ✅ Credits never expire
- ✅ Secure payment via Stripe

## Implementation Notes
- The pricing modal displays all 4 tiers in a grid layout
- "Basic" (300 credits) is marked as the recommended option
- Custom amount section can be toggled to show/hide
- Real-time price calculation for custom amounts
- Minimum custom amount: 10 credits
- Maximum width expanded to accommodate all tiers

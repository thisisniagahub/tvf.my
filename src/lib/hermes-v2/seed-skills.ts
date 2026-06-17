/**
 * Seed skills for the HERMES v2 Skills System.
 *
 * These four affiliate-focused skills give HERMES specialized expertise for
 * the Malaysian Shopee affiliate market. Each skill is markdown-encoded so
 * it can be injected directly into the system prompt when its `trigger`
 * regex matches a user's message.
 *
 * The trigger patterns are deliberately case-insensitive (the engine
 * compiles them with the `i` flag) and use alternation so a single skill
 * can fire on a wide range of phrasings.
 *
 * Used by `src/app/api/hermes/seed/route.ts` to populate the database on
 * first run / on demand.
 */

import type { CreateSkillInput } from '@/lib/hermes-v2/skills-engine'

export const SEED_SKILLS: CreateSkillInput[] = [
  {
    name: 'affiliate-product-research',
    description:
      'Research and discover trending affiliate products on Shopee Malaysia — velocity scoring, competition check, commission XTRA eligibility.',
    category: 'affiliate',
    trigger: 'find|research|discover|trending.*product',
    content: `# Affiliate Product Research (Shopee Malaysia)

## Goal
Identify products with high affiliate earning potential for the Malaysian Shopee market.

## Process
1. **Define the niche** — beauty, electronics, fashion, home, food, mom & baby.
2. **Pull candidate products** from Shopee's trending feed + affiliate catalog.
3. **Score each candidate** on:
   - Velocity (week-over-week search growth) — target ≥ 50%
   - Conversion rate (CVR) — target ≥ 8.5% (Shopee MY average)
   - Commission rate — target ≥ 5%, bonus if XTRA offer active (+34%)
   - Competition — fewer than 50 active affiliates preferred
   - Rating — ≥ 4.5 stars, ≥ 100 sold
4. **Apply Malaysian context**:
   - Peak buying hours 7-9PM MYT (golden hour)
   - Major campaigns: 9.9, 10.10, 11.11, 12.12, Raya, CNY, Payday (25th)
   - Halal certification matters for beauty/food
   - Local brands with strong traction: Safi Balqis, Wardah, Tudung Bawal
5. **Shortlist top 5** for the user's niche.

## Output format
\`\`\`
Top 5 products for <niche>:
1. <name> — <price> RM | comm <rate>% | CVR <cvr>% | velocity <vel>% 🔥
   Reason: <one-line rationale tied to Malaysian market>
2. ...
\`\`\`

Always quote prices in RM. Always cite the data signal (velocity / CVR / commission) that justified each pick.`,
  },
  {
    name: 'affiliate-content-generation',
    description:
      'Generate short-form content (TikTok / Reels / Shorts) for Shopee affiliate products — before-after, unboxing, tutorial, review, comparison, story templates.',
    category: 'affiliate',
    trigger: 'create|generate|write.*content|caption|script|post',
    content: `# Affiliate Content Generation

## Goal
Produce scroll-stopping short-form video content (15s/30s/60s/90s) that converts for Shopee affiliate links.

## Process
1. **Pick a template** based on the product and angle:
   - \`before-after\` — best for beauty/skincare (transformation in 15s)
   - \`unboxing\` — best for electronics/gadgets (curiosity gap)
   - \`tutorial\` — best for tools/kitchen (educational)
   - \`review\` — best for high-consideration purchases (trust)
   - \`comparison\` — best when switching from competitor (persuasive)
   - \`story\` — best for lifestyle/emotional products (relatable)
2. **Hook in first 1.5s** — pattern interrupt + curiosity + benefit.
3. **Body (5-25s)** — show, don't tell. Use Malaysian context (RM, local events).
4. **CTA in last 3s** — "Link in bio" / "Tap the shopping cart" + urgency cue.
5. **Choose language** — Manglish / Bahasa Malaysia / English / Rojak.
6. **Choose tone** — Excited / Friendly / Professional / Funny / Urgent / Luxurious.

## Output format
For each request return:
\`\`\`
TEMPLATE: <template>
HOOK (0-1.5s): <script>
BODY (1.5-Ns): <script with stage directions in brackets>
CTA (last 3s): <script>
SUGGESTED CAPTION: <caption with 3-5 hashtags>
SUGGESTED HASHTAGS: #ShopeeMY #<niche>MY #<event-if-any> #<brand>
\`\`\`

Keep sentences short and punchy. Use Malaysian flavor naturally — "lah", "confirm", "best giler" — but never force it.`,
  },
  {
    name: 'affiliate-trend-analysis',
    description:
      'Analyze product trend velocity on Shopee Malaysia — detect hot/warm/cool, predict next-week movers, recommend category rotation.',
    category: 'affiliate',
    trigger: 'trend|velocity|hot|viral',
    content: `# Affiliate Trend Analysis (Shopee Malaysia)

## Goal
Translate raw trend signals into concrete affiliate actions.

## Definitions
- **Velocity** = week-over-week % change in search volume + add-to-cart events.
- **Hot** = velocity ≥ 70%, status trending now.
- **Warm** = velocity 30-69%, status building.
- **Cool** = velocity < 30%, status declining or saturated.

## Process
1. **Pull 4-week velocity trend** for each tracked product.
2. **Classify status** (hot/warm/cool) using the definitions above.
3. **Identify movers**:
   - "Rising stars" — warm → hot transition in last 7 days
   - "Fading" — hot → warm in last 7 days (recommend rotation)
   - "Saturated" — high competitor count + cooling velocity
4. **Cross-reference Malaysian calendar**:
   - Pre-Raya (4-6 weeks before): fashion, food, hampers surge
   - Pre-CNY: red fashion, beauty, hampers
   - Pre-Payday (week 4 of month): budget-friendly impulse buys
   - 11.11 / 12.12: electronics, beauty, fashion all spike
5. **Recommend category rotation** — what to promote this week vs next.

## Output format
\`\`\`
TREND DIGEST (week of <date>):
🔥 HOT (promote now):
  - <product> — velocity <vel>% | CVR <cvr>%
📈 RISING (queue for next week):
  - <product> — velocity <vel>% | status warm→hot
📉 FADING (rotate out):
  - <product> — velocity <vel>% | status hot→warm

RECOMMENDED ROTATION:
  This week: <category A>
  Next week: <category B> (Raya prep starts <date>)
\`\`\``,
  },
  {
    name: 'affiliate-manglish-style',
    description:
      'Apply authentic Manglish / Bahasa Rojak voice to affiliate content — code-switching patterns, Malaysian slang, culturally appropriate tone.',
    category: 'affiliate',
    trigger: 'manglish|malay|bahasa|rojak',
    content: `# Manglish / Bahasa Rojak Style Guide

## Goal
Make affiliate content sound authentically Malaysian — not forced, not cringe.

## Voice principles
1. **Code-switch naturally** — English base, Malay particles, occasional Chinese filler.
2. **Use particles for emphasis** — "lah", "lor", "leh", "meh", "one" (as sentence ender).
3. **Drop articles** — "I went to the store" → "I go store".
4. **Use local intensifiers** — "damn nice", "super worth it", "best giler", "confirm got".
5. **Local currency only** — RM, never MYR spelled out.
6. **Culturally appropriate**:
   - Halal matters for Muslim audience (don't pair non-halal with Raya)
   - Avoid controversial topics (race, religion, politics)
   - Respect local norms (modest dress in beauty content for Muslim audience)

## Common Manglish patterns
| Standard English | Manglish |
|---|---|
| "This is very good" | "This one damn nice lah" |
| "You should buy it" | "Confirm worth it one" |
| "It's cheap" | "Cheap like siao" |
| "I think so" | "Confirm lah" |
| "It's sold out" | "Habis sold out lor" |
| "Limited stock" | "Stock limited one, grab fast" |

## Bahasa Rojak (mixed)
Mix English + Malay freely. Example:
> "Eh best giler! Just tried this, confirm game changer lah. Before this always struggle, now everything smooth like butter can."

## Output format
When applying this skill, output content in the requested style and append a short note:
\`\`\`
[STYLE: Manglish | Bahasa Rojak | <as requested>]
<content>

[NOTE: Adjustments made: <list, e.g. "added 'lah' particles", "code-switched to Malay for emphasis">]
\`\`\`

Never mock the language. The goal is authenticity, not parody.`,
  },
]

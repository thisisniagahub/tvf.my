# Task 5-a — Framer Motion stagger animations (Products, Campaigns, Leaderboard)

Agent: full-stack-developer (stagger animations)
Task: Add Framer Motion stagger animations to Products, Campaigns, and Leaderboard pages.

## Files touched
- `src/components/pages/products-page.tsx`
- `src/components/pages/campaigns-page.tsx`
- `src/components/pages/leaderboard-page.tsx`

## What was done
- Added `import { motion } from 'framer-motion'` to each of the 3 files.
- Products: wrapped each product `<Card>` in `motion.div` with
  `initial={{opacity:0,y:16}} animate={{opacity:1,y:0}} transition={{duration:0.4, delay:index*0.05, ease:[0.16,1,0.3,1]}} whileHover={{y:-4, transition:{duration:0.2}}}`.
  Added `index` to `products.map`; moved `key` to the motion.div; kept Card className + `onClick={() => setSelected(p)}`.
- Campaigns: wrapped each campaign `<Card>` in `motion.div` with the same entrance pattern (delay `index*0.08`) and `whileHover={{y:-4, transition:{duration:0.2}}}`.
  Hover shadow comes from the existing Card `hover:shadow-md`. Moved `key` to wrapper; preserved Card className/handlers.
- Leaderboard:
  - Podium (top 3): wrapped each `<Card>` in `motion.div` with spring entrance
    `initial={{scale:0.8, opacity:0}} animate={{scale:1, opacity:1}} transition={{type:'spring', stiffness:200, damping:20, delay:index*0.1}}`.
  - Full table: replaced `<TableRow>` with `<motion.tr>` for `rest.map` rows, added `index`,
    slide-in-from-left `initial={{opacity:0, x:-10}} animate={{opacity:1, x:0}} transition={{duration:0.4, delay:index*0.04, ease:[0.16,1,0.3,1]}}`.
    Appended `border-b` to the row className to preserve the default border that shadcn `TableRow` provided (motion.tr does not inherit those defaults).
    `TableRow` is still used for the header row, so its import stays in use.

## Notes / decisions
- `ease: [0.16, 1, 0.3, 1]` is accepted by framer-motion v12 without `as const` thanks to contextual typing (BezierDefinition = readonly [number, number, number, number]).
- For table rows, used `motion.tr` (not `motion(TableRow)`) because the shadcn TableRow does not forward refs, which would prevent motion from animating the DOM node. `border-b` was appended to the row className purely to preserve the pre-existing bottom border (no existing token removed).
- Card classNames were left intact (no h-full additions) per the "keep existing className intact" rule; campaign cards have uniform content so wrapping does not change the equal-height visual, and product cards render fine with natural heights.
- Hover lift uses nested `transition:{duration:0.2}` inside `whileHover` to honor both the canonical pattern (`y:-4`) and the "hover duration 0.2" guideline.

## Verification
- `bun run lint` → clean (no errors / warnings).
- `dev.log` → pages compile and return 200 with no runtime errors.

## Constraints honored
- No export names changed; `'use client'` preserved; no data/functionality/styling removed; no test files created; only motion wrappers + imports added.

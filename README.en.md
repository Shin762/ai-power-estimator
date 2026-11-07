# AI Power Estimator

[日本語](README.md) | English

A web tool that estimates the electricity, CO₂ emissions and equivalent electricity cost of AI inference from usage. Every coefficient carries its source and date, so you can get a grounded sense of scale.

> The app UI is currently in Japanese.

## Purpose

The rapid growth of AI demand raises the risk that regional power grids hosting concentrated data centers become strained, with knock-on effects on household supply and electricity prices. This project aims to make AI electricity consumption **visible** and to support two goals:

1. **Preventing power shortages**
   Provide a shared yardstick so grid operators and AI companies can coordinate load (when, where and how much compute runs) and avoid overloading regional grids.
2. **Promoting regional distribution**
   Make it possible to compare, in numbers, options that ease concentration in specific areas, such as edge inference and regional data centers.

The current version is the first step: it estimates inference energy per individual user or per service.

## Target users

| Who | Main interest |
|---|---|
| Individuals who use AI daily | How much electricity their own usage consumes |
| Developers and product planners building AI services | Inference energy based on model size, tokens and request volume |
| Local governments, utilities, policy makers (planned) | Regional AI power demand and its impact on the grid |
| Data center operators and AI companies (planned) | Effects of shifting load in time and distributing it across regions |
| Educators and writers | Sourced, citable ballpark figures |

## Use cases

- **Individuals**: reflect on usage; explain it in terms of LED bulbs or smartphone charges
- **Developers**: choose a model size (how many times a small vs. large model differs); estimate savings from shorter prompts and outputs
- **Companies**: a starting point for proposals, internal briefings and environmental reports (not suitable for official disclosure, since published figures use inconsistent scopes)
- **Regions and utilities (planned)**: aggregate AI demand against grid capacity; evaluate load coordination and distributed siting

## Current features

- **Personal chat usage**: energy per query (Gemini / ChatGPT published figures, external estimates, or custom) × number of queries, plus image generation
- **API / per-token**: estimate from active parameters, input/output tokens and monthly requests, given GPU throughput, utilization, server overhead and PUE
- **Household impact**: pick one of Japan's 10 grid areas and a fiscal year (FY2026–FY2035) to estimate how much new data center demand could raise household electricity bills through grid reinforcement costs (network tariffs) and capacity costs (capacity market). Compare mitigation scenarios with load shifting and regional distribution
- **Common**: monthly/yearly energy, CO₂ (adjustable emission factor), equivalent electricity cost, and everyday comparisons

## Roadmap

- [ ] Save and share assumptions via URL; CSV export
- [ ] Hourly load profiles (overlap with peak hours)
- [x] Household impact (bill increase by area and year, with mitigation effects)
- [ ] Regional aggregation (estimate regional demand from user counts and service scale, compared with grid supply capacity)
- [ ] Load-shifting simulation (effect of avoiding peaks and moving to night-time or renewable-surplus hours)
- [ ] Siting scenario comparison (urban-concentrated vs. regional data centers vs. edge inference)
- [ ] Region-specific emission factors and generation mix
- [ ] Regular review of coefficients as published figures are updated

## Assumptions and caveats

- Only inference (usage-time) electricity is covered. Model training, end-user devices, networks and data storage are excluded.
- Published figures are self-reported by companies or external estimates, and their scopes differ. Use the results as order-of-magnitude estimates.
- Data center demand in the household impact tab comes from OCCTO's FY2026 demand outlook (published 2026-01-21). The area split is not published as numbers, so it is allocated by each area's growth in industrial demand (an estimate).
- Grid reinforcement cost per kW, general-burden share, annual cost rate, capacity price elasticity and similar coefficients in the household impact tab are assumptions with no public source. Results are for sensitivity analysis, not a forecast of actual tariff changes. Wholesale price effects are not included.
- Sources and dates for each coefficient are listed in [`src/data/factors.ts`](src/data/factors.ts), [`src/data/grid.ts`](src/data/grid.ts) and at the bottom of the app.

## Development

Requirements: Node.js (tested with v24)

```bash
npm install
npm run dev      # dev server
npm test         # tests (Vitest)
npm run build    # type check and build (output in dist/)
```

Tech stack: React 19 / TypeScript / Vite / Vitest

## License

[MIT License](LICENSE)

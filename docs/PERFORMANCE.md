# Performance Guidelines & Baseline Metrics

## Core Strategies Implemented

1. **Lazy Loading via React.lazy()**
   - Heavy pages like `Chat`, `Settings`, `Report`, and `VideoConsult` are loaded dynamically only when routed to.
   - `EducationGuide` is lazy-loaded to prevent a ~500KB bundle block.

2. **Rollup Manual Chunks**
   - Heavy dependencies are bundled into their own cacheable files:
     - `vendor-firebase` for all Firebase SDK logic
     - `vendor-charts` for Recharts
     - `vendor-ai` for Groq AI interactions

3. **Code Deduplication**
   - Firebase interactions have been abstracted into `syncPatientRootDoc` and `buildGlobalSessionDoc` to keep bundle size small and logic cohesive.

4. **Service Workers (PWA)**
   - Pre-caching static assets
   - Runtime caching of Google Fonts.

## Future Recommendations
- Implement a global state management tool if prop-drilling causes performance lags.
- Integrate Web Vitals tracking in production for real-time Lighthouse scores.

# CareerX-Ray Project Structure

This repository is organized around a Vite React single-page app plus supporting docs and generated assets.

## Runtime Source

- `src/main.tsx` - React entrypoint.
- `src/app/App.tsx` - top-level app state machine and page router.
- `src/app/pages/` - page-level product surfaces and feature screens.
- `src/app/layout/` - reusable app shell and brand layout components.
- `src/app/state/` - shared React state/context and cross-page utilities.
- `src/app/lib/` - deterministic domain logic that can be tested without React.
- `src/app/components/ui/` - shadcn-style UI primitives.
- `src/app/components/figma/` - Figma import compatibility helpers.
- `src/styles/` - global styles, Tailwind entrypoints, fonts, and theme tokens.

## Public Assets

- `public/` - static assets served by Vite/Vercel.
- `public/dna/` - Career DNA archetype images used by the app.
- `public/brand-logo.svg` and `public/favicon.svg` - production brand assets.

## Documentation And Artifacts

- `docs/architecture/` - architecture diagrams and diagram generation script.
- `docs/pitch/` - pitch documents and deck-related source artifacts.
- `docs/guidelines/` - design/build guidelines.
- `docs/assets/` - non-runtime source images and imported assets.
- `docs/generated/` - generated outputs such as presentation exports.

## Tests

- `tests/` - focused tests for deterministic domain logic.

## Local-Only / Ignored

- `dist/` - Vite production build output.
- `node_modules/` - installed dependencies.
- `.vercel/` - local Vercel project link metadata.
- `vercel-snapshots/` - local production deployment snapshots for rollback/reference.

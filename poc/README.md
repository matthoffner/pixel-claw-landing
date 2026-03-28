# Pixel Agents POC (Unified App + Web)

This folder is the implementation spine for the Pixel Agents platform concept:

- Host shell across native + web
- Manifest-based subagent microapps
- Scoped memory (global + agent + session)
- Widget-first customization workflow

## Structure

- `agent-registry.json` — Source of truth for available agents + widget capabilities
- `memory-store.example.json` — Example scoped memory contract
- `web-demo.html` — Clickable browser POC for agent selection + memory injection
- `mobile/` — Expo React Native app scaffold targeting TestFlight

## POC contract

Each microapp agent must provide:

1. `id`, `name`, and `description`
2. `defaultMemoryNamespace`
3. `widgets[]` supported by the agent
4. action handlers (next step: implemented via API gateway)

## TestFlight path (React Native)

Inside `mobile/`:

1. `npm install`
2. `npx expo start`
3. `eas build --platform ios --profile preview`
4. `eas submit --platform ios`

Once EAS build credentials are configured, this yields installable TestFlight builds.

## Vercel path (web)

This repo root remains Vercel-deployable as static content.
`/poc/web-demo.html` is the live POC page to share while native build matures.

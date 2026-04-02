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
- `pretext-layout-poc.html` — New text layout benchmark POC using `@chenglou/pretext` for card sizing + canvas line rendering
- `pretext-chat-showcase.html` — Side-by-side chat demo showing DOM streaming vs Pretext pre-sized bubbles
- `mobile/` — Expo React Native app scaffold targeting TestFlight
- `../api/cdp-session.js` — CDP bridge endpoint for remote Chrome tab/session metadata

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

### CDP bridge notes

- The demo can call `POST /api/cdp-session` to attach to a remote Chrome DevTools Protocol target.
- Configure `CHROME_CDP_HTTP_URL` (example: `http://127.0.0.1:9222`) in your runtime env.
- `GET /api/cdp-events` provides SSE tab metadata fallback.

### CDP WebSocket relay (bi-directional)

A local relay is included at `../relay/cdp-relay.mjs`.

1. `cd relay && npm install`
2. Set `CDP_WS_URL` to a browser websocket endpoint from `/json/version` (for example `ws://127.0.0.1:9222/devtools/browser/<id>`)
3. `npm start`
4. In demo UI, set relay URL to `ws://127.0.0.1:8787/ws/cdp` and click **Start live stream**.

This enables command/event pass-through so the client can send CDP methods like `Target.getTargets` directly.

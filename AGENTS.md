<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## Sarvam credits: keep this project free

All audio is pre-generated in `public/audio/` with Sarvam's one-time free credits, and the owner does not want to pay for more.
- Never run `npm run audio -- --yes`, set `ENABLE_LIVE_TTS=1`, or call the Sarvam API without the owner's explicit go-ahead.
- Clip ids hash the spoken text and voice settings. Editing a voiced line's text, its mood in `content/direction/`, or anything in `src/lib/casting.ts` or `src/lib/script.ts` that changes the voice settings or spoken text makes existing audio stale. Run `npm run audio` (report only) after such changes. If it lists clips that used to have audio, revert or ask first.
- Never delete files in `public/audio/`; they can't be regenerated for free.

# Number Duel

A browser version of Faris Younas's Python number guessing game. Create a challenge and send its link to friends: everyone guesses the same secret, and the fewest attempts wins. Ties share a rank.

## Play

Enter a name, choose 1–10, 1–100, or 1–1,000, and create a challenge. Use **Copy challenge link** to invite friends. Each browser has its own player session, hints, and guess history. Leaderboards refresh every five seconds. Challenges expire after seven days and support up to 50 players. Results are standings while players are still guessing.

The secret stays on the server. Invalid and duplicate guesses do not count. Scores cannot be submitted directly from the browser. This is a casual friends game: clearing cookies or using another browser permits another entry, so it is not suitable for prizes or strict competitive play. Do not share the answer.

## Code map

- `app/page.tsx`: game screen and interactions (React/TypeScript).
- `app/globals.css`: responsive styling.
- `app/api/game/route.ts`: create, join, guess, and leaderboard API.
- `lib/game.ts`: validation and high/low/correct hints, adapted from the Python rules.
- `db/schema.ts`, `drizzle/`: durable challenge/player storage using Cloudflare D1.
- `.openai/hosting.json`: hosting configuration.

Python is the original terminal game. The browser edition uses TypeScript for both UI and server; it does not run the Python file in the browser.

## Local development

Requires Node.js 22.13+ and npm. Run `npm ci`, `npm run build`, then apply `drizzle/0000_mighty_blackheart.sql` to the local database:

```sh
node --import ./scripts/sites-env.mjs ./node_modules/wrangler/bin/wrangler.js d1 execute DB --local --config dist/server/wrangler.json --persist-to .wrangler/state --file drizzle/0000_mighty_blackheart.sql
npm run dev
```

Use the local URL printed by the server. No API keys are required. A production host must support a Cloudflare Worker and D1; GitHub Pages alone cannot run the shared leaderboard.

## Checks

```sh
npx tsc --noEmit
node scripts/test-game.mjs
npm run build
```

The API checks execute the actual handlers against SQLite with a small D1 adapter. Browser checks cover creation, hints, and persisted attempts. Automated checks do not replace multi-device production testing.

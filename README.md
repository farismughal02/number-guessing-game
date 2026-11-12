# Number Guessing Game · Number Duel

My first Python game, expanded into **Number Duel**, a browser game where friends try to find the same secret number in the fewest guesses.

**[Play Number Duel](https://faris-number-duel.drawnpaste5.chatgpt.site)**

## Two versions, one idea

| Version | Location | How it works |
| --- | --- | --- |
| Original Python game | [`guessing_game.py`](guessing_game.py) | Play in your terminal. Guess a number from 1 to 100 and follow the hints. |
| Friends challenge | [`web/`](web/) | Create a round in your browser, share its link, and compare scores on a shared leaderboard. |

The browser edition reimplements the original rules in TypeScript. It does not execute the Python file. The original game is preserved to show the project's starting point.

## Play with friends

1. Open the live game and enter your player name.
2. Choose a range: 1–10, 1–100, or 1–1,000.
3. Select **Create challenge**, then **Copy challenge link**.
4. Send that link to your friends. Everyone in that challenge guesses the same secret number.
5. Follow the “too high” and “too low” hints. The fewest attempts wins; equal scores share a rank.

The leaderboard updates every five seconds. Scores remain provisional while players are still guessing. Rounds stay open for seven days and support up to 50 players.

## Features

- Whole-number validation and high/low hints.
- Attempt counter and personal guess history.
- Server-generated secret numbers and server-checked scores.
- Shared leaderboard stored in a database.
- Progress restored in the same browser using a player cookie.
- Responsive layout for smaller screens.

This is a casual game for friends. Clearing cookies or using another browser allows another entry, so it is not intended for prizes or strict competitive play. Share your score, not the answer!

## Run the Python game

Install Python 3, download or clone this repository, and run:

```sh
python guessing_game.py
```

On systems that use `python3`, run `python3 guessing_game.py` instead. The Python version uses only the standard library.

## Run the browser game locally

The browser edition uses React, TypeScript, Vinext, and Cloudflare D1 (SQLite). It requires Node.js 22.13 or newer and npm. Use Node.js 24+ to run the included API test script, which uses `node:sqlite`.

From this repository's root:

```sh
cd web
npm ci
npm run build
```

Create the local database tables:

```sh
node --import ./scripts/sites-env.mjs ./node_modules/wrangler/bin/wrangler.js d1 execute DB --local --config dist/server/wrangler.json --persist-to .wrangler/state --file drizzle/0000_mighty_blackheart.sql
```

Then start the development server:

```sh
npm run dev
```

Open the local URL printed in the terminal. Apply the initial migration once to a fresh local database. Local test data is separate from the live game's data.

No API keys or `.env` file are needed for gameplay. Keep any future credentials out of Git.

## Where to learn from the code

| File | Responsibility |
| --- | --- |
| `guessing_game.py` | Original loop, integer conversion, input checks, and hints |
| `web/app/page.tsx` | Browser screen, forms, and leaderboard updates |
| `web/app/globals.css` | Colors, spacing, and responsive layout |
| `web/lib/game.ts` | Number validation and hint calculation |
| `web/app/api/game/route.ts` | Create/join challenges, check guesses, and return scores |
| `web/db/schema.ts` | Challenge and player database structure |
| `web/drizzle/` | Database migrations |

The web folder also includes the framework's supporting components and hosting/build scripts; start with the files above when learning how the game works.

## Verify the browser version

Run these commands inside `web/`:

```sh
npx tsc --noEmit
node scripts/test-game.mjs
npm run build
```

The API tests exercise the actual handlers against SQLite through a D1 adapter. They check shared secrets across two players, input validation, membership, scoring, leaderboard ordering, completed-game locking, and persisted progress. They do not replace multi-device production testing.

## Hosting

The live game is hosted separately from GitHub. This repository contains its source code; pushing or merging here does **not** automatically update the live website. The `web/.openai/hosting.json` file identifies the existing hosted project and its `DB` binding. Forks should configure their own hosting project.

GitHub Pages alone cannot run this version's server API and shared database. Deployment needs a compatible Cloudflare Worker runtime and D1 database.

## Possible next steps

- Add a host-controlled finish button and final results screen.
- Add rematches with the same group.
- Add accounts if stronger restrictions on repeat entries are needed.

Created by **Faris Younas**. The browser edition was developed with AI assistance as an extension of my original Python learning project.

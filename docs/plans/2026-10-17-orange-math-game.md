# Orange counting game

## Goal
Add a visual addition game for a 4½-year-old to the existing static site, with every sum at most ten and no visible numerals in play.

## Learning design
- Twelve rounds in three gentle stages: totals 2–4, 5–7, and 8–10.
- Each prompt shows two groups of the same orange illustrations. The child counts both groups and picks one of three baskets showing possible totals.
- Orange illustrations are aligned in rows of five. The correct basket changes position between rounds; wrong options differ by one where possible.
- A replayable Hebrew voice prompt explains the action. After two misses the correct basket glows, so the child can continue without adult intervention.
- Progress only advances after an explicit Continue button. Back returns one exercise. Mute and replay remain available.

## Implementation
- Reuse the existing island, boat, color palette, and layout rules in `style.css`; add `math.html`, `math.css`, `math.js`, and a small pure `math-rounds.js` module.
- Generate five local Hebrew voice clips with the installed Carmit voice and store them in `assets`.
- Add a link from the reading game's start screen to the math game and a return link on the math game's start and end screens.
- Test all twelve sums and choices across many generated runs; complete all twelve rounds through the browser, including wrong answers, audio replay, Back, restart, and mobile width.
- Push to the existing public GitHub repository and confirm the automatic Vercel deployment and public URL.

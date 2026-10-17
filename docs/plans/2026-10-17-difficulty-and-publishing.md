# Difficulty levels and publishing plan

## Goal
Make the 22 worksheet prompts replayable at three reading levels, then publish the static game in a public `shaije` GitHub repository and prepare it for Vercel.

## Constraints
- Keep every worksheet occurrence, including repeated sounds and words.
- Preserve the six row groupings and the existing audio, replay, back, mute, and completion flows.
- Keep a dependency-free static site so Vercel needs no build command or secrets.
- A child must never be trapped: mistakes eventually reveal a hint.

## Design
1. **Easy:** original item order and original answer cards.
2. **Medium:** shuffle items within each row and shuffle answer cards for each prompt. Prevent the exact original row order where a different order exists. Keep the selected order stable when using Back.
3. **Hard:** shuffle items within each row while spacing repeated prompts when possible. Draw answer cards from every sound or word on the sheet, and reveal the correct card after three mistakes. Prevent an unchanged original row order. The correct card should move between consecutive prompts.
4. Choose the level on the start screen. Replay uses the same level with a new sequence; the completion screen also offers level selection.

## Implementation
- Extract worksheet data and run generation into `levels.js` for focused deterministic tests.
- Update `homework.js` to read the selected run, preserve it for Back navigation, and adjust hints by level.
- Add concise level controls in `homework.css`; keep the island artwork and the existing layouts.
- Add a small Node test script for coverage, duplicate preservation, permutations, distractors, and stable navigation data. Exercise all three full routes and Back in a browser.
- Initialize Git in the static-site directory, commit the verified files, create a public repository under `shaije`, and push `main`.
- Verify GitHub contents and document the Vercel import steps. If Vercel authentication is available, deploy and verify the live URL.


# Riichi Table Helper (Svelte + Vite)

A small, static, installable web app for the center of a riichi mahjong table. Tracks round/seat winds, scores, honba, riichi sticks, and scores hands via fu/han with tsumo/ron.


## Features
- Tap-friendly UI for 4 seats (E/S/W/N) with names and scores
- Round wind (E/S), dealer, honba, riichi pot
- New Hand wizard with: winner, tsumo/ron, discarder (if ron), han & fu pickers, live payment preview
- Undo last hand; Reset match; Settings
- Draws (ryūkyoku) with tenpai payment split
- Standard riichi scoring caps (mangan/haneman/baiman/sanbaiman/yakuman) and rounding rules

## Usage
- Seat the tablet with Player 1 at the bottom; Player 2/3/4 sit clockwise on the right, top, and left. Winds rotate automatically after a non-East win.
- Tap a name field to rename a player. Points track per person while their current wind badge shows who is East (and therefore dealer).
- Each seat has an **I Won** button: it opens the hand wizard already facing that player and preselects their wind. Enter ron/tsumo, han/fu, and (if needed) the discarder, then confirm.
- Use **Settings** to change starting points or enable/disable kiriage mangan and draw payments; **Undo** rewinds the most recent hand by replaying the saved history.

## Scripts
```bash
npm run dev      # start dev server
npm run build    # production build
npm run preview  # preview build
npm run test     # vitest unit tests
```

## Future improvements
- Yaku presets to auto-fill common fu/han
- Export/import match state as JSON

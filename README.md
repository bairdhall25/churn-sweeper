# Churn Sweeper

A web-based SaaS simulation game inspired by Minesweeper. Reach $1,000,000 ARR by sweeping a 10x10 grid of customer tiles, using the right tools to fix churn events.

## Overview

- **Grid Size:** 10x10
- **Tile Types:**
  - Safe Customer (50%)
  - Minor Churn Event (35%)
  - Major Churn Event (10%)
  - Empty Tile (5%)
- **Tools:** Discount, Support, Bug Fix, Feature Ship, Dunning Email
- **Goal:** Reach $1,000,000 ARR before churn hits 100%

## How to Play

1. **Select a Tool:** Click a tool in the toolbelt to select it.
2. **Click a Tile:**
   - If it's a safe tile, it reveals the number of adjacent churn tiles.
   - If it's a churn tile, use the correct tool to fix it and gain ARR.
   - If the wrong tool is used, churn increases.
3. **Win/Loss:**
   - Win: ARR hits $1,000,000
   - Loss: Churn hits 100%

## How to Run

1. Clone the repository:
   ```bash
   git clone https://github.com/bairdhall25/churn-sweeper.git
   cd churn-sweeper
   ```
2. Open `index.html` in your web browser.

## Next Steps

- Slackbot messages
- Flood fill for empty/safe tiles
- Daily challenge mode with seeded boards

## License

MPL-2.0 
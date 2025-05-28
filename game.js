// --- Churn Sweeper: Board Generation & Tile Logic ---

const BOARD_SIZE = 10;
const TILE_TYPES = [
  { type: 'safe', weight: 0.5 },
  { type: 'minor', weight: 0.35 },
  { type: 'major', weight: 0.1 },
  { type: 'empty', weight: 0.05 },
];
const FIX_TOOLS = [
  'Discount',
  'Support',
  'Bug Fix',
  'Feature Ship',
  'Dunning Email',
];
const TOOLBELT = [
  { name: 'Discount', icon: '💰' },
  { name: 'Support', icon: '🧑‍💻' },
  { name: 'Bug Fix', icon: '🛠' },
  { name: 'Feature Ship', icon: '📣' },
  { name: 'Dunning Email', icon: '📬' },
];

let boardState = [];
let selectedTool = null;
let arr = 0;
let churn = 0;

function weightedRandomType() {
  const r = Math.random();
  let acc = 0;
  for (const t of TILE_TYPES) {
    acc += t.weight;
    if (r < acc) return t.type;
  }
  return TILE_TYPES[TILE_TYPES.length - 1].type;
}

function randomFix() {
  return FIX_TOOLS[Math.floor(Math.random() * FIX_TOOLS.length)];
}

function generateBoard() {
  // 1. Generate flat list with correct counts
  const total = BOARD_SIZE * BOARD_SIZE;
  const counts = {
    safe: Math.round(total * 0.5),
    minor: Math.round(total * 0.35),
    major: Math.round(total * 0.1),
    empty: total - (Math.round(total * 0.5) + Math.round(total * 0.35) + Math.round(total * 0.1)),
  };
  let tiles = [];
  for (let i = 0; i < counts.safe; i++) tiles.push({ type: 'safe' });
  for (let i = 0; i < counts.minor; i++) tiles.push({ type: 'minor', requiredFix: randomFix() });
  for (let i = 0; i < counts.major; i++) tiles.push({ type: 'major', requiredFix: randomFix() });
  for (let i = 0; i < counts.empty; i++) tiles.push({ type: 'empty' });
  // Shuffle
  for (let i = tiles.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [tiles[i], tiles[j]] = [tiles[j], tiles[i]];
  }
  // 2. Place into 2D array
  const board = [];
  for (let row = 0; row < BOARD_SIZE; row++) {
    board[row] = [];
    for (let col = 0; col < BOARD_SIZE; col++) {
      const tile = tiles[row * BOARD_SIZE + col];
      board[row][col] = {
        ...tile,
        status: 'hidden', // or 'revealed'
        adjacentChurn: 0, // to be calculated
        row,
        col,
      };
    }
  }
  // 3. Calculate adjacent churn counts for safe tiles
  for (let row = 0; row < BOARD_SIZE; row++) {
    for (let col = 0; col < BOARD_SIZE; col++) {
      if (board[row][col].type === 'safe') {
        let count = 0;
        for (let dr = -1; dr <= 1; dr++) {
          for (let dc = -1; dc <= 1; dc++) {
            if (dr === 0 && dc === 0) continue;
            const nr = row + dr, nc = col + dc;
            if (nr >= 0 && nr < BOARD_SIZE && nc >= 0 && nc < BOARD_SIZE) {
              if (board[nr][nc].type === 'minor' || board[nr][nc].type === 'major') count++;
            }
          }
        }
        board[row][col].adjacentChurn = count;
      }
    }
  }
  return board;
}

function renderGrid() {
  const board = document.getElementById('game-board');
  board.innerHTML = '';
  for (let row = 0; row < BOARD_SIZE; row++) {
    for (let col = 0; col < BOARD_SIZE; col++) {
      const tile = boardState[row][col];
      const div = document.createElement('div');
      div.className = 'tile';
      div.dataset.row = row;
      div.dataset.col = col;
      if (tile.status === 'revealed') {
        div.classList.add('revealed');
        if (tile.type === 'safe') {
          div.textContent = tile.adjacentChurn > 0 ? tile.adjacentChurn : '';
        } else if (tile.type === 'minor' || tile.type === 'major') {
          div.innerHTML = `<span>${tile.type === 'minor' ? '⚠️' : '🚨'}</span><br><small>${tile.requiredFix}</small>`;
        } else if (tile.type === 'empty') {
          div.textContent = '';
        }
      }
      div.addEventListener('click', onTileClick);
      board.appendChild(div);
    }
  }
}

function onTileClick(e) {
  const row = parseInt(e.currentTarget.dataset.row);
  const col = parseInt(e.currentTarget.dataset.col);
  const tile = boardState[row][col];
  if (tile.status === 'revealed') return;
  if (tile.type === 'safe') {
    tile.status = 'revealed';
    renderGrid();
  } else if (tile.type === 'minor' || tile.type === 'major') {
    if (!selectedTool) {
      alert('Please select a tool first!');
      return;
    }
    if (selectedTool === tile.requiredFix) {
      tile.status = 'revealed';
      if (tile.type === 'minor') {
        arr += 10000;
        churn = Math.max(0, churn - 5);
      } else {
        arr += 25000;
        churn = Math.max(0, churn - 10);
      }
    } else {
      tile.status = 'revealed';
      if (tile.type === 'minor') {
        churn += 10;
      } else {
        churn += 25;
      }
    }
    updateUI();
    renderGrid();
    checkGameEnd();
  } else if (tile.type === 'empty') {
    tile.status = 'revealed';
    renderGrid();
  }
}

function updateUI() {
  document.getElementById('arr-counter').textContent = `ARR: $${arr}`;
  document.getElementById('churn-meter').textContent = `Churn: ${churn}%`;
}

function checkGameEnd() {
  if (arr >= 1000000) {
    showEndModal(true);
  } else if (churn >= 100) {
    showEndModal(false);
  }
}

function showEndModal(isWin) {
  const modal = document.createElement('div');
  modal.className = 'end-modal';
  modal.innerHTML = `
    <div class="end-modal-content">
      <h2>${isWin ? 'You Win!' : 'Game Over'}</h2>
      <p>ARR: $${arr}</p>
      <p>Churn: ${churn}%</p>
      <button id="play-again">Play Again</button>
      <button id="daily-challenge">Daily Challenge</button>
    </div>
  `;
  document.body.appendChild(modal);
  document.getElementById('play-again').addEventListener('click', () => {
    document.body.removeChild(modal);
    resetGame();
  });
  document.getElementById('daily-challenge').addEventListener('click', () => {
    document.body.removeChild(modal);
    resetGame(true);
  });
}

function resetGame(isDaily = false) {
  arr = 0;
  churn = 0;
  selectedTool = null;
  boardState = generateBoard();
  renderGrid();
  updateUI();
  document.querySelectorAll('.tool').forEach(t => t.classList.remove('selected'));
}

function createToolbelt() {
  const bar = document.getElementById('toolbelt-bar');
  bar.innerHTML = '';
  TOOLBELT.forEach((tool, idx) => {
    const btn = document.createElement('button');
    btn.className = 'tool';
    btn.innerHTML = `<span>${tool.icon}</span> <span>${tool.name}</span>`;
    btn.dataset.tool = tool.name;
    btn.addEventListener('click', () => {
      selectedTool = tool.name;
      document.querySelectorAll('.tool').forEach(t => t.classList.remove('selected'));
      btn.classList.add('selected');
    });
    bar.appendChild(btn);
  });
}

window.addEventListener('DOMContentLoaded', () => {
  boardState = generateBoard();
  renderGrid();
  createToolbelt();
  updateUI();
}); 
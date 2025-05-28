// --- Churn Sweeper: Board Generation & Tile Logic ---

const BOARD_SIZE = 10;
const TILE_TYPES = [
  { type: 'safe', weight: 0.5 },
  { type: 'minor', weight: 0.35 },
  { type: 'major', weight: 0.1 },
  { type: 'empty', weight: 0.05 },
];

const CHURN_EVENTS = {
  'Discount': [
    "It's too expensive.",
    "We're cutting costs this quarter.",
    "We didn't get ROI fast enough.",
    "Freemium competitor is good enough.",
    "Budget didn't get approved.",
    "Pricing doesn't scale with our usage.",
    "Your per-seat model is killing us.",
    "Renewal came up faster than expected.",
    "The CFO said no.",
    "We only needed it for a short-term project.",
    "Annual plan is too much up front.",
    "Our revenue dropped — cutting SaaS tools.",
    "Another vendor offered a better deal.",
    "We didn't use it enough to justify the cost.",
    "You raised prices without warning.",
    "We're pausing spend while fundraising.",
    "We couldn't get our team onboarded in time to justify renewal.",
    "We didn't know we were paying this much.",
    "We thought we were still in the trial.",
    "We meant to cancel before the billing cycle."
  ],
  'Support': [
    "We couldn't get help when we needed it.",
    "Support response time was too slow.",
    "It took too long to resolve issues.",
    "I never heard back from the team.",
    "We needed a live demo, never got one.",
    "Too much back and forth just to fix a small thing.",
    "Our onboarding rep disappeared.",
    "I couldn't get in touch with anyone.",
    "The documentation wasn't enough.",
    "We didn't understand how to use it.",
    "Nobody walked us through setup.",
    "Our team got stuck setting it up.",
    "There was no help for our integration.",
    "We hit a wall and couldn't get answers.",
    "Customer success was MIA.",
    "No one helped us activate our account.",
    "Our internal champion left and we got lost.",
    "Support tickets kept bouncing between teams.",
    "You only offered email support.",
    "We felt abandoned."
  ],
  'Feature Ship': [
    "It's missing the one feature we needed.",
    "Doesn't support our workflow.",
    "You don't integrate with our CRM.",
    "There's no analytics.",
    "We can't customize it.",
    "You don't support multi-user roles.",
    "The reporting is too basic.",
    "Can't export data easily.",
    "We needed API access.",
    "We outgrew the feature set.",
    "Your competitor has more advanced options.",
    "There's no mobile version.",
    "There's no sandbox/test mode.",
    "You don't support SSO.",
    "Missing key compliance features.",
    "No white-labeling available.",
    "We needed localization/multilingual support.",
    "We wanted dashboards for execs.",
    "No version history or audit log.",
    "We needed real-time alerts."
  ],
  'Bug Fix': [
    "Too many bugs.",
    "It kept breaking during peak hours.",
    "App was crashing constantly.",
    "Data wasn't syncing correctly.",
    "Downtime was unacceptable.",
    "Notifications didn't work.",
    "Our users kept reporting issues.",
    "We lost data.",
    "Reports weren't accurate.",
    "We kept getting error messages.",
    "It froze in our browser.",
    "Couldn't connect to Stripe.",
    "Slow loading times.",
    "Feature broke after an update.",
    "Mobile app was glitchy.",
    "Permissions didn't apply correctly.",
    "It wiped out our settings.",
    "Couldn't upload files.",
    "We had to manually reset everything.",
    "Fixes never stuck."
  ],
  'Dunning Email': [
    "Our card expired.",
    "We meant to update billing info.",
    "We missed your payment reminders.",
    "Charge failed and we never noticed.",
    "We switched banks and forgot.",
    "Didn't realize we got suspended.",
    "We got locked out after a failed payment.",
    "Never got an invoice.",
    "Didn't know renewal was automatic.",
    "No receipt or proof of payment.",
    "There was a billing mismatch.",
    "We never got the Stripe notification.",
    "Card was flagged as fraud.",
    "We thought we had canceled.",
    "Failed payment disabled our access.",
    "Finance never saw the charge.",
    "Subscription lapsed without warning.",
    "We were double billed.",
    "Accounting flagged this as unknown vendor.",
    "We forgot to whitelist your billing address."
  ]
};

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
let isMuted = false;

class MusicManager {
  constructor() {
    this.synth = null;
    this.bassSynth = null;
    this.leadSynth = null;
    this.drumSynth = null;
    this.isPlaying = false;
    this.initialized = false;
  }

  async initialize() {
    if (this.initialized) return;
    
    try {
      await Tone.start();
      
      // Main synth - bright, bouncy
      this.synth = new Tone.PolySynth(Tone.Synth, {
        oscillator: {
          type: "square"
        },
        envelope: {
          attack: 0.05,
          decay: 0.2,
          sustain: 0.3,
          release: 0.4
        }
      }).toDestination();

      // Bass synth - punchy
      this.bassSynth = new Tone.PolySynth(Tone.Synth, {
        oscillator: {
          type: "square"
        },
        envelope: {
          attack: 0.01,
          decay: 0.1,
          sustain: 0.2,
          release: 0.2
        }
      }).toDestination();

      // Lead synth - bright and playful
      this.leadSynth = new Tone.PolySynth(Tone.Synth, {
        oscillator: {
          type: "sawtooth"
        },
        envelope: {
          attack: 0.02,
          decay: 0.1,
          sustain: 0.2,
          release: 0.2
        }
      }).toDestination();

      // Drum synth - snappy
      this.drumSynth = new Tone.NoiseSynth({
        noise: {
          type: "white"
        },
        envelope: {
          attack: 0.001,
          decay: 0.1,
          sustain: 0
        }
      }).toDestination();

      this.initialized = true;
      console.log('Music manager initialized');
    } catch (error) {
      console.error('Failed to initialize music manager:', error);
    }
  }

  generateMenuPattern() {
    // Fun, bouncy chord progression
    const chordProgressions = [
      ['C4', 'E4', 'G4'], // C major
      ['G3', 'B3', 'D4'], // G major
      ['A3', 'C4', 'E4'], // A minor
      ['F3', 'A3', 'C4']  // F major
    ];
    
    // Generate main chords
    const mainNotes = [];
    for (let i = 0; i < 8; i++) {
      const chord = chordProgressions[i % chordProgressions.length];
      mainNotes.push(chord);
    }

    // Generate bass line (bouncy)
    const bassNotes = [];
    for (let i = 0; i < 16; i++) {
      const chord = chordProgressions[Math.floor(i / 4) % chordProgressions.length];
      if (i % 2 === 0) {
        bassNotes.push(chord[0].replace('4', '2')); // Root note
      } else {
        bassNotes.push(chord[2].replace('4', '2')); // Fifth note
      }
    }

    // Generate lead melody (catchy and playful)
    const leadNotes = [];
    const leadPattern = [
      'C5', 'E5', 'G5', 'E5',
      'C5', 'E5', 'G5', 'E5',
      'A4', 'C5', 'E5', 'C5',
      'G4', 'B4', 'D5', 'B4'
    ];
    leadNotes.push(...leadPattern);

    // Generate drum pattern (energetic)
    const drumPattern = [];
    for (let i = 0; i < 16; i++) {
      if (i % 4 === 0) {
        drumPattern.push(1); // Kick on 1
      } else if (i % 2 === 0) {
        drumPattern.push(0.8); // Kick on 3
      } else {
        drumPattern.push(0.6); // Snare on 2 and 4
      }
    }

    return { mainNotes, bassNotes, leadNotes, drumPattern };
  }

  async play() {
    if (this.isPlaying) return;
    
    if (!this.initialized) {
      await this.initialize();
    }

    try {
      const { mainNotes, bassNotes, leadNotes, drumPattern } = this.generateMenuPattern();
      
      // Set upbeat tempo (120-130 BPM)
      Tone.Transport.bpm.value = Math.floor(Math.random() * 10) + 120;

      // Main chords
      this.sequence = new Tone.Sequence(
        (time, chord) => {
          this.synth.triggerAttackRelease(chord, "4n", time);
        },
        mainNotes,
        "4n"
      );

      // Bass line
      this.bassSequence = new Tone.Sequence(
        (time, note) => {
          this.bassSynth.triggerAttackRelease(note, "8n", time);
        },
        bassNotes,
        "8n"
      );

      // Lead melody
      this.leadSequence = new Tone.Sequence(
        (time, note) => {
          this.leadSynth.triggerAttackRelease(note, "8n", time);
        },
        leadNotes,
        "8n"
      );

      // Drum pattern
      this.drumSequence = new Tone.Sequence(
        (time, hit) => {
          if (hit > 0) {
            this.drumSynth.triggerAttackRelease("16n", time, hit);
          }
        },
        drumPattern,
        "16n"
      );

      // Start all sequences
      this.sequence.start(0);
      this.bassSequence.start(0);
      this.leadSequence.start(0);
      this.drumSequence.start(0);
      Tone.Transport.start();
      
      this.isPlaying = true;
      console.log('Music started playing');
    } catch (error) {
      console.error('Failed to play music:', error);
    }
  }

  stop() {
    if (!this.isPlaying) return;
    
    try {
      if (this.sequence) {
        this.sequence.stop();
        this.sequence.dispose();
      }
      if (this.bassSequence) {
        this.bassSequence.stop();
        this.bassSequence.dispose();
      }
      if (this.leadSequence) {
        this.leadSequence.stop();
        this.leadSequence.dispose();
      }
      if (this.drumSequence) {
        this.drumSequence.stop();
        this.drumSequence.dispose();
      }
      Tone.Transport.stop();
      this.isPlaying = false;
      console.log('Music stopped');
    } catch (error) {
      console.error('Failed to stop music:', error);
    }
  }

  toggle() {
    if (this.isPlaying) {
      this.stop();
    } else {
      this.play();
    }
  }
}

const musicManager = new MusicManager();

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

function randomChurnEvent(solution) {
  const events = CHURN_EVENTS[solution];
  return events[Math.floor(Math.random() * events.length)];
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
  for (let i = 0; i < counts.minor; i++) {
    const solution = TOOLBELT[Math.floor(Math.random() * TOOLBELT.length)].name;
    tiles.push({ 
      type: 'minor', 
      requiredFix: solution,
      churnEvent: randomChurnEvent(solution)
    });
  }
  for (let i = 0; i < counts.major; i++) {
    const solution = TOOLBELT[Math.floor(Math.random() * TOOLBELT.length)].name;
    tiles.push({ 
      type: 'major', 
      requiredFix: solution,
      churnEvent: randomChurnEvent(solution)
    });
  }
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
          div.innerHTML = `
            <span>${tile.type === 'minor' ? '⚠️' : '🚨'}</span>
            <div class="churn-event">${tile.churnEvent}</div>
            <div class="required-fix">${tile.requiredFix}</div>
          `;
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
    // Show tool selection dialog first
    const dialog = document.createElement('div');
    dialog.className = 'tool-selection-dialog';
    dialog.innerHTML = `
      <div class="dialog-content">
        <h3>Select a tool to handle this churn:</h3>
        <div class="tool-buttons"></div>
      </div>
    `;
    
    // Add tool buttons
    const toolButtons = dialog.querySelector('.tool-buttons');
    TOOLBELT.forEach(tool => {
      const btn = document.createElement('button');
      btn.className = 'tool-selection-btn';
      btn.innerHTML = `<span>${tool.icon}</span> <span>${tool.name}</span>`;
      btn.addEventListener('click', () => {
        // Remove dialog
        document.body.removeChild(dialog);
        
        // Now reveal the tile and show the result
        tile.status = 'revealed';
        renderGrid();
        
        // Show result message
        const resultDialog = document.createElement('div');
        resultDialog.className = 'tool-selection-dialog';
        resultDialog.innerHTML = `
          <div class="dialog-content">
            <h3>${tool.name === tile.requiredFix ? 'Correct!' : 'Wrong!'}</h3>
            <div class="churn-event">${tile.churnEvent}</div>
            <div class="result-message">
              ${tool.name === tile.requiredFix 
                ? `You chose the right tool! ${tile.type === 'minor' ? '+$10,000 ARR' : '+$25,000 ARR'}`
                : `This churn required: ${tile.requiredFix}`}
            </div>
            <button class="close-btn">Continue</button>
          </div>
        `;
        
        // Add close button handler
        resultDialog.querySelector('.close-btn').addEventListener('click', () => {
          document.body.removeChild(resultDialog);
        });
        
        document.body.appendChild(resultDialog);
        
        // Update game state
        if (tool.name === tile.requiredFix) {
          if (tile.type === 'minor') {
            arr += 10000;
            churn = Math.max(0, churn - 5);
          } else {
            arr += 25000;
            churn = Math.max(0, churn - 10);
          }
        } else {
          if (tile.type === 'minor') {
            churn += 10;
          } else {
            churn += 25;
          }
        }
        
        updateUI();
        checkGameEnd();
      });
      toolButtons.appendChild(btn);
    });
    
    document.body.appendChild(dialog);
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
  // Generate new random song on game reset
  if (!isMuted) {
    musicManager.stop();
    musicManager.play();
  }
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

function toggleMute() {
  isMuted = !isMuted;
  const muteBtn = document.getElementById('mute-toggle');
  muteBtn.textContent = isMuted ? '🔇' : '🔊';
  if (isMuted) {
    musicManager.stop();
  } else {
    musicManager.play();
  }
}

window.addEventListener('DOMContentLoaded', () => {
  boardState = generateBoard();
  renderGrid();
  createToolbelt();
  updateUI();
  
  // Initialize music on first user interaction
  document.addEventListener('click', async () => {
    if (!isMuted && !musicManager.isPlaying) {
      await musicManager.play();
    }
  }, { once: true });

  // Initialize mute toggle
  document.getElementById('mute-toggle').addEventListener('click', async () => {
    isMuted = !isMuted;
    const muteBtn = document.getElementById('mute-toggle');
    muteBtn.textContent = isMuted ? '🔇' : '🔊';
    if (isMuted) {
      musicManager.stop();
    } else {
      await musicManager.play();
    }
  });
}); 
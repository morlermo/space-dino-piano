#!/usr/bin/env node

const blessed = require('blessed');
const { exec, execSync } = require('child_process');
const { promisify } = require('util');

const execAsync = promisify(exec);

// Note frequencies for audio synthesis
const NOTE_FREQUENCIES = {
  'C4': 261.63, 'C#4': 277.18, 'D4': 293.66, 'D#4': 311.13,
  'E4': 329.63, 'F4': 349.23, 'F#4': 369.99, 'G4': 392.00,
  'G#4': 415.30, 'A4': 440.00, 'A#4': 466.16, 'B4': 493.88,
  'C5': 523.25, 'D5': 587.33, 'E5': 659.25, 'A3': 220.00
};

// Keyboard to note mappings
const KEY_MAP = {
  'a': 'C4', 's': 'D4', 'd': 'E4', 'f': 'F4',
  'g': 'G4', 'h': 'A4', 'j': 'B4', 'k': 'C5',
  'w': 'C#4', 'e': 'D#4', 't': 'F#4', 
  'y': 'G#4', 'u': 'A#4'
};

const STORY_SEQUENCES = [
  "🦕 Rex: 'Welcome aboard, Space Cadet! I'm Rex Rhythmo!'",
  "🦕 Rex: 'The Silent Void has stolen all music from the galaxy!'",
  "🦖 Trixie: 'We need YOUR help to power our Musical Spaceship!'",
  "🦕 Rex: 'Each note you play generates cosmic fuel!'",
  "🦖 Trixie: 'Let's start with the Launch Sequence - the C Major Scale!'",
  "🦕 Rex: 'Use keys A-S-D-F-G-H-J-K for white notes!'"
];

const LESSONS = [
  {
    name: "🚀 Fuel Note Training",
    notes: ['C4', 'D4', 'E4', 'F4', 'G4', 'A4', 'B4', 'C5'],
    instruction: "Play each fuel note as it appears! (A-S-D-F-G-H-J-K)",
    reward: 20
  },
  {
    name: "⭐ Launch Code: Twinkle Twinkle",
    notes: ['C4', 'C4', 'G4', 'G4', 'A4', 'A4', 'G4'],
    instruction: "Play the ancient launch code melody!",
    reward: 30
  },
  {
    name: "🌙 Return Journey",
    notes: ['C5', 'B4', 'A4', 'G4', 'F4', 'E4', 'D4', 'C4'],
    instruction: "Navigate back through the scale!",
    reward: 25
  },
  {
    name: "🎵 Mary's Space Lamb",
    notes: ['E4', 'D4', 'C4', 'D4', 'E4', 'E4', 'E4'],
    instruction: "Mary had a little space lamb!",
    reward: 35
  }
];

// Check if sox is available
let hasSox = false;
try {
  execSync('which sox', { stdio: 'ignore' });
  hasSox = true;
} catch (e) {
  hasSox = false;
}

// Audio manager for sox
class AudioManager {
  static playNote(note, duration = 0.2) {
    const freq = NOTE_FREQUENCIES[note] || 440;
    
    if (hasSox) {
      // Use play command directly for macOS, sox for others
      // Remove stderr redirection, just use quiet flag
      const soxCommand = process.platform === 'darwin' 
        ? `play -q -n synth ${duration} pluck ${freq} vol 0.3`
        : `sox -q -n -d synth ${duration} pluck ${freq} vol 0.3`;
      
      // Execute in background using spawn for better control
      const { spawn } = require('child_process');
      const child = spawn('sh', ['-c', soxCommand], {
        detached: true,
        stdio: 'ignore'
      });
      child.unref(); // Allow the parent to exit independently
    } else {
      // System beep fallback
      process.stdout.write('\x07');
    }
  }
  
  static playSuccess() {
    const notes = ['C4', 'E4', 'G4', 'C5'];
    let delay = 0;
    notes.forEach(note => {
      setTimeout(() => {
        this.playNote(note, 0.15);
      }, delay);
      delay += 120;
    });
  }
  
  static playError() {
    this.playNote('A3', 0.3);
  }
}

// Game state
let gameState = {
  score: 0,
  fuel: 0,
  combo: 0,
  currentLesson: -1,
  storyIndex: 0,
  isPlaying: false,
  currentNote: null,
  expectedNotes: [],
  message: 'Press SPACE to begin your adventure!',
  feedbackType: 'info',
  keyPressTime: 0
};

// Create screen with better settings
const screen = blessed.screen({
  smartCSR: true,
  title: 'Space Dino Piano 🦕🚀🎹',
  fullUnicode: true,
  forceUnicode: true,
  cursor: {
    artificial: true,
    blink: false,
    shape: 'underline'
  },
  // Important: Enable proper input handling
  input: process.stdin,
  output: process.stdout,
  terminal: 'xterm-256color',
  sendFocus: true,
  warnings: false
});

// Set background gradient effect
screen.style = {
  bg: '#111122',
  fg: 'white'
};

// Title with animated gradient effect
const titleBox = blessed.box({
  top: 0,
  left: 'center',
  width: 'shrink',
  height: 3,
  content: '{center}{yellow-fg}{bold}╔═══════════════════════════════════════════════════╗\n' +
           '║  🦕 SPACE DINO PIANO: The Cosmic Symphony 🚀🎹  ║\n' +
           '╚═══════════════════════════════════════════════════╝{/bold}{/yellow-fg}{/center}',
  tags: true,
  align: 'center'
});

// Story panel with better styling
const storyBox = blessed.box({
  label: '{ 🚀 Mission Control }',
  top: 4,
  left: 0,
  width: '58%',
  height: 9,
  border: {
    type: 'line',
    fg: 'cyan'
  },
  style: {
    border: { fg: 'cyan' },
    label: { fg: 'cyan', bold: true }
  },
  scrollable: true,
  tags: true,
  padding: { left: 2, right: 2, top: 1, bottom: 1 },
  shadow: true
});

// Space view with animation
const spaceBox = blessed.box({
  label: '{ 🌌 Space View }',
  top: 13,
  left: 0,
  width: '58%',
  height: 11,
  border: {
    type: 'line',
    fg: '#4444ff'
  },
  style: {
    border: { fg: '#4444ff' },
    label: { fg: '#6666ff', bold: true },
    bg: '#000011'
  },
  tags: true,
  padding: { left: 2, right: 2, top: 1, bottom: 1 },
  shadow: true
});

// Stats panel with progress bars
const statsBox = blessed.box({
  label: '{ 📊 Stats }',
  top: 4,
  left: '60%',
  width: '40%',
  height: 9,
  border: {
    type: 'line',
    fg: 'green'
  },
  style: {
    border: { fg: 'green' },
    label: { fg: 'green', bold: true }
  },
  tags: true,
  padding: { left: 2, right: 2, top: 1, bottom: 1 },
  shadow: true
});

// Current lesson box
const lessonBox = blessed.box({
  label: '{ 📖 Current Lesson }',
  top: 13,
  left: '60%',
  width: '40%',
  height: 11,
  border: {
    type: 'line',
    fg: '#ff44ff'
  },
  style: {
    border: { fg: '#ff44ff' },
    label: { fg: '#ff88ff', bold: true }
  },
  tags: true,
  padding: { left: 2, right: 2, top: 1, bottom: 1 },
  shadow: true
});

// Piano keyboard with better visuals
const pianoBox = blessed.box({
  label: '{ 🎹 Space Piano Keyboard }',
  top: 24,
  left: 0,
  width: '100%',
  height: 10,
  border: {
    type: 'line',
    fg: 'magenta'
  },
  style: {
    border: { fg: 'magenta' },
    label: { fg: 'magenta', bold: true },
    bg: '#1a0033'
  },
  tags: true,
  padding: { left: 2, right: 2, top: 1, bottom: 1 },
  shadow: true
});

// Help text
const helpBox = blessed.box({
  top: 34,
  left: 0,
  width: '100%',
  height: 2,
  content: '{center}{#888888-fg}♪ Controls: [SPACE] Continue Story │ [ENTER] Start/Next Lesson │ [Q/ESC] Quit ♪\n' +
           '♫ Piano Keys: [A-K] White Keys │ [W,E,T,Y,U] Black Keys ♫{/#888888-fg}{/center}',
  tags: true,
  align: 'center'
});

// Add all boxes to screen
screen.append(titleBox);
screen.append(storyBox);
screen.append(spaceBox);
screen.append(statsBox);
screen.append(lessonBox);
screen.append(pianoBox);
screen.append(helpBox);

// Update functions
function updateStory() {
  const currentStory = STORY_SEQUENCES[Math.min(gameState.storyIndex, STORY_SEQUENCES.length - 1)];
  const messageColor = gameState.feedbackType === 'success' ? 'green' : 
                       gameState.feedbackType === 'error' ? 'red' : 'yellow';
  
  storyBox.setContent(
    `{bold}${currentStory}{/bold}\n\n` +
    `{${messageColor}-fg}{bold}➤ ${gameState.message}{/bold}{/${messageColor}-fg}`
  );
}

function updateStats() {
  const scoreBar = '█'.repeat(Math.min(20, Math.floor(gameState.score / 50)));
  const fuelBar = '█'.repeat(Math.floor(gameState.fuel / 5));
  const comboStars = '⭐'.repeat(Math.min(5, gameState.combo));
  
  statsBox.setContent(
    `{bold}{yellow-fg}🎯 Score:{/yellow-fg}{/bold} ${gameState.score}\n` +
    `   {#444444-fg}[{/#444444-fg}{yellow-fg}${scoreBar.padEnd(20, '░')}{/yellow-fg}{#444444-fg}]{/#444444-fg}\n\n` +
    `{bold}{blue-fg}⛽ Fuel:{/blue-fg}{/bold} ${gameState.fuel}%\n` +
    `   {#444444-fg}[{/#444444-fg}{blue-fg}${fuelBar.padEnd(20, '░')}{/blue-fg}{#444444-fg}]{/#444444-fg}\n\n` +
    `{bold}{red-fg}🔥 Combo:{/red-fg}{/bold} x${gameState.combo} ${comboStars}`
  );
}

function updateLesson() {
  if (gameState.currentLesson >= 0 && gameState.currentLesson < LESSONS.length) {
    const lesson = LESSONS[gameState.currentLesson];
    const progress = lesson.notes.length - gameState.expectedNotes.length;
    const total = lesson.notes.length;
    const progressBar = '♪'.repeat(progress) + '♫'.repeat(gameState.expectedNotes.length);
    
    lessonBox.setContent(
      `{bold}{cyan-fg}Current:{/cyan-fg}{/bold}\n${lesson.name}\n\n` +
      `{bold}{green-fg}Progress:{/green-fg}{/bold} ${progress}/${total}\n` +
      `{magenta-fg}${progressBar}{/magenta-fg}\n\n` +
      `{bold}{yellow-fg}Reward:{/yellow-fg}{/bold} +${lesson.reward}% Fuel\n\n` +
      `{#888888-fg}${lesson.instruction}{/#888888-fg}`
    );
  } else {
    lessonBox.setContent(
      `{center}{#666666-fg}No lesson active\n\n` +
      `Press {bold}ENTER{/bold} to start\n` +
      `your first lesson!{/#666666-fg}{/center}`
    );
  }
}

function updateSpace() {
  const frame = Date.now() / 500;
  const stars1 = Math.sin(frame) > 0 ? '✨     ⭐    ✨         🌟' : '   🌟    ✨     ⭐     ✨';
  const stars2 = Math.sin(frame + 1) > 0 ? '      ⭐        ✨   🌟   ' : '  ✨      🌟        ⭐    ';
  const flames = gameState.fuel > 0 ? (gameState.fuel > 50 ? '{red-fg}🔥🔥🔥{/red-fg}' : '{yellow-fg}🔥🔥{/yellow-fg}') : '';
  const rocketY = gameState.fuel >= 100 ? 0 : 2;
  
  let spaceContent = `{blue-fg}${stars1}{/blue-fg}\n`;
  spaceContent += `{blue-fg}${stars2}{/blue-fg}\n`;
  for (let i = 0; i < rocketY; i++) {
    spaceContent += '\n';
  }
  if (gameState.fuel >= 100) {
    spaceContent += '{bold}{yellow-fg}      🚀 LAUNCHED!{/yellow-fg}{/bold}\n';
  } else {
    spaceContent += '{white-fg}        🚀{/white-fg}\n';
  }
  spaceContent += '{#666666-fg}       ╱ ╲{/#666666-fg}\n';
  spaceContent += '{#666666-fg}      ╱___╲{/#666666-fg}\n';
  spaceContent += `      ${flames}\n\n`;
  
  const fuelGauge = Array(20).fill('').map((_, i) => {
    if (i < gameState.fuel/5) {
      if (gameState.fuel >= 80) return '{green-fg}█{/green-fg}';
      if (gameState.fuel >= 40) return '{yellow-fg}█{/yellow-fg}';
      return '{red-fg}█{/red-fg}';
    }
    return '{#333333-fg}░{/#333333-fg}';
  }).join('');
  
  spaceContent += `{bold}Fuel:{/bold} [${fuelGauge}] ${gameState.fuel}%`;
  
  spaceBox.setContent(spaceContent);
}

function updatePiano() {
  const whiteKeys = ['C', 'D', 'E', 'F', 'G', 'A', 'B', 'C'];
  const blackKeys = ['C#', 'D#', '', 'F#', 'G#', 'A#'];
  const whiteBindings = ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K'];
  const blackBindings = ['W', 'E', '', 'T', 'Y', 'U'];
  const nextNote = gameState.expectedNotes[0] || null;
  
  let pianoContent = '';
  
  // Visual piano representation
  pianoContent += '{bold}{white-fg}┌─────┬─────┬─────┬─────┬─────┬─────┬─────┬─────┐{/white-fg}{/bold}\n';
  
  // Black keys row
  pianoContent += '{bold}{white-fg}│{/white-fg}{/bold}     ';
  blackKeys.forEach((key, i) => {
    if (key) {
      const isActive = gameState.currentNote?.includes(key);
      const color = isActive ? 'yellow' : '#333333';
      pianoContent += `{bold}{${color}-fg}│${blackBindings[i]}│{/${color}-fg}{/bold}   `;
    } else {
      pianoContent += '{white-fg}│{/white-fg}     ';
    }
  });
  pianoContent += '{white-fg}│{/white-fg}\n';
  
  // White keys row - top
  pianoContent += '{bold}{white-fg}│{/white-fg}{/bold}';
  whiteKeys.forEach((key, i) => {
    const noteKey = i === 7 ? 'C5' : key + '4';
    const isActive = gameState.currentNote === noteKey;
    const isNext = nextNote === noteKey;
    const timeSincePress = Date.now() - gameState.keyPressTime;
    
    let color = 'white';
    let bg = '';
    if (isActive && timeSincePress < 200) {
      color = 'black';
      bg = '-bg';
      pianoContent += `{cyan${bg}}{${color}-fg}  ${whiteBindings[i]}  {/${color}-fg}{/cyan${bg}}`;
    } else if (isNext) {
      pianoContent += `{green-fg}{bold}  ${whiteBindings[i]}  {/bold}{/green-fg}`;
    } else {
      pianoContent += `{white-fg}  ${whiteBindings[i]}  {/white-fg}`;
    }
    pianoContent += '{white-fg}│{/white-fg}';
  });
  pianoContent += '\n';
  
  // White keys row - bottom with note names
  pianoContent += '{bold}{white-fg}│{/white-fg}{/bold}';
  whiteKeys.forEach((key, i) => {
    const noteKey = i === 7 ? 'C5' : key + '4';
    const isActive = gameState.currentNote === noteKey;
    const isNext = nextNote === noteKey;
    
    if (isActive) {
      pianoContent += `{cyan-bg}{black-fg}  ${key}  {/black-fg}{/cyan-bg}`;
    } else if (isNext) {
      pianoContent += `{green-fg}{bold}  ${key}  {/bold}{/green-fg}`;
    } else {
      pianoContent += `{#666666-fg}  ${key}  {/#666666-fg}`;
    }
    pianoContent += '{white-fg}│{/white-fg}';
  });
  pianoContent += '\n';
  
  pianoContent += '{bold}{white-fg}└─────┴─────┴─────┴─────┴─────┴─────┴─────┴─────┘{/white-fg}{/bold}\n';
  
  // Show next note to play
  if (nextNote && gameState.isPlaying) {
    const keyToPress = Object.keys(KEY_MAP).find(k => KEY_MAP[k] === nextNote);
    pianoContent += `\n{center}{bold}{green-fg}♪ Next: ${nextNote} (Press ${keyToPress?.toUpperCase()}) ♪{/green-fg}{/bold}{/center}`;
  } else if (!gameState.isPlaying && gameState.currentLesson >= 0) {
    pianoContent += `\n{center}{yellow-fg}Press ENTER to continue the lesson{/yellow-fg}{/center}`;
  }
  
  pianoBox.setContent(pianoContent);
}

function updateDisplay() {
  updateStory();
  updateStats();
  updateSpace();
  updatePiano();
  updateLesson();
  screen.render();
}

// Game logic
function playNote(note) {
  // Play sound immediately - no await, no blocking
  AudioManager.playNote(note);
  
  // Update visual state immediately
  gameState.keyPressTime = Date.now();
  gameState.currentNote = note;
  updateDisplay();
  
  // Clear visual feedback after short delay
  setTimeout(() => {
    gameState.currentNote = null;
    updateDisplay();
  }, 200);
  
  // Check if in lesson
  if (gameState.isPlaying && gameState.expectedNotes.length > 0) {
    if (note === gameState.expectedNotes[0]) {
      // Correct note!
      const newCombo = gameState.combo + 1;
      const points = 10 * Math.max(1, Math.floor(newCombo * 1.5));
      gameState.score += points;
      gameState.fuel = Math.min(100, gameState.fuel + 5);
      gameState.combo = newCombo;
      gameState.expectedNotes = gameState.expectedNotes.slice(1);
      
      if (gameState.expectedNotes.length > 0) {
        gameState.message = `Perfect! +${points} points! Next: ${gameState.expectedNotes[0]}`;
      } else {
        gameState.message = '🎉 Lesson Complete! Amazing job!';
        AudioManager.playSuccess();
        setTimeout(nextLesson, 2000);
      }
      gameState.feedbackType = 'success';
    } else {
      // Wrong note
      AudioManager.playError();
      gameState.combo = 0;
      gameState.message = `Oops! Try again! Expected: ${gameState.expectedNotes[0]}`;
      gameState.feedbackType = 'error';
    }
    updateDisplay();
  }
}

function nextStory() {
  if (gameState.storyIndex < STORY_SEQUENCES.length) {
    gameState.storyIndex++;
    if (gameState.storyIndex === STORY_SEQUENCES.length) {
      gameState.message = 'Ready to save the galaxy? Press ENTER!';
    } else {
      gameState.message = 'Press SPACE to continue the story...';
    }
    updateDisplay();
  }
}

function startLesson() {
  if (gameState.currentLesson < LESSONS.length - 1) {
    gameState.currentLesson++;
    const lesson = LESSONS[gameState.currentLesson];
    
    gameState.expectedNotes = [...lesson.notes];
    gameState.isPlaying = true;
    gameState.combo = 0;
    gameState.message = `Starting: ${lesson.name}`;
    gameState.feedbackType = 'info';
    updateDisplay();
  }
}

function nextLesson() {
  const lesson = LESSONS[gameState.currentLesson];
  if (lesson) {
    gameState.fuel = Math.min(100, gameState.fuel + lesson.reward);
    gameState.isPlaying = false;
    gameState.message = 'Excellent! Ready for the next challenge?';
    gameState.feedbackType = 'success';
  }
  
  if (gameState.currentLesson >= LESSONS.length - 1) {
    gameState.fuel = 100;
    gameState.message = '🎊 MISSION COMPLETE! The galaxy is saved!';
    gameState.feedbackType = 'success';
  }
  updateDisplay();
}

// Keyboard input - Simple and direct
screen.key(['q', 'C-c', 'escape'], () => {
  process.exit(0);
});

screen.key('space', () => {
  nextStory();
});

screen.key('enter', () => {
  startLesson();
});

// Piano keys - individual key handlers for reliability
// White keys
screen.key('a', () => playNote('C4'));
screen.key('s', () => playNote('D4'));
screen.key('d', () => playNote('E4'));
screen.key('f', () => playNote('F4'));
screen.key('g', () => playNote('G4'));
screen.key('h', () => playNote('A4'));
screen.key('j', () => playNote('B4'));
screen.key('k', () => playNote('C5'));

// Black keys
screen.key('w', () => playNote('C#4'));
screen.key('e', () => playNote('D#4'));
screen.key('t', () => playNote('F#4'));
screen.key('y', () => playNote('G#4'));
screen.key('u', () => playNote('A#4'));

// Animation loop
setInterval(() => {
  updateSpace();
  screen.render();
}, 500);

// Main
async function main() {
  if (!hasSox) {
    const warnBox = blessed.message({
      parent: screen,
      top: 'center',
      left: 'center',
      width: '60%',
      height: 'shrink',
      border: 'line',
      style: {
        border: { fg: 'yellow' },
        label: { fg: 'yellow', bold: true }
      },
      label: '{ 🎵 Audio Setup }',
      tags: true,
      shadow: true
    });
    
    warnBox.display(
      '{center}{bold}{yellow-fg}Sox Audio Synthesizer Not Found{/yellow-fg}{/bold}{/center}\n\n' +
      'For the best experience with piano sounds, install Sox:\n\n' +
      '{cyan-fg}  macOS:{/cyan-fg}   brew install sox\n' +
      '{cyan-fg}  Linux:{/cyan-fg}   sudo apt-get install sox\n' +
      '{cyan-fg}  Windows:{/cyan-fg} Download from sox.sourceforge.net\n\n' +
      '{#888888-fg}Starting with basic system beep audio...{/#888888-fg}\n\n' +
      '{center}{bold}Press any key to start the game{/bold}{/center}',
      0,
      () => {
        updateDisplay();
      }
    );
  } else {
    updateDisplay();
  }
}

// Start the game
screen.render();
main().catch(console.error);
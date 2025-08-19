/// <reference types="@opentui/react/jsx-namespace" />
import React, { useState, useEffect, useCallback } from 'react';
import { render, useKeyboard, useRenderer } from '@opentui/react';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

// Note frequencies for audio synthesis
const NOTE_FREQUENCIES: Record<string, number> = {
  'C4': 261.63, 'C#4': 277.18, 'D4': 293.66, 'D#4': 311.13,
  'E4': 329.63, 'F4': 349.23, 'F#4': 369.99, 'G4': 392.00,
  'G#4': 415.30, 'A4': 440.00, 'A#4': 466.16, 'B4': 493.88,
  'C5': 523.25, 'D5': 587.33, 'E5': 659.25
};

// Keyboard to note mappings
const KEY_MAP: Record<string, string> = {
  'a': 'C4', 's': 'D4', 'd': 'E4', 'f': 'F4',
  'g': 'G4', 'h': 'A4', 'j': 'B4', 'k': 'C5',
  'w': 'C#4', 'e': 'D#4', 't': 'F#4', 
  'y': 'G#4', 'u': 'A#4'
};

interface Lesson {
  name: string;
  notes: string[];
  instruction: string;
  reward: number;
}

interface GameState {
  score: number;
  fuel: number;
  combo: number;
  currentLesson: number;
  storyIndex: number;
  isPlaying: boolean;
  currentNote: string | null;
  expectedNotes: string[];
  message: string;
  feedbackType: 'success' | 'error' | 'info';
}

const STORY_SEQUENCES = [
  "🦕 Rex: 'Welcome aboard, Space Cadet! I'm Rex Rhythmo!'",
  "🦕 Rex: 'The Silent Void has stolen all music from the galaxy!'",
  "🦖 Trixie: 'We need YOUR help to power our Musical Spaceship!'",
  "🦕 Rex: 'Each note you play generates cosmic fuel!'",
  "🦖 Trixie: 'Let's start with the Launch Sequence - the C Major Scale!'",
  "🦕 Rex: 'Use keys A-S-D-F-G-H-J-K for white notes!'"
];

const LESSONS: Lesson[] = [
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

// Audio manager for sox
class AudioManager {
  private static isPlaying = false;
  
  static async playNote(note: string, duration: number = 0.2) {
    if (this.isPlaying) return;
    
    const freq = NOTE_FREQUENCIES[note] || 440;
    this.isPlaying = true;
    
    try {
      // Use sox to generate a nice piano-like sound
      const soxCommand = `sox -n -d synth ${duration} pluck ${freq} fade 0 ${duration} ${duration * 0.5} trim 0 ${duration} 2>/dev/null`;
      exec(soxCommand, () => {
        this.isPlaying = false;
      });
    } catch (error) {
      // Fallback to system beep if sox isn't available
      process.stdout.write('\x07');
      this.isPlaying = false;
    }
  }
  
  static async playSuccess() {
    const notes = ['C4', 'E4', 'G4', 'C5'];
    for (const note of notes) {
      await this.playNote(note, 0.1);
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }
  
  static async playError() {
    await this.playNote('A3', 0.3);
  }
}

// Piano keyboard component
const PianoKeyboard = ({ activeNote, nextNote }: { activeNote: string | null; nextNote: string | null }) => {
  const whiteKeys = ['C', 'D', 'E', 'F', 'G', 'A', 'B', 'C'];
  const blackKeys = ['C#', 'D#', '', 'F#', 'G#', 'A#'];
  const whiteBindings = ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K'];
  const blackBindings = ['W', 'E', '', 'T', 'Y', 'U'];
  
  return (
    <box style={{ borderStyle: "round", borderColor: "magenta", padding: 1 }}>
      <group>
        <text style={{ bold: true }} fg="magenta">🎹 Space Piano</text>
        
        {/* Black keys row */}
        <box style={{ marginTop: 1 }}>
          <text>   </text>
          {blackKeys.map((key, i) => (
            <text key={`black-${i}`} fg={key && activeNote?.includes(key) ? "yellow" : "white"}>
              {key ? ` ${blackBindings[i]} ` : '   '}
            </text>
          ))}
        </box>
        
        {/* White keys row */}
        <box style={{ marginTop: 0 }}>
          <text>  </text>
          {whiteKeys.map((key, i) => {
            const noteKey = i === 7 ? 'C5' : key + '4';
            const isActive = activeNote === noteKey;
            const isNext = nextNote === noteKey;
            return (
              <text 
                key={`white-${i}`}
                fg={isActive ? "cyan" : isNext ? "green" : "white"}
                bg={isActive ? "blue" : undefined}
                style={{ bold: isActive || isNext }}
              >
                [{whiteBindings[i]}]
              </text>
            );
          })}
        </box>
        
        {/* Note labels */}
        <box style={{ marginTop: 0 }}>
          <text>  </text>
          {whiteKeys.map((key, i) => (
            <text key={`label-${i}`} style={{ dim: true }}> {key}  </text>
          ))}
        </box>
      </group>
    </box>
  );
};

// Space view with animated rocket
const SpaceView = ({ fuel, isLaunched }: { fuel: number; isLaunched: boolean }) => {
  const [frame, setFrame] = useState(0);
  
  useEffect(() => {
    const timer = setInterval(() => setFrame(f => f + 1), 500);
    return () => clearInterval(timer);
  }, []);
  
  const stars = frame % 2 === 0 ? '✨ ⭐ ✨    🌟' : '🌟 ✨ ⭐    ✨';
  const flames = fuel > 0 ? (fuel > 50 ? '🔥🔥🔥' : '🔥🔥') : '';
  const rocketY = isLaunched ? 1 : 3;
  
  return (
    <box style={{ borderStyle: "round", borderColor: "blue", padding: 1, height: 10 }}>
      <group>
        <text style={{ bold: true }} fg="blue">🌌 Space View</text>
        <text style={{ marginTop: 1 }}>{stars}</text>
        {Array(rocketY).fill(null).map((_, i) => (
          <text key={`space-${i}`}> </text>
        ))}
        <text>      🚀</text>
        <text>     ╱ ╲</text>
        <text>    ╱___╲</text>
        <text>    {flames}</text>
        <text style={{ marginTop: 1 }}>
          Fuel: [{Array(10).fill('').map((_, i) => i < fuel/10 ? '█' : '░').join('')}]
        </text>
      </group>
    </box>
  );
};

// Story panel
const StoryPanel = ({ story, message, feedbackType }: { story: string; message: string; feedbackType: string }) => {
  const messageColor = feedbackType === 'success' ? 'green' : feedbackType === 'error' ? 'red' : 'yellow';
  
  return (
    <box style={{ borderStyle: "round", borderColor: "cyan", padding: 1, height: 8 }}>
      <group>
        <text style={{ bold: true }} fg="cyan">🚀 Mission Control</text>
        <text style={{ marginTop: 1, wrap: true }}>{story}</text>
        <text style={{ marginTop: 1, wrap: true }} fg={messageColor}>{message}</text>
      </group>
    </box>
  );
};

// Stats panel
const StatsPanel = ({ score, fuel, combo, lesson }: { score: number; fuel: number; combo: number; lesson: number }) => {
  return (
    <box style={{ borderStyle: "round", borderColor: "green", padding: 1 }}>
      <group>
        <text style={{ bold: true }} fg="green">📊 Stats</text>
        <text style={{ marginTop: 1 }}>🎯 Score: {score}</text>
        <text>⛽ Fuel: {fuel}%</text>
        <text>🔥 Combo: x{combo}</text>
        <text>📖 Lesson: {lesson + 1}/{LESSONS.length}</text>
      </group>
    </box>
  );
};

// Main game component
const SpaceDinoPiano = () => {
  const renderer = useRenderer();
  const [gameState, setGameState] = useState<GameState>({
    score: 0,
    fuel: 0,
    combo: 0,
    currentLesson: -1,
    storyIndex: 0,
    isPlaying: false,
    currentNote: null,
    expectedNotes: [],
    message: 'Press SPACE to begin your adventure!',
    feedbackType: 'info'
  });

  const playNote = useCallback(async (note: string) => {
    // Play the sound
    await AudioManager.playNote(note);
    
    // Visual feedback
    setGameState(prev => ({ ...prev, currentNote: note }));
    setTimeout(() => {
      setGameState(prev => ({ ...prev, currentNote: null }));
    }, 200);
    
    // Check if in lesson
    if (gameState.isPlaying && gameState.expectedNotes.length > 0) {
      if (note === gameState.expectedNotes[0]) {
        // Correct note!
        const newCombo = gameState.combo + 1;
        const points = 10 * Math.max(1, newCombo);
        const newExpected = gameState.expectedNotes.slice(1);
        
        setGameState(prev => ({
          ...prev,
          score: prev.score + points,
          fuel: Math.min(100, prev.fuel + 5),
          combo: newCombo,
          expectedNotes: newExpected,
          message: newExpected.length > 0 
            ? `✅ Great! Next: ${newExpected[0]}` 
            : '🎉 Lesson Complete!',
          feedbackType: 'success'
        }));
        
        if (newExpected.length === 0) {
          AudioManager.playSuccess();
          setTimeout(() => nextLesson(), 2000);
        }
      } else {
        // Wrong note
        AudioManager.playError();
        setGameState(prev => ({
          ...prev,
          combo: 0,
          message: `❌ Try again! Expected: ${prev.expectedNotes[0]}`,
          feedbackType: 'error'
        }));
      }
    }
  }, [gameState.isPlaying, gameState.expectedNotes, gameState.combo]);

  const nextStory = useCallback(() => {
    if (gameState.storyIndex < STORY_SEQUENCES.length) {
      setGameState(prev => ({
        ...prev,
        storyIndex: prev.storyIndex + 1,
        message: prev.storyIndex === STORY_SEQUENCES.length - 1 
          ? 'Press ENTER to start your first lesson!' 
          : 'Press SPACE to continue...'
      }));
    }
  }, [gameState.storyIndex]);

  const startLesson = useCallback(() => {
    if (gameState.currentLesson < LESSONS.length - 1) {
      const lessonIndex = gameState.currentLesson + 1;
      const lesson = LESSONS[lessonIndex];
      
      setGameState(prev => ({
        ...prev,
        currentLesson: lessonIndex,
        expectedNotes: [...lesson.notes],
        isPlaying: true,
        combo: 0,
        message: `Starting: ${lesson.name}. Play: ${lesson.notes[0]}`,
        feedbackType: 'info'
      }));
    }
  }, [gameState.currentLesson]);

  const nextLesson = useCallback(() => {
    const lesson = LESSONS[gameState.currentLesson];
    if (lesson) {
      setGameState(prev => ({
        ...prev,
        fuel: Math.min(100, prev.fuel + lesson.reward),
        isPlaying: false,
        message: 'Great job! Press ENTER for the next challenge!',
        feedbackType: 'success'
      }));
    }
    
    if (gameState.currentLesson >= LESSONS.length - 1) {
      setGameState(prev => ({
        ...prev,
        fuel: 100,
        message: '🎊 CHAPTER COMPLETE! You\'ve mastered the launch sequence!',
        feedbackType: 'success'
      }));
    }
  }, [gameState.currentLesson]);

  // Handle keyboard input
  useKeyboard((event) => {
    const key = event.name || event.sequence;
    const ctrl = event.ctrl;
    
    if (key === 'escape' || key === 'q') {
      process.exit(0);
    } else if (key === 'space') {
      nextStory();
    } else if (key === 'return') {
      startLesson();
    } else if (KEY_MAP[key]) {
      playNote(KEY_MAP[key]);
    } else if (ctrl && key === 'c') {
      process.exit(0);
    }
  });

  const currentStory = STORY_SEQUENCES[Math.min(gameState.storyIndex, STORY_SEQUENCES.length - 1)];
  const nextNote = gameState.expectedNotes[0] || null;

  return (
    <group>
      <text style={{ bold: true }} fg="yellow">🦕 Space Dino Piano: The Cosmic Symphony 🚀</text>
      
      <box style={{ marginTop: 2, flexDirection: "row", gap: 1 }}>
        <group>
          <StoryPanel 
            story={currentStory} 
            message={gameState.message}
            feedbackType={gameState.feedbackType}
          />
          <box style={{ marginTop: 1 }}>
            <SpaceView fuel={gameState.fuel} isLaunched={gameState.fuel >= 100} />
          </box>
        </group>
        
        <box style={{ marginLeft: 2 }}>
          <StatsPanel 
            score={gameState.score}
            fuel={gameState.fuel}
            combo={gameState.combo}
            lesson={gameState.currentLesson}
          />
        </box>
      </box>
      
      <box style={{ marginTop: 1 }}>
        <PianoKeyboard activeNote={gameState.currentNote} nextNote={nextNote} />
      </box>
      
      <text style={{ marginTop: 1, dim: true }}>
        Controls: [SPACE] Story | [ENTER] Start Lesson | [Q] Quit
      </text>
    </group>
  );
};

// Check if sox is installed
async function checkSox(): Promise<boolean> {
  try {
    await execAsync('which sox');
    return true;
  } catch {
    return false;
  }
}

// Main app entry
async function main() {
  const hasSox = await checkSox();
  
  if (!hasSox) {
    console.log('🎵 Sox not found. Install it for better audio:');
    console.log('   macOS: brew install sox');
    console.log('   Linux: sudo apt-get install sox');
    console.log('   Windows: Download from http://sox.sourceforge.net\n');
    console.log('Starting with basic audio...\n');
    await new Promise(resolve => setTimeout(resolve, 3000));
  }

  render(<SpaceDinoPiano />);
}

main().catch(console.error);
# 🦕🚀 Space Dino Piano 🎹

> A fun, interactive terminal-based piano learning game for kids featuring space dinosaurs!

![GitHub stars](https://img.shields.io/github/stars/yourusername/space-dino-piano?style=social)
![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Node](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen)

## 🌟 What is Space Dino Piano?

Join Rex Rhythmo and Trixie Treble on an epic musical adventure through space! Learn piano basics while helping the dinosaurs power their spaceship with musical fuel to save the galaxy from the Silent Void.

### ✨ Features

- 🎮 **Story Mode**: Engaging narrative with lovable dinosaur characters
- 🎹 **Interactive Piano**: Use your keyboard as a piano
- 🎵 **Progressive Lessons**: Start with simple notes, advance to melodies
- 🏆 **Scoring System**: Track your progress with points and combos
- 🚀 **Visual Feedback**: Animated space scenes and rocket launches
- 🔊 **Audio Synthesis**: Real piano sounds (with Sox installed)
- 🎯 **Kid-Friendly**: Designed for ages 5+

## 🚀 Quick Start (Super Easy!)

### For macOS/Linux Users:

1. **Download the game**
   ```bash
   git clone https://github.com/yourusername/space-dino-piano.git
   cd space-dino-piano
   ```

2. **Run the setup** (only needed once)
   ```bash
   bash setup.sh
   ```

3. **Play the game!**
   ```bash
   ./play.sh
   ```
   Or:
   ```bash
   npm start
   ```

### For Windows Users:

1. **Download the game**
   - Click the green "Code" button above
   - Select "Download ZIP"
   - Extract the ZIP file

2. **Install Node.js** (if you don't have it)
   - Go to [nodejs.org](https://nodejs.org)
   - Download and install the LTS version

3. **Setup the game**
   - Open Command Prompt or PowerShell
   - Navigate to the game folder
   - Run:
   ```cmd
   npm install
   npm run build
   ```

4. **Play!**
   ```cmd
   npm start
   ```

## 🎮 How to Play

### Keyboard Controls

```
Piano Keys:
  A S D F G H J K  = White keys (C D E F G A B C)
    W E   T Y U    = Black keys (C# D# F# G# A#)

Game Controls:
  SPACE  = Continue story
  ENTER  = Start/next lesson
  Q/ESC  = Quit game
```

### Game Flow

1. **Story Introduction**: Meet the space dinosaurs
2. **Learn the Keys**: Practice individual notes
3. **Play Melodies**: Complete songs to fuel the rocket
4. **Launch to Space**: Fill your fuel tank to 100%!

## 📚 Lessons

### Chapter 1: Launch Sequence
- **Lesson 1**: C Major Scale (fuel notes)
- **Lesson 2**: Twinkle Twinkle Little Star
- **Lesson 3**: Descending Scale
- **Lesson 4**: Mary Had a Little Lamb

*More chapters coming soon!*

## 🔧 Troubleshooting

### "Command not found" error
Make sure Node.js is installed:
```bash
node --version  # Should show v18.0.0 or higher
```

### No sound or beeps only
Install Sox for better audio:
- **macOS**: `brew install sox`
- **Linux**: `sudo apt-get install sox`
- **Windows**: Download from [sox.sourceforge.net](http://sox.sourceforge.net)

### Screen looks weird
Make sure your terminal window is at least 80x24 characters

### Game won't start
Try rebuilding:
```bash
npm install
npm run build
npm start
```

## 🎯 Tips for Parents/Teachers

- **Practice Mode**: Let kids explore the keyboard freely before starting lessons
- **Repeat Lessons**: Each lesson can be replayed for practice
- **Celebrate Success**: The game rewards progress with animations and sounds
- **Take Breaks**: Sessions of 10-15 minutes work best for young learners

## 🛠️ Advanced Options

### Development Mode
For live reloading during development:
```bash
npm run dev
```

### Custom Songs
Add new songs by editing the `LESSONS` array in `src/space-dino-piano.js`

### MIDI Keyboard Support
Connect a USB MIDI keyboard for a more realistic piano experience! (Coming in v3.0)

## 📁 Project Structure

```
space-dino-piano/
├── src/
│   └── space-dino-piano.js   # Main game code
├── dist/                     # Built game files
├── package.json              # Project configuration
├── tsconfig.json             # TypeScript configuration
├── setup.sh                  # Setup script
├── play.sh                   # Quick play script
└── README.md                 # This file
```

## 🤝 Contributing

We welcome contributions! Ideas for new features:
- More dinosaur characters
- Additional songs and lessons
- Different space worlds to explore
- Multiplayer duet mode
- Recording and playback features

## 📝 License

This project is MIT licensed - feel free to use it for educational purposes!

## 🙏 Credits

- Built with [OpenTUI](https://github.com/sst/opentui) for terminal UI
- Audio synthesis powered by [Sox](http://sox.sourceforge.net)
- Created with ❤️ for young musicians everywhere

## 🎉 Fun Facts

- Rex Rhythmo's favorite note is C (for Cretaceous!)
- Trixie Treble can hit notes higher than most pterodactyls can fly
- The Silent Void is actually just shy and needs music to come out of hiding
- Every note you play helps a star shine brighter in the game's galaxy

---

**Ready to save the galaxy with music? Let's play!** 🦕🚀🎹

*Having fun? Star this repo to help other space cadets find the game!

#!/bin/bash

# Simple script to play Space Dino Piano

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Check if game is built
if [ ! -d "dist" ]; then
    echo -e "${YELLOW}First time running? Setting up the game...${NC}"
    bash setup.sh
fi

# Clear screen for better experience
clear

# ASCII art splash
echo "
    🦕🚀 SPACE DINO PIANO 🚀🦕
         The Cosmic Symphony
    
       Press any key to start...
"

read -n 1 -s

# Run the game
node src/space-dino-piano.js

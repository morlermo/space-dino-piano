#!/bin/bash

# Space Dino Piano Setup Script
# This script sets up everything needed to run the game

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[✓]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[!]${NC} $1"
}

print_error() {
    echo -e "${RED}[✗]${NC} $1"
}

# ASCII Art Welcome
echo "
🦕🚀🎹🦕🚀🎹🦕🚀🎹🦕🚀🎹🦕🚀🎹
    
  SPACE DINO PIANO SETUP
  The Cosmic Symphony
    
🦕🚀🎹🦕🚀🎹🦕🚀🎹🦕🚀🎹🦕🚀🎹
"

print_status "Starting setup process..."

# Detect OS
OS="Unknown"
if [[ "$OSTYPE" == "darwin"* ]]; then
    OS="macOS"
elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
    OS="Linux"
elif [[ "$OSTYPE" == "msys" ]] || [[ "$OSTYPE" == "cygwin" ]]; then
    OS="Windows"
fi

print_status "Detected OS: $OS"

# Check for Node.js
print_status "Checking for Node.js..."
if command -v node &> /dev/null; then
    NODE_VERSION=$(node -v)
    print_success "Node.js found: $NODE_VERSION"
    
    # Check if version is >= 18
    REQUIRED_VERSION=18
    CURRENT_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
    
    if [ "$CURRENT_VERSION" -lt "$REQUIRED_VERSION" ]; then
        print_error "Node.js version 18 or higher is required (you have $NODE_VERSION)"
        print_status "Please update Node.js from https://nodejs.org"
        exit 1
    fi
else
    print_error "Node.js is not installed!"
    print_status "Installing Node.js..."
    
    if [[ "$OS" == "macOS" ]]; then
        if command -v brew &> /dev/null; then
            brew install node
        else
            print_error "Please install Node.js from https://nodejs.org"
            exit 1
        fi
    elif [[ "$OS" == "Linux" ]]; then
        print_status "Please install Node.js using:"
        echo "  curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo -E bash -"
        echo "  sudo apt-get install -y nodejs"
        exit 1
    else
        print_error "Please install Node.js from https://nodejs.org"
        exit 1
    fi
fi

# Check for npm
print_status "Checking for npm..."
if command -v npm &> /dev/null; then
    NPM_VERSION=$(npm -v)
    print_success "npm found: $NPM_VERSION"
else
    print_error "npm is not installed!"
    exit 1
fi

# Check for Git (optional but recommended)
if command -v git &> /dev/null; then
    print_success "Git is installed"
else
    print_warning "Git is not installed (optional)"
fi

# Check for Sox (audio synthesis)
print_status "Checking for Sox audio synthesizer..."
if command -v sox &> /dev/null; then
    print_success "Sox is installed - you'll have great audio!"
else
    print_warning "Sox is not installed - audio will be limited"
    print_status "To install Sox for better audio:"
    
    if [[ "$OS" == "macOS" ]]; then
        echo "  brew install sox"
    elif [[ "$OS" == "Linux" ]]; then
        echo "  sudo apt-get install sox"
    else
        echo "  Download from: http://sox.sourceforge.net"
    fi
    
    echo ""
    read -p "Would you like to install Sox now? (y/n) " -n 1 -r
    echo ""
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        if [[ "$OS" == "macOS" ]]; then
            if command -v brew &> /dev/null; then
                brew install sox
                print_success "Sox installed!"
            else
                print_warning "Please install Homebrew first: https://brew.sh"
            fi
        elif [[ "$OS" == "Linux" ]]; then
            sudo apt-get update && sudo apt-get install -y sox
            print_success "Sox installed!"
        fi
    fi
fi

# Create project structure
print_status "Creating project structure..."
mkdir -p src
mkdir -p dist

# Move the main file to src if it exists in root
if [ -f "space-dino-piano.js" ]; then
    mv space-dino-piano.js src/
    print_success "Moved main file to src/"
fi

# Install dependencies
print_status "Installing dependencies (this may take a minute)..."
npm install

# Build the project
print_status "Building the game..."
npm run build

print_success "Setup complete!"

echo ""
echo "======================================"
echo "  🎉 SETUP COMPLETE! 🎉"
echo "======================================"
echo ""
echo "To play the game, run:"
echo "  ${GREEN}npm start${NC}"
echo ""
echo "Or simply:"
echo "  ${GREEN}./play.sh${NC}"
echo ""
echo "Controls:"
echo "  🎹 A-S-D-F-G-H-J-K = White keys (C-D-E-F-G-A-B-C)"
echo "  🎹 W-E-T-Y-U = Black keys"
echo "  📖 SPACE = Continue story"
echo "  ▶️  ENTER = Start lesson"
echo "  🚪 Q or ESC = Quit"
echo ""
echo "Have fun learning piano with the Space Dinosaurs! 🦕🚀🎹"
echo ""

#!/bin/bash

echo "Installing Job Scout Dependencies..."
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "Error: Node.js is not installed or not in PATH"
    echo "Please install Node.js from https://nodejs.org/"
    exit 1
fi

echo "Node.js found. Installing dependencies..."
echo ""

# Get the directory where this script is located
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"

# Install scout-bot dependencies
echo "[1/3] Installing Scout Bot dependencies..."
cd "$SCRIPT_DIR/scout-bot"
npm install
if [ $? -ne 0 ]; then
    echo "Error installing scout-bot dependencies"
    exit 1
fi

# Install server dependencies
echo "[2/3] Installing Server dependencies..."
cd "$SCRIPT_DIR/job-scout-app/server"
npm install
if [ $? -ne 0 ]; then
    echo "Error installing server dependencies"
    exit 1
fi

# Install frontend dependencies
echo "[3/3] Installing Frontend dependencies..."
cd "$SCRIPT_DIR/job-scout-app/front-end/job-scout"
npm install
if [ $? -ne 0 ]; then
    echo "Error installing frontend dependencies"
    exit 1
fi

echo ""
echo "======================================"
echo "Installation Complete!"
echo "======================================"
echo ""
echo "You can now run the application using:"
echo "  ./start.sh (Linux/Mac)"
echo "  start.bat (Windows)"
echo ""
echo "Press Enter to continue..."
read

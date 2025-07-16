#!/bin/bash

echo "Starting Job Scout Application..."
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "Error: Node.js is not installed or not in PATH"
    echo "Please install Node.js from https://nodejs.org/"
    exit 1
fi

echo "Node.js found. Starting application components..."
echo ""

# Get the directory where this script is located
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"

# Start the backend server
echo "[1/3] Starting Job Evaluation Server..."
gnome-terminal --title="Job Scout Server" -- bash -c "cd '$SCRIPT_DIR/job-scout-app/server' && npm run dev; exec bash" 2>/dev/null || \
xterm -title "Job Scout Server" -e "cd '$SCRIPT_DIR/job-scout-app/server' && npm run dev; bash" 2>/dev/null || \
osascript -e "tell application \"Terminal\" to do script \"cd '$SCRIPT_DIR/job-scout-app/server' && npm run dev\"" 2>/dev/null &

# Wait a moment for server to start
sleep 3

# Start the React frontend
echo "[2/3] Starting React Frontend..."
gnome-terminal --title="Job Scout Frontend" -- bash -c "cd '$SCRIPT_DIR/job-scout-app/front-end/job-scout' && npm start; exec bash" 2>/dev/null || \
xterm -title "Job Scout Frontend" -e "cd '$SCRIPT_DIR/job-scout-app/front-end/job-scout' && npm start; bash" 2>/dev/null || \
osascript -e "tell application \"Terminal\" to do script \"cd '$SCRIPT_DIR/job-scout-app/front-end/job-scout' && npm start\"" 2>/dev/null &

# Wait a moment
sleep 2

echo "[3/3] Setup complete!"
echo ""
echo "======================================"
echo "Job Scout is starting up..."
echo "======================================"
echo ""
echo "Backend Server: http://localhost:3000"
echo "Frontend App: http://localhost:3001 (will open automatically)"
echo ""
echo "To run the automation bot:"
echo "  1. Open LinkedIn job search in your browser"
echo "  2. Run: cd scout-bot && npm run dev"
echo ""
echo "Press ESC in any bot window to stop automation"
echo "Press Enter to continue..."
read

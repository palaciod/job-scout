import express from 'express';
import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

// Track the bot process
let botProcess = null;
let botStatus = 'stopped'; // 'stopped', 'starting', 'running', 'stopping'
let botLogs = [];

// Path to the scout-bot directory
const scoutBotPath = path.resolve(__dirname, '../../../../scout-bot');

// Helper function to add log entry
const addLog = (message, type = 'info') => {
  const logEntry = {
    timestamp: new Date().toISOString(),
    message,
    type
  };
  botLogs.push(logEntry);
  // Keep only last 100 log entries
  if (botLogs.length > 100) {
    botLogs = botLogs.slice(-100);
  }
  console.log(`[Bot ${type.toUpperCase()}] ${message}`);
};

// Start the bot
router.post('/start', async (req, res) => {
  try {
    if (botProcess && !botProcess.killed) {
      return res.status(400).json({
        success: false,
        message: 'Bot is already running',
        status: botStatus
      });
    }

    botStatus = 'starting';
    addLog('Starting automation bot...', 'info');

    // Spawn the bot process
    botProcess = spawn('node', ['index.js'], {
      cwd: scoutBotPath,
      stdio: ['pipe', 'pipe', 'pipe'],
      shell: process.platform === 'win32'
    });

    // Handle process output
    botProcess.stdout.on('data', (data) => {
      const message = data.toString().trim();
      if (message) {
        addLog(message, 'stdout');
      }
    });

    botProcess.stderr.on('data', (data) => {
      const message = data.toString().trim();
      if (message) {
        addLog(message, 'error');
      }
    });

    // Handle process close
    botProcess.on('close', (code) => {
      const message = `Bot process exited with code ${code}`;
      addLog(message, code === 0 ? 'info' : 'error');
      botStatus = 'stopped';
      botProcess = null;
    });

    // Handle process error
    botProcess.on('error', (error) => {
      addLog(`Bot process error: ${error.message}`, 'error');
      botStatus = 'stopped';
      botProcess = null;
    });

    // Wait a bit to see if the process starts successfully
    await new Promise(resolve => setTimeout(resolve, 1000));

    if (botProcess && !botProcess.killed) {
      botStatus = 'running';
      addLog('Bot started successfully', 'success');
      
      res.json({
        success: true,
        message: 'Bot started successfully',
        status: botStatus,
        pid: botProcess.pid
      });
    } else {
      botStatus = 'stopped';
      res.status(500).json({
        success: false,
        message: 'Failed to start bot',
        status: botStatus
      });
    }

  } catch (error) {
    botStatus = 'stopped';
    addLog(`Error starting bot: ${error.message}`, 'error');
    res.status(500).json({
      success: false,
      message: `Error starting bot: ${error.message}`,
      status: botStatus
    });
  }
});

// Stop the bot
router.post('/stop', (req, res) => {
  try {
    if (!botProcess || botProcess.killed) {
      return res.status(400).json({
        success: false,
        message: 'Bot is not running',
        status: botStatus
      });
    }

    botStatus = 'stopping';
    addLog('Stopping automation bot...', 'info');

    // Kill the process
    botProcess.kill('SIGTERM');
    
    // Force kill after 5 seconds if it doesn't stop gracefully
    setTimeout(() => {
      if (botProcess && !botProcess.killed) {
        botProcess.kill('SIGKILL');
        addLog('Bot force killed', 'warn');
      }
    }, 5000);

    res.json({
      success: true,
      message: 'Bot stop signal sent',
      status: botStatus
    });

  } catch (error) {
    addLog(`Error stopping bot: ${error.message}`, 'error');
    res.status(500).json({
      success: false,
      message: `Error stopping bot: ${error.message}`,
      status: botStatus
    });
  }
});

// Get bot status
router.get('/status', (req, res) => {
  const isRunning = botProcess && !botProcess.killed;
  
  res.json({
    success: true,
    status: botStatus,
    isRunning,
    pid: isRunning ? botProcess.pid : null,
    uptime: isRunning ? process.uptime() : null
  });
});

// Get bot logs
router.get('/logs', (req, res) => {
  const limit = parseInt(req.query.limit) || 50;
  const logs = botLogs.slice(-limit);
  
  res.json({
    success: true,
    logs,
    total: botLogs.length
  });
});

// Clear bot logs
router.delete('/logs', (req, res) => {
  botLogs = [];
  addLog('Logs cleared', 'info');
  
  res.json({
    success: true,
    message: 'Logs cleared'
  });
});

// Emergency stop (force kill)
router.post('/emergency-stop', (req, res) => {
  try {
    if (botProcess && !botProcess.killed) {
      botProcess.kill('SIGKILL');
      addLog('Emergency stop executed', 'warn');
    }
    
    botStatus = 'stopped';
    botProcess = null;
    
    res.json({
      success: true,
      message: 'Emergency stop executed',
      status: botStatus
    });

  } catch (error) {
    addLog(`Error during emergency stop: ${error.message}`, 'error');
    res.status(500).json({
      success: false,
      message: `Error during emergency stop: ${error.message}`
    });
  }
});

export default router;
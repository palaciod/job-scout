const { spawn } = require('cross-spawn');
const path = require('path');
const fs = require('fs');
const os = require('os');

// ANSI color codes for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m'
};

const log = {
  info: (msg) => console.log(`${colors.blue}ℹ${colors.reset} ${msg}`),
  success: (msg) => console.log(`${colors.green}✓${colors.reset} ${msg}`),
  error: (msg) => console.log(`${colors.red}✗${colors.reset} ${msg}`),
  warn: (msg) => console.log(`${colors.yellow}⚠${colors.reset} ${msg}`),
  title: (msg) => console.log(`${colors.cyan}${colors.bright}${msg}${colors.reset}`),
  step: (num, total, msg) => console.log(`${colors.magenta}[${num}/${total}]${colors.reset} ${msg}`)
};

const isWindows = os.platform() === 'win32';

function checkNodeJs() {
  return new Promise((resolve) => {
    const child = spawn('node', ['--version'], { stdio: 'pipe' });
    child.on('close', (code) => {
      resolve(code === 0);
    });
    child.on('error', () => {
      resolve(false);
    });
  });
}

function runCommand(command, args, options = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      stdio: options.silent ? 'pipe' : 'inherit',
      shell: isWindows,
      ...options
    });

    child.on('close', (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`Command failed with exit code ${code}`));
      }
    });

    child.on('error', (error) => {
      reject(error);
    });
  });
}

async function installDependencies() {
  log.title('🔧 Installing Job Scout Dependencies...');
  console.log('');

  const components = [
    { name: 'Scout Bot', path: 'scout-bot' },
    { name: 'Backend Server', path: 'job-scout-app/server' },
    { name: 'React Frontend', path: 'job-scout-app/front-end/job-scout' }
  ];

  for (let i = 0; i < components.length; i++) {
    const component = components[i];
    log.step(i + 1, components.length, `Installing ${component.name} dependencies...`);
    
    const componentPath = path.join(__dirname, component.path);
    
    if (!fs.existsSync(componentPath)) {
      log.error(`Directory not found: ${componentPath}`);
      continue;
    }

    try {
      await runCommand('npm', ['install'], { cwd: componentPath });
      log.success(`${component.name} dependencies installed`);
    } catch (error) {
      log.error(`Failed to install ${component.name} dependencies: ${error.message}`);
      throw error;
    }
  }

  console.log('');
  log.success('All dependencies installed successfully!');
}

async function startApplication() {
  log.title('🚀 Starting Job Scout Application...');
  console.log('');

  // Start backend server
  log.step(1, 2, 'Starting Job Evaluation Server...');
  const serverPath = path.join(__dirname, 'job-scout-app/server');
  
  const serverProcess = spawn('npm', ['run', 'dev'], {
    cwd: serverPath,
    stdio: 'inherit',
    shell: isWindows,
    detached: !isWindows
  });

  // Wait a moment for server to start
  await new Promise(resolve => setTimeout(resolve, 3000));

  // Start React frontend
  log.step(2, 2, 'Starting React Frontend...');
  const frontendPath = path.join(__dirname, 'job-scout-app/front-end/job-scout');
  
  const frontendProcess = spawn('npm', ['start'], {
    cwd: frontendPath,
    stdio: 'inherit',
    shell: isWindows,
    detached: !isWindows
  });

  console.log('');
  log.success('Job Scout is starting up!');
  console.log('');
  console.log(`${colors.cyan}======================================${colors.reset}`);
  console.log(`${colors.bright}Job Scout Application Started${colors.reset}`);
  console.log(`${colors.cyan}======================================${colors.reset}`);
  console.log('');
  console.log(`Backend Server: ${colors.green}http://localhost:3000${colors.reset}`);
  console.log(`Frontend App: ${colors.green}http://localhost:3001${colors.reset} (will open automatically)`);
  console.log('');
  console.log(`${colors.yellow}To run the automation bot:${colors.reset}`);
  console.log(`  1. Open LinkedIn job search in your browser`);
  console.log(`  2. Run: ${colors.cyan}cd scout-bot && npm run dev${colors.reset}`);
  console.log('');
  console.log(`${colors.red}Press ESC in any bot window to stop automation${colors.reset}`);
  console.log(`${colors.dim}Press Ctrl+C to stop the application${colors.reset}`);

  // Handle graceful shutdown
  process.on('SIGINT', () => {
    console.log('\n\nShutting down Job Scout...');
    if (serverProcess && !serverProcess.killed) {
      serverProcess.kill();
    }
    if (frontendProcess && !frontendProcess.killed) {
      frontendProcess.kill();
    }
    process.exit(0);
  });

  // Keep the process alive
  return new Promise(() => {});
}

async function main() {
  const args = process.argv.slice(2);
  const installOnly = args.includes('--install-only');
  const devMode = args.includes('--dev');

  try {
    // Check if Node.js is available
    const hasNode = await checkNodeJs();
    if (!hasNode) {
      log.error('Node.js is not installed or not in PATH');
      log.error('Please install Node.js from https://nodejs.org/');
      process.exit(1);
    }

    log.success('Node.js found');
    console.log('');

    // Always install dependencies first (or if install-only flag is used)
    await installDependencies();

    if (installOnly) {
      console.log('');
      log.info('Installation complete. Run "npm start" to start the application.');
      return;
    }

    console.log('');
    
    // Start the application
    await startApplication();

  } catch (error) {
    console.log('');
    log.error(`Setup failed: ${error.message}`);
    process.exit(1);
  }
}

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  log.error(`Unhandled Rejection at: ${promise}, reason: ${reason}`);
  process.exit(1);
});

main();

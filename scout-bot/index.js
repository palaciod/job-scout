import path from 'path';
import { fileURLToPath } from 'url';
import { exec, spawn } from 'child_process';
import { promisify } from 'util';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const mouseToolsPath = path.resolve(__dirname, '../mouse-tools');

const screenshotPath = path.join(mouseToolsPath, 'screenshot.exe');
const visualizerPath = path.join(mouseToolsPath, 'visualizer.exe');
const moveMousePath = path.join(mouseToolsPath, 'moveMouse.exe');
const escapePath = path.join(mouseToolsPath, 'escape.exe');

const buildMoveMouse = path.join(mouseToolsPath, 'buildMoveMouse.bat');
const buildVisualizer = path.join(mouseToolsPath, 'buildVisualizer.bat');
const screenshotBuilder = path.join(mouseToolsPath, 'screenshotBuilder.bat');
const buildEscape = path.join(mouseToolsPath, 'buildEscape.bat');

const execPromise = promisify(exec);

const initialize = async () => {
    try {
        if (!fs.existsSync(screenshotPath)) {
            console.log('screenshot.exe not found, building...');
            await execPromise(`"${screenshotBuilder}"`, { cwd: mouseToolsPath });
        }

        if (!fs.existsSync(visualizerPath)) {
            console.log('visualizer.exe not found, building...');
            await execPromise(`"${buildVisualizer}"`, { cwd: mouseToolsPath });
        }

        if (!fs.existsSync(moveMousePath)) {
            console.log('moveMouse.exe not found, building...');
            await execPromise(`"${buildMoveMouse}"`, { cwd: mouseToolsPath });
        }

        if (!fs.existsSync(escapePath)) {
            console.log('escape.exe not found, building...');
            await execPromise(`"${buildEscape}"`, { cwd: mouseToolsPath });
        }
    } catch (err) {
        console.error(`Initialization error: ${err.message}`);
        process.exit(1);
    }
};

const runEscapeListener = () => {
    console.log('Starting global Escape key listener...');
    const escapeProcess = spawn(escapePath, [], { cwd: mouseToolsPath, detached: true, stdio: 'ignore' });
    escapeProcess.unref();
};

const moveWithEscapeCheck = (x, y, shouldClick) => {
    return new Promise((resolve, reject) => {
        const moveProcess = spawn(moveMousePath, [`${x}`, `${y}`, `${shouldClick}`], { cwd: mouseToolsPath });

        moveProcess.stdout.on('data', (data) => {
            const output = data.toString().trim();
            console.log(output);

            if (output.includes('Escape key pressed')) {
                console.log('Detected Escape during movement. Stopping bot.');
                process.exit(0);
            }
        });

        moveProcess.stderr.on('data', (data) => {
            console.error(`Error: ${data}`);
        });

        moveProcess.on('close', () => {
            resolve();
        });
    });
};

const runBot = async () => {
    try {
        console.log('Taking screenshot...');
        await execPromise(`"${screenshotPath}"`);
        console.log('Screenshot complete.');

        console.log('Running visualizer...');
        const { stdout } = await execPromise(`"${visualizerPath}"`);
        const points = JSON.parse(stdout.trim());

        console.log('Detected job postings:', points);

        for (const { x, y } of points) {
            console.log(`Moving to: ${x}, ${y}`);
            await moveWithEscapeCheck(x, y, 'click');

            const saveButtonPoint = await execPromise(`"${visualizerPath}" find-save`);
            const saveButton = JSON.parse(saveButtonPoint.stdout.trim());
            await moveWithEscapeCheck(saveButton.x, saveButton.y, "");
            const aboutTheJobButtonPoint = await execPromise(`"${visualizerPath}" find-about`);
            const aboutButton = JSON.parse(aboutTheJobButtonPoint.stdout.trim());
            await moveWithEscapeCheck(aboutButton.x, aboutButton.y, "");
            console.log(`Save point at:`, aboutButton);
        }

        console.log('All points completed.');
    } catch (err) {
        console.error(`Error: ${err.message}`);
    }
};

const start = async () => {
    await initialize();
    runEscapeListener();
    await runBot();
};

start();

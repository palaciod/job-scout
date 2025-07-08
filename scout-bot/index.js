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
const highlightPath = path.join(mouseToolsPath, 'highlight.exe');

const buildMoveMouse = path.join(mouseToolsPath, 'buildMoveMouse.bat');
const buildVisualizer = path.join(mouseToolsPath, 'buildVisualizer.bat');
const screenshotBuilder = path.join(mouseToolsPath, 'screenshotBuilder.bat');
const buildEscape = path.join(mouseToolsPath, 'buildEscape.bat');
const buildHighlight = path.join(mouseToolsPath, 'buildHighlight.bat');


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
        if (!fs.existsSync(highlightPath)) {
            console.log('highlight.exe not found, building... ');
            await execPromise(`"${buildHighlight}"`, { cwd: mouseToolsPath });
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
        const linkedInScreenshot = 'screenshots/linkedInScreen.bmp';
        const { stdout } = await execPromise(`"${visualizerPath}" ${linkedInScreenshot}`);
        const menuButtonPoint = await execPromise(`"${visualizerPath}" ${linkedInScreenshot} find-menu`);
        const menuButton = JSON.parse(menuButtonPoint.stdout.trim());
        const points = JSON.parse(stdout.trim());

        console.log('Detected job postings:', points);

        for (const { x, y } of points) {
            await moveWithEscapeCheck(x, y, 'click');
            await new Promise(resolve => setTimeout(resolve, 2000));
            await execPromise(`"${screenshotPath}" jobPost`);
            const jobPostScreen = 'screenshots/jobPost.bmp';
            const saveButtonPoint = await execPromise(`"${visualizerPath}" ${jobPostScreen} find-save`);
            console.log('i ran <-----------> 1');
            const saveButton = JSON.parse(saveButtonPoint.stdout.trim());
            // await moveWithEscapeCheck(saveButton.x, saveButton.y, "");
            console.log('i ran <-----------> 2', `"${visualizerPath}"${jobPostScreen} find-about`);
            const aboutTheJobButtonPoint = await execPromise(`"${visualizerPath}" ${jobPostScreen} find-about`);
            console.log('i ran <-----------> 3');
            const aboutButton = JSON.parse(aboutTheJobButtonPoint.stdout.trim());
            await moveWithEscapeCheck(aboutButton.xStart, aboutButton.yStart, "");
            console.log(`Save point at:`, aboutButton);
            console.log(aboutTheJobButtonPoint, 'about button coord');
            // Highlight and scroll after arriving at About section
            console.log('Running highlight drag + scroll...');
            await execPromise(`"${highlightPath}" ${menuButton.x} 30 -120`)
                .catch(err => {
                    console.error("Highlight failed:", err.stderr || err.message);
                });
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

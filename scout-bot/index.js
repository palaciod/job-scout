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
const scrollPath = path.join(mouseToolsPath, 'scroll.exe');
const dumpClipBoardPath = path.join(mouseToolsPath, 'dumpClipBoard.exe');

const buildMoveMouse = path.join(mouseToolsPath, 'buildMoveMouse.bat');
const buildVisualizer = path.join(mouseToolsPath, 'buildVisualizer.bat');
const screenshotBuilder = path.join(mouseToolsPath, 'screenshotBuilder.bat');
const buildEscape = path.join(mouseToolsPath, 'buildEscape.bat');
const buildHighlight = path.join(mouseToolsPath, 'buildHighlight.bat');
const buildScroll = path.join(mouseToolsPath, 'buildScroll.bat');
const buildDumpData = path.join(mouseToolsPath, 'buildDumpData.bat');


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
        if (!fs.existsSync(scrollPath)) {
            console.log('scroll.exe not found, building... ');
            await execPromise(`"${buildScroll}"`, { cwd: mouseToolsPath });
        }
        if (!fs.existsSync(dumpClipBoardPath)) {
            console.log('dumpClipBoard.exe not found, building... ');
            await execPromise(`"${buildDumpData}"`, { cwd: mouseToolsPath });
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

const findButton = async (imageLocation, buttonToFind, attempt = 1, maxAttempts = 10) => {
    const output = await execPromise(`"${visualizerPath}" ${imageLocation} ${buttonToFind}`);
    const result = JSON.parse(output.stdout.trim());
    if (!result?.xStart) {
        if (attempt >= maxAttempts) {
            throw new Error("Button not found after multiple scrolls.");
        }
        await execPromise(`"${screenshotPath}" jobPost`);
        await execPromise(`"${scrollPath}"`);
        return findButton(imageLocation, buttonToFind, attempt + 1, maxAttempts);
    }

    console.log('found!');
    return result;
};


const runBot = async () => {
    try {
        await execPromise(`"${screenshotPath}"`);
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
            console.log(`"${screenshotPath}" jobPost`, 'first screenshot');
            const jobPostScreen = 'screenshots/jobPost.bmp';
            const saveButtonPoint = await execPromise(`"${visualizerPath}" ${jobPostScreen} find-save`);
            const saveButton = JSON.parse(saveButtonPoint.stdout.trim());
            await moveWithEscapeCheck(saveButton.x, saveButton.y, "");
            const aboutButton = await findButton(jobPostScreen, "find-about");
            await moveWithEscapeCheck(aboutButton.xStart, aboutButton.yStart, "");
            // Highlight and scroll after arriving at About section
            await execPromise(`"${highlightPath}" ${menuButton.x} 30 -120`)
                .catch(err => {
                    console.error("Highlight failed:", err.stderr || err.message);
                });
            await execPromise(`"${dumpClipBoardPath}"`);
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

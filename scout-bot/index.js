import path from "path";
import { fileURLToPath } from "url";
import { exec, spawn } from "child_process";
import { promisify } from "util";
import fs from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const mouseToolsPath = path.resolve(__dirname, "../mouse-tools");

const screenshotPath = path.join(mouseToolsPath, "screenshot.exe");
const visualizerPath = path.join(mouseToolsPath, "visualizer.exe");
const moveMousePath = path.join(mouseToolsPath, "moveMouse.exe");
const escapePath = path.join(mouseToolsPath, "escape.exe");
const highlightPath = path.join(mouseToolsPath, "highlight.exe");
const scrollPath = path.join(mouseToolsPath, "scroll.exe");
const dumpClipBoardPath = path.join(mouseToolsPath, "dumpClipBoard.exe");
const findTextImagePath = path.join(mouseToolsPath, "findTextImage.exe");

const buildMoveMouse = path.join(mouseToolsPath, "buildMoveMouse.bat");
const buildVisualizer = path.join(mouseToolsPath, "buildVisualizer.bat");
const screenshotBuilder = path.join(mouseToolsPath, "screenshotBuilder.bat");
const buildEscape = path.join(mouseToolsPath, "buildEscape.bat");
const buildHighlight = path.join(mouseToolsPath, "buildHighlight.bat");
const buildScroll = path.join(mouseToolsPath, "buildScroll.bat");
const buildDumpData = path.join(mouseToolsPath, "buildDumpData.bat");
const buildTextImageFinder = path.join(mouseToolsPath, "buildTextImageFinder.bat");

const execPromise = promisify(exec);

const initialize = async () => {
  try {
    const toolBuildPairs = [
      [screenshotPath, screenshotBuilder],
      [visualizerPath, buildVisualizer],
      [moveMousePath, buildMoveMouse],
      [escapePath, buildEscape],
      [highlightPath, buildHighlight],
      [scrollPath, buildScroll],
      [dumpClipBoardPath, buildDumpData],
      [findTextImagePath, buildTextImageFinder],
    ];

    for (const [tool, builder] of toolBuildPairs) {
      if (!fs.existsSync(tool)) {
        console.log(`${path.basename(tool)} not found, building...`);
        await execPromise(`"${builder}"`, { cwd: mouseToolsPath });
      }
    }
  } catch (err) {
    console.error(`Initialization error: ${err.message}`);
    process.exit(1);
  }
};

const runEscapeListener = () => {
  console.log("Starting global Escape key listener...");
  const escapeProcess = spawn(escapePath, [], {
    cwd: mouseToolsPath,
    detached: true,
    stdio: "ignore",
  });
  escapeProcess.unref();
};

const moveWithEscapeCheck = (x, y, shouldClick) => {
  return new Promise((resolve, reject) => {
    const moveProcess = spawn(
      moveMousePath,
      [`${x}`, `${y}`, `${shouldClick}`],
      { cwd: mouseToolsPath }
    );

    moveProcess.stdout.on("data", (data) => {
      const output = data.toString().trim();
      console.log(output);

      if (output.includes("Escape key pressed")) {
        console.log("Detected Escape during movement. Stopping bot.");
        process.exit(0);
      }
    });

    moveProcess.stderr.on("data", (data) => {
      console.error(`Error: ${data}`);
    });

    moveProcess.on("close", () => {
      resolve();
    });
  });
};

const findButton = async (
  imageLocation,
  buttonToFind,
  attempt = 1,
  maxAttempts = 10
) => {
  const output = await execPromise(
    `"${visualizerPath}" ${imageLocation} ${buttonToFind}`
  );
  const result = JSON.parse(output.stdout.trim());
  if (!result?.xStart) {
    if (attempt >= maxAttempts) {
      throw new Error("Button not found after multiple scrolls.");
    }
    await execPromise(`"${screenshotPath}" jobPost`);
    await execPromise(`"${scrollPath}"`);
    return findButton(imageLocation, buttonToFind, attempt + 1, maxAttempts);
  }

  console.log("found!");
  return result;
};

const findSaveButton = async (jobPostScreen, attempt = 1, maxAttempts = 10) => {
  console.log(`Attempt ${attempt} to find save button...`);
  await execPromise(`"${screenshotPath}" jobPost`);
  const output = await execPromise(
    `"${visualizerPath}" "${jobPostScreen}" find-save`
  );
  const result = JSON.parse(output.stdout.trim());
  if (result?.x === undefined || result?.y === undefined) {
    if (attempt >= maxAttempts) {
      throw new Error("Save button not found after multiple attempts.");
    }
    return findSaveButton(jobPostScreen, attempt + 1, maxAttempts);
  }

  await moveWithEscapeCheck(result.x, result.y, "");
  if (attempt === 1) {
    console.log("Retrying once after successful find...");
    return findSaveButton(jobPostScreen, attempt + 1, maxAttempts);
  }
  return result;
};

const runBot = async () => {
  const jobPostScreen = "screenshots/jobPost.png";
  const screenshotRegion = [80, 100, 700, 250];
  try {
    await execPromise(`"${screenshotPath}" linkedInScreen`);
    const linkedInScreenshot = "screenshots/linkedInScreen.png";
    const { stdout } = await execPromise(
      `"${visualizerPath}" ${linkedInScreenshot}`
    );
    const menuButtonPoint = await execPromise(
      `"${visualizerPath}" ${linkedInScreenshot} find-menu`
    );
    const menuButton = JSON.parse(menuButtonPoint.stdout.trim());
    const points = JSON.parse(stdout.trim());
    let start;
    let end;
    console.log("Detected job postings:", points, start, end);

    for (const { x, y, xStart, yStart } of points) {
      if (start === undefined) {
        start = x;
        end = y;
      }
      await moveWithEscapeCheck(x, y, "click");
      console.log(start, end);
      await findSaveButton(jobPostScreen);

      await execPromise(
        `"${screenshotPath}" topJobPost ${start} ${end} ${screenshotRegion.join(" ")}`
      );
      const jobDataRaw = await execPromise(
        `"${findTextImagePath}" screenshots/topJobPost.png applicants hours people minutes`
      );
      const jobData = JSON.parse(jobDataRaw.stdout.trim());
      console.log("Extracted job data:", jobData);
      const aboutButton = await findButton(jobPostScreen, "find-about");
      await moveWithEscapeCheck(aboutButton.xStart, aboutButton.yStart, "");

      await execPromise(`"${highlightPath}" ${menuButton.x} 30 -120`).catch(
        (err) => {
          console.error("Highlight failed:", err.stderr || err.message);
        }
      );
      await execPromise(`"${dumpClipBoardPath}"`);
    }

    console.log("All points completed.");
  } catch (err) {
    console.error(`Error: ${err.message}`);
  }
};
process.on("unhandledRejection", (reason) => {
  console.error("Unhandled Rejection:", reason);
  process.exit(1);
});

const start = async () => {
  await initialize();
  runEscapeListener();
  await runBot();
};

start();

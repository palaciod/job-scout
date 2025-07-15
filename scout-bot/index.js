import path from "path";
import { fileURLToPath } from "url";
import { exec, spawn } from "child_process";
import { promisify } from "util";
import fs from "fs";

let scrollDistance;
let lastPoint;

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
const buildTextImageFinder = path.join(
  mouseToolsPath,
  "buildTextImageFinder.bat"
);

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

const moveWithEscapeCheck = (x, y, action) => {
  return new Promise((resolve, reject) => {
    let outputData = "";

    const args = [`${x}`, `${y}`];
    if (action === "click" || action === "copy") args.push(action);

    const moveProcess = spawn(moveMousePath, args, { cwd: mouseToolsPath });

    moveProcess.stdout.on("data", (data) => {
      const output = data.toString();
      outputData += output;

      if (output.includes("Escape key pressed")) {
        console.log("Detected Escape during movement. Stopping bot.");
        process.exit(0);
      }

      console.log(output.trim());
    });

    moveProcess.stderr.on("data", (data) => {
      console.error(`Error: ${data}`);
    });

    moveProcess.on("close", () => {
      try {
        const json = JSON.parse(outputData);
        resolve(json);
      } catch {
        resolve();
      }
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
    await execPromise(`"${scrollPath}" -45`);
    return findButton(imageLocation, buttonToFind, attempt + 1, maxAttempts);
  }

  console.log("found!");
  return result;
};

const findSaveButton = async (
  jobPostScreen,
  attempt = 1,
  maxAttempts = 10,
  hasRetriedAfterFind = false
) => {
  console.log(`Attempt ${attempt} to find save button...`);
  await execPromise(`"${screenshotPath}" jobPost`);

  const output = await execPromise(
    `"${visualizerPath}" "${jobPostScreen}" find-save`
  );
  const result = JSON.parse(output.stdout.trim());

  const notFound = result?.x === undefined || result?.y === undefined;

  if (notFound) {
    if (attempt >= maxAttempts) {
      throw new Error("Save button not found after multiple attempts.");
    }
    return findSaveButton(jobPostScreen, attempt + 1, maxAttempts, false);
  }
  if (!hasRetriedAfterFind) {
    console.log("Save Button found — retrying once more to confirm...");
    return findSaveButton(jobPostScreen, attempt + 1, maxAttempts, true);
  }
  await moveWithEscapeCheck(result.x, result.y);
  console.log(result, "<----------->");
  await execPromise(`"${scrollPath}" 100`);
  return result;
};

const shouldApply = (jobData) => {
  console.log("Extracted job data:", jobData);
  const firstLine = jobData.firstLine?.trim();
  const blocklist = [
    "Jobright.ai",
    "Wiraa",
    "Lensa",
    "hours",
    "United States",
    "people",
    "applicants",
  ];
  if (
    firstLine &&
    blocklist.some((company) =>
      firstLine.toLowerCase().includes(company.toLowerCase())
    )
  ) {
    console.log(`❌ Skipping: Blocked company "${firstLine}"`);
    return false;
  }
  const applicantsCount = jobData.applicants?.found
    ? parseInt(jobData.applicants.number, 10)
    : null;

  const peopleCount = jobData.people?.found
    ? parseInt(jobData.people.number, 10)
    : null;
  const personCount = jobData.person?.found
    ? parseInt(jobData.person.number, 10)
    : null;

  const decision =
    (applicantsCount !== null && applicantsCount < 100) ||
    (peopleCount !== null && peopleCount < 100) ||
    personCount !== null;

  if (decision) {
    const reason =
      applicantsCount !== null && applicantsCount < 100
        ? `✅ Applying: applicants < 100 (${applicantsCount})`
        : `✅ Applying: people < 100 (${peopleCount})`;
    console.log(reason);
  } else {
    console.log("❌ Skipping: too many applicants or data not found.");
  }

  return decision;
};

const getJobPointsWithRetry = async (maxAttempts = 10) => {
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      console.log(`📸 Capturing LinkedIn screen (Attempt ${attempt})`);
      await execPromise(`"${screenshotPath}" linkedInScreen`);
      const linkedInScreenshot = "screenshots/linkedInScreen.png";

      const [pointsOutput, menuButtonOutput] = await Promise.all([
        execPromise(`"${visualizerPath}" ${linkedInScreenshot}`),
        execPromise(`"${visualizerPath}" ${linkedInScreenshot} find-menu`),
      ]);

      const points = JSON.parse(pointsOutput.stdout.trim());
      const menuButton = JSON.parse(menuButtonOutput.stdout.trim());

      if (Array.isArray(points) && points.length > 0) {
        return { points, menuButton };
      }

      console.warn(`⚠️ No points found (Attempt ${attempt})`);
    } catch (err) {
      console.warn(`⚠️ Error in attempt ${attempt}:`, err.message);
    }

    await new Promise((res) => setTimeout(res, 200)); // Optional delay
  }

  throw new Error("❌ Failed to find any job points after multiple attempts.");
};

const scrollToTopAndGrabLink = async () => {
  // Scrolling value technically doesn't matter, we just need to scroll high enough to reach the top again
  await execPromise(`"${scrollPath}" 5000`);
  const url = await moveWithEscapeCheck(1270, 408, "copy");
  console.log(url, "<------------------------>");
  return url;
};

const runBot = async () => {
  const jobPostScreen = "screenshots/jobPost.png";
  // For the job title
  // Requested X: 1086, Y: 402, xOffset: 100, yOffset: 220, Width: 800, Height: 300
  // For job data under title (amount of applications data)
  // Requested X: 1086, Y: 402, xOffset: 100, yOffset: 180, Width: 700, Height: 150
  const jobTitleRegion = [100, 60, 900, 150];
  const screenshotRegion = [100, 180, 700, 150];
  try {
    const { points, menuButton } = await getJobPointsWithRetry();
    let start;
    let end;

    for (const { x, y, xStart, yStart } of points) {
      if (start === undefined) {
        start = 1086;
        end = 402;
      }
      await moveWithEscapeCheck(x, y, "click");
      try {
        await findSaveButton(jobPostScreen);
      } catch (err) {
        console.warn(`⚠️ Could not find save button: ${err.message}`);
        continue;
      }

      await execPromise(
        `"${screenshotPath}" topJobPostTitle ${1086} ${402} ${jobTitleRegion.join(
          " "
        )}`
      );
      const jobTitleRawData = await execPromise(
        `"${findTextImagePath}" screenshots/topJobPostTitle.png`
      );
      await execPromise(
        `"${screenshotPath}" topJobPost ${1086} ${402} ${screenshotRegion.join(
          " "
        )}`
      );
      const jobDataRaw = await execPromise(
        `"${findTextImagePath}" screenshots/topJobPost.png applicants hours people minutes hour person`
      );
      let jobData;
      let titleData;
      try {
        const cleaned = jobDataRaw.stdout.trim();
        const cleanedTitle = jobTitleRawData.stdout.trim();
        const firstBrace = cleaned.indexOf("{");
        const secondBrace = cleanedTitle.indexOf("{");
        if (firstBrace === -1 || secondBrace)
          throw new Error("No JSON object found");
        jobData = JSON.parse(cleaned.slice(firstBrace));
        titleData = JSON.parse(cleanedTitle.slice(secondBrace));
      } catch (err) {
        console.warn(
          "⚠️ Could not parse job data JSON. Skipping to next point."
        );
        console.warn("Raw stdout:", jobDataRaw.stdout);
        console.warn("Raw stdout:", jobTitleRawData.stdout);
        console.warn("Parse error:", err.message);
        continue;
      }
      jobData.firstLine = titleData?.firstLine;
      const apply = shouldApply(jobData);
      if (apply) {
        const result = await scrollToTopAndGrabLink();
        const jobUrl = typeof result === "string" ? result : result?.jobUrl;

        if (!jobUrl) {
          console.error("❌ No job URL found.");
          return;
        }

        const aboutButton = await findButton(jobPostScreen, "find-about");
        console.log(aboutButton, menuButton, "something weird here");

        await moveWithEscapeCheck(aboutButton.xStart, aboutButton.yStart);

        await execPromise(
          `"${highlightPath}" ${menuButton.x ?? 2022} 30 -120`
        ).catch((err) => {
          console.error("Highlight failed:", err.stderr || err.message);
        });

        const command = `"${dumpClipBoardPath}" "${jobUrl}"`;
        console.log("Running:", command);

        await execPromise(command);
      }
    }
    await moveWithEscapeCheck(
      points[points.length - 1]?.xStart,
      points[points.length - 1]?.yStart
    );
    scrollDistance = points[0]?.yStart - points[points.length - 1]?.yStart;
    lastPoint = points[points.length - 1]?.yStart;

    await execPromise(`"${scrollPath}" ${scrollDistance}`);
    console.log("All points completed.", scrollDistance, points[0]?.yStart);
  } catch (err) {
    console.error(`Error: ${err.message}`);
  }
};

const searchJobBoard = async (retryCount = 0, maxRetries = 3) => {
  await execPromise(`"${screenshotPath}" finalPage`);
  const linkedInScreenshot = "screenshots/finalPage.png";

  // Check if we've reached the end of the search results
  try {
    const endOfSearchPoint = await execPromise(
      `"${visualizerPath}" ${linkedInScreenshot} find-final-page`
    );
    const endOfSearchText = JSON.parse(endOfSearchPoint.stdout.trim());

    if (endOfSearchText?.x) {
      console.log("✅ Reached end of search. Halting.");
      return;
    }
  } catch (parseError) {
    console.log("🔁 End-of-search marker not found. Continuing...");
  }

  try {
    console.log("<------------1-------------->");
    const nextButtonPoint = await execPromise(
      `"${visualizerPath}" ${linkedInScreenshot} find-next`
    );
    let nextButton;
    console.log("<------------2-------------->", nextButtonPoint);

    try {
      nextButton = JSON.parse(nextButtonPoint.stdout.trim());
      console.log("<------------3-------------->", nextButton);
    } catch (parseError) {
      console.error(
        "Failed to parse next button output:",
        nextButtonPoint.stdout
      );
      throw parseError;
    }

    if (!nextButton || !nextButton.x || !nextButton.y) {
      console.log("❌ Next button not found or invalid. Running bot again...");
      const previousPoint = lastPoint;
      await runBot();
      console.log("<------------4-------------->", previousPoint);
      return searchJobBoard(0, maxRetries);
    }

    console.log("✅ Next button found:", nextButton);
    await moveWithEscapeCheck(nextButton.x, nextButton.y, "click");

    return searchJobBoard(0, maxRetries);
  } catch (error) {
    console.error("Error in searchJobBoard:", error);
    throw error;
  }
};

process.on("unhandledRejection", (reason) => {
  console.error("Unhandled Rejection:", reason);
  process.exit(1);
});

const start = async () => {
  await initialize();
  runEscapeListener();
  await searchJobBoard();
};

start();

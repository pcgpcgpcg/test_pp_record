import {launch, getStream } from "./PuppeteerStream.js";
const fs = require("fs");

const file = fs.createWriteStream(__dirname + "/test.webm");

const child_process = require('child_process');


const getExecutablePath = () => {
  if (process.env.CHROME_BIN) {
    return process.env.CHROME_BIN;
  }

  let executablePath;
  if (process.platform === 'linux') {
    try {
      executablePath = child_process.execSync('which chromium-browser').toString().split('\n').shift();
    } catch (e) {
      // NOOP
    }

    if (!executablePath) {
      executablePath = child_process.execSync('which chromium').toString().split('\n').shift();
      if (!executablePath) {
        throw new Error('Chromium not found (which chromium)');
      }
    }
  } else if (process.platform === 'darwin') {
    executablePath = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
  } else if (process.platform === 'win32') {
    executablePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
  } else {
    throw new Error('Unsupported platform: ' + process.platform);
  }

  return executablePath;
};

async function test() {
	console.log(`executablePath=${getExecutablePath()}`)
	const browser = await launch({
		executablePath: getExecutablePath(),
	});

	const page = await browser.newPage();
	await page.goto("http://192.168.31.110:8013/")//("https://www.bilibili.com/bangumi/play/ep808543?theme=movie&from_spmid=666.7.recommend.2");
	await page.setViewport({
		width: 1920,
		height: 1080,
	});
	const stream = await getStream(page, {
		audio: true,
		video: true,
		videoConstraints: {
			mandatory: {
				width: 1920,
				height: 1080,
			},
		},
	});
	console.log("recording");

	stream.pipe(file);
	setTimeout(async () => {
		stream.destroy();
		file.close();
		console.log("finished");
	}, 1000 * 120);
}

test();


const puppeteer = require("puppeteer");
require("dotenv").config();

const scrapeLogic = async (res) => {
  const browser = await puppeteer.launch({
    args: [
      "--disable-setuid-sandbox",
      "--no-sandbox",
      "--single-process",
      "--no-zygote",
    ],
    executablePath:
      process.env.NODE_ENV === "production"
        ? process.env.PUPPETEER_EXECUTABLE_PATH
        : puppeteer.executablePath(),
  });

  try {
    const page = await browser.newPage();
    await page.goto("https://developer.chrome.com/", { waitUntil: 'networkidle2' });

    // Set screen size
    await page.setViewport({ width: 1080, height: 1024 });

    // Ensure the page has loaded completely
    await page.waitForTimeout(3000); // Wait an additional 3 seconds

    // Check if the search box is available
    const searchBox = await page.$(".search-box__input");
    if (!searchBox) {
      throw new Error("Search box element not found");
    }

    // Type into search box
    await page.type(".search-box__input", "automate beyond recorder");

    // Wait and click on the first result
    const searchResultSelector = ".search-box__link";
    await page.waitForSelector(searchResultSelector);
    await page.click(searchResultSelector);

    // Locate the full title with a unique string
    const textSelector = await page.waitForSelector("text/Customize and automate");
    const fullTitle = await textSelector.evaluate((el) => el.textContent);

    // Print the full title
    const logStatement = `The title of this blog post is ${fullTitle}`;
    console.log(logStatement);
    res.send(logStatement);
  } catch (e) {
    console.error(e);
    res.send(`Something went wrong while running Puppeteer: ${e}`);
  } finally {
    await browser.close();
  }
};

module.exports = { scrapeLogic };

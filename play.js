const puppeteer = require("puppeteer");
var fs = require("fs");

let file;

const script = fs.readFileSync(__dirname + "\\rrweb\\rrweb.js", "utf8");
const style = fs.readFileSync(__dirname + "\\rrweb\\rrweb.css", "utf8");

console.log(__dirname);

const run_browser = async () => {
  const events = fs.readFileSync(file, "utf8");

  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: null,
    args: ["--no-sandbox", "--disable-setuid-sandbox", "--start-maximized"]
  });
  const pages = await browser.pages();
  const page = pages[0];
  //await page.goto("file://" + file);
  await page.evaluate(script);
  await page.addStyleTag({ content: style });
  await page.evaluate(`events=${events};new rrweb.Replayer(events).play();`);
};

const open_file = files => {
  file = files[0].path;
  console.log(file);
  load_replay();
};
const load_replay = () => {
  console.log("should open puppeteer");
  console.log("file is", file);
  run_browser();
};
exports.open_file = open_file;
exports.load_replay = load_replay;

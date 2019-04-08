/** /
// Pure puppeteer version
const puppeteer = require("puppeteer");

const run_browser = async () => {
        const browser = await puppeteer.launch({
                headless: false,
                defaultViewport: null,
                args: ["--no-sandbox", "--disable-setuid-sandbox"]
        });
        const page = await browser.newPage();
        await page.goto("https://example.com");
};

const read_events = file => {
        console.log("click");
        run_browser();
        // console.log(file);
};

(async () => {
        const controls_browser = await puppeteer.launch({
                headless: false,
                defaultViewport: null,
                frame: false,
                args: ["--app=http://localhost:3000", "--start-maximized"] //, "--kiosk"]
                // args: ["--app=http://localhost:3000", "--window-size=800,250", "--window-position=560,900"]
        });
        const _controls = await controls_browser.pages();
        const controls = _controls[0];
        controls.once("load", async () => {
                console.log("Page loaded!");
                const win = await controls.evaluateHandle("window");
                win.read_events = read_events;
        });
        controls.exposeFunction("read_events", arg => {
                console.log(arg);
        });
        // await controls.evaluateHandle(function() {
        //         window.read_events = read_events;
        // });
})();

/*/
// Electron version
const { app, BrowserWindow } = require("electron");
const path = require("path");
let mainWindow;

app.on("ready", () => {
        mainWindow = new BrowserWindow({
                // width: 800,
                // height: 250,
                // x: 560,
                // y: 900,
                // maximizable: false,
                alwaysOnTop: true,
                autoHideMenuBar: true,
                title: "UXEEG is getting ready",
                // frame: false,
                webPreferences: {
                        nodeIntegration: true
                }
        });
        mainWindow.maximize();
        mainWindow.webContents.openDevTools();
        mainWindow.loadURL("http://localhost:3000");
        mainWindow.on("closed", function() {
                mainWindow = null;
                app.quit();
        });
});

/**/

const { app, BrowserWindow, ipcMain } = require("electron");
const path = require("path");

const createWindow = () => {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    titleBarStyle: "hidden",
    autoHideMenuBar: true,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
    },
  });
  win.loadURL("http://localhost:5000");
  win.webContents.openDevTools();
};

app.on("ready", createWindow);

ipcMain.on("capture-screen", (event, msg) => {
  const win = new BrowserWindow({
    fullscreen: true,
    resizable: false,
    movable: false,
    focusable: false,
    alwaysOnTop: true,
    autoHideMenuBar: true,
  });
  win.loadURL(msg);
});

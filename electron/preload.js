const { ipcRenderer } = require("electron");

global.captureScreen = (url) => {
  ipcRenderer.send("capture-screen", url);
};

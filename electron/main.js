"use strict";

const { app, BrowserWindow, Menu, shell, nativeTheme } = require("electron");
const path = require("path");

const REPO_URL = "https://github.com/kvcodeproject/Financial-Intelligence-Monitor";

function createWindow() {
  const win = new BrowserWindow({
    width: 1480,
    height: 920,
    minWidth: 1024,
    minHeight: 640,
    backgroundColor: "#0e1117",
    title: "Financial Intelligence Monitor",
    autoHideMenuBar: false,
    icon: path.join(__dirname, "..", "build", "icon.png"),
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
      spellcheck: false
    }
  });

  win.loadFile(path.join(__dirname, "..", "index.html"));

  // Open external links in the user's default browser, never inside the app shell.
  win.webContents.setWindowOpenHandler(({ url }) => {
    if (/^https?:\/\//i.test(url)) shell.openExternal(url);
    return { action: "deny" };
  });

  return win;
}

function buildMenu() {
  const isMac = process.platform === "darwin";
  const template = [
    ...(isMac ? [{ role: "appMenu" }] : []),
    {
      label: "File",
      submenu: [
        { role: "reload" },
        { role: "forceReload" },
        { type: "separator" },
        isMac ? { role: "close" } : { role: "quit" }
      ]
    },
    { role: "editMenu" },
    {
      label: "View",
      submenu: [
        { role: "resetZoom" },
        { role: "zoomIn" },
        { role: "zoomOut" },
        { type: "separator" },
        { role: "togglefullscreen" },
        { role: "toggleDevTools" }
      ]
    },
    {
      role: "help",
      submenu: [
        {
          label: "Open repository",
          click: () => shell.openExternal(REPO_URL)
        },
        {
          label: "Releases (download installers)",
          click: () => shell.openExternal(`${REPO_URL}/releases/latest`)
        },
        {
          label: "Report an issue",
          click: () => shell.openExternal(`${REPO_URL}/issues/new`)
        }
      ]
    }
  ];
  Menu.setApplicationMenu(Menu.buildFromTemplate(template));
}

app.whenReady().then(() => {
  nativeTheme.themeSource = "dark";
  buildMenu();
  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});

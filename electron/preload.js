"use strict";

const { contextBridge } = require("electron");

contextBridge.exposeInMainWorld("fim", {
  isDesktop: true,
  platform: process.platform,
  arch: process.arch,
  versions: {
    app: process.env.npm_package_version || "1.0.0",
    electron: process.versions.electron,
    chrome: process.versions.chrome,
    node: process.versions.node
  }
});

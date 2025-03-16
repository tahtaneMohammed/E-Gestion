import { app, BrowserWindow } from "electron"
import path from "path"
import { fileURLToPath } from "url"

// Get the directory name of the current module
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

function createWindow() {
  // Create the browser window
  const mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
    },
    icon: path.join(__dirname, "../assets/icon.png"),
  })

  // Load the index.html from the vite dev server or the built file
  if (process.env.NODE_ENV === "development") {
    mainWindow.loadURL("http://localhost:5173")
    // Open the DevTools in development mode
    mainWindow.webContents.openDevTools()
  } else {
    mainWindow.loadFile(path.join(__dirname, "../dist/index.html"))
  }

  // Set window title
  mainWindow.setTitle("E'gest - نظام إدارة الامتحانات")
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
app.whenReady().then(() => {
  createWindow()

  app.on("activate", () => {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

// Quit when all windows are closed, except on macOS.
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit()
})


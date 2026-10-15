import { app, BrowserWindow, ipcMain, dialog, shell } from 'electron'
import { join } from 'node:path'
import { closeDatabase, openDatabase, pingDatabase } from './db/client'
import { FiscalServiceManager } from './fiscal-service-manager'

const manager = new FiscalServiceManager()
let mainWindow: BrowserWindow | null = null
let quitting = false

function preloadPath() {
  return join(__dirname, '../preload/index.js')
}

async function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1100,
    height: 720,
    minWidth: 800,
    minHeight: 560,
    title: 'Crema Stereo POS',
    webPreferences: {
      preload: preloadPath(),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false
    }
  })

  manager.setWindow(mainWindow)

  if (process.env.ELECTRON_RENDERER_URL) {
    await mainWindow.loadURL(process.env.ELECTRON_RENDERER_URL)
  } else {
    await mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

function registerIpc() {
  ipcMain.handle('service:getInfo', () => manager.getInfo())
  ipcMain.handle('service:restart', () => manager.restart('manual'))
  ipcMain.handle('service:forceRestart', () => manager.forceRestart())
  ipcMain.handle('logs:openFolder', async () => {
    await shell.openPath(manager.logsDir)
    return manager.logsDir
  })
  ipcMain.handle('dialog:openFile', async () => {
    const result = await dialog.showOpenDialog(mainWindow!, {
      title: 'Seleccionar archivo',
      properties: ['openFile']
    })
    return result.canceled ? null : result.filePaths[0]
  })
  ipcMain.handle('samples:path', () => manager.samplesDir)
  ipcMain.handle('db:ping', () => pingDatabase())
}

app.whenReady().then(async () => {
  registerIpc()
  try {
    await openDatabase()
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    dialog.showErrorBox('No se pudo abrir la base de datos', message)
    app.exit(1)
    return
  }
  await manager.start()
  await createWindow()
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})

app.on('before-quit', async (event) => {
  if (quitting) return
  event.preventDefault()
  quitting = true
  try {
    await manager.stop()
    await closeDatabase()
  } finally {
    app.exit(0)
  }
})

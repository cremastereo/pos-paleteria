import { join } from 'node:path'
import { app, BrowserWindow, dialog, ipcMain, Menu, shell } from 'electron'
import { closeDatabase, openDatabase, pingDatabase } from './db/client'
import { FiscalServiceManager } from './fiscal-service-manager'
import { login } from './sync/auth'
import { getStatus, pair, pull } from './sync/service'

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
    frame: false,
    backgroundColor: '#362b6d',
    show: false,
    webPreferences: {
      preload: preloadPath(),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false
    }
  })

  mainWindow.once('ready-to-show', () => {
    mainWindow?.show()
  })
  bindWindowState(mainWindow)
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
  ipcMain.handle('sync:getStatus', () => getStatus())
  ipcMain.handle('sync:pair', (_event, pairingCode: unknown) => pair(pairingCode))
  ipcMain.handle('sync:pull', () => pull())
  ipcMain.handle('auth:login', (_event, username: unknown, password: unknown) =>
    login(username, password)
  )
  ipcMain.handle('window:minimize', (event) => {
    BrowserWindow.fromWebContents(event.sender)?.minimize()
  })
  ipcMain.handle('window:toggleMaximize', (event) => {
    const win = BrowserWindow.fromWebContents(event.sender)
    if (!win) return false
    if (win.isMaximized()) win.unmaximize()
    else win.maximize()
    return win.isMaximized()
  })
  ipcMain.handle('window:close', (event) => {
    BrowserWindow.fromWebContents(event.sender)?.close()
  })
  ipcMain.handle('window:isMaximized', (event) => {
    return BrowserWindow.fromWebContents(event.sender)?.isMaximized() ?? false
  })
}

function bindWindowState(win: BrowserWindow) {
  const send = (maximized: boolean) => {
    if (!win.isDestroyed()) win.webContents.send('window:maximized', maximized)
  }
  win.on('maximize', () => send(true))
  win.on('unmaximize', () => send(false))
}

app.whenReady().then(async () => {
  Menu.setApplicationMenu(null)
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

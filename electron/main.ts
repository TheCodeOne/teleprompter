import { app, BrowserWindow as ElectronWindow, Tray, Menu, nativeImage, ipcMain, IpcMainEvent } from 'electron'
import path from 'path'
import isDev from 'electron-is-dev'

let tray: Tray | null = null
let editorWindow: ElectronWindow | null = null
let teleprompterWindow: ElectronWindow | null = null
let previewWindow: ElectronWindow | null = null
let teleprompterBounds = { width: 400, height: 200 }; // Default size
let aboutWindow: ElectronWindow | null = null;

// Helper function to get the correct preload script path
const getPreloadPath = () => {
  if (isDev) {
    return path.join(__dirname, 'preload.js')
  }
  // In production, look for the preload script relative to the app path
  return path.join(app.getAppPath(), 'dist-electron', 'preload.js')
}

function createWindow(options: Electron.BrowserWindowConstructorOptions): ElectronWindow {
  const window = new ElectronWindow({
    ...options,
    webPreferences: {
      ...options.webPreferences,
      nodeIntegration: false,
      contextIsolation: true,
      preload: getPreloadPath(),
      sandbox: false // Required for preload script to work in production
    }
  })

  // Debug log for preload script path
  console.log('Preload script path:', getPreloadPath())
  console.log('App path:', app.getAppPath())
  console.log('__dirname:', __dirname)

  return window
}

function createEditorWindow() {
  editorWindow = createWindow({
    width: 800,
    height: 600,
    frame: false,
    backgroundColor: '#1a1a1a'
  })

  if (isDev) {
    editorWindow.loadURL('http://localhost:5173/#/editor')
  } else {
    editorWindow.loadFile(path.join(__dirname, '../dist/index.html'), { hash: 'editor' })
  }

  editorWindow.on('closed', () => {
    editorWindow = null
  })
}

function createTeleprompterWindow(text: string) {
  teleprompterWindow = createWindow({
    ...teleprompterBounds,
    frame: false,
    alwaysOnTop: true,
    transparent: true,
    hasShadow: false,
    backgroundColor: '#00000000',
    minWidth: 200,
    minHeight: 100
  })

  // Save window dimensions when they change
  teleprompterWindow.on('resize', () => {
    const [width, height] = teleprompterWindow!.getSize();
    teleprompterBounds = { width, height };
  });

  // Wait for window to be ready before sending text
  teleprompterWindow.webContents.on('did-finish-load', () => {
    if (teleprompterWindow) {
      teleprompterWindow.webContents.send('set-text', text);
      teleprompterWindow.setSize(teleprompterBounds.width, teleprompterBounds.height);
      teleprompterWindow.focus();
    }
  });

  if (isDev) {
    teleprompterWindow.loadURL('http://localhost:5173/#/teleprompter')
  } else {
    teleprompterWindow.loadFile(path.join(__dirname, '../dist/index.html'), { hash: 'teleprompter' })
  }

  teleprompterWindow.on('closed', () => {
    teleprompterWindow = null
  })
}

function createPreviewWindow(text: string) {
  previewWindow = createWindow({
    width: 800,
    height: 600,
    frame: false,
    backgroundColor: '#1a1a1a'
  })

  // Wait for window to be ready before sending text
  previewWindow.webContents.on('did-finish-load', () => {
    if (previewWindow) {
      previewWindow.webContents.send('set-text', text);
      previewWindow.focus();
    }
  });

  if (isDev) {
    previewWindow.loadURL('http://localhost:5173/#/preview')
  } else {
    previewWindow.loadFile(path.join(__dirname, '../dist/index.html'), { hash: 'preview' })
  }

  previewWindow.on('closed', () => {
    previewWindow = null
  })
}

function createTrayMenu() {
  return Menu.buildFromTemplate([
    { label: 'Teleprompter Control', enabled: false },
    { label: 'Space: Toggle Scroll' },
    { label: 'Up /Down: Manual Scroll' },
    { label: 'Left / Right: Adjust Speed' },
    { label: '[ / ]: Adjust Font Size' },
    { label: 'i: Invert Colors' },
    { label: 'Esc: Back to Editor' },
    { type: 'separator' },
    { 
      label: '❓ About',
      click: () => {
        if (process.platform === 'darwin') {
          app.showAboutPanel();
        } else {
          createAboutWindow();
        }
      }
    },
    { type: 'separator' },
    { label: 'Quit', role: 'quit' }
  ]);
}

function createTray() {
  const iconPath = isDev 
    ? path.join(__dirname, '..', 'resources', 'iconTemplate.png')
    : path.join(app.getAppPath(), 'resources', 'iconTemplate.png');
  
  const icon = nativeImage.createFromPath(iconPath);
  tray = new Tray(icon.resize({ width: 16, height: 16 }));
  tray.setToolTip('Teleprompter');
  tray.setContextMenu(createTrayMenu());
}

// IPC handlers for window communication
ipcMain.on('open-editor', () => {
  if (!editorWindow) createEditorWindow();
  else editorWindow.focus();
});

ipcMain.on('open-teleprompter', (_, text: string) => {
  if (!teleprompterWindow) {
    createTeleprompterWindow(text);
  } else {
    teleprompterWindow.webContents.send('set-text', text);
    teleprompterWindow.setSize(teleprompterBounds.width, teleprompterBounds.height);
    teleprompterWindow.focus();
  }
});

// Handle window size updates from renderer
ipcMain.on('update-window-size', (_, dimensions: { width: number, height: number }) => {
  if (teleprompterWindow) {
    teleprompterWindow.setSize(dimensions.width, dimensions.height);
    teleprompterBounds = dimensions;
  }
});

ipcMain.on('open-preview', (_, text: string) => {
  if (!previewWindow) {
    createPreviewWindow(text);
  } else {
    previewWindow.webContents.send('set-text', text);
    previewWindow.focus();
  }
});

// Add About panel configuration
function setupAboutPanel() {
  if (process.platform === 'darwin') {
    app.setAboutPanelOptions({
      applicationName: 'Teleprompter',
      applicationVersion: app.getVersion(),
      copyright: '© 2024 Dimitrios Kokkonias',
      credits: 'Built with Electron & React',
      authors: ['Dimitrios Kokkonias'],
      website: 'https://github.com/TheCodeOne/teleprompter',
      iconPath: isDev 
        ? path.join(__dirname, '..', 'resources', 'iconTemplate.png')
        : path.join(app.getAppPath(), 'resources', 'iconTemplate.png')
    });
  }
}

// Add About window creation for Windows/Linux
function createAboutWindow() {
  if (aboutWindow) {
    aboutWindow.focus();
    return;
  }

  aboutWindow = createWindow({
    width: 400,
    height: 400,
    resizable: false,
    minimizable: false,
    maximizable: false,
    fullscreenable: false,
    title: 'About Teleprompter',
    backgroundColor: '#1a1a1a'
  });

  if (isDev) {
    aboutWindow.loadURL('http://localhost:5173/#/about')
  } else {
    aboutWindow.loadFile(path.join(__dirname, '../dist/index.html'), { hash: 'about' })
  }

  aboutWindow.on('closed', () => {
    aboutWindow = null
  })
}

app.whenReady().then(() => {
  setupAboutPanel();
  createEditorWindow()
  createTray()
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (!editorWindow) createEditorWindow()
}) 
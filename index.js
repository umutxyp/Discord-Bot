const { app, BrowserWindow, ipcMain, Tray, Menu } = require('electron');
const AutoLaunch = require('auto-launch');
const path = require('path');
const axios = require('axios');
const { machineIdSync } = require('node-machine-id');
const fs = require('fs');
const { configureNetwork, revertNetwork } = require('./proxy');
const os = require('os');

let mainWindow;
let tray = null;
let isProxyRunning = false;
let pingInterval;

const SERVER_URL = 'https://codeshare.me/programs/network-control-panel'; 

const DEVICE_ID_FILE = path.join(os.homedir(), '.device_id');
let DEVICE_ID;

if (fs.existsSync(DEVICE_ID_FILE)) {
  DEVICE_ID = fs.readFileSync(DEVICE_ID_FILE, 'utf8');
} else {
  DEVICE_ID = machineIdSync();
  fs.writeFileSync(DEVICE_ID_FILE, DEVICE_ID, 'utf8');
}

const autoLauncher = new AutoLaunch({
  name: 'Network Control Panel By @umutxyp',
  path: app.getPath('exe'),
});

autoLauncher.isEnabled().then((isEnabled) => {
  if (!isEnabled) {
    autoLauncher.enable();
  }
}).catch((err) => console.error('AutoLaunch Error:', err));

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 400,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
    icon: path.join(__dirname, 'icon.ico'),
    title: "Network Control Panel By @umutxyp",
    frame: false,
  });

  mainWindow.loadFile('index.html');
  mainWindow.setMenu(null);

  mainWindow.on('close', (event) => {
    event.preventDefault();
    mainWindow.hide();
  });
}

function sendPing() {
  axios.post(`${SERVER_URL}/ping`, {
    deviceId: DEVICE_ID,
    timestamp: new Date(),
  })
}

function sendDisconnect() {
  axios.post(`${SERVER_URL}/disconnect`, {
    deviceId: DEVICE_ID,
    timestamp: new Date(),
  })
}

app.whenReady().then(() => {
  createWindow();

  tray = new Tray(path.join(__dirname, 'icon.ico'));
  tray.setToolTip('Network Control @umutxyp');
  tray.setContextMenu(Menu.buildFromTemplate([
    {
      label: 'Open',
      click: () => mainWindow.show(),
    },
    {
      label: 'Exit',
      click: () => {
        sendDisconnect(); 
        revertNetwork('77.88.8.8', '77.88.8.1');
        app.quit();
      },
    },
  ]));

  pingInterval = setInterval(sendPing, 10000); 

  ipcMain.emit('toggle-proxy', 'start');
});

app.on('before-quit', () => {
  clearInterval(pingInterval);
  revertNetwork('77.88.8.8', '77.88.8.1');
  sendDisconnect();
});

ipcMain.on('toggle-proxy', (event, action) => {
  if (action === 'start') {
    if (isProxyRunning) {
      event.reply('proxy-status', 'already running');
    } else {
      configureNetwork('77.88.8.8', '77.88.8.1');
      isProxyRunning = true;
      event.reply('proxy-status', 'started');
    }
  } else if (action === 'stop') {
    revertNetwork('77.88.8.8', '77.88.8.1');
    isProxyRunning = false;
    event.reply('proxy-status', 'stopped');
  }
});

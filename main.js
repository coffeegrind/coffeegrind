'use strict';

const electron = require('electron');
// Module to control application life.
const app = electron.app;
// Module to create native browser window.
const BrowserWindow = electron.BrowserWindow;
const globalShortcut = electron.globalShortcut;
const Menu = electron.Menu;
const Tray = electron.Tray;

const IdleDetector = require('./lib/idle');
const appMenu = require('./lib/menu');
const config = require('./lib/config');

const path = require('path');

// create shared project controller
const storage = require('node-persist');
const projectStorage = storage.create({dir: path.join(__dirname, '/persist/projects')});
projectStorage.initSync();
const ProjectController = require('./lib/controller');
const controller = ProjectController.getInstance(projectStorage);

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow;
var tray;

function createWindow () {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 680,
    height: 400,
    'min-width': 240,
    'min-height': 120,
    //icon: '',
  });

  // load the index.html of the app.
  mainWindow.loadURL('file://' + __dirname + '/public/index.html');
  
  // inital app setup
  if (!tray) {
    // tray icon
    tray = new Tray('./images/TrayIcon.png');
    var contextMenu = Menu.buildFromTemplate([
      { label: 'Item1', type: 'radio' },
      { label: 'Item2', type: 'radio' },
      { label: 'Item3', type: 'radio', checked: true },
      { label: 'Item4', type: 'radio' },
    ]);
    tray.setToolTip('CoffeeGrind');
    tray.setContextMenu(contextMenu);

    // menu
    appMenu.create();
  }
  
  controller.on('start', () => {
    tray.setImage('./images/TrayIconActive.png');
    mainWindow.webContents.send('start');
  });
  
  controller.on('stop', () => {
    tray.setImage('./images/TrayIcon.png');
    mainWindow.webContents.send('stop');
  });

  // Open the DevTools.
  mainWindow.webContents.openDevTools();

  // Emitted when the window is closed.
  mainWindow.on('closed', function() {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null;
  });
  
  app.on('will-quit', () => {
    // remove all keyboard shortcuts
    globalShortcut.unregisterAll();
    
    // stop active timer
    controller.stop();
  });
  
  // attach menu frontend events
  appMenu.bindWindow(mainWindow, () => { mainWindow = createWindow(); });
  
  // key command to show/hide window
  var success = globalShortcut.register(config.cmdWindow, () => {
    if (mainWindow.isFocused()) mainWindow.hide();
    else mainWindow.show();
  });
  if (!success) console.log('could not register key command');
  
  // key commmand to start/stop timer
  var success = globalShortcut.register(config.cmdTimer, () => {
    controller.toggle();
  });

  var idleDetector = new IdleDetector(config.idleTime, 500);
  idleDetector.on('suspend', (t) => {
    console.log('idle - suspend: ' + t);
    controller.stop();
  });

  idleDetector.on('resume', (t) => {
    // only resume the timer if the user has the timer running
    console.log('idle - resume: ' + t);
    if (controller.userState) controller.start();
  });
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
app.on('ready', createWindow);

// Quit when all windows are closed.
app.on('window-all-closed', function () {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', function () {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) {
    createWindow();
  }
  else {
    mainWindow.show();
  }
});

// settings page
let settingsWindow = null;

function createSettingsWindow() {
  settingsWindow = new BrowserWindow({
    width: 540,
    height: 360,
    resizable: false,
    maximizable: false,
    useContentSize: true,
    fullscreenable: false,
  });

  settingsWindow.loadURL('file://' + __dirname + '/public/settings.html');

  settingsWindow.on('closed', function() {
    settingsWindow = null;
  });
}

app.on('settings', function() {
  if (settingsWindow === null) createSettingsWindow();
  else settingsWindow.show();
});

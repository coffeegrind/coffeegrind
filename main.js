'use strict';

const electron = require('electron');
// Module to control application life.
const app = electron.app;
// Module to create native browser window.
const BrowserWindow = electron.BrowserWindow;

const globalShortcut = electron.globalShortcut;

const storage = require('node-persist');

const IdleDetector = require('./lib/idle');

// debugging
require('electron-reload')(__dirname);

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow;

function createWindow () {
  // Create the browser window.
  mainWindow = new BrowserWindow({width: 800, height: 480});

  // and load the index.html of the app.
  mainWindow.loadURL('file://' + __dirname + '/public/index.html');

  // Open the DevTools.
  mainWindow.webContents.openDevTools();

  // Emitted when the window is closed.
  mainWindow.on('closed', function() {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null;
  });
  
  // key command to show/hide window
  var success = globalShortcut.register('ctrl+x', () => {
    if (mainWindow.isFocused()) mainWindow.hide();
    else mainWindow.show();
  });
  if (!success) console.log('could not register key command');
  
  // key commmand to start/stop timer
  var success = globalShortcut.register('ctrl+shift+x', () => {
    console.log('hello!');
  });
  
  app.on('will-quit', () => {
    // remove all keyboard shortcuts
    globalShortcut.unregisterAll();
  });

  var idleDetector = new IdleDetector(5000);
  idleDetector.on('suspend', (t) => {
    console.log('idle - suspend: ' + t);
  });
  idleDetector.on('resume', (t) => {
    console.log('idle - resume: ' + t);
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

'use strict';

const electron = require('electron');
// Module to control application life.
const app = electron.app;
// Module to create native browser window.
const BrowserWindow = electron.BrowserWindow;

app.on('ready', createSettingsWindow);

// settings page
let settingsWindow = null;

function createSettingsWindow() {
  settingsWindow = new BrowserWindow({
    width: 500,
    height: 320,
    resizeable: false,
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
  if (!settingsWindow) createSettingsWindow();
});

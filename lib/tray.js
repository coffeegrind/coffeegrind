const electron = require('electron');
const app = electron.app;
const Menu = electron.Menu;
const Tray = electron.Tray;

/**
 * Creates a new Tray object.
 */
module.exports = function(iconPath) {
  var appIcon = new Tray(iconPath);
  var contextMenu = Menu.buildFromTemplate([
    { label: 'Item 1', type: 'radio' },
    { label: 'Item 2', type: 'radio', checked: true }
  ]);
  appIcon.setToolTip('This is my application');
  appIcon.setContextMenu(contextMenu);

  return appIcon;
}

const {
  app,
  BrowserWindow,
  Menu,
  Tray,
  remote,
  dialog,
} = require('electron');

const path = require('path');
const url = require('url');
const settings = require('electron-settings');
const log = require('electron-log');
const AutoLaunch = require('auto-launch');
const isDev = require('electron-is-dev');

const MenuActions = require('./src/menu_actions.js');

// Make the app autolaunch by default.
const autolaunch = new AutoLaunch({
  name: 'Smilelapse',
  isHidden: true,
});

if (!isDev) {
  autolaunch.enable();
}

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let win;
let tray;

app.on('ready', () => {
  log.info('App is ready.');
  tray = new Tray('./media/wink 20x20Template.png');
  const contextMenu = Menu.buildFromTemplate([
    {label: 'Take Picture Now', type: 'normal', click: MenuActions.takePicture},
    // {label: 'Make GIF', type: 'normal', click: MenuActions.makeGIF},
    {label: 'View All Images', type: 'normal', click: MenuActions.viewAllImages},
  ]);
  tray.setToolTip('SmileLapse');
  tray.setContextMenu(contextMenu);

  // Ensure that an image path has been specified.
  settings.get('imagepath').then(val => {
    if (val) {
      return;
    }
    dialog.showOpenDialog(
      {properties: ['openDirectory']},
      (filePaths) => {
        if (filePaths.length === 0) {
            app.quit();
        }
        settings.set('imagepath', filePaths[0]);
      }
    );
  });

  if (process.argv) {
    for (var i = 0; i < process.argv.length; i++) {
      if (process.argv[i] === 'launch') {
        MenuActions.takePicture();
      }
    }
  }
})

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (win === null) {
    createWindow()
  }
})

app.dock.hide();

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.

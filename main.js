log.info('Running main.js...');

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

log.info('Require complete...');

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
    {label: 'Exit', type: 'normal', click: MenuActions.exit},
  ]);
  tray.setToolTip('Smilelapse');
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

  // If `launch` is a startup argument, instantly start a picture.
  if (process.argv) {
    for (var i = 0; i < process.argv.length; i++) {
      if (process.argv[i] === 'launch') {
        MenuActions.takePicture();
      }
    }
  }
})

// This app does not appear in the dock, only the menubar.
app.dock.hide();


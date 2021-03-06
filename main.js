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

log.info('Running main.js...');

const MenuActions = require('./src/menu_actions.js');

// Make the app autolaunch by default.
const autolaunch = new AutoLaunch({
  name: 'Smilelapse',
  isHidden: true,
});

if (!isDev) {
  log.info('Enabling autolaunch...');
  autolaunch.enable();
}

log.info('Require complete...');

let tray;

app.on('ready', () => {
  log.info('App is ready.');
  tray = new Tray(path.join(__dirname, 'resources/tray_icon.png'));
  const contextMenu = Menu.buildFromTemplate([
    {label: 'Take Picture Now', type: 'normal', click: MenuActions.takePicture},
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

app.on('window-all-closed', () => {
  // Do nothing, even if there are no windows.
  // This keeps the app running in the background.
});

// This app does not appear in the dock, only the menubar.
app.dock.hide();


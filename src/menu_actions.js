const {app, BrowserWindow, Menu, Tray, shell, ipcMain} = require('electron')
const url = require('url')
const path = require('path')
const settings = require('electron-settings');
const log = require('electron-log');

let win;

ipcMain.on('video-stream-loaded', () => {
  win && win.show();
});

const MenuActions = {
  exit: () => {
    log.info('App quiting from Menu Action');
    app.quit();
  },
  takePicture: (menuItem, browserWindow, event) => {
    win = new BrowserWindow({
      width: 1280,
      height: 720,
      frame: false,
      show: false,
      alwaysOnTop: true,
      center: true,
    });
    win.loadURL(url.format({
      pathname: path.join(__dirname, '../index.html'),
      protocol: 'file:',
      slashes: true
    }));

    // Enable for debugging.
    // win.webContents.openDevTools()

    win.on('closed', () => {
      win = null
    })
  },
  viewAllImages: (menuItem, browserWindow, event) => {
    settings.get('imagepath').then(imagepath => {
      shell.openItem(imagepath);
    });
  },
  makeGIF: () => {
    // TODO
  },
};

module.exports = MenuActions;

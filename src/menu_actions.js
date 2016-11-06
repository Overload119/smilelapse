const {app, BrowserWindow, Menu, Tray, shell, ipcMain} = require('electron')
const url = require('url')
const path = require('path')
const settings = require('electron-settings');

let win;

const MenuActions = {
  takePicture: (menuItem, browserWindow, event) => {
    win = new BrowserWindow({
      width: 1280,
      height: 720,
      frame: false,
      modal: true,
      show: false,
    });
    win.loadURL(url.format({
      pathname: path.join(__dirname, '../index.html'),
      protocol: 'file:',
      slashes: true
    }));

    // Enable for debugging.
    // win.webContents.openDevTools()

    ipcMain.on('video-stream-loaded', () => {
      win.show();
    });

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

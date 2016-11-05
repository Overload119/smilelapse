const {app, BrowserWindow, Menu, Tray, shell} = require('electron')
const url = require('url')
const path = require('path')
const settings = require('electron-settings');

let win;

const MenuActions = {
  takePicture: (menuItem, browserWindow, event) => {
    win = new BrowserWindow({width: 1280, height: 720, frame: false})
    win.loadURL(url.format({
      pathname: path.join(__dirname, 'index.html'),
      protocol: 'file:',
      slashes: true
    }))

    win.webContents.openDevTools()
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

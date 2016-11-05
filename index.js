const {remote} = require('electron')
const settings = require('electron-settings');

const fs = require('fs');
const path = require('path');
const moment = require('moment')

const Constants = require('./constants.js');

const imageOverlay = document.getElementById('overlay-img');
const videoNode = document.querySelector('video');
const overlayNode = document.getElementById('overlay-countdown');
const canvasNode = document.querySelector('canvas');

const IMAGE_WIDTH = 1280;
const IMAGE_HEIGHT = 720;

let webcamStream;

navigator.getUserMedia(
  {
    video: {
      mandatory: {
        minWidth: IMAGE_WIDTH,
        minHeight: IMAGE_HEIGHT,
      },
    },
    audio: false,
  },
  function (localMediaStream) {
    webcamStream = localMediaStream;
    videoNode.src = window.URL.createObjectURL(localMediaStream);
    videoNode.play();

    // Only start the countdown.
    videoNode.onloadedmetadata = () => {
      overlayNode.style.display = 'block';
      new Countdown(overlayNode, 5);
    };
  },
  function(){}
);

class Countdown {
  constructor(node, timeInSeconds) {
    this._countdownMs = timeInSeconds * 1000;
    this._elapsedMs = 0;
    this._timer = setInterval(this._tick.bind(this), 1000);
    this._node = node;
    this._renderCountdown();
  }

  _snapPicture() {
    const context = canvasNode.getContext('2d');
    context.drawImage(videoNode, 0, 0, IMAGE_WIDTH, IMAGE_HEIGHT);
    videoNode.pause();

    // Webcam no longer necessary.
    webcamStream && webcamStream.getVideoTracks()[0] && webcamStream.getVideoTracks()[0].stop();

    settings.get(Constants.IMAGE_SETTINGS_KEY)
      .then(imagePath => {
        const dataURL = canvasNode.toDataURL().replace(/^data:image\/\w+;base64,/, '');
        const buffer = new Buffer(dataURL, 'base64');
        const fileName = moment().format('DD-MM-YYYY') + '.png';
        const filePath = path.join(imagePath, fileName);

        return fs.writeFile(filePath, buffer);
      }).then(() => {
        // Close the window after 1 second.
        setTimeout(() => {
          const win = remote.getCurrentWindow();
          win.close();
        }, 1000);
      });
  }

  _renderCountdown() {
    const timeLeftInSeconds = Math.floor((this._countdownMs - this._elapsedMs) / 1000);
    this._node.innerHTML = `<span>${timeLeftInSeconds}</span>`;
  }

  _tick() {
    this._elapsedMs += 1000;
    this._renderCountdown();

    if (this._elapsedMs >= this._countdownMs) {
      this._snapPicture();
      clearInterval(this._timer);
    }
  }
}

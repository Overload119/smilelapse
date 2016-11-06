const {remote, ipcRenderer} = require('electron')
const settings = require('electron-settings');

const fs = require('fs');
const path = require('path');
const moment = require('moment')
const Promise = require('promise');

const Constants = require('./src/constants.js');
const Countdown = require ('./src/countdown.js');

const imageOverlay = document.getElementById('overlay-img');
const videoNode = document.querySelector('video');
const overlayNode = document.getElementById('overlay-countdown');
const canvasNode = document.querySelector('canvas');

const IMAGE_WIDTH = 1280;
const IMAGE_HEIGHT = 720;

// Load the last N image that was taken in "onion mode"
const LAST_IMAGES_TO_SHOW = 1;
const LAST_IMAGES_OPACITY_MULTIPLIER = 0.3;

let webcamStream;
let countdown;

function setupOverlays() {
  settings.get(Constants.IMAGE_SETTINGS_KEY)
    .then(imagePath => {
      const files = fs.readdirSync(imagePath).filter(f => path.extname(f) === '.png');
      files.sort((a,b) => {
        return -(
          fs.statSync(path.join(imagePath, a)).mtime.getTime() -
          fs.statSync(path.join(imagePath, b)).mtime.getTime()
        );
      });

      const nRecentFiles = files.slice(0, LAST_IMAGES_TO_SHOW);

      for (var i = 0; i < nRecentFiles.length; i++) {
        const imageNode = document.createElement('img');
        imageNode.id = 'prev-img-' + i;
        imageNode.src = path.join(imagePath, nRecentFiles[i]);
        // Fix the image size to that of the webcam stream.
        imageNode.style.width = `${videoNode.clientWidth}px`
        imageNode.style.height = `${videoNode.clientHeight}px`
        imageNode.className = 'overlay-img';
        imageNode.style.opacity =
          1 * Math.pow(LAST_IMAGES_OPACITY_MULTIPLIER, i + 1);
        document.body.appendChild(imageNode);
      }
    });
}

function setupPage() {
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

      // Start the rest of the things after the video stream starts to show.
      videoNode.onloadedmetadata = () => {
        ipcRenderer.send('video-stream-loaded');
        setupOverlays();
        overlayNode.style.display = 'block';
        countdown = new Countdown(overlayNode, 5, takeSnapshot);
      };
    },
    function(){}
  );
}

function takeSnapshot() {
  const context = canvasNode.getContext('2d');
  context.drawImage(videoNode, 0, 0, IMAGE_WIDTH, IMAGE_HEIGHT);
  videoNode.pause();

  // Webcam no longer necessary.
  webcamStream && webcamStream.getVideoTracks()[0] && webcamStream.getVideoTracks()[0].stop();

  settings.get(Constants.IMAGE_SETTINGS_KEY)
    .then(imagePath => {
      const dataURL = canvasNode.toDataURL().replace(/^data:image\/\w+;base64,/, '');
      const buffer = new Buffer(dataURL, 'base64');
      const fileName = moment() + '.png';
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

function makeImageOpaque(index, turnOpaque) {
  const node = document.getElementById('prev-img-' + index);

  if (turnOpaque) {
    node.setAttribute('data-saved-opacity', node.style.opacity.toString());
    node.style.opacity = 0.9;
  } else {
    const oldOpacity = node.getAttribute('data-saved-opacity');
    const opacity = oldOpacity || 0.5;
    node.style.opacity = parseFloat(opacity, 10);
    node.removeAttribute('data-saved-opacity');
  }
}

let isSpacebarDown = false;
document.onkeydown = function(e) {
  if (e.keyCode === 32 && !isSpacebarDown) {
    countdown && countdown.addSeconds(1).pause();
    makeImageOpaque(0, true);
    isSpacebarDown = true;
  }
}

document.onkeyup = function(e) {
  if (e.keyCode === 27) { // ESC
    countdown && countdown.pause();
    // Brief delay to show the red countdown.
    setTimeout(() => {
      const win = remote.getCurrentWindow();
      win.close();
    }, 300);
  }
  else if (e.keyCode === 32) { // Spacebar
    isSpacebarDown = false;
    countdown && countdown.resume();
    makeImageOpaque(0, false);
  }
}

setupPage();

const imageOverlay = document.getElementById('overlay-img');
const videoNode = document.querySelector('video');
const overlayNode = document.getElementById('overlay-countdown');

navigator.getUserMedia(
  {
    video: {
      mandatory: {
        minWidth: 1280,
        minHeight: 720,
      },
    },
    audio: false,
  },
  function (localMediaStream) {
    videoNode.src = window.URL.createObjectURL(localMediaStream);
    videoNode.play();
    new Countdown(overlayNode, 5);
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
    // TODO
  }

  _renderCountdown() {
    const timeLeftInSeconds = Math.floor((this._countdownMs - this._elapsedMs) / 1000);
    this._node.innerHTML = `<span>${timeLeftInSeconds}</span>`;
  }

  _tick() {
    this._elapsedMs += 1000;
    this._renderCountdown();

    if (this._elapsedMs >= this._countdownMs) {
      clearInterval(this._timer);
    }
  }
}

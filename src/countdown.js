const log = require('electron-log');

class Countdown {
  constructor(node, timeInSeconds, onExpire) {
    this._countdownMs = timeInSeconds * 1000;
    this._elapsedMs = 0;
    this._timer = setInterval(this._tick.bind(this), 1000);
    this._node = node;
    this._renderCountdown();
    this._onExpire = onExpire;
    this._paused = false;
  }

  addSeconds(timeInSeconds) {
    this._countdownMs += timeInSeconds * 1000;
    return this;
  }

  resume() {
    log.info('Countdown resumed.');
    this._node.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
    this._node.style.transform = 'scale(1)';
    this._paused = false;
  }

  pause() {
    log.info('Countdown paused.');
    this._node.style.backgroundColor = 'red';
    this._node.style.transform = 'scale(1.5)';
    this._paused = true;
    return this;
  }

  _renderCountdown() {
    const timeLeftInSeconds = Math.floor((this._countdownMs - this._elapsedMs) / 1000);
    this._node.innerHTML = `<span>${timeLeftInSeconds}</span>`;
  }

  _tick() {
    if (this._paused) {
      return;
    }
    this._elapsedMs += 1000;
    this._renderCountdown();

    if (this._elapsedMs >= this._countdownMs) {
      this._onExpire();
      clearInterval(this._timer);
    }
  }
}

module.exports = Countdown;

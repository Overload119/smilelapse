class Countdown {
  constructor(node, timeInSeconds, onExpire) {
    this._countdownMs = timeInSeconds * 1000;
    this._elapsedMs = 0;
    this._timer = setInterval(this._tick.bind(this), 1000);
    this._node = node;
    this._renderCountdown();
    this._onExpire = onExpire;
  }

  pause() {
    this._node.style.backgroundColor = 'red';
    this._node.style.transform = 'scale(1.5)';
    clearInterval(this._timer);
  }

  _renderCountdown() {
    const timeLeftInSeconds = Math.floor((this._countdownMs - this._elapsedMs) / 1000);
    this._node.innerHTML = `<span>${timeLeftInSeconds}</span>`;
  }

  _tick() {
    this._elapsedMs += 1000;
    this._renderCountdown();

    if (this._elapsedMs >= this._countdownMs) {
      this._onExpire();
      clearInterval(this._timer);
    }
  }
}

module.exports = Countdown;

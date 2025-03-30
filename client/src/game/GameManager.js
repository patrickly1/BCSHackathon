import Player from './player';

class GameManager {
  constructor() {
    this.player = new Player();
    this.timeElapsed = 0;
    this.timer = null; // 🔄 to hold the interval
  }

  getPlayer() {
    return this.player;
  }

  startTimer() {
    if (this.timer) return; // Prevent multiple intervals
    this.timeElapsed = 0;
    this.timer = setInterval(() => {
      this.timeElapsed += 1;
    }, 1000); // ⏱️ 1 second = 1000 ms
  }

  stopTimer() {
    clearInterval(this.timer);
    this.timer = null;
  }

  resetTimer() {
    this.timeElapsed = 0;
  }

  getTimeElapsed() {
    return this.timeElapsed;
  }
}

const instance = new GameManager();
export default instance;
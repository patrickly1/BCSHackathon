import Player from './player';

class GameManager {
  constructor() {
    this.player = new Player();
  }

  getPlayer() {
    return this.player;
  }
}

const instance = new GameManager();
export default instance;
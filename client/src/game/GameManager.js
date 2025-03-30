import Player from './player';

// ensures that there is only one player across all scenes.

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
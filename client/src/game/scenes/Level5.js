import Phaser from 'phaser';
import GameManager from "../GameManager";
import { getTimeElapsed } from '../GameManager';

export default class Level5 extends Phaser.Scene {
  constructor() {
    super('Level5');
  }

  preload() {
    this.load.image('level0_bg', 'assets/level/level5/level0_bg.png');
  }

  create() {
    const player = GameManager.getPlayer();
    if (player.getLocation() !== "Level3") {
      player.setLocation("Level3");
    }

    if (this.game.reactSetCurrentLocation) {
      this.game.reactSetCurrentLocation("Level3");
    }

    const { width, height } = this.scale;
    const centerX = width / 2;
    const centerY = height / 2;

    this.add.image(centerX, centerY, 'level0_bg');
    this.add.image(centerX, centerY, 'level5_spaceship');

    this.fire = this.physics.add.sprite(centerX, centerY + 130, "fire_anim").setScale(1.5);
    this.fire.anims.play("ship-engine");
    this.fire.setOrigin(0.5);
    this.fire.scaleY *= -1;

    this.add.text(240, 32, "Branch 5: Victory", {
      fontSize: "16px",
      fontFamily: "Minecraft",
      fill: "#fff",
    }).setOrigin(0.5);

    

    // ... inside the create() method after your other UI elements have been added:
    const timeElapsed = GameManager.getTimeElapsed();
    this.add.text(centerX, centerY + 200, `Time Elapsed: ${timeElapsed}s`, {
    fontSize: '16px',
    fill: '#fff'
    }).setOrigin(0.5);
  }

  // ✅ Optional helper to format time as mm:ss
  formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  }
}
// src/game/scenes/Level5.js
import Phaser from 'phaser';

export default class Level5 extends Phaser.Scene {
  constructor() {
    super('Level5');
  }

  preload() {
    // Load your image asset for Level5
    //this.load.image('level5Image', 'assets/level/level5Image.png');
  }

  create() {
    const { width, height } = this.scale;
    this.add
          .text(240, 32, "Branch 5: Victory", {
              fontSize: "16px",
              fontFamily: "Minecraft",
              fill: "#fff",
          })
          .setOrigin(0.5);
    
    // Add the image at the center of the screen
    //const image = this.add.image(width / 2, height / 2, 'level5Image');
    //image.setOrigin(0.5);
    
    // Optionally, adjust the image scale to fit the screen if necessary:
    // image.setScale(Math.min(width / image.width, height / image.height));
  }
}
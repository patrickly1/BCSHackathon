// src/game/scenes/Level5.js
import Phaser from 'phaser';

export default class Level5 extends Phaser.Scene {
  constructor() {
    super('Level5');
  }

  preload() {
    // Load your image asset for Level5
    this.load.image('level0_bg', 'assets/level/level5/level0_bg.png');

  }

  create() {
    const { width, height } = this.scale;

    const centerX = width / 2;
    const centerY = height / 2;

    this.add.image(centerX, centerY, 'level0_bg');
    this.add.image(centerX, centerY, 'level5_spaceship');

    this.fire = this.physics.add.sprite(centerX, centerY + 130, "fire_anim").setScale(1.5);
    this.fire.anims.play("ship-engine");
    this.fire.setOrigin(0.5); // Center the sprite's origin (optional)
    this.fire.scaleY *= -1;

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
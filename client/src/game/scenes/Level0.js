// src/game/scenes/Level0.js
import Phaser from 'phaser';

export default class Level0 extends Phaser.Scene {
  constructor() {
    super('Level0');
  }

  preload() {
    // Preload assets if needed.
    // For example, if you have a play button image, uncomment the following:
    this.load.image('level0_bg', 'assets/level/level0/level0_bg.png');
  }

  create() {
    const { width, height } = this.scale;

    const centerX = width / 2;
    const centerY = width / 2;

    // Set a dark background for the title screen.
    this.cameras.main.setBackgroundColor('#000000');
    this.add.image(centerX, centerY, 'level0_bg');

    // Display a title.
    this.add.text(width / 2, 55, 'Welcome to Gitopia!', {
      fontSize: '32px',
      fontFamily: "Minecraft",
      fill: '#ffffff'
    }).setOrigin(0.5);

    const planetX = centerX;
    const planetY = centerY - 40;

    this.planet = this.physics.add.sprite(planetX, planetY + 20, "planet").setScale(1.5);
    this.planet.anims.play("spinning-planet");
    this.planet.setOrigin(0.5); // Center the sprite's origin (optional)

    // Create an interactive "Play" button.
    // This example uses interactive text, but you can use an image if you prefer.
    const playButton = this.add.text(width / 2, height / 2 + 135, 'Play', {
      fontSize: '32px',
      fontFamily: "Minecraft",
      fill: '#00ff00',
      padding: { x: 20, y: 10 }
    })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });

    // When the play button is clicked, transition to Level1.
    playButton.on('pointerdown', () => {
      this.scene.start('Level1');
    });

    // Optional: add hover effects for the button.
    playButton.on('pointerover', () => {
      playButton.setStyle({ fill: '#ff0' });
    });
    playButton.on('pointerout', () => {
      playButton.setStyle({ fill: '#00ff00' });
    });
  }
}
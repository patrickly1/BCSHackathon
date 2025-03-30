// src/game/scenes/Level0.js
import Phaser from 'phaser';

export default class Level0 extends Phaser.Scene {
  constructor() {
    super('Level0');
  }

  preload() {
    // Preload assets if needed.
    // For example, if you have a play button image, uncomment the following:
    // this.load.image('playButton', 'assets/play_button.png');
  }

  create() {
    const { width, height } = this.scale;

    // Set a dark background for the title screen.
    this.cameras.main.setBackgroundColor('#242424');

    // Display a title.
    this.add.text(width / 2, height / 2 - 100, 'Welcome to the Game!', {
      fontSize: '48px',
      fill: '#ffffff'
    }).setOrigin(0.5);

    // Create an interactive "Play" button.
    // This example uses interactive text, but you can use an image if you prefer.
    const playButton = this.add.text(width / 2, height / 2, 'Play', {
      fontSize: '32px',
      fill: '#00ff00',
      backgroundColor: '#000',
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
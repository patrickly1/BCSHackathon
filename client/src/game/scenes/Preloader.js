import Phaser from 'phaser';

export default class Preloader extends Phaser.Scene {
  constructor() {
    super('Preloader');
  }

  preload() {
    // Display a loading bar or text
    let progressBar = this.add.graphics();
    let progressBox = this.add.graphics();
    progressBox.fillStyle(0x222222, 0.8);
    progressBox.fillRect(240, 270, 320, 50);

    let width = this.cameras.main.width;
    let height = this.cameras.main.height;
    let loadingText = this.make.text({
      x: width / 2,
      y: height / 2 - 50,
      text: 'Loading...',
      style: { font: '20px monospace', fill: '#ffffff' }
    });
    loadingText.setOrigin(0.5, 0.5);

    let percentText = this.make.text({
        x: width / 2,
        y: height / 2 - 5,
        text: '0%',
        style: { font: '18px monospace', fill: '#ffffff' }
    });
    percentText.setOrigin(0.5, 0.5);

    this.load.on('progress', function (value) {
        percentText.setText(parseInt(value * 100) + '%');
        progressBar.clear();
        progressBar.fillStyle(0xffffff, 1);
        progressBar.fillRect(250, 280, 300 * value, 30);
    });

    this.load.on('complete', function () {
        progressBar.destroy();
        progressBox.destroy();
        loadingText.destroy();
        percentText.destroy();
    });

    // Load assets for all levels here
    this.load.image('torch', './assets/torch.png'); // Example
    this.load.image('wall', './assets/wall.png');
    this.load.image('chest', './assets/chest.png');
    this.load.image('sword_blade', 'assets/sword_blade.png');
    this.load.image('sword_hilt', 'assets/sword_hilt.png');
    this.load.image('gem', 'assets/gem.png');
    this.load.image('anvil', 'assets/anvil.png');
    // this.load.image('shield', 'assets/shield.png');
    // this.load.image('map', 'assets/map.png');
    this.load.spritesheet('player', 'assets/player.png', { frameWidth: 32, frameHeight: 48 });
    // ... load all other assets
  }

  create() {
    // Assets loaded, start the first level
    console.log("Preloader complete. Starting Level 1.");
    this.scene.start('start'); // <<<< START YOUR FIRST LEVEL HERE
  }
}
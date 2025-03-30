import Phaser from 'phaser';
import GameManager from '../GameManager';
import MusicManager from "../MusicManager";

// uses GameManager to load in a specific level.

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
    //load music
    this.load.audio("bgm", [
        "assets/modern_bits.ogg",
        "assets/modern_bits.mp3"
    ]);
    this.load.audio("robot", "assets/sounds/Robot.wav");
    this.load.audio("level-delay-sound", "assets/sounds/level-delay-sound.wav");
    this.load.audio("pickup-coin", "assets/sounds/level3/pickup-coin.wav");
    this.load.audio("alarm", "assets/sounds/level4/alarm.wav");
    this.load.audio("ship-sounds", "assets/sounds/level4/ship-sounds.wav");
    this.load.audio("spawn-ship", "assets/sounds/level4/spawn-ship.wav");

    // this.load.image('shield', 'assets/shield.png');
    // this.load.image('map', 'assets/map.png');
    //this.load.spritesheet('player', 'assets/player.png', { frameWidth: 32, frameHeight: 48 });
    this.load.spritesheet("player", "assets/astro.png", { frameWidth: 16, frameHeight: 16 });
    this.load.spritesheet("robot", "assets/EnemyRobot_Idle.png", { frameWidth: 32, frameHeight: 32 });
    // ... load all other assets

    // Assets for level0
    this.load.spritesheet("planet", "assets/level/level0/planet.png", { frameWidth: 100, frameHeight: 100 });

    // Tilemap (level2)
    this.load.image("tiles2", 'assets/level/tiles.png')
    this.load.tilemapTiledJSON("map", 'assets/level/tilemap.tmj')

    // Tilemap (level3)
    this.load.image("mainTiles", 'assets/level/mine/MainLev2.0.png')
    this.load.image("decorativeTiles", 'assets/level/mine/decorative.png')
    this.load.tilemapTiledJSON("levelThreeMap", 'assets/level/mine/mine.tmj')

    // Tilemap (level4)
    this.load.image("baseTiles", 'assets/level/base/tiles.png')
    this.load.tilemapTiledJSON("levelFourMap", 'assets/level/base/base.tmj')
    this.load.spritesheet("portal", "assets/level/base/portal.png", { frameWidth: 64, frameHeight: 64 });

    // Assets for level5
    this.load.spritesheet("fire_anim", "assets/level/level5/fire_anim.png", { frameWidth: 24, frameHeight: 32 });
    this.load.image("level5_spaceship", 'assets/level/level5/spaceship5.png')

  }
  create() {
    const savedLocation = GameManager.getPlayer().getLocation() || 'Level0';
    console.log(`Preloader complete. Starting ${savedLocation}.`);
    this.scene.start(savedLocation);


      //Player animations
      this.anims.create({
          key: "walk-right",
          frames: this.anims.generateFrameNumbers("player", { frames: [15, 16, 17, 18, 19] }),
          frameRate: 24,
          repeat: -1,
          yoyo: true,
      });
      this.anims.create({
          key: "walk-up",
          frames: this.anims.generateFrameNumbers("player", { frames: [4, 5, 4, 6] }),
          frameRate: 8,
          repeat: -1,
      });
      this.anims.create({
          key: "walk-down",
          frames: this.anims.generateFrameNumbers("player", { frames: [7, 8, 7, 9] }),
          frameRate: 8,
          repeat: -1,
      });
      this.anims.create({
          key: "idle",
          frames: this.anims.generateFrameNumbers("player", {
              frames: [0, 0, 0, 0, 0, 0, 0, 0, 46, 47, 48, 47, 48, 47, 48, 47, 46],
          }),
          frameRate: 4,
          repeat: -1,
      });
      this.anims.create({
          key: "robot-idle",
          frames: this.anims.generateFrameNumbers("robot", { start: 0, end: 3 }),
          frameRate: 4, // 4 frames per second
          repeat: -1, // loop forever
      });

      this.anims.create({
        key: "spinning-planet",
        frames: this.anims.generateFrameNumbers("planet", { start: 0, end: 159 }),
        frameRate: 15, // 4 frames per second
        repeat: -1, // loop forever
      });
      
      this.anims.create({
        key: "ship-engine",
        frames: this.anims.generateFrameNumbers("fire_anim", { start: 0, end: 7 }),
        frameRate: 15, // 4 frames per second
        repeat: -1, // loop forever
    });
    this.anims.create({
        key: "portal-effect",
        frames: this.anims.generateFrameNumbers("portal", { start: 0, end: 6 }),
        frameRate: 15, // 4 frames per second
        repeat: -1, // loop forever
    });
    this.musicManager = new MusicManager(this);


    if (!this.sound.get("bgm")) {
        this.musicManager.play("bgm");
    }

      this.scene.start("Level4"); //Start first level
  }
}
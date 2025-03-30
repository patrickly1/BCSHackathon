import Phaser from 'phaser';
import GameManager from '../GameManager';
import PlayerController from "../PlayerController";

const PLAYER_SPEED = 160;

export default class Level1 extends Phaser.Scene {
  constructor() {
    super('Level1');
    this.isCloned = false; // State for this level
  }
  preload() {
    this.load.image('level1_bg',"assets/level/start/level1_bg.png");
  }

  create() {
    const { width, height } = this.scale;
    this.cameras.main.setBackgroundColor('#1a1a1a'); // Dark background
    this.add.image(width/2, height/2,'level1_bg');
    GameManager.getPlayer().setLocation('Level1');
    // sets the location of the player to level1

    // Initial state: Shadowy void with a torch
    // this.torch = this.add.image(100, 100, 'torch').setScale(0.5); // Example position/asset

    this.add
        .text(240, 32, "Area 1: Space", {
            fontSize: "16px",
            fontFamily: "Minecraft",
            fill: "#fff",
        })
        .setOrigin(0.5);
    this.feedbackText = this.add
        .text(
            240,
            140,
            "Press T to open terminal.\n\nYou’re drifting through a hostile void. \nYour only hope? A faint signal from a forgotten project. \n\nTo pull its last commit into memory…\n\n-> Type 'git clone gitopia'",
            { fontSize: "16px", fontFamily: "Minecraft", fill: "#aaa" }
        )
        .setOrigin(0.5);

    // Listen for commands from the React Terminal via the global event emitter
    this.game.events.on('commandInput', this.handleCommand, this);

    // --- Player ---
    this.player = this.physics.add.sprite(width / 2, 320, "player").setScale(2.5);
    this.player.setCollideWorldBounds(true);

    // --- Input ---
            // Still add keys so they are ready when input is enabled
            this.keys = this.input.keyboard.addKeys("W,A,S,D");
    
            this.playerController = new PlayerController(this.player, this.keys, PLAYER_SPEED);
    // Add collision
    // Create a static group to hold collision zones

    // Red Rectangle for debugging
    // const zone1 = this.add.rectangle(80, 285, 300, 65, 0xff0000, .2).setOrigin(0); // x, y, width, height, color, alpha
    // const zone2 = this.add.rectangle(160, 350, 150, 40, 0xff0000, .2).setOrigin(0); // x, y, width, height, color, alpha
    // this.physics.add.existing(zone1, true); // true = static body
    // this.physics.add.existing(zone2, true); // true = static body

    // Cleanup listener when scene is destroyed
    this.events.on('shutdown', () => {
      this.game.events.off('commandInput', this.handleCommand, this);
    });
  }

  handleCommand(command) {
    // Only process commands if this scene is active
    if (!this.scene.isActive()) {
        return;
    }

    console.log(`Level 1 received command: ${command}`);
    const expectedCommand = 'git clone gitopia';

    if (command.toLowerCase() === expectedCommand) {
      if (!this.isCloned) {
        this.isCloned = true;
        this.scene.start("Level2");
      } else {
        this.feedbackText.setText('Incorrect command. Try "git clone gitopia".');
      }
    } else {
      this.feedbackText.setText(`Unknown command or incorrect syntax. Expected: ${expectedCommand}`);
    }
  }


  update() {
    if (!this.input.keyboard.enabled) return;
        this.playerController.update();
        this.player.x = Phaser.Math.Clamp(this.player.x, 140, 340);
        this.player.y = Phaser.Math.Clamp(this.player.y, 280, 350);
  }
}
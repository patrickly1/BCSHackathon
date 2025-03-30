import Phaser from 'phaser';
import GameManager from '../GameManager';
import PlayerController from "../PlayerController";

const PLAYER_SPEED = 200;

export default class Level1 extends Phaser.Scene {
  constructor() {
      super("Level1");
      this.isCloned = false; // State for this level

      // Flag for robot interaction
      this.robotInteracted = false;
  }

  preload() {
    this.load.image('level1_bg', "assets/level/start/level1_bg.png");
  }

  create() {
    const { width, height } = this.scale;
    this.cameras.main.setBackgroundColor("#1a1a1a"); // Dark background
    this.add.image(width / 2, height / 2, "level1_bg");
    GameManager.getPlayer().setLocation("Level1");
    // sets the location of the player to level1

    this.add
      .text(240, 32, "Branch 1: Space", {
        fontSize: "16px",
        fontFamily: "Minecraft",
        fill: "#fff",
      })
      .setOrigin(0.5);

    // Create a separate instruction text that is always visible.
    // Adjust position as needed.
    this.instructionText = this.add.text(width / 2, height - 90, "Use WASD to move.\nPress T to open terminal.\nPress ESC to close terminal", {
      fontSize: "12px",
      fill: "#fff",
      fontFamily: "Minecraft"
    }).setOrigin(0.5);

    // Create feedback text for command responses
    this.feedbackText = this.add.text(width / 2, height - 50, "", {
      fontSize: "12px",
      fill: "#fff",
    }).setOrigin(0.5);

    // Listen for commands from the React Terminal via the global event emitter
    this.game.events.on("commandInput", this.handleCommand, this);

    // --- Player ---
    this.player = this.physics.add.sprite(width / 2, 320, "player").setScale(2.5);
    this.player.setCollideWorldBounds(true);

    // --- Input ---
    // Still add keys so they are ready when input is enabled
    this.keys = this.input.keyboard.addKeys("W,A,S,D");

    this.playerController = new PlayerController(this.player, this.keys, PLAYER_SPEED);
    const robotX = width * 0.73;
    const robotY = width * 0.65;

    this.robotInstruction = this.add
      .text(
        robotX,
        robotY - height * 0.2,
        "Press T to open terminal.\n\nYou’re drifting through a hostile void. \nYour only hope? A faint signal from a forgotten project. \n\nTo pull its last commit into memory…\n\n-> Type 'git clone gitopia'",
        {
          fontSize: "10px",
          fill: "#00ffcc",
          stroke: "#003344",
          strokeThickness: 0,
          align: "left",
          backgroundColor: "#11111188", // Dark, metallic background
          padding: { x: 12, y: 8 },
          wordWrap: { width: 250, useAdvancedWrap: true },
          shadow: {
            offsetX: 3,
            offsetY: 3,
            color: "#001122",
            blur: 2,
            stroke: false,
            fill: true,
          },
          lineSpacing: 4,
        }
      )
      .setOrigin(0.5);

    // Spawn the robot sprite
    this.robot = this.physics.add.sprite(robotX, robotY, "robot").setScale(1.5);
    this.robot.anims.play("robot-idle");
    this.robot.setOrigin(0.5); // Center the sprite's origin (optional)

    this.robotAlert = this.add
        .text(robotX, robotY - 25, "!", {
            fontSize: "20px",
            fontFamily: "Minecraft",
            color: "#ff0000",
            stroke: "#000000",
            strokeThickness: 3,
        })
        .setOrigin(0.5);

    // Cleanup listener when scene is destroyed
    this.events.on("shutdown", () => {
      this.game.events.off("commandInput", this.handleCommand, this);
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

      // Check distance between the player and the robot
      if (this.robot && this.robotInstruction) {
          const distance = Phaser.Math.Distance.Between(this.player.x, this.player.y, this.robot.x, this.robot.y);
          const threshold = 50; // Adjust as needed
          this.robotInstruction.setVisible(distance < threshold);

          if (this.robotAlert && !this.robotInteracted) {
              this.robotAlert.setVisible(distance >= threshold);
          }

          if (distance < threshold && !this.robotInteracted) {
              this.robotInteracted = true;
          }
      }
  }
}

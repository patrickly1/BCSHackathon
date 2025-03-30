// src/game/scenes/Level4.js
import Phaser from 'phaser';
import GameManager from '../GameManager';
import PlayerController from "../PlayerController";

const PLAYER_SPEED = 160;
const REQUIRED_BRANCH_NAME = 'mine';

export default class Level4 extends Phaser.Scene {
  constructor() {
      super("Level4");
      this.player = null;
      this.keys = null;
      this.feedbackText = null;
      this.instructionText = null; // Always-visible instruction text

      // Level state flags for our command sequence:
      this.stashDone = false; // Items from the mine have been stashed
      this.mergeAttempted = false; // Merge was attempted (and produced an error)
      this.resetDone = false; // Merge conflict was resolved via reset

      // Flag for robot interaction
      this.robotInteracted = false;
  }

  preload() {
    this.load.image("baseTiles", 'assets/level/base/tiles.png');
    this.load.image("decorationTiles", 'assets/level/base/TileSet v1.0.png');
    this.load.image("computerTile", 'assets/level/base/computer_terminal.png');
    this.load.image("spaceship", 'assets/level/base/spaceship.png');
    this.load.tilemapTiledJSON("levelFourMap", 'assets/level/base/base.tmj');
  }

  create() {
      const player = GameManager.getPlayer();
      if (player.getLocation() !== "Level4") {
          player.setLocation("Level4");
      }
      // Update the location in the App (React side)
      if (this.game.reactSetCurrentLocation) {
          this.game.reactSetCurrentLocation("Level4");
      }
      const { width, height } = this.scale;
      const centerX = width / 2;

      // Set a dark background for a final, tense feel
      this.cameras.main.setBackgroundColor("#1a1a1a");

      // Setup tilemap
      const map = this.add.tilemap("levelFourMap");
      const mainTiles = map.addTilesetImage("tiles", "baseTiles");
      const decorationTiles = map.addTilesetImage("TileSet v1.0", "decorationTiles");
      const computerTile = map.addTilesetImage("computer_terminal", "computerTile");

      const floorLayer = map.createLayer("Floor", mainTiles);
      const wallLayer = map.createLayer("Walls", mainTiles);
      const decorationLayer = map.createLayer("decorations", decorationTiles);
      const computerLayer = map.createLayer("computer", computerTile);

      // Title text
      this.add
          .text(centerX, 30, "Branch 4: The Base", {
              fontSize: "16px",
              fontFamily: "Minecraft",
              fill: "#fff",
          })
          .setOrigin(0.5);

      // Create feedback text for command responses
      this.feedbackText = this.add
          .text(centerX, height - 30, "", {
              fontSize: "12px",
              fill: "#fff",
          })
          .setOrigin(0.5);

      // Create instruction text that is always visible.
      this.instructionText = this.add
          .text(centerX, height - 60, "Stash your progress before anything bad happens", {
              fontSize: "12px",
              fill: "#fff",
              fontFamily: "Minecraft",
          })
          .setOrigin(0.5);

      // Create the player sprite (for movement only)
      this.player = this.physics.add.sprite(centerX, height - 80, "player").setScale(2.5);
      this.player.body.setSize(6, 8); // width, height
      this.player.body.setOffset(3, 8); // center it if neededw
      this.player.setCollideWorldBounds(true);

      // --- Setup Collision ---
      wallLayer.setCollisionByProperty({ collides: true });
      // decorationLayer.setCollisionByProperty({ collides: true });
      this.physics.add.collider(this.player, wallLayer);
      // this.physics.add.collider(this.player, decorationLayer);

      // Setup WASD input for movement
      this.keys = this.input.keyboard.addKeys("W,A,S,D");
      this.playerController = new PlayerController(this.player, this.keys, PLAYER_SPEED);

      // Listen for command input events
      this.game.events.on("commandInput", this.handleCommand, this);

      // Terminal toggle: disable Phaser keyboard input when the terminal is open
      this.game.events.on("terminalToggled", this.handleTerminalToggle, this);
      this.input.keyboard.enabled = true;

      const robotX = width * 0.3;
      const robotY = width * 0.75;

      this.robotInstruction = this.add
          .text(
              robotX,
              robotY - height * 0.27,
              "You’re back at base with everything you collected from the mine.\n\nBefore merging, stash any rare items using 'git stash' to keep them safe.\n\nNow run 'git merge mine' to bring your work into the project.\n\nThen walk over to the spaceship—it’s ready for repairs.\n\nPush your updates to mission control using 'git push', and prepare for launch.",
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
      this.robot.setFlipX(true);
      this.robot.anims.play("robot-idle");
      this.robot.setOrigin(0.5);

      this.robotAlert = this.add
          .text(robotX, robotY - 25, "!", {
              fontSize: "20px",
              fontFamily: "Minecraft",
              color: "#ff0000",
              stroke: "#000000",
              strokeThickness: 3,
          })
          .setOrigin(0.5);
  }

  handleTerminalToggle(isOpen) {
    if (isOpen) {
      // Terminal is open; disable all keyboard input in Phaser
      this.input.keyboard.enabled = false;
      this.input.keyboard.removeAllListeners();
      if (this.player) {
        this.player.setVelocity(0);
      }
    } else {
      // Terminal closed; re-enable keyboard input
      this.input.keyboard.enabled = true;
      this.keys = this.input.keyboard.addKeys('W,A,S,D');
    }
  }

  update(time, delta) {
      if (!this.input.keyboard.enabled) return;
      this.playerController.update();

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

  handleCommand(command) {
    const parts = command.trim().toLowerCase().split(' ');
    const action = parts[0];
    const verb = parts[1];
    const arg = parts[2]; // Only used for the merge command

    const { width, height } = this.scale;
    // For stash, merge, and reset commands, require the player be near the centre:
    const centerX = width / 2;
    const centerY = height / 2;
    // For git push, require the player be near this location:
    const pushX = width * 0.5; // same as centerX
    const pushY = height * 0.2;
    const threshold = 50; // tolerance in pixels

    // Check for commands that require the player be near the centre
    if (
      (verb === 'stash') ||
      (verb === 'merge' && arg === REQUIRED_BRANCH_NAME) ||
      (verb === 'reset')
    ) {
      const distanceToCenter = Phaser.Math.Distance.Between(this.player.x, this.player.y, centerX, centerY);
      if (distanceToCenter > threshold) {
        this.setFeedback("You must be near the computer to use that command.");
        return;
      }
    }

    // For the push command, the player must be near (width * 0.5, height * 0.2)
    if (verb === 'push') {
      const distanceToPush = Phaser.Math.Distance.Between(this.player.x, this.player.y, pushX, pushY);
      if (distanceToPush > threshold) {
        this.setFeedback("You must be at the designated push location to finish.");
        return;
      }
    }

    console.log(`Level4 received command: ${command}`);

    if (action === 'git') {
      // Command: git stash
      if (verb === 'stash') {
        if (!this.stashDone) {
          this.stashDone = true;
          this.setFeedback("Items stashed successfully! Now merge changes from mine using: git merge mine");
          this.instructionText.setText("Merge your resources from the mine");
        } else {
          this.setFeedback("You've already stashed your items.");
        }
        return;
      }
      // Command: git merge mine
      if (verb === 'merge' && arg === REQUIRED_BRANCH_NAME) {
        if (!this.stashDone) {
          this.setFeedback("You must stash your items first with: git stash");
          return;
        }
        if (!this.mergeAttempted) {
          this.mergeAttempted = true;
          this.setFeedback("Merge conflict error! Please run git reset to resolve conflicts.");
          this.instructionText.setText("Computer malfunctioned! Reset the changes!");
        } else {
          this.setFeedback("Merge conflict persists. Run git reset.");
        }
        return;
      }
      // Command: git reset
      if (verb === 'reset') {
        if (!this.mergeAttempted) {
          this.setFeedback("There's nothing to reset yet! Try merging changes first.");
          return;
        }
        if (!this.resetDone) {
          this.resetDone = true;
          this.portal = this.physics.add.sprite(width * 0.5, height * 0.2, "portal").setScale(1.5);
          this.portal.anims.play("portal-effect");
          this.portal.setOrigin(0.5); // Center the sprite's origin (optional)
          this.time.delayedCall(1500, () => {
            // Transition to a final scene or restart the game.
            this.portal.destroy(true);
            this.add.image(width * 0.5, height * 0.2, "spaceship")
          });
          this.setFeedback("Reset successful! Finalize your mission with: git push");
          this.instructionText.setText("Lets hop on the spaceship!");
        } else {
          this.setFeedback("You've already resolved the merge conflict. Now push your changes.");
        }
        return;
      }
      // Command: git push
      if (verb === 'push') {
        if (!this.resetDone) {
          this.setFeedback("You must resolve the merge conflict first by running git reset.");
          return;
        }
        // End the game with a success message.
        this.setFeedback("Mission accomplished! Your changes have been pushed. Game Over.");
        this.time.delayedCall(500, () => {
          // Transition to a final scene or restart the game.
          this.scene.start('Level5'); // Replace 'EndScene' with your final scene key.
        });
        return;
      }
    }
    this.setFeedback("Unknown command. Try: 'git stash', 'git merge mine', 'git reset', or 'git push'.");
  }

  setFeedback(message) {
    if (this.feedbackText && this.feedbackText.active) {
      this.feedbackText.setText(message);
    }
  }
}
// src/game/scenes/Level4.js
import Phaser from 'phaser';
import GameManager from '../GameManager';
import PlayerController from "../PlayerController";

const PLAYER_SPEED = 200; // Increased speed
const REQUIRED_BRANCH_NAME = 'mine';

export default class Level4 extends Phaser.Scene {
  constructor() {
    super('Level4');
    this.player = null;
    this.keys = null;
    this.feedbackText = null;
    this.instructionText = null; // Always-visible instruction text

    // Level state flags for our command sequence:
    this.stashDone = false;      // Items from the mine have been stashed
    this.mergeAttempted = false; // Merge was attempted (and produced an error)
    this.resetDone = false;      // Merge conflict was resolved via reset
    this.hasBoarded = false;     // Player boards spaceship after reset

    this.flashEvent = null;
    this.isFlashing = false;
  }

  preload() {
    this.load.image("baseTiles", 'assets/level/base/tiles.png');
    this.load.image("decorationTiles", 'assets/level/base/TileSet v1.0.png');
    this.load.image("computerTile", 'assets/level/base/computer_terminal.png');
    this.load.image("spaceship", 'assets/level/base/spaceship.png');
    this.load.image("portal", 'assets/level/base/portal.png'); // Make sure this asset exists
    this.load.tilemapTiledJSON("levelFourMap", 'assets/level/base/base.tmj');
  }

  create() {
    const player = GameManager.getPlayer();
    if (player.getLocation() !== "Level4") {
      player.setLocation("Level4");
    }
    if (this.game.reactSetCurrentLocation) {
      this.game.reactSetCurrentLocation("Level4");
    }
    const { width, height } = this.scale;
    const centerX = width / 2;

    // Create a full-screen red overlay for flashing effect (initially hidden)
    this.alertOverlay = this.add.rectangle(0, 0, width, height, 0xff0000, 0.3)
      .setOrigin(0)
      .setDepth(100)
      .setVisible(false);

    // Set a dark background for a final, tense feel
    this.cameras.main.setBackgroundColor("#1a1a1a");

    // Setup tilemap and layers
    const map = this.add.tilemap("levelFourMap");
    const mainTiles = map.addTilesetImage("tiles", "baseTiles");
    const decorationTiles = map.addTilesetImage("TileSet v1.0", "decorationTiles");
    const computerTile = map.addTilesetImage("computer_terminal", "computerTile");

    const floorLayer = map.createLayer("Floor", mainTiles);
    const wallLayer = map.createLayer("Walls", mainTiles);
    const decorationLayer = map.createLayer("decorations", decorationTiles);
    const computerLayer = map.createLayer("computer", computerTile);

    // Title text
    this.add.text(centerX, 30, "Branch 4: The Base", {
      fontSize: "16px",
      fontFamily: "Minecraft",
      fill: "#fff",
    }).setOrigin(0.5);

    // Create feedback text for command responses (bottom center)
    this.feedbackText = this.add.text(centerX, height - (height * 0.15), "", {
      fontSize: "12px",
      fill: "#fff",
    }).setOrigin(0.5);

    // Create instruction text (always visible, above feedback text)
    this.instructionText = this.add.text(centerX, height - (height * 0.2), "Stash your progress before anything bad happens", {
      fontSize: "12px",
      fill: "#fff",
      fontFamily: "Minecraft"
    }).setOrigin(0.5);

    // Create the player sprite
    this.player = this.physics.add.sprite(centerX, height - 80, "player").setScale(2.5);
    this.player.body.setSize(6, 8); // width, height
    this.player.body.setOffset(3, 8); // center it if needed
    this.player.setCollideWorldBounds(true);

    // Setup collision layers
    wallLayer.setCollisionByProperty({ collides: true });
    decorationLayer.setCollisionByProperty({ collides: true });
    this.physics.add.collider(this.player, wallLayer);
    this.physics.add.collider(this.player, decorationLayer);

    // Setup WASD input for movement
    this.keys = this.input.keyboard.addKeys("W,A,S,D");
    this.playerController = new PlayerController(this.player, this.keys, PLAYER_SPEED);

    // Listen for command input events from the terminal
    this.game.events.on("commandInput", this.handleCommand, this);

    // Listen for terminal toggle events
    this.game.events.on("terminalToggled", this.handleTerminalToggle, this);
    this.input.keyboard.enabled = true;

    // Setup robot instruction and sprite (optional)
    const robotX = width * 0.3;
    const robotY = height * 0.7;

    this.robotInstruction = this.add.text(
      robotX,
      robotY - height * 0.3,
      "You’re back at base with everything you collected from the mine.\n\nBefore merging, stash any rare items using 'git stash' to keep them safe.\n\nNow run 'git merge mine' to bring your work into the project.\n\nThen walk over to the spaceship—it’s ready for repairs.\n\nPush your updates to mission control using 'git push', and prepare for launch.",
      {
        fontSize: "10px",
        fill: "#00ffcc",
        stroke: "#003344",
        strokeThickness: 0,
        align: "left",
        backgroundColor: "#11111188",
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
    ).setOrigin(0.5);

    this.robot = this.physics.add.sprite(robotX, robotY, "robot").setScale(1.5);
    this.robot.setFlipX(true);
    this.robot.anims.play("robot-idle");
    this.robot.setOrigin(0.5);

    // Optional: A robot alert for extra effect
    this.robotAlert = this.add.text(robotX, robotY - 25, "!", {
      fontSize: "20px",
      fontFamily: "Minecraft",
      color: "#ff0000",
      stroke: "#000000",
      strokeThickness: 3,
    }).setOrigin(0.5);
  }

  handleTerminalToggle(isOpen) {
    if (isOpen) {
      // Terminal is open; disable Phaser input
      this.input.keyboard.enabled = false;
      this.input.keyboard.removeAllListeners();
      if (this.player) {
        this.player.setVelocity(0);
      }
    } else {
      // Terminal closed; re-enable input
      this.input.keyboard.enabled = true;
      this.keys = this.input.keyboard.addKeys('W,A,S,D');
    }
  }

  update(time, delta) {
    if (!this.input.keyboard.enabled) return;
    this.playerController.update();

    // Check distance between the player and the robot (for robot instruction)
    if (this.robot && this.robotInstruction) {
      const distance = Phaser.Math.Distance.Between(this.player.x, this.player.y, this.robot.x, this.robot.y);
      const threshold = 50;
      this.robotInstruction.setVisible(distance < threshold);
      if (this.robotAlert) {
        this.robotAlert.setVisible(distance >= threshold);
      }
    }

    // In update() method, add this after your existing update logic:
    if (this.resetDone && !this.hasBoarded && this.player) {
        const pushX = this.scale.width * 0.5;
        const pushY = this.scale.height * 0.2;
        const distanceToPush = Phaser.Math.Distance.Between(this.player.x, this.player.y, pushX, pushY);
        const threshold = 50;
        if (distanceToPush < threshold) {
        this.player.setVisible(false);
        this.player.body.enable = false;
        this.hasBoarded = true;
        this.instructionText.setText("You have boarded the spaceship. Now type: git push");
        }
    }
    // Removed automatic spaceship boarding from update()
  }

  handleCommand(command) {
    const parts = command.trim().toLowerCase().split(' ');
    const action = parts[0];
    const verb = parts[1];
    const arg = parts[2]; // Only used for the merge command

    const { width, height } = this.scale;
    // For stash, merge, and reset commands, require the player be near the computer (center)
    const centerX = width / 2;
    const centerY = height / 2;
    // For git push, we now require that the player has boarded (set by git reset)
    const threshold = 50;

    // Check for commands that require proximity to the computer
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
          this.startFlashingBackground();
          this.setFeedback("Merge conflict error! Please run git reset to resolve conflicts.");
          this.instructionText.setText("Computer malfunctioned! Reset the changes!");
        } else {
          this.setFeedback("Merge conflict persists. Run git reset.");
        }
        return;
      }
    //   
      // Command: git reset
      // Command: git reset
        // Command: git reset
        if (verb === 'reset') {
            if (!this.mergeAttempted) {
            this.setFeedback("There's nothing to reset yet! Try merging changes first.");
            return;
            }
            if (!this.resetDone) {
            this.resetDone = true;
            this.stopFlashingBackground();
            // Create a portal sprite at launch area, then replace it with the spaceship image
            this.portal = this.physics.add.sprite(width * 0.5, height * 0.2, "portal").setScale(1.5);
            if (this.portal.anims) {
                this.portal.anims.play("portal-effect");
            }
            this.portal.setOrigin(0.5);
            this.time.delayedCall(1500, () => {
                this.portal.destroy(true);
                this.add.image(width * 0.5, height * 0.2, "spaceship");
            });
            this.setFeedback("Reset successful! Now move near the spaceship to board. Then type: git push");
            this.instructionText.setText("Move near the spaceship to board");
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
        if (!this.hasBoarded) {
          this.setFeedback("You must board the spaceship first by running git reset.");
          return;
        }
        this.setFeedback("Mission accomplished! Your changes have been pushed. Game Over.");
        this.time.delayedCall(500, () => {
          this.scene.start('Level5');
        });
        return;
      }
    }
    this.setFeedback("Unknown command. Try: 'git stash', 'git merge mine',\n'git reset', or 'git push'.");
  }

  setFeedback(message) {
    if (this.feedbackText) {
      this.feedbackText.setText(message);
    }
  }

  startFlashingBackground() {
    if (this.flashEvent) return;
    this.flashEvent = this.time.addEvent({
      delay: 2000,
      loop: true,
      callback: () => {
        if (!this.alertOverlay) return;
        this.isFlashing = !this.isFlashing;
        this.alertOverlay.setVisible(this.isFlashing);
      }
    });
  }

  stopFlashingBackground() {
    if (this.flashEvent) {
      this.flashEvent.remove();
      this.flashEvent = null;
    }
    if (this.alertOverlay) {
      this.alertOverlay.setVisible(false);
    }
    this.isFlashing = false;
  }
}

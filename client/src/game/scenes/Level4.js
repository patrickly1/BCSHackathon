// client/src/game/scenes/Level4.js
import Phaser from 'phaser';
import GameManager from '../GameManager';

const REQUIRED_BRANCH_NAME = 'secret-tunnel';

export default class Level4 extends Phaser.Scene {
  constructor() {
    super('Level4');
    this.player = null;
    this.keys = null;
    this.feedbackText = null;

    // Level state flags for our command sequence:
    this.stashDone = false;      // Items from the mine have been stashed
    this.mergeAttempted = false; // Merge was attempted (and produced an error)
    this.resetDone = false;      // Merge conflict was resolved via reset
  }

  preload() {

  }

  create() {
    const player = GameManager.getPlayer();
        if (player.getLocation() !== 'Level4') {
            player.setLocation('Level4');
            }

        // Update the location in the App (React side)
        if (this.game.reactSetCurrentLocation) {
            this.game.reactSetCurrentLocation('Level4');
        }
    const { width, height } = this.scale;
    const centerX = width / 2;

    // Set a dark background for a final, tense feel
    this.cameras.main.setBackgroundColor('#1a1a1a');

    // Setup tilemap
    const map = this.add.tilemap("levelFourMap");
    const mainTiles = map.addTilesetImage("tiles", "baseTiles")
    const floorLayer = map.createLayer("Floor", mainTiles)
    const wallLayer = map.createLayer("Walls", mainTiles)

    // Title text
    this.add.text(centerX, 30, 'Level 4: The Final Merge', {
      fontSize: '18px',
      fill: '#fff'
    }).setOrigin(0.5);

    // Feedback text for instructions and command responses
    this.feedbackText = this.add.text(centerX, height - 30, 'Stash your mined items with: git stash', {
      fontSize: '12px',
      fill: '#aaa'
    }).setOrigin(0.5);

    // Create the player sprite (for movement only)
    this.player = this.physics.add.sprite(centerX, height - 80, 'player');
    this.player.setCollideWorldBounds(true);

    // --- Setup Collision ---
    // Add collisions
    wallLayer.setCollisionByProperty({ collides: true });
    this.physics.add.collider(this.player, wallLayer);

    // Setup WASD input for movement
    this.keys = this.input.keyboard.addKeys('W,A,S,D');

    // Listen for command input events
    this.game.events.on('commandInput', this.handleCommand, this);

    // Terminal toggle: disable Phaser keyboard input when the terminal is open
    this.game.events.on('terminalToggled', this.handleTerminalToggle, this);
    this.input.keyboard.enabled = true;
  }

  handleTerminalToggle(isOpen) {
    if (isOpen) {
      // Terminal is open; disable movement and remove key listeners
      this.input.keyboard.enabled = false;
      this.input.keyboard.removeAllListeners();
      if (this.player) {
        this.player.setVelocity(0);
      }
    } else {
      // Terminal closed; re-enable movement keys
      this.input.keyboard.enabled = true;
      this.keys = this.input.keyboard.addKeys('W,A,S,D');
    }
  }

  update(time, delta) {
    // Do nothing if keyboard is disabled or player not defined
    if (!this.player || !this.keys || !this.input.keyboard.enabled) return;

    this.player.setVelocity(0);

    if (this.keys.A.isDown) {
      this.player.setVelocityX(-160);
    } else if (this.keys.D.isDown) {
      this.player.setVelocityX(160);
    }
    if (this.keys.W.isDown) {
      this.player.setVelocityY(-160);
    } else if (this.keys.S.isDown) {
      this.player.setVelocityY(160);
    }
    this.player.body.velocity.normalize().scale(160);
  }

  handleCommand(command) {
    // Convert the command to lowercase and split by spaces.
    const parts = command.trim().toLowerCase().split(' ');
    const action = parts[0];
    const verb = parts[1];
    const arg = parts[2]; // Only used for the merge command

    console.log(`Level4 received command: ${command}`);

    if (action === 'git') {
      // Command: git stash
      if (verb === 'stash') {
        if (!this.stashDone) {
          this.stashDone = true;
          this.setFeedback("Items stashed successfully! Now merge changes from secret-tunnel using: git merge secret-tunnel");
        } else {
          this.setFeedback("You've already stashed your items.");
        }
        return;
      }
      // Command: git merge secret-tunnel
      if (verb === 'merge' && arg === REQUIRED_BRANCH_NAME) {
        if (!this.stashDone) {
          this.setFeedback("You must stash your items first with: git stash");
          return;
        }
        if (!this.mergeAttempted) {
          this.mergeAttempted = true;
          this.setFeedback("Merge conflict error! Please run git reset to resolve conflicts.");
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
          this.setFeedback("Reset successful! Finalize your mission with: git push");
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
        this.time.delayedCall(2000, () => {
          // Transition to a final scene or restart the game.
          this.scene.start('EndScene'); // Replace 'EndScene' with your final scene key.
        });
        return;
      }
    }
    // If the command doesn't match any known command, show a helpful message.
    this.setFeedback("Unknown command. Try: 'git stash', 'git merge secret-tunnel', 'git reset', or 'git push'.");
  }

  setFeedback(message) {
    if (this.feedbackText && this.feedbackText.active) {
      this.feedbackText.setText(message);
    }
  }
}
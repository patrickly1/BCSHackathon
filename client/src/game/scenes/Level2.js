// client/src/game/scenes/Level2.js (or Level3.js, Level4.js, etc.)
import Phaser from 'phaser';
import GameManager from '../GameManager';

const PLAYER_SPEED = 160;
const REQUIRED_BRANCH_NAME = 'secret-tunnel';

export default class Level2 extends Phaser.Scene { // Adjust class name per level
    constructor() {
        super('Level2'); // Adjust scene key per level

        this.player = null;
        this.keys = null;
        this.feedbackText = null;
        this.mapImage = null;
        this.branchCreated = false;
        this.checkedOut = false;
        // Game logic state
        // this.inventory = new Set(); // Items the player has picked up

        this.stagedItems = new Set(); // Items successfully 'git add'-ed
    }

    // ... preload() ...
    preload() {
        this.load.image('robot', 'assets/EnemyRobot_Idle.png');
    }

    create() {
        const { width, height } = this.scale;
        const centerX = width / 2;

        const robotX = width * 0.5;
        const robotY = width * 0.7;

        this.robotInstruction = this.add.text(
            robotX, 
            robotY - 50, 
            "Welcome, Commander, to our Hackathon Adventure!\nWASD to navigate, T to open the terminal\nWe’ve crash-landed on an uncharted planet...\nWe need to gather critical resources to survive\nLet’s checkout that mysterious tunnel ahead—it might hold the key to our escape!", 
            {
                fontFamily: 'Courier, monospace',
                fontSize: '10px',
                fill: '#00ffcc',
                align: 'center',
                backgroundColor: '#000000cc', // semi-transparent
                padding: { x: 12, y: 8 },
                wordWrap: { width: 250, useAdvancedWrap: true },
                shadow: {
                  offsetX: 2,
                  offsetY: 2,
                  color: '#000',
                  blur: 2,
                  stroke: false,
                  fill: true
                }
            }
          ).setOrigin(0.5);

        // Spawn the robot sprite
        this.robot = this.physics.add.sprite(robotX, robotY, 'robot');
        this.robot.setOrigin(0.5); // Center the sprite's origin (optional)
        this.robot.setCollideWorldBounds(true); // Prevent the robot from leaving the game bounds (optional)
        // ... other setup ...
        this.cameras.main.setBackgroundColor('#2c3e50');

        // --- *** CHANGE HERE: Listen for toggle and handle enable/disable *** ---
        this.game.events.on("terminalToggled", this.handleTerminalToggle, this);
        // Ensure keyboard input is ENABLED initially
        this.input.keyboard.enabled = true;
        // --- *** END CHANGE *** ---


        // --- UI Text ---
        this.add.text(centerX, 30, 'Level 2: The Mystic Map', { fontSize: '18px', fill: '#fff' }).setOrigin(0.5); // Adjust title
        this.feedbackText = this.add.text(centerX, height - 30, 'Explore... (Press T)', { fontSize: '12px', fill: '#aaa' }).setOrigin(0.5);

        // --- Player ---
        this.player = this.physics.add.sprite(centerX, height - 80, 'player');
        this.player.setCollideWorldBounds(true);

        // --- Input ---
        // Still add keys so they are ready when input is enabled
        this.keys = this.input.keyboard.addKeys('W,A,S,D');

        // Command listener
        this.game.events.on('commandInput', this.handleCommand, this);

        // Shutdown cleanup
        this.events.on('shutdown', () => {
            console.log('Level 2 shutdown, removing listeners.');
            this.game.events.off('commandInput', this.handleCommand, this);
            // --- *** CHANGE HERE: Remove the terminal toggle listener *** ---
            this.game.events.off("terminalToggled", this.handleTerminalToggle, this);
            // --- *** END CHANGE *** ---
            this.branchCreated = false;
            this.checkedOut = false;
          
             GameManager.getPlayer().setLocation('Level2');
        // sets location of player to level2

        if (this.game.reactSetCurrentLocation) {
            this.game.reactSetCurrentLocation('Level2');
          }
          
        this.cameras.main.setBackgroundColor('#3d3d3d'); // Dungeon floor color

        // Setup tilemap
        const map = this.add.tilemap("map");
        const tiles = map.addTilesetImage("tiles", "tiles2");
        const groundLayer = map.createLayer("Ground", tiles);
        const wallLayer = map.createLayer("Walls", tiles);
        });

        this.setFeedback(`Hint: Create a branch named '${REQUIRED_BRANCH_NAME}'`);
    }

    // --- *** ADD THIS METHOD *** ---
    handleTerminalToggle(isOpen) {
        console.log(`Phaser Scene: Setting keyboard input = ${!isOpen}`);
    
        if (isOpen) {
            // Terminal is OPEN, disable all keyboard input in Phaser
            this.input.keyboard.enabled = false;
            this.input.keyboard.removeAllListeners(); // 🚨 Stop listening to all key events
        } else {
            // Terminal is CLOSED, re-enable keyboard input
            this.input.keyboard.enabled = true;
    
            // Re-add keys manually after clearing listeners
            this.keys = this.input.keyboard.addKeys('W,A,S,D');
        }
    
        // Ensure player stops moving immediately when terminal opens
        if (isOpen && this.player) {
            this.player.setVelocity(0);
        }
    }
    // --- *** END ADDED METHOD *** ---

    update(time, delta) {
        if (!this.player || !this.keys || !this.input.keyboard.enabled) return; // 🚨 Prevent movement if keyboard is disabled
    
        this.player.setVelocity(0);
    
        if (this.keys.A.isDown) {
            this.player.setVelocityX(-PLAYER_SPEED);
            this.player.setFlipX(true); // Mirror horizontally
            this.player.anims.play("walk-right", true);
        } else if (this.keys.D.isDown) {
            this.player.setVelocityX(PLAYER_SPEED);
            this.player.setFlipX(false);
            this.player.play("walk-right", true);
        } else if (this.keys.W.isDown) {
            this.player.setVelocityY(-PLAYER_SPEED);
            this.player.play("walk-up", true);
        } else if (this.keys.S.isDown) {
            this.player.setVelocityY(PLAYER_SPEED);
            this.player.play("walk-down", true);
        } else {
            this.player.play("idle", true);
        }
    
        this.player.body.velocity.normalize().scale(PLAYER_SPEED);
      // --- Add simple player direction facing (optional) ---
        // if (this.keys.A.isDown) this.player.flipX = true;
        // if (this.keys.D.isDown) this.player.flipX = false;
    }

    collectItem(playerSprite, item) {
    const itemName = item.getData('itemName');
    const player = GameManager.getPlayer();
    const currentItems = player.getInventory();

    if (!currentItems.includes(itemName)) {
        player.addItem(itemName);
        console.log(`Collected: ${itemName}`);
        this.setFeedback(`Collected ${itemName}! Find the others.`);

        item.disableBody(true, true);
        this.updateStatusText();
    }
}

    // ... handleCommand() ... (Keep existing, ensure scene transition is correct)
    handleCommand(command) {
        if (!this.scene.isActive() || this.checkedOut) return;
    
        console.log(`Level 2 received command: ${command}`);
        const parts = command.trim().toLowerCase().split(' ');
        const action = parts[0];
        const verb = parts[1];
        const arg = parts[2];
    
        if (action === 'git' && verb === 'branch' && arg) {
            if (arg === REQUIRED_BRANCH_NAME) {
                if (!this.branchCreated) {
                    this.branchCreated = true;
                    this.setFeedback(`Branch '${REQUIRED_BRANCH_NAME}' created! Now switch to it.`);
                } else {
                    this.setFeedback(`Branch '${REQUIRED_BRANCH_NAME}' already exists.`);
                }
            } else {
                this.setFeedback(`Incorrect branch name. Use: '${REQUIRED_BRANCH_NAME}'`);
            }
            return;
        }
    
        if (action === 'git' && verb === 'checkout' && arg) {
            if (arg === REQUIRED_BRANCH_NAME) {
                if (this.branchCreated) {
                    if (!this.checkedOut) {
                        this.checkedOut = true;
                        this.setFeedback(`Switched to branch '${REQUIRED_BRANCH_NAME}'. Passage revealed!`);
                        this.revealPassage();
                        this.time.delayedCall(2500, () => {
                            this.scene.start('Level3'); // Update as needed
                        });
                    } else {
                        this.setFeedback(`Already on branch '${REQUIRED_BRANCH_NAME}'.`);
                    }
                } else {
                    this.setFeedback(`Branch '${REQUIRED_BRANCH_NAME}' doesn't exist yet. Use 'git branch' first.`);
                }
            } else {
                this.setFeedback(`Cannot checkout that branch. Use: '${REQUIRED_BRANCH_NAME}'`);
            }
            return;
        }
    
        this.setFeedback(`Unknown command. Try 'git branch ...' or 'git checkout ...'`);
    }
    
    setFeedback(message) {
        if (this.feedbackText && this.feedbackText.active) {
            this.feedbackText.setText(message);
        }
    }
    
    updateStatusText() {
        const player = GameManager.getPlayer();
        const collectedList = player.getInventory().join(', ') || 'None';
        const stagedList = Array.from(this.stagedItems).join(', ') || 'None';
        this.collectedText?.setText(`Collected: ${collectedList}`);
        this.stagedText?.setText(`Staged: ${stagedList}`);
    }
}
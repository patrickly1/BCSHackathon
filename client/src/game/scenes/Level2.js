// client/src/game/scenes/Level2.js (or Level3.js, Level4.js, etc.)
import Phaser from 'phaser';

const PLAYER_SPEED = 160;
const REQUIRED_BRANCH_NAME = 'secret-tunnel';

export default class Level2 extends Phaser.Scene { // Adjust class name per level
    constructor() {
        super('Level2'); // Adjust scene key per level

        this.player = null;
        this.keys = null;
        this.feedbackText = null;
        // No longer need this.terminalOpen for the update loop guard,
        // but can keep it if needed for other logic. Let's remove it for clarity here.
        // this.terminalOpen = false;
        this.mapImage = null;
        this.branchCreated = false;
        this.checkedOut = false;
    }

    // ... preload() ...

    create() {
        const { width, height } = this.scale;
        const centerX = width / 2;
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
            this.player.flipX = true;
        } else if (this.keys.D.isDown) {
            this.player.setVelocityX(PLAYER_SPEED);
            this.player.flipX = false;
        }
    
        if (this.keys.W.isDown) {
            this.player.setVelocityY(-PLAYER_SPEED);
        } else if (this.keys.S.isDown) {
            this.player.setVelocityY(PLAYER_SPEED);
        }
    
        this.player.body.velocity.normalize().scale(PLAYER_SPEED);
    }

    // ... handleCommand() ... (Keep existing, ensure scene transition is correct)
    handleCommand(command) {
        if (!this.scene.isActive() || this.checkedOut) { /* ... */ return; }
        console.log(`Level 2 received command: ${command}`);
        const parts = command.trim().toLowerCase().split(' ');
        const action = parts[0]; const verb = parts[1]; const arg = parts[2];

        if (action === 'git' && verb === 'branch' && arg) {
            if (arg === REQUIRED_BRANCH_NAME) {
                if (!this.branchCreated) {
                    this.branchCreated = true;
                    this.setFeedback(`Branch '${REQUIRED_BRANCH_NAME}' created! Now switch to it.`);
                } else { this.setFeedback(`Branch '${REQUIRED_BRANCH_NAME}' already exists.`); }
            } else { this.setFeedback(`Incorrect branch name. Use: '${REQUIRED_BRANCH_NAME}'`); }
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
                            // --- MAKE SURE this transitions to the correct NEXT level ---
                            this.scene.start('Level3'); // Or Level4, Level5 etc.
                            // --- END ---
                        });
                    } else { this.setFeedback(`Already on branch '${REQUIRED_BRANCH_NAME}'.`); }
                } else { this.setFeedback(`Branch '${REQUIRED_BRANCH_NAME}' doesn't exist yet. Use 'git branch' first.`); }
            } else { this.setFeedback(`Cannot checkout that branch. Use: '${REQUIRED_BRANCH_NAME}'`); }
            return;
        }
        this.setFeedback(`Unknown command. Try 'git branch ...' or 'git checkout ...'`);
    }


    // ... revealPassage() ... (Keep existing)
     revealPassage() {
        this.cameras.main.setBackgroundColor('#34495e');
        this.add.text(this.scale.width / 2, this.scale.height / 2, 'Passage Opened!', { fontSize: '20px', fill: '#0f0' }).setOrigin(0.5);
    }

    // ... setFeedback() ... (Keep existing)
    setFeedback(message) {
         if (this.feedbackText && this.feedbackText.active) {
             this.feedbackText.setText(message);
         }
    }
}
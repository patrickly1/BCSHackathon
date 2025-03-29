// client/src/game/scenes/Level2.js
import Phaser from 'phaser';

const PLAYER_SPEED = 160; // Pixels per second
const REQUIRED_BRANCH_NAME = 'secret-tunnel'; // The name players need to use

export default class Level2 extends Phaser.Scene {
    constructor() {
        super('Level2');

        // Scene state
        this.player = null;
        this.keys = null;
        this.feedbackText = null;
        this.mapImage = null; // Optional visual cue

        // Game logic state
        this.branchCreated = false;
        this.checkedOut = false;
    }

    preload() {
        // Assets should be loaded by Preloader.js
        // this.load.image('map', 'assets/map.png'); // Ensure map is loaded if used
    }

    create() {
        // Use relative positioning
        const { width, height } = this.scale;
        const centerX = width / 2;
        const centerY = height / 2;

        this.cameras.main.setBackgroundColor('#2c3e50'); // A different dungeon area color

        // --- Setup UI Text ---
        this.add.text(centerX, 30, 'Level 2: The Mystic Map', { fontSize: '18px', fill: '#fff' }).setOrigin(0.5);
        this.feedbackText = this.add.text(centerX, height - 30, 'Explore... Maybe create a new path? (Press T)', { fontSize: '12px', fill: '#aaa' }).setOrigin(0.5);

        // --- Optional Visual Cue (Map) ---
        // If you have a map image, display it. It can react to commands.
        // this.mapImage = this.add.image(centerX, centerY - 50, 'map').setScale(0.8);

        // --- Setup Player ---
        this.player = this.physics.add.sprite(centerX, height - 80, 'player'); // Start near bottom-center
        this.player.setCollideWorldBounds(true);

        // --- Setup Input ---
        this.keys = this.input.keyboard.addKeys('W,A,S,D');

        // Listen for commands from React Terminal
        this.game.events.on('commandInput', this.handleCommand, this);

        // Cleanup listener
        this.events.on('shutdown', () => {
            console.log('Level 2 shutdown, removing listener.');
            this.game.events.off('commandInput', this.handleCommand, this);
            // Reset state for potential restarts
            this.branchCreated = false;
            this.checkedOut = false;
        });

        this.setFeedback(`Hint: Create a branch named '${REQUIRED_BRANCH_NAME}'`);
    }

    update(time, delta) {
        if (!this.player || !this.keys) return;

        this.player.setVelocity(0);

        // Horizontal movement
        if (this.keys.A.isDown) {
            this.player.setVelocityX(-PLAYER_SPEED);
            this.player.flipX = true; // Face left
        } else if (this.keys.D.isDown) {
            this.player.setVelocityX(PLAYER_SPEED);
            this.player.flipX = false; // Face right
        }

        // Vertical movement
        if (this.keys.W.isDown) {
            this.player.setVelocityY(-PLAYER_SPEED);
        } else if (this.keys.S.isDown) {
            this.player.setVelocityY(PLAYER_SPEED);
        }

        // Normalize speed
        this.player.body.velocity.normalize().scale(PLAYER_SPEED);
    }

    handleCommand(command) {
        if (!this.scene.isActive() || this.checkedOut) {
             if(this.checkedOut) {
                this.setFeedback("You've already found the secret passage!");
             }
            return; // Don't process if scene inactive or level already passed
        }
        console.log(`Level 2 received command: ${command}`);

        const parts = command.trim().toLowerCase().split(' ');
        const action = parts[0];
        const verb = parts[1];
        const arg = parts[2]; // Branch name

        // --- Handle 'git branch' ---
        if (action === 'git' && verb === 'branch') {
            if (parts.length === 3) { // Expecting 'git branch <name>'
                if (arg === REQUIRED_BRANCH_NAME) {
                    if (!this.branchCreated) {
                        this.branchCreated = true;
                        this.setFeedback(`Branch '${REQUIRED_BRANCH_NAME}' created! Now switch to it.`);
                        console.log('Branch created successfully');
                        // Optional visual feedback: make map glow?
                        // if (this.mapImage) this.mapImage.setTint(0xffff00);
                    } else {
                        this.setFeedback(`Branch '${REQUIRED_BRANCH_NAME}' already exists.`);
                    }
                } else {
                    this.setFeedback(`Incorrect branch name. Use: '${REQUIRED_BRANCH_NAME}'`);
                }
            } else {
                 this.setFeedback(`Usage: git branch <branch-name>`);
            }
            return; // Command processed (or failed validation)
        }

        // --- Handle 'git checkout' ---
        if (action === 'git' && verb === 'checkout') {
            if (parts.length === 3) { // Expecting 'git checkout <name>'
                 if (arg === REQUIRED_BRANCH_NAME) {
                    if (this.branchCreated) {
                        if (!this.checkedOut) {
                            // --- SUCCESS ---
                            this.checkedOut = true;
                            this.setFeedback(`Switched to branch '${REQUIRED_BRANCH_NAME}'. Passage revealed!`);
                            console.log('Checkout successful!');
                            this.revealPassage(); // Trigger visual change

                            // Transition to next level
                            this.time.delayedCall(2500, () => {
                                this.scene.start('Level3'); // <<<< CHANGE TO YOUR NEXT LEVEL KEY
                            });
                        } else {
                             // Should technically be blocked by the check at the start of the function
                             this.setFeedback(`Already on branch '${REQUIRED_BRANCH_NAME}'.`);
                        }
                    } else {
                        this.setFeedback(`Branch '${REQUIRED_BRANCH_NAME}' doesn't exist yet. Use 'git branch' first.`);
                    }
                } else {
                    this.setFeedback(`Cannot checkout that branch. Use: '${REQUIRED_BRANCH_NAME}'`);
                }
            } else {
                 this.setFeedback(`Usage: git checkout <branch-name>`);
            }
            return; // Command processed
        }

        // --- Fallback for unknown commands ---
        this.setFeedback(`Unknown command. Try 'git branch ${REQUIRED_BRANCH_NAME}' or 'git checkout ${REQUIRED_BRANCH_NAME}'`);
    }

    revealPassage() {
        // Simple visual feedback: change background slightly
        this.cameras.main.setBackgroundColor('#34495e'); // Darker shade maybe
        this.add.text(this.scale.width / 2, this.scale.height / 2, 'Passage Opened!', { fontSize: '20px', fill: '#0f0' }).setOrigin(0.5);

        // Stop player movement maybe?
        // this.player.setVelocity(0);
        // this.player.setActive(false);

        // If using map, maybe change its tint or image
        // if (this.mapImage) this.mapImage.setTint(0x00ff00).setScale(0.9); // Green tint
    }

    setFeedback(message) {
         if (this.feedbackText && this.feedbackText.active) {
             this.feedbackText.setText(message);
         }
    }
}
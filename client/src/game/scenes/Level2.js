import Phaser from "phaser";
import GameManager from "../GameManager";
import PlayerController from "../PlayerController";


const PLAYER_SPEED = 160;
const REQUIRED_BRANCH_NAME = "mine";

export default class Level2 extends Phaser.Scene {
    // Adjust class name per level
    constructor() {
        super("Level2"); // Adjust scene key per level

        this.player = null;
        this.keys = null;
        this.feedbackText = null;
        this.mapImage = null;
        this.branchCreated = false;
        this.checkedOut = false;
        // Game logic state
        // this.inventory = new Set(); // Items the player has picked up

        // Flag for robot interaction
        this.robotInteracted = false;

        this.stagedItems = new Set(); // Items successfully 'git add'-ed
    }

    // ... preload() ...
    preload() {
        this.load.image("mainTiles", 'assets/level/mine/MainLev2.0.png')
        this.load.image("decorativeTiles", 'assets/level/mine/decorative.png')
        this.load.tilemapTiledJSON("levelThreeMap", 'assets/level/mine/mine.tmj')
        this.load.image('level2_bg',"assets/level/crashsite/level2_bg.png");

        this.robotSound = this.sound.add("robot");
        this.robotSound = this.sound.add("robot");
        this.warpSound = this.sound.add("level-delay-sound");
    }

    create() {
        const { width, height } = this.scale;
        this.warpSound.play();
        this.add.image(width / 2, height / 2, "level2_bg");
        const player = GameManager.getPlayer();
        if (player.getLocation() !== "Level2") {
            player.setLocation("Level2");
        }

        // Update the location in the App (React side)
        if (this.game.reactSetCurrentLocation) {
            this.game.reactSetCurrentLocation("Level2");
        }

        const centerX = width / 2;

        const robotX = centerX;
        const robotY = height - 80;

        this.robotInstruction = this.add
            .text(
                robotX,
                robotY - height * 0.25,
                "Our spaceship is down—we need to reach a mine to collect resources for repairs!\n\nTo avoid breaking the main project, we create a new branch using 'git branch <name>'.\n\nWe use 'git checkout <name>' to switch into that branch and start working.\n\nTry it now to explore the mine without affecting main progress.",
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

        // ... other setup ...
        this.cameras.main.setBackgroundColor("#2c3e50");

        // --- *** CHANGE HERE: Listen for toggle and handle enable/disable *** ---
        this.game.events.on("terminalToggled", this.handleTerminalToggle, this);
        // Ensure keyboard input is ENABLED initially
        this.input.keyboard.enabled = true;
        // --- *** END CHANGE *** ---

        // --- UI Text ---
        this.add
            .text(centerX, 30, "Branch 2: Gitopia", { fontSize: "16px", fontFamily: "Minecraft", fill: "#fff" })
            .setOrigin(0.5); // Adjust title
        this.feedbackText = this.add
            .text(centerX, height - 30, "Explore... (Press T)", { fontSize: "12px", fill: "#aaa" })
            .setOrigin(0.5);

        // --- Player ---
        this.player = this.physics.add.sprite(width * 0.5, height * 0.5, "player").setScale(2.5);
        this.player.body.setSize(6, 8); // width, height
        this.player.body.setOffset(3, 8); // center it if neededw
        this.player.setCollideWorldBounds(true);

        // Add Ship Collision
        const squareOne = this.add.rectangle(240, 320, 100, 100, 0xff0000, 0);
        const squareTwo = this.add.rectangle(200, 320, 50, 50, 0xff0000, 0);
        const squareThree = this.add.rectangle(190, 330, 50, 50, 0xff0000, 0);
        const squareFour = this.add.rectangle(180, 340, 50, 50, 0xff0000, 0);
        const squareFive = this.add.rectangle(170, 350, 50, 50, 0xff0000, 0);
        const squareSix = this.add.rectangle(300, 250, 50, 50, 0xff0000, 0);

        this.physics.add.existing(squareOne, true);
        this.physics.add.collider(this.player, squareOne);
        this.physics.add.existing(squareTwo, true);
        this.physics.add.collider(this.player, squareTwo);
        this.physics.add.existing(squareThree, true);
        this.physics.add.collider(this.player, squareThree);
        this.physics.add.existing(squareFour, true);
        this.physics.add.collider(this.player, squareFour);
        this.physics.add.existing(squareFive, true);
        this.physics.add.collider(this.player, squareFive);
        this.physics.add.existing(squareSix, true);
        this.physics.add.collider(this.player, squareSix);

        // --- Input ---
        // Still add keys so they are ready when input is enabled
        this.keys = this.input.keyboard.addKeys("W,A,S,D");

        this.playerController = new PlayerController(this.player, this.keys, PLAYER_SPEED);

        // Command listener
        this.game.events.on("commandInput", this.handleCommand, this);

        // Shutdown cleanup
        this.events.on("shutdown", () => {
            console.log("Level 2 shutdown, removing listeners.");
            this.game.events.off("commandInput", this.handleCommand, this);
            // --- *** CHANGE HERE: Remove the terminal toggle listener *** ---
            this.game.events.off("terminalToggled", this.handleTerminalToggle, this);
            // --- *** END CHANGE *** ---
            this.branchCreated = false;
            this.checkedOut = false;

            GameManager.getPlayer().setLocation("Level2");
            // sets location of player to level2

            if (this.game.reactSetCurrentLocation) {
                this.game.reactSetCurrentLocation("Level2");
            }

            // this.cameras.main.setBackgroundColor('#3d3d3d'); // Dungeon floor color

            // Setup tilemap
            const map = this.add.tilemap("map");
            const tiles = map.addTilesetImage("tiles", "tiles2");
            const groundLayer = map.createLayer("Ground", tiles);
            const wallLayer = map.createLayer("Walls", tiles);
        });

        this.setFeedback(`Move: WASD\nOpen Terminal: T\nClose Terminal: ESC\nHint: Create a branch named '${REQUIRED_BRANCH_NAME}'`);
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
            this.keys = this.input.keyboard.addKeys("W,A,S,D");
        }

        // Ensure player stops moving immediately when terminal opens
        if (isOpen && this.player) {
            this.player.setVelocity(0);
        }
    }
    // --- *** END ADDED METHOD *** ---

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
                this.robotSound.play();
            }
        }

        if (!this.input.keyboard.enabled) return;
        this.playerController.update();
        this.player.x = Phaser.Math.Clamp(this.player.x, 30, 450);
        this.player.y = Phaser.Math.Clamp(this.player.y, 240, 450);
    }

    collectItem(playerSprite, item) {
      
    const itemName = item.getData('itemName');
    const player = GameManager.getPlayer();
    player.setLocation('Level2');
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
        const parts = command.trim().toLowerCase().split(" ");
        const action = parts[0];
        const verb = parts[1];
        const arg = parts[2];

        if (action === "git" && verb === "branch" && arg) {
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

        if (action === "git" && verb === "checkout" && arg) {
            if (arg === REQUIRED_BRANCH_NAME) {
                if (this.branchCreated) {
                    if (!this.checkedOut) {
                        this.checkedOut = true;
                        this.setFeedback(`Switched to branch '${REQUIRED_BRANCH_NAME}'. Prepare for landing!`);
                        // this.revealPassage();
                        this.scene.start("Level3");
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
        const collectedList = player.getInventory().join(", ") || "None";
        const stagedList = Array.from(this.stagedItems).join(", ") || "None";
        this.collectedText?.setText(`Collected: ${collectedList}`);
        this.stagedText?.setText(`Staged: ${stagedList}`);
    }
}

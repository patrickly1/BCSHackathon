import Phaser from 'phaser';
import GameManager from '../GameManager';
import PlayerController from '../PlayerController';

const PLAYER_SPEED = 200; // Pixels per second
const REQUIRED_ITEMS = ['blade', 'hilt', 'gem'];
const player = GameManager.getPlayer();

export default class Level3 extends Phaser.Scene {
    constructor() {
        super('Level3');

        // Scene state
        this.player = GameManager.getPlayer();
        this.keys = null; // To store keyboard keys
        this.itemsToCollect = null; // Group for collectable items
        this.anvil = null;
        this.feedbackText = null;
        console.log(`inital test: ${player.getLocation()}`);


        // Game logic state
        // this.inventory = new Set(); // Items the player has picked up
        this.stagedItems = new Set(); // Items successfully 'git add'-ed
    }

    preload() {
        // Assets should already be loaded by Preloader.js
        // If you need scene-specific assets, load them here.
    }

    create() {
        if (this.scene.isActive('Level1')) {
            console.log('💣 Shutting down Level1 from inside Level3');
            this.scene.stop('Level1');
          }
        console.log(`inital test: ${player.getLocation()}`);

        if (player.getLocation() !== 'Level3') {
            console.log(`inital test: ${player.getLocation()}`);
            player.setLocation('Level3');
            console.log(`after test: ${player.getLocation()}`);
        }

        // Update the location in the App (React side)
        if (this.game.reactSetCurrentLocation) {
            this.game.reactSetCurrentLocation('Level3');
        }

        const { width, height } = this.scale;
        const centerX = width / 2;
        
        this.cameras.main.setBackgroundColor('#3d3d3d'); // Dungeon floor color


        // Setup tilemap
        const map = this.add.tilemap("levelThreeMap");
        const mainTiles = map.addTilesetImage("MainLev2.0", "mainTiles")
        const decorativeTiles = map.addTilesetImage("decorative", "decorativeTiles")
        const floorLayer = map.createLayer("Floor", mainTiles)
        const obstacleLayer = map.createLayer("Obstacles", decorativeTiles)
        const mushroomLayer = map.createLayer("Foliage", decorativeTiles)

        // --- Setup UI Text ---
        this.add.text(250, 30, 'Level 3: The Blacksmith’s Anvil', { fontSize: '14px', fill: '#fff' }).setOrigin(0.5);
        this.feedbackText = this.add.text(250, 100, 'Collect the sword parts (WASD to move). Press T for terminal.', { fontSize: '16px', fill: '#aaa' }).setOrigin(0.5);
        this.collectedText = this.add.text(10, 10, 'Collected: ', { fontSize: '8px', fill: '#fff' });
        this.stagedText = this.add.text(10, 30, 'Staged: ', { fontSize: '8px', fill: '#fff' });

        // --- Setup Anvil ---
        this.anvil = this.add.image(width * 0.5, height * 0.5, 'anvil').setScale(1.5); // Position the anvil centrally

        // --- Setup Player ---
        this.player = this.physics.add.sprite(centerX, 240, 'player').setScale(2.5); // Starting position
        this.player.setCollideWorldBounds(true); // Keep player within game bounds
        // Optional: Set player size if sprite needs adjusting
        // this.player.setSize(20, 32).setOffset(6, 16);

        // --- Setup Items ---
        this.itemsToCollect = this.physics.add.group();

        // Create and position items - use setData to store item type
        const blade = this.itemsToCollect.create(width * 0.4, height * 0.2, 'sword_blade').setData('itemName', 'blade');
        const hilt = this.itemsToCollect.create(width * 0.3, height * 0.6, 'sword_hilt').setData('itemName', 'hilt');
        const gem = this.itemsToCollect.create(width * 0.2, height * 0.4, 'gem').setData('itemName', 'gem');

        // --- Setup Physics ---
        // Add overlap detection between player and items
        this.physics.add.overlap(this.player, this.itemsToCollect, this.collectItem, null, this);


        // --- Setup Collision ---
        // Add collisions
        obstacleLayer.setCollisionByProperty({ collides: true });
        this.physics.add.collider(this.player, obstacleLayer);

        // --- Setup Input ---
        // Basic WASD controls
        this.keys = this.input.keyboard.addKeys('W,A,S,D');

        // Listen for commands from the React Terminal
        this.game.events.on('commandInput', this.handleCommand, this);

        // Cleanup listener when scene is destroyed
        this.events.on('shutdown', () => {
            console.log('Level 2 shutdown, removing listener.');
            this.game.events.off('commandInput', this.handleCommand, this);
            // Reset state for potential restarts if needed (or handle in init/create)
            this.stagedItems.clear();
        });

        // Initial state update
        this.updateStatusText();



        // Player controller
        this.playerController = new PlayerController(this.player, this.keys, PLAYER_SPEED);
    }

    update(time, delta) {
        if (!this.input.keyboard.enabled) return;
        this.playerController.update();
    }

    collectItem(playerSprite, item) {
        const itemName = item.getData('itemName');
        // resets here.
        player.setLocation('Level3');
        console.log(`collect start: ${player.getLocation()}`);
        const currentItems = player.getInventory();
        console.log(`after setup: ${player.getLocation()}`);
    
        if (!currentItems.includes(itemName)) {
            player.addItem(itemName);
            console.log(`after add: ${player.getLocation()}`);
            console.log(`Collected: ${itemName}`);
            console.log(`Location: ${player.getLocation()}`);

            this.setFeedback(`Collected ${itemName}! Find the others.`);
    
            item.disableBody(true, true);
            this.updateStatusText();
        }
    }

    handleCommand(command) {
        if (!this.scene.isActive()) {
            return; // Don't process if scene is not active
        }
        console.log(`Level 3 received command: ${command}`);

        const parts = command.trim().toLowerCase().split(' '); // Split command into parts
        const action = parts[0];
        const verb = parts[1];
        const target = parts[2]; // The item name

        if (action !== 'git' || verb !== 'add' || !target) {
            this.setFeedback(`Invalid command format. Use: git add <item_name>`);
            return;
        }

        // Check if the target item is one of the required ones
        if (!REQUIRED_ITEMS.includes(target)) {
            this.setFeedback(`Cannot add '${target}'. It's not part of the sword.`);
            return;
        }

        // Check if the player has collected the item
        if (!GameManager.getPlayer().getInventory().includes(target)) {
            this.setFeedback(`You haven't collected the ${target} yet!`);
            return;
        }

        // Check if the item has already been staged
        if (this.stagedItems.has(target)) {
            this.setFeedback(`The ${target} is already on the anvil (staged).`);
            return;
        }

        // --- Success: Stage the item ---
        this.stagedItems.add(target);
        this.setFeedback(`Success! Added ${target} to the anvil.`);
        console.log(`Staged: ${target}`);
        this.updateStatusText();

        // --- Check for Win Condition ---
        if (this.checkWinCondition()) {
            this.setFeedback('All parts staged! Ready to forge. Proceeding...');
            this.time.delayedCall(2500, () => {
                this.scene.start('Level4'); // Move to the next level
            });
        }
    }

    checkWinCondition() {
        // Check if the number of staged items matches the required number
        if (this.stagedItems.size !== REQUIRED_ITEMS.length) {
            return false;
        }
        // Optionally, double-check if *all* required items are present
        return REQUIRED_ITEMS.every(item => this.stagedItems.has(item));
    }

    setFeedback(message) {
        this.feedbackText.setText(message);
        // Optional: Clear feedback after a delay
        // if (this.feedbackTimeout) clearTimeout(this.feedbackTimeout);
        // this.feedbackTimeout = setTimeout(() => {
        //     if (this.feedbackText.active) { // Check if text object still exists
        //       this.feedbackText.setText('Use terminal (T) to "git add <item_name>"');
        //     }
        // }, 4000);
    }

    updateStatusText() {
        const player = GameManager.getPlayer();
        const collectedList = player.getInventory().join(', ') || 'None';
        const stagedList = Array.from(this.stagedItems).join(', ') || 'None';
        this.collectedText.setText(`Collected: ${collectedList}`);
        this.stagedText.setText(`Staged: ${stagedList}`);
    }
}
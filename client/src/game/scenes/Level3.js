// // client/src/game/scenes/Level3.js
// import Phaser from 'phaser';

// const PLAYER_SPEED = 200; // Pixels per second
// const REQUIRED_ITEMS = ['blade', 'hilt', 'gem'];

// export default class Level3 extends Phaser.Scene {
//     constructor() {
//         super('Level3');

//         // Scene state
//         this.player = null;
//         this.keys = null; // To store keyboard keys
//         this.itemsToCollect = null; // Group for collectable items
//         this.anvil = null;
//         this.feedbackText = null;

//         // Game logic state
//         this.inventory = new Set(); // Items the player has picked up
//         this.stagedItems = new Set(); // Items successfully 'git add'-ed
//     }

//     preload() {
//         // Assets should already be loaded by Preloader.js
//         // If you need scene-specific assets, load them here.
//     }

//     create() {
//         const { width, height } = this.scale;
//         this.cameras.main.setBackgroundColor('#3d3d3d'); // Dungeon floor color

//         // Setup tilemap
//         const map = this.add.tilemap("levelThreeMap");
//         const mainTiles = map.addTilesetImage("MainLev2.0", "mainTiles")
//         const decorativeTiles = map.addTilesetImage("decorative", "decorativeTiles")
//         const floorLayer = map.createLayer("Floor", mainTiles)
//         const obstacleLayer = map.createLayer("Obstacles", decorativeTiles)
//         // const mushroomLayer = map.createLayer("Foliage", decorativeTiles)

//         // --- Setup UI Text ---
//         this.add.text(250, 30, 'Level 3: The Secret Tunnel', { fontSize: '14px', fill: '#fff' }).setOrigin(0.5);
//         this.feedbackText = this.add.text(250, 100, 'Collect the sword parts (WASD to move). Press T for terminal.', { fontSize: '16px', fill: '#aaa' }).setOrigin(0.5);
//         this.collectedText = this.add.text(10, 10, 'Collected: ', { fontSize: '8px', fill: '#fff' });
//         this.stagedText = this.add.text(10, 30, 'Staged: ', { fontSize: '8px', fill: '#fff' });

//         // --- Setup Anvil ---
//         this.anvil = this.add.image(width * 0.5, height * 0.5, 'anvil').setScale(1.5); // Position the anvil centrally

//         // --- Setup Player ---
//         this.player = this.physics.add.sprite(100, 450, 'player'); // Starting position
//         this.player.setCollideWorldBounds(true); // Keep player within game bounds
//         // Optional: Set player size if sprite needs adjusting
//         // this.player.setSize(20, 32).setOffset(6, 16);

//         // --- Setup Items ---
//         this.itemsToCollect = this.physics.add.group();

//         // Create and position items - use setData to store item type
//         const blade = this.itemsToCollect.create(width * 0.4, height * 0.2, 'sword_blade').setData('itemName', 'blade');
//         const hilt = this.itemsToCollect.create(width * 0.3, height * 0.6, 'sword_hilt').setData('itemName', 'hilt');
//         const gem = this.itemsToCollect.create(width * 0.2, height * 0.4, 'gem').setData('itemName', 'gem');

//         // --- Setup Physics ---
//         // Add overlap detection between player and items
//         this.physics.add.overlap(this.player, this.itemsToCollect, this.collectItem, null, this);


//         // --- Setup Collision ---
//         // Add collisions
//         obstacleLayer.setCollisionByProperty({ collides: true });
//         this.physics.add.collider(this.player, obstacleLayer);

//         // --- Setup Input ---
//         // Basic WASD controls
//         this.keys = this.input.keyboard.addKeys('W,A,S,D');

//         // Listen for commands from the React Terminal
//         this.game.events.on('commandInput', this.handleCommand, this);

//         // Cleanup listener when scene is destroyed
//         this.events.on('shutdown', () => {
//             console.log('Level 2 shutdown, removing listener.');
//             this.game.events.off('commandInput', this.handleCommand, this);
//             // Reset state for potential restarts if needed (or handle in init/create)
//             this.inventory.clear();
//             this.stagedItems.clear();
//         });

//         // Initial state update
//         this.updateStatusText();
//     }

//     update(time, delta) {
//         if (!this.player || !this.keys) return; // Guard clause

//         this.player.setVelocity(0);

//         // Horizontal movement
//         if (this.keys.A.isDown) {
//             this.player.setVelocityX(-PLAYER_SPEED);
//         } else if (this.keys.D.isDown) {
//             this.player.setVelocityX(PLAYER_SPEED);
//         }

//         // Vertical movement
//         if (this.keys.W.isDown) {
//             this.player.setVelocityY(-PLAYER_SPEED);
//         } else if (this.keys.S.isDown) {
//             this.player.setVelocityY(PLAYER_SPEED);
//         }

//         // Normalize speed for diagonal movement
//         this.player.body.velocity.normalize().scale(PLAYER_SPEED);

//         // --- Add simple player direction facing (optional) ---
//         // if (this.keys.A.isDown) this.player.flipX = true;
//         // if (this.keys.D.isDown) this.player.flipX = false;
//     }

//     collectItem(player, item) {
//         const itemName = item.getData('itemName');
//         if (!this.inventory.has(itemName)) {
//             this.inventory.add(itemName);
//             console.log(`Collected: ${itemName}`);
//             this.setFeedback(`Collected ${itemName}! Find the others.`);

//             // Remove item from the scene
//             item.disableBody(true, true);

//             this.updateStatusText();
//         }
//     }

//     handleCommand(command) {
//         if (!this.scene.isActive()) {
//             return; // Don't process if scene is not active
//         }
//         console.log(`Level 3 received command: ${command}`);

//         const parts = command.trim().toLowerCase().split(' '); // Split command into parts
//         const action = parts[0];
//         const verb = parts[1];
//         const target = parts[2]; // The item name

//         if (action !== 'git' || verb !== 'add' || !target) {
//             this.setFeedback(`Invalid command format. Use: git add <item_name>`);
//             return;
//         }

//         // Check if the target item is one of the required ones
//         if (!REQUIRED_ITEMS.includes(target)) {
//             this.setFeedback(`Cannot add '${target}'. It's not part of the sword.`);
//             return;
//         }

//         // Check if the player has collected the item
//         if (!this.inventory.has(target)) {
//             this.setFeedback(`You haven't collected the ${target} yet!`);
//             return;
//         }

//         // Check if the item has already been staged
//         if (this.stagedItems.has(target)) {
//             this.setFeedback(`The ${target} is already on the anvil (staged).`);
//             return;
//         }

//         // --- Success: Stage the item ---
//         this.stagedItems.add(target);
//         this.setFeedback(`Success! Added ${target} to the anvil.`);
//         console.log(`Staged: ${target}`);
//         this.updateStatusText();

//         // --- Check for Win Condition ---
//         if (this.checkWinCondition()) {
//             this.setFeedback('All parts staged! Ready to forge. Proceeding...');
//             this.time.delayedCall(2500, () => {
//                 this.scene.start('Level4'); // Move to the next level
//             });
//         }
//     }

//     checkWinCondition() {
//         // Check if the number of staged items matches the required number
//         if (this.stagedItems.size !== REQUIRED_ITEMS.length) {
//             return false;
//         }
//         // Optionally, double-check if *all* required items are present
//         return REQUIRED_ITEMS.every(item => this.stagedItems.has(item));
//     }

//     setFeedback(message) {
//         this.feedbackText.setText(message);
//         // Optional: Clear feedback after a delay
//         // if (this.feedbackTimeout) clearTimeout(this.feedbackTimeout);
//         // this.feedbackTimeout = setTimeout(() => {
//         //     if (this.feedbackText.active) { // Check if text object still exists
//         //       this.feedbackText.setText('Use terminal (T) to "git add <item_name>"');
//         //     }
//         // }, 4000);
//     }

//     updateStatusText() {
//          // Use Array.from() to convert Set to Array for joining
//          const collectedList = Array.from(this.inventory).join(', ') || 'None';
//          const stagedList = Array.from(this.stagedItems).join(', ') || 'None';
//          this.collectedText.setText(`Collected: ${collectedList}`);
//          this.stagedText.setText(`Staged: ${stagedList}`);
//     }
// }

// client/src/game/scenes/Level3.js
import Phaser from 'phaser';

const PLAYER_SPEED = 200;
const REQUIRED_ITEMS = ['silver', 'copper'];

export default class Level3 extends Phaser.Scene {
  constructor() {
    super('Level3');

    // Scene state
    this.player = null;
    this.keys = null;
    this.itemsToCollect = null;
    this.anvil = null;
    this.feedbackText = null;
    this.collectedText = null;
    this.stagedText = null;

    // Game logic state
    this.inventory = new Set(); // Items the player has picked up
    this.stagedItems = new Set(); // Items successfully 'git add'-ed

    // New state flags for commit and checkout sequence
    this.commitDone = false;
    this.checkoutDone = false;
  }

  preload() {
    // Assets should be preloaded by your Preloader.
    // If not already loaded, uncomment the following:
    this.load.image('silver', 'assets/silver.png');
    this.load.image('copper', 'assets/copper.png');
  }

  create() {
    const { width, height } = this.scale;
    this.cameras.main.setBackgroundColor('#3d3d3d'); // Dungeon floor color

    // Setup tilemap (if used in this level)
    const map = this.add.tilemap("levelThreeMap");
    const mainTiles = map.addTilesetImage("MainLev2.0", "mainTiles");
    const decorativeTiles = map.addTilesetImage("decorative", "decorativeTiles");
    const floorLayer = map.createLayer("Floor", mainTiles);
    const obstacleLayer = map.createLayer("Obstacles", decorativeTiles);

    // --- Setup UI Text ---
    this.add.text(250, 30, 'Level 3: The Resource Mine', { fontSize: '14px', fill: '#fff' }).setOrigin(0.5);
    this.feedbackText = this.add.text(250, 100, 'Collect silver & copper. Use WASD to move. Press T for terminal.', { fontSize: '16px', fill: '#aaa' }).setOrigin(0.5);
    this.collectedText = this.add.text(10, 10, 'Collected: ', { fontSize: '8px', fill: '#fff' });
    this.stagedText = this.add.text(10, 30, 'Staged: ', { fontSize: '8px', fill: '#fff' });

    // --- Setup Anvil ---
    this.anvil = this.add.image(width * 0.5, height * 0.5, 'anvil').setScale(1.5);

    // --- Setup Player ---
    this.player = this.physics.add.sprite(100, 450, 'player');
    this.player.setCollideWorldBounds(true);

    // --- Setup Items ---
    this.itemsToCollect = this.physics.add.group();

    // Create and position resource items. Set their itemName to match REQUIRED_ITEMS.
    const silver = this.itemsToCollect.create(width * 0.9, height * 0.2, 'silver').setData('itemName', 'silver').setScale(0.15);
    const copper = this.itemsToCollect.create(width * 0.6, height * 0.4, 'copper').setData('itemName', 'copper').setScale(0.15);

    // --- Setup Physics ---
    this.physics.add.overlap(this.player, this.itemsToCollect, this.collectItem, null, this);

    // --- Setup Collision ---
    obstacleLayer.setCollisionByProperty({ collides: true });
    this.physics.add.collider(this.player, obstacleLayer);

    // --- Setup Input ---
    this.keys = this.input.keyboard.addKeys('W,A,S,D');

    // Listen for commands from the React Terminal
    this.game.events.on('commandInput', this.handleCommand, this);

    // Cleanup listener when scene is destroyed
    this.events.on('shutdown', () => {
      console.log('Level 3 shutdown, removing listener.');
      this.game.events.off('commandInput', this.handleCommand, this);
      this.inventory.clear();
      this.stagedItems.clear();
    });

    this.updateStatusText();
  }

  update(time, delta) {
    if (!this.player || !this.keys) return;

    this.player.setVelocity(0);

    if (this.keys.A.isDown) {
      this.player.setVelocityX(-PLAYER_SPEED);
    } else if (this.keys.D.isDown) {
      this.player.setVelocityX(PLAYER_SPEED);
    }
    if (this.keys.W.isDown) {
      this.player.setVelocityY(-PLAYER_SPEED);
    } else if (this.keys.S.isDown) {
      this.player.setVelocityY(PLAYER_SPEED);
    }
    this.player.body.velocity.normalize().scale(PLAYER_SPEED);
  }

  collectItem(player, item) {
    const itemName = item.getData('itemName');
    if (!this.inventory.has(itemName)) {
      this.inventory.add(itemName);
      console.log(`Collected: ${itemName}`);
      this.setFeedback(`Collected ${itemName}!`);
      item.disableBody(true, true);
      this.updateStatusText();
    }
  }

  handleCommand(command) {
    if (!this.scene.isActive()) return;
    console.log(`Level 3 received command: ${command}`);
    
    // Split the command and handle case-insensitively.
    const parts = command.trim().split(' ');
    const action = parts[0].toLowerCase();
    const verb = parts[1] ? parts[1].toLowerCase() : null;
    const target = parts[2] ? parts[2].toLowerCase() : null;

    // --- Handle "git add" ---
    if (action === 'git' && verb === 'add' && target) {
      if (!REQUIRED_ITEMS.includes(target)) {
        this.setFeedback(`Cannot add '${target}'. Only silver and copper can be added.`);
        return;
      }
      if (!this.inventory.has(target)) {
        this.setFeedback(`You haven't collected the ${target} yet!`);
        return;
      }
      if (this.stagedItems.has(target)) {
        this.setFeedback(`The ${target} is already staged on the anvil.`);
        return;
      }
      this.stagedItems.add(target);
      this.setFeedback(`Success! Added ${target} to the anvil.`);
      this.updateStatusText();
      return;
    }

    // --- Handle "git commit -m 'Collected resources'" ---
    if (action === 'git' && verb === 'commit') {
      // Expecting format: git commit -m "Collected resources"
      if (parts[2] && parts[2].toLowerCase() === '-m') {
        const commitMessage = parts.slice(3).join(' ').replace(/["']/g, '').toLowerCase();
        if (commitMessage === 'collected resources') {
          if (this.stagedItems.size !== REQUIRED_ITEMS.length) {
            this.setFeedback("Not all resources have been staged yet!");
          } else {
            this.commitDone = true;
            this.setFeedback("Commit successful! Now checkout the base with: git checkout base");
          }
        } else {
          this.setFeedback('Incorrect commit message. Use: git commit -m "Collected resources"');
        }
      } else {
        this.setFeedback('Invalid commit command. Use: git commit -m "Collected resources"');
      }
      return;
    }

    // --- Handle "git checkout base" ---
    if (action === 'git' && verb === 'checkout' && target === 'base') {
      if (!this.commitDone) {
        this.setFeedback('You must commit your resources first with: git commit -m "Collected resources"');
        return;
      }
      this.checkoutDone = true;
      this.setFeedback("Checked out base successfully! Level complete.");
      this.time.delayedCall(2000, () => {
        // Transition to next level or end the game.
        this.scene.start('Level4'); // Update with your next scene key if needed.
      });
      return;
    }

    this.setFeedback('Unknown command. Try: git add <resource>, git commit -m "Collected resources", or git checkout base.');
  }

  setFeedback(message) {
    this.feedbackText.setText(message);
  }

  updateStatusText() {
    const collectedList = Array.from(this.inventory).join(', ') || 'None';
    const stagedList = Array.from(this.stagedItems).join(', ') || 'None';
    this.collectedText.setText(`Collected: ${collectedList}`);
    this.stagedText.setText(`Staged: ${stagedList}`);
  }
}
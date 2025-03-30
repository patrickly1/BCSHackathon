// client/src/game/scenes/Level3.js
import Phaser from 'phaser';

const PLAYER_SPEED = 200;
// Now, the required items are "copper" and "iron"
const REQUIRED_ITEMS = ['copper', 'iron'];

export default class Level3 extends Phaser.Scene {
  constructor() {
    super('Level3');

    // Scene state
    this.player = null;
    this.keys = null;
    this.itemsToCollect = null;
    this.feedbackText = null;
    this.collectedText = null;
    this.stagedText = null;

    // Game logic state
    this.inventory = new Set(); // Items the player has picked up (via command)
    this.stagedItems = new Set(); // Items successfully 'git add'-ed

    // State flags for commit and checkout sequence
    this.commitDone = false;
    this.checkoutDone = false;
  }

  preload() {
    // Assets should be preloaded by your Preloader.
    // If not, you can load here:
    this.load.image('copper', 'assets/copper.png');
    this.load.image('iron', 'assets/iron.png');
    // this.load.image('player', 'assets/player.png');
    // this.load.tilemapTiledJSON("levelThreeMap", "assets/levelThreeMap.json");
    // this.load.image("mainTiles", "assets/mainTiles.png");
    // this.load.image("decorativeTiles", "assets/decorativeTiles.png");
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
    this.feedbackText = this.add.text(
      250,
      100,
      'Collect the resources by getting near them and using git add <resource>.\nThen commit with: git commit -m "Collected resources"\nAnd checkout base with: git checkout base',
      { fontSize: '12px', fill: '#aaa', align: 'center' }
    ).setOrigin(0.5);
    this.collectedText = this.add.text(10, 10, 'Collected: ', { fontSize: '8px', fill: '#fff' });
    this.stagedText = this.add.text(10, 30, 'Staged: ', { fontSize: '8px', fill: '#fff' });

    // --- Remove the anvil (it's no longer needed) ---

    // --- Setup Player ---
    this.player = this.physics.add.sprite(100, 450, 'player');
    this.player.setCollideWorldBounds(true);
    this.player.setDepth(10); // Ensure player is drawn above items

    // --- Setup Items ---
    this.itemsToCollect = this.physics.add.group();

    // Create and position resource items for "copper" and "iron"
    const copper = this.itemsToCollect.create(width * 0.9, height * 0.2, 'copper').setData('itemName', 'copper').setScale(0.15);
    const iron = this.itemsToCollect.create(width * 0.6, height * 0.4, 'iron').setData('itemName', 'iron').setScale(0.15);

    // Do NOT add an automatic overlap callback—items remain until the player issues the command

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

  handleCommand(command) {
    if (!this.scene.isActive()) return;
    console.log(`Level 3 received command: ${command}`);
    
    const parts = command.trim().split(' ');
    const action = parts[0].toLowerCase();
    const verb = parts[1] ? parts[1].toLowerCase() : null;
    const target = parts[2] ? parts[2].toLowerCase() : null;

    // --- Handle "git add" ---
    if (action === 'git' && verb === 'add' && target) {
      if (!REQUIRED_ITEMS.includes(target)) {
        this.setFeedback(`Cannot add '${target}'. Only copper and iron can be added.`);
        return;
      }
      if (this.stagedItems.has(target)) {
        this.setFeedback(`The ${target} is already added.`);
        return;
      }
      // Find the item in the scene by its itemName
      const item = this.itemsToCollect.getChildren().find(it => it.getData('itemName') === target);
      if (!item) {
        this.setFeedback(`There is no ${target} available.`);
        return;
      }
      // Check if the player is near the item (within 50 pixels)
      const dist = Phaser.Math.Distance.Between(this.player.x, this.player.y, item.x, item.y);
      const threshold = 50; // pixels
      if (dist > threshold) {
        this.setFeedback(`You are too far from the ${target}. Get closer to add it.`);
        return;
      }
      // Success: mark item as staged and add to inventory
      this.stagedItems.add(target);
      this.inventory.add(target);
      item.disableBody(true, true);
      this.setFeedback(`Success! Added ${target}.`);
      this.updateStatusText();
      return;
    }

    // --- Handle "git commit -m 'Collected resources'" ---
    if (action === 'git' && verb === 'commit') {
      if (parts[2] && parts[2].toLowerCase() === '-m') {
        const commitMessage = parts.slice(3).join(' ').replace(/["']/g, '').toLowerCase();
        if (commitMessage === 'collected resources') {
          if (this.stagedItems.size !== REQUIRED_ITEMS.length) {
            this.setFeedback("Not all resources have been added yet!");
          } else {
            this.commitDone = true;
            this.setFeedback("Commit successful! Now checkout base with: git checkout base");
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
        // Transition to the next level or final scene.
        this.scene.start('Level4'); // Replace with your next scene key if needed.
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
import Phaser from 'phaser';

export default class Level1 extends Phaser.Scene {
  constructor() {
    super('Level1');
    this.isCloned = false; // State for this level
  }

  create() {
    this.cameras.main.setBackgroundColor('#1a1a1a'); // Dark background

    // Initial state: Shadowy void with a torch
    // this.torch = this.add.image(100, 100, 'torch').setScale(0.5); // Example position/asset

    this.add.text(400, 50, 'Level 1: The Forgotten Repository', { fontSize: '24px', fill: '#fff' }).setOrigin(0.5);
    this.feedbackText = this.add.text(400, 550, 'Press T to open terminal. Hint: clone the dungeon', { fontSize: '16px', fill: '#aaa' }).setOrigin(0.5);

    // Listen for commands from the React Terminal via the global event emitter
    this.game.events.on('commandInput', this.handleCommand, this);

    // Cleanup listener when scene is destroyed
    this.events.on('shutdown', () => {
      this.game.events.off('commandInput', this.handleCommand, this);
    });
  }

  handleCommand(command) {
    // Only process commands if this scene is active
    if (!this.scene.isActive()) {
        return;
    }

    console.log(`Level 1 received command: ${command}`);
    const expectedCommand = 'git clone ancient-dungeon';

    if (command.toLowerCase() === expectedCommand) {
      if (!this.isCloned) {
        this.isCloned = true;
        this.feedbackText.setText('Success! The ancient dungeon reveals itself...');
        this.revealDungeon();

        // Transition to next level after a short delay
        this.time.delayedCall(2000, () => {
          this.scene.start('Level2');
        });
      } else {
        this.feedbackText.setText('The dungeon is already cloned.');
      }
    } else {
      this.feedbackText.setText(`Unknown command or incorrect syntax. Expected: ${expectedCommand}`);
    }
  }

  revealDungeon() {
    // Add walls, doors, chests etc.
    this.add.image(200, 200, 'wall');
    this.add.image(300, 200, 'wall');
    this.add.image(400, 200, 'wall');
    this.add.image(500, 300, 'chest');
    // ... make the dungeon appear visually
    this.torch.setDepth(1); // Keep torch on top if needed
  }

  update() {
    // Add any real-time updates if needed
  }
}
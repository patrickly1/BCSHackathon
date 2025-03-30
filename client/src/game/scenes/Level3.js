// // src/game/scenes/Level3.js
// import Phaser from 'phaser';
// import PlayerController from "../PlayerController";
// import GameManager from "../GameManager";

// const PLAYER_SPEED = 200;
// // Now, the required items are "copper" and "iron"
// const REQUIRED_ITEMS = ['copper', 'iron'];

// export default class Level3 extends Phaser.Scene {
//   constructor() {
//     super('Level3');

//     // Scene state
//     this.player = null;
//     this.keys = null;
//     this.itemsToCollect = null;
//     this.feedbackText = null;
//     this.collectedText = null;
//     this.stagedText = null;

//     // Game logic state
//     this.inventory = new Set(); // Items the player has picked up (via command)
//     this.stagedItems = new Set(); // Items successfully 'git add'-ed

//     // State flags for commit and checkout sequence
//     this.commitDone = false;
//     this.checkoutDone = false;
//   }

//   preload() {
//     this.load.image("mainTiles", 'assets/level/mine/MainLev2.0.png');
//     this.load.image("decorativeTiles", 'assets/level/mine/decorative.png');
//     this.load.tilemapTiledJSON("levelThreeMap", 'assets/level/mine/mine.tmj');
//     // Assets for required items:
//     this.load.image('copper', 'assets/copper.png');
//     this.load.image('iron', 'assets/iron.png');
//     // Ensure the "player" asset is loaded in your Preloader or here if needed
//   }

//   create() {
//       const player = GameManager.getPlayer();
//       if (player.getLocation() !== "Level3") {
//           player.setLocation("Level3");
//       }

//       // Update the location in the App (React side)
//       if (this.game.reactSetCurrentLocation) {
//           this.game.reactSetCurrentLocation("Level3");
//       }
//       const { width, height } = this.scale;
//       this.cameras.main.setBackgroundColor("#3d3d3d"); // Dungeon floor color

//       // Setup tilemap
//       const map = this.add.tilemap("levelThreeMap");
//       const mainTiles = map.addTilesetImage("MainLev2.0", "mainTiles");
//       const decorativeTiles = map.addTilesetImage("decorative", "decorativeTiles");
//       const floorLayer = map.createLayer("Floor", mainTiles);
//       const obstacleLayer = map.createLayer("Obstacles", decorativeTiles);

//       // --- Setup UI Text ---
//       this.add
//           .text(250, 30, "Branch 3: The Mine", { fontSize: "16px", fontFamily: "Minecraft", fill: "#fff" })
//           .setOrigin(0.5);
      
//       this.collectedText = this.add.text(10, 10, "Collected: ", { fontSize: "8px", fill: "#fff" });
//       this.stagedText = this.add.text(10, 30, "Staged: ", { fontSize: "8px", fill: "#fff" });
      
//       // ADD FEEDBACK TEXT HERE:
//       this.feedbackText = this.add.text(width / 2, height - 50, "", { fontSize: "12px", fill: "#fff" }).setOrigin(0.5);

//       // --- Setup Player ---
//       this.player = this.physics.add.sprite(width / 2, height / 2, "player").setScale(2.5);
//       this.player.setCollideWorldBounds(true);
//       this.player.setDepth(10); // Ensure player is drawn above items

//       // --- Setup Items ---
//       this.itemsToCollect = this.physics.add.group();

//       // Create and position resource items for "copper" and "iron"
//       const copper = this.itemsToCollect
//           .create(width * 0.9, height * 0.2, "copper")
//           .setData("itemName", "copper")
//           .setScale(0.15);
//       const iron = this.itemsToCollect
//           .create(width * 0.6, height * 0.4, "iron")
//           .setData("itemName", "iron")
//           .setScale(0.15);

//       // Do NOT add an automatic overlap callback—items remain until the player issues the command

//       // --- Setup Collision ---
//       obstacleLayer.setCollisionByProperty({ collides: true });
//       this.physics.add.collider(this.player, obstacleLayer);

//       // --- Setup Input ---
//       this.keys = this.input.keyboard.addKeys("W,A,S,D");
//       this.playerController = new PlayerController(this.player, this.keys, PLAYER_SPEED);

//       // Listen for commands from the React Terminal
//       this.game.events.on("commandInput", this.handleCommand, this);

//       // Cleanup listener when scene is destroyed
//       this.events.on("shutdown", () => {
//           console.log("Level 3 shutdown, removing listener.");
//           this.game.events.off("commandInput", this.handleCommand, this);
//           this.inventory.clear();
//           this.stagedItems.clear();
//       });

//       this.updateStatusText();

//       // Setup robot instructions and sprite (optional)
//       const robotX = width * 0.7;
//       const robotY = width * 0.85;
//       this.robotInstruction = this.add
//           .text(
//               robotX,
//               robotY - height * 0.3,
//               'We’ve found some scattered parts nearby—perfect for repairing the ship!\n\nTo collect items into your staging area, use git add <resource>.\nOnce you’ve gathered everything, save your progress with git commit -m "Collected resources".\nThen return to base using git checkout base.',
//               {
//                   fontSize: "10px",
//                   fill: "#00ffcc",
//                   stroke: "#003344",
//                   strokeThickness: 0,
//                   align: "left",
//                   backgroundColor: "#11111188", // Dark, metallic background
//                   padding: { x: 12, y: 8 },
//                   wordWrap: { width: 250, useAdvancedWrap: true },
//                   shadow: {
//                       offsetX: 3,
//                       offsetY: 3,
//                       color: "#001122",
//                       blur: 2,
//                       stroke: false,
//                       fill: true,
//                   },
//                   lineSpacing: 4,
//               }
//           )
//           .setOrigin(0.5);

//       // Spawn the robot sprite
//       this.robot = this.physics.add.sprite(robotX, robotY, "robot").setScale(1.5);
//       this.robot.anims.play("robot-idle");
//       this.robot.setOrigin(0.5);
//   }

//   update(time, delta) {
//       if (!this.input.keyboard.enabled) return;
//       this.playerController.update();

//       // Check distance between the player and the robot
//       if (this.robot && this.robotInstruction) {
//           const distance = Phaser.Math.Distance.Between(this.player.x, this.player.y, this.robot.x, this.robot.y);
//           const threshold = 50; // Adjust this value as needed
//           this.robotInstruction.setVisible(distance < threshold);
//       }
//   }

//   handleCommand(command) {
//     if (!this.scene.isActive()) return;
//     console.log(`Level 3 received command: ${command}`);
    
//     const parts = command.trim().split(' ');
//     const action = parts[0].toLowerCase();
//     const verb = parts[1] ? parts[1].toLowerCase() : null;
//     const target = parts[2] ? parts[2].toLowerCase() : null;

//     // --- Handle "git add" ---
//     if (action === 'git' && verb === 'add' && target) {
//       if (!REQUIRED_ITEMS.includes(target)) {
//         this.setFeedback(`Cannot add '${target}'. Only copper and iron can be added.`);
//         return;
//       }
//       if (this.stagedItems.has(target)) {
//         this.setFeedback(`The ${target} is already added.`);
//         return;
//       }
//       // Find the item in the scene by its itemName
//       const item = this.itemsToCollect.getChildren().find(it => it.getData('itemName') === target);
//       if (!item) {
//         this.setFeedback(`There is no ${target} available.`);
//         return;
//       }
//       // Check if the player is near the item (within 50 pixels)
//       const dist = Phaser.Math.Distance.Between(this.player.x, this.player.y, item.x, item.y);
//       const threshold = 50; // pixels
//       if (dist > threshold) {
//         this.setFeedback(`You are too far from the ${target}. Get closer to add it.`);
//         return;
//       }
//       // Success: mark item as staged and add to inventory
//       this.stagedItems.add(target);
//       this.inventory.add(target);
//       item.disableBody(true, true);
//       this.setFeedback(`Success! Added ${target}.`);
//       this.updateStatusText();
//       return;
//     }

//     // --- Handle "git commit -m 'Collected resources'" ---
//     if (action === 'git' && verb === 'commit') {
//       if (parts[2] && parts[2].toLowerCase() === '-m') {
//         const commitMessage = parts.slice(3).join(' ').replace(/["']/g, '').trim().toLowerCase();
//         if (commitMessage === 'collected resources') {
//           if (this.stagedItems.size !== REQUIRED_ITEMS.length) {
//             this.setFeedback("Not all resources have been added yet!");
//           } else {
//             this.commitDone = true;
//             this.setFeedback("Commit successful! Now checkout base with: git checkout base");
//           }
//         } else {
//           this.setFeedback('Incorrect commit message. Use: git commit -m "Collected resources"');
//         }
//       } else {
//         this.setFeedback('Invalid commit command. Use: git commit -m "Collected resources"');
//       }
//       return;
//     }

//     // --- Handle "git checkout base" ---
//     if (action === 'git' && verb === 'checkout' && target === 'base') {
//       if (!this.commitDone) {
//         this.setFeedback('You must commit your resources first with: git commit -m "Collected resources"');
//         return;
//       }
//       this.checkoutDone = true;
//       this.setFeedback("Checked out base successfully! Level complete.");
//       this.time.delayedCall(2000, () => {
//         this.scene.start('Level4'); // Replace with your next scene key if needed.
//       });
//       return;
//     }

//     this.setFeedback('Unknown command. Try: git add <resource>, git commit -m "Collected resources", or git checkout base.');
//   }

//   setFeedback(message) {
//     this.feedbackText.setText(message);
//   }

//   updateStatusText() {
//     const collectedList = Array.from(this.inventory).join(', ') || 'None';
//     const stagedList = Array.from(this.stagedItems).join(', ') || 'None';
//     this.collectedText.setText(`Collected: ${collectedList}`);
//     this.stagedText.setText(`Staged: ${stagedList}`);
//   }
// }

// src/game/scenes/Level3.js
import Phaser from 'phaser';
import PlayerController from "../PlayerController";
import GameManager from "../GameManager";

const PLAYER_SPEED = 200;
// The required items are "copper" and "iron"
const REQUIRED_ITEMS = ['copper', 'iron'];

export default class Level3 extends Phaser.Scene {
  constructor() {
    super('Level3');

    // Scene state
    this.player = null;
    this.keys = null;
    this.itemsToCollect = null;
    this.feedbackText = null;
    this.instructionText = null; // Always-visible instruction text
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
    this.load.image("mainTiles", 'assets/level/mine/MainLev2.0.png');
    this.load.image("decorativeTiles", 'assets/level/mine/decorative.png');
    this.load.tilemapTiledJSON("levelThreeMap", 'assets/level/mine/mine.tmj');
    // Assets for required items:
    this.load.image('copper', 'assets/copper.png');
    this.load.image('iron', 'assets/iron.png');
    // Ensure the "player" asset is loaded in your Preloader or here if needed
  }

  create() {
    const player = GameManager.getPlayer();
    if (player.getLocation() !== "Level3") {
      player.setLocation("Level3");
    }

    // Update the location in the App (React side)
    if (this.game.reactSetCurrentLocation) {
      this.game.reactSetCurrentLocation("Level3");
    }
    const { width, height } = this.scale;
    this.cameras.main.setBackgroundColor("#3d3d3d"); // Dungeon floor color

    // Setup tilemap
    const map = this.add.tilemap("levelThreeMap");
    const mainTiles = map.addTilesetImage("MainLev2.0", "mainTiles");
    const decorativeTiles = map.addTilesetImage("decorative", "decorativeTiles");
    const floorLayer = map.createLayer("Floor", mainTiles);
    const obstacleLayer = map.createLayer("Obstacles", decorativeTiles);

    // --- Setup UI Text ---
    // Instruction text: initially "Collect resources"
    this.instructionText = this.add.text(width / 2, height - 90, "Collect iron and copper to craft", {
      fontSize: "12px",
      fill: "#fff",
      fontFamily: "Minecraft"
    }).setOrigin(0.5);

    // Feedback text for command responses
    this.feedbackText = this.add.text(width / 2, height - 50, "", {
      fontSize: "12px",
      fill: "#fff",
    }).setOrigin(0.5);

    this.collectedText = this.add.text(10, 10, "Collected: ", { fontSize: "8px", fill: "#fff" });
    this.stagedText = this.add.text(10, 30, "Staged: ", { fontSize: "8px", fill: "#fff" });

    // --- Setup Player ---
    this.player = this.physics.add.sprite(width / 2, height / 2, "player").setScale(2.5);
    this.player.setCollideWorldBounds(true);
    this.player.setDepth(10); // Ensure player is drawn above items

    // --- Setup Items ---
    this.itemsToCollect = this.physics.add.group();

    // Create and position resource items for "copper" and "iron"
    const copper = this.itemsToCollect
      .create(width * 0.9, height * 0.2, "copper")
      .setData("itemName", "copper")
      .setScale(0.15);
    const iron = this.itemsToCollect
      .create(width * 0.6, height * 0.4, "iron")
      .setData("itemName", "iron")
      .setScale(0.15);

    // Do NOT add an automatic overlap callback—items remain until the player issues the command

    // --- Setup Collision ---
    obstacleLayer.setCollisionByProperty({ collides: true });
    this.physics.add.collider(this.player, obstacleLayer);

    // --- Setup Input ---
    this.keys = this.input.keyboard.addKeys("W,A,S,D");
    this.playerController = new PlayerController(this.player, this.keys, PLAYER_SPEED);

    // Listen for commands from the React Terminal
    this.game.events.on("commandInput", this.handleCommand, this);

    // Cleanup listener when scene is destroyed
    this.events.on("shutdown", () => {
      this.game.events.off("commandInput", this.handleCommand, this);
      this.inventory.clear();
      this.stagedItems.clear();
    });

    this.updateStatusText();

    // Setup robot instructions and sprite (optional)
    const robotX = width * 0.7;
    const robotY = width * 0.85;
    this.robotInstruction = this.add.text(
      robotX,
      robotY - height * 0.3,
      'We’ve found some scattered parts nearby—perfect for repairing the ship!\n\nTo collect items into your staging area, use git add <resource>.\nOnce you’ve gathered everything, save your progress with git commit -m "Collected resources".\nThen return to base using git checkout base.',
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
    ).setOrigin(0.5);

    // Spawn the robot sprite
    this.robot = this.physics.add.sprite(robotX, robotY, "robot").setScale(1.5);
    this.robot.anims.play("robot-idle");
    this.robot.setOrigin(0.5);
  }

  update(time, delta) {
    if (!this.input.keyboard.enabled) return;
    this.playerController.update();

    // Check distance between the player and the robot
    if (this.robot && this.robotInstruction) {
      const distance = Phaser.Math.Distance.Between(this.player.x, this.player.y, this.robot.x, this.robot.y);
      const threshold = 50; // Adjust as needed
      this.robotInstruction.setVisible(distance < threshold);
    }
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
      const threshold = 50;
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
      this.updateInstruction(); // Update instructions if needed
      return;
    }

    // --- Handle "git commit -m 'Collected resources'" ---
    if (action === 'git' && verb === 'commit') {
      if (parts[2] && parts[2].toLowerCase() === '-m') {
        const commitMessage = parts.slice(3).join(' ').replace(/["']/g, '').trim().toLowerCase();
        if (commitMessage === 'collected resources') {
          if (this.stagedItems.size !== REQUIRED_ITEMS.length) {
            this.setFeedback("Not all resources have been added yet!");
          } else {
            this.commitDone = true;
            this.setFeedback("Commit successful! Now checkout base with: git checkout base");
            this.updateInstruction(); // Update instruction after commit
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
      this.updateInstruction(); // Update instruction if needed
      this.time.delayedCall(2000, () => {
        this.scene.start('Level4'); // Transition to next level or scene
      });
      return;
    }

    this.setFeedback('Unknown command. Try: git add <resource>,\n git commit -m "Collected resources",\n or git checkout base.');
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

  updateInstruction() {
    // If not all items are added and commit not done, instruct to "Collect resources"
    if (this.stagedItems.size < REQUIRED_ITEMS.length && !this.commitDone) {
      this.instructionText.setText("Collect resources");
    }
    // If all items are staged but commit is not done, instruct to commit
    else if (this.stagedItems.size === REQUIRED_ITEMS.length && !this.commitDone) {
      this.instructionText.setText("Commit your collected resources");
    }
    // If commit is done but checkout is not, instruct to "Go back to base"
    else if (this.commitDone && !this.checkoutDone) {
      this.instructionText.setText("Go back to base");
    }
  }
}

import Phaser from 'phaser';
import Preloader from './scenes/Preloader';
import start from './scenes/start';
import crashSite from './scenes/crashSite';
// import Level3 from './scenes/Level3';
// import Level4 from './scenes/Level4';
// import Level5 from './scenes/Level5';
// import Level6 from './scenes/Level6';

export const config = {
  type: Phaser.AUTO, // AUTO uses WebGL if available, otherwise Canvas
  parent: 'phaser-container', // ID of the div to inject the canvas into
  width: 480,
  height: 480,
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 0 }, // Top-down, no gravity needed unless for specific mechanics
      // debug: true // Set true for physics debugging visuals
    }
  },
  pixelArt: true, // If using pixel art assets
  scene: [
    Preloader, // Start with preloader
    start,
    crashSite
    // Level3,
    // Level4,
    // Level5,
    // Level6
    // Add other scenes as needed (e.g., MainMenu, GameOver)
  ],
  // Allow communication between React and Phaser via game instance events
  callbacks: {
    postBoot: (game) => {
      window.phaserGame = game; // Make accessible for debugging (optional)
    }
  }
};
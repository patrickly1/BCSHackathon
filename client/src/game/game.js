import Phaser from 'phaser';
import GameManager from './GameManager';
import { config } from './config';

export function initGame(container, options = {}) {
    const gameConfig = { ...config, parent: container };
    const game = new Phaser.Game(gameConfig);
  
    // Attach React setter
    game.reactSetCurrentLocation = options.setCurrentLocation || (() => {});
  
    // Set starting location
    const playerData = options.initialPlayerData || {};
    GameManager.getPlayer().loadFromData(playerData);
  
    // If a saved location exists, use it
    const startingScene = GameManager.getPlayer().getLocation() || 'Level1';
  
    // Wait for the game to be ready before switching
    game.scene.start(startingScene);
  
    return game;
  }
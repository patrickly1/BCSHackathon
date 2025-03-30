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
    // sets starting location.
    GameManager.getPlayer().loadFromData(playerData);
    // loads the current player
  
    // If a saved location exists, use it
    const startingScene = GameManager.getPlayer().getLocation() || 'Level4';
  
    // Wait for the game to be ready before switchin


    game.scene.start(startingScene);

  
    return game;
  }
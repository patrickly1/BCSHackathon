import Phaser from 'phaser';
import { config } from './config';

export function initGame(container) {
  // Ensure config parent matches the container ref's ID or the container itself
  const gameConfig = { ...config, parent: container };
  const game = new Phaser.Game(gameConfig);
  return game;
}
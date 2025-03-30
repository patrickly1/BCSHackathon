export default class Player {
    constructor() {
      this.location = null; // e.g., 'Level1'
      this.inventory = {};  // { Level1: [...], Level2: [...] }
    }
  
    setLocation(levelName) {
      this.location = levelName;
  
      // Initialize inventory for this level if not present
      if (!this.inventory[levelName]) {
        this.inventory[levelName] = [];
      }
    }
  
    getLocation() {
      return this.location;
    }
  
    addItem(item) {
      if (!this.location) {
        throw new Error('Player location is not set.');
      }
      this.inventory[this.location].push(item);
    }
  
    getInventory(location = this.location) {
      return this.inventory[location] || [];
    }
  
    toJSON() {
      return {
        location: this.location,
        inventory: this.inventory
      };
    }
  
    loadFromData(data) {
      this.location = data.location || null;
      this.inventory = data.inventory || {};
    }
  }
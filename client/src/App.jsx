import React, { useState, useEffect, useRef } from 'react';
import Terminal from './components/Terminal';
import { initGame } from './game/game'; // We'll create this
import './index.css'; // Basic styling

function App() {
  const [isTerminalOpen, setIsTerminalOpen] = useState(false);
  const [phaserGame, setPhaserGame] = useState(null);
  const phaserContainerRef = useRef(null); // Ref to mount Phaser game

  // Initialize Phaser game on component mount
  useEffect(() => {
    if (phaserContainerRef.current && !phaserGame) {
      const gameInstance = initGame(phaserContainerRef.current);
      setPhaserGame(gameInstance);
    }

    // Cleanup Phaser game on component unmount
    return () => {
      phaserGame?.destroy(true);
      setPhaserGame(null);
    };
  }, [phaserGame]); // Only re-run if phaserGame changes (e.g., on cleanup)

  // Handle 'T' key press to toggle terminal
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key.toUpperCase() === 'T') {
        setIsTerminalOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Function to process commands from the Terminal
  const handleCommandSubmit = (command) => {
    if (!phaserGame) return;

    console.log("Command entered:", command);
    // Send command to the active Phaser scene
    // Using Phaser's event emitter is a good way
    phaserGame.events.emit('commandInput', command);

    // Optionally, close terminal after command, or keep it open
    // setIsTerminalOpen(false);
  };

  return (
    <div className="App">
      {/* Container where Phaser canvas will be injected */}
      <div ref={phaserContainerRef} id="phaser-container"></div>

      {isTerminalOpen && (
        <Terminal onSubmit={handleCommandSubmit} />
      )}
    </div>
  );
}

export default App;
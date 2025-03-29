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

  const handleSave = async () => {
    try {
      const res = await fetch('http://localhost:5001/api/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: 'devhero',
          timeElapsed: 42,
          levelsCompleted: ['level1'],
        }),
      });
      const data = await res.json();
      console.log('✅ Save response:', data);
    } catch (err) {
      console.error('❌ Save failed:', err);
    }
  };

  const handleLoad = async () => {
    try {
      const res = await fetch('http://localhost:5001/api/save/devhero');
      const data = await res.json();
      console.log('📦 Loaded save:', data);
    } catch (err) {
      console.error('❌ Load failed:', err);
    }
  };

  return (
    <div className="App">
      {/* Container where Phaser canvas will be injected */}
      <div ref={phaserContainerRef} id="phaser-container"></div>

      {isTerminalOpen && (
        <Terminal onSubmit={handleCommandSubmit} />
      )}
            <div style={{ position: 'absolute', bottom: 20, left: 20 }}>
        <button onClick={handleSave} style={{ marginRight: '10px' }}>
          💾 Save
        </button>
        <button onClick={handleLoad}>
          📂 Load
        </button>
      </div>
    </div>
  );
}

export default App;
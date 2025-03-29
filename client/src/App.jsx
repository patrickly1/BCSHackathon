import React, { useState, useEffect, useRef } from 'react';
import Terminal from './components/Terminal';
import { initGame } from './game/game'; // We'll create this
import './index.css'; // Basic styling

function App() {
  const [isTerminalOpen, setIsTerminalOpen] = useState(false);
  const [username, setUsername] = useState('');
  const [phaserGame, setPhaserGame] = useState(null);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [timerActive, setTimerActive] = useState(false);
  const [levelsCompleted, setLevelsCompleted] = useState([]);
  
  const phaserContainerRef = useRef(null); // Ref to mount Phaser game

  // Initialize Phaser game on component mount
  useEffect(() => {
    if (phaserContainerRef.current && !phaserGame) {
      const gameInstance = initGame(phaserContainerRef.current);
      setPhaserGame(gameInstance);
      setTimerActive(true); // ✅ Start the timer on game load
    }

    // Cleanup Phaser game on component unmount
    return () => {
      phaserGame?.destroy(true);
      setPhaserGame(null);
    };
  }, []); // Only re-run if phaserGame changes (e.g., on cleanup)

  // Handle 'T' key press to toggle terminal
  useEffect(() => {
    const handleKeyDown = (event) => {
        const activeElement = document.activeElement;
        if (event.key.toUpperCase() === 'T' && activeElement.tagName !== 'INPUT') {
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
    let saveName = username;
    // this is blan by default - check top of the page

  
    if (!saveName) {
      const entered = prompt('Enter a name to save your progress:');

      // if save name is blank it brings this up.

      if (!entered) return;
      // if entered is null, break out of handleSave
  
      saveName = entered;       // use immediately
      setUsername(entered);     // store for future saves
      // setusername is an external method
    }
  
    try {
      const res = await fetch('http://localhost:5001/api/save', {
        // fetch is a built in browser function
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: saveName,
          timeElapsed,
          levelsCompleted: ['none'], // placeholder
        }), // this is a JSON object of all the parameters
      });
  
      const data = await res.json();
      // res.json() tells server to send back a 200 OK message
      console.log('✅ Save response:', data);
  
      setTimeElapsed(data.timeElapsed);
      setLevelsCompleted(data.levelsCompleted);
      // just for syncing purposes.
      // data. means the parsed response from the backend, Mongoose

    } catch (err) {
      console.error('❌ Save failed:', err);
    }
  };

  const handleLoad = async () => {
    try {
      // 1. Fetch all usernames from the backend
      const listRes = await fetch('http://localhost:5001/api/save');
      // fetch from localhost
      const usernames = await listRes.json();
      // await from server an array of usernames
  
      if (!Array.isArray(usernames) || usernames.length === 0) {
        alert('No save files found.');
        return;
      }
  
      // 2. Ask user to choose one (basic prompt)
      const selected = prompt(
        `Which file do you want to load?\n\n${usernames.join('\n')}`
      );
  
      if (!selected) {
        alert('Invalid or cancelled selection.');
        return;
      }
      
      // Try to find a case-insensitive match
      const matchedUsername = usernames.find(
        (name) => name.toLowerCase() === selected.toLowerCase()
      );
      
      if (!matchedUsername) {
        alert('No matching save file found.');
        return;
      }
  
      // 3. Load that specific file
      const res = await fetch(`http://localhost:5001/api/save/${selected}`);
      const data = await res.json();
      // awaits 200 ok message
  
      console.log('📦 Loaded save:', data);
      setUsername(selected);
      setTimeElapsed(data.timeElapsed);
      setLevelsCompleted(data.levelsCompleted);
      setTimerActive(true);
    } catch (err) {
      console.error('❌ Load failed:', err);
    }
  };

  useEffect(() => {
    let interval;
  
    if (timerActive) {
      interval = setInterval(() => {
        setTimeElapsed(prev => prev + 1);
      }, 1000); // increment every second
    }
  
    return () => clearInterval(interval);
  }, [timerActive]);

  return (
    <div className="App">
            <div style={{
        position: 'fixed',
        top: 10,
        left: 10,
        zIndex: 9999,
        fontSize: '10px',
        opacity: 0.7,
        pointerEvents: 'auto'
        }}>
        <button
            onClick={handleSave} // this button is the save button, handleSave
            style={{
            marginRight: '5px',
            padding: '2px 4px',
            fontSize: '10px'
            }}
        >
            💾 Save
        </button>
        <button
            onClick={handleLoad} // load button
            style={{
            padding: '2px 4px',
            fontSize: '10px'
            }}
        >
            📂 Load
        </button>
        </div>
                <div style={{ // this entire section is fixed to the top right and it's the data loaded
        position: 'fixed',
        top: 10,
        right: 10,
        zIndex: 9999,
        fontSize: '10px',
        opacity: 0.8,
        textAlign: 'right',
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        padding: '4px 6px',
        borderRadius: '4px'
        }}>
        <div><strong>User:</strong> {username || '—'}</div>
        <div><strong>Time:</strong> {timeElapsed}s</div>
        <div><strong>Levels:</strong> {levelsCompleted.join(', ') || '—'}</div>
        </div>
      {/* Container where Phaser canvas will be injected */}
      <div ref={phaserContainerRef} id="phaser-container"></div>

      {isTerminalOpen && (
        <Terminal onSubmit={handleCommandSubmit} />
      )}
    </div>
  );
}

export default App;
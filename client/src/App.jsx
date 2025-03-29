// import React, { useState, useEffect, useRef } from 'react';
// import Terminal from './components/Terminal';
// import { initGame } from './game/game'; // We'll create this
// import './index.css'; // Basic styling

// function App() {
//   const [isTerminalOpen, setIsTerminalOpen] = useState(false);
//   const [phaserGame, setPhaserGame] = useState(null);
//   const phaserContainerRef = useRef(null); // Ref to mount Phaser game

//   // Initialize Phaser game on component mount
//   useEffect(() => {
//     if (phaserContainerRef.current && !phaserGame) {
//       const gameInstance = initGame(phaserContainerRef.current);
//       setPhaserGame(gameInstance);
//     }

//     // Cleanup Phaser game on component unmount
//     return () => {
//       phaserGame?.destroy(true);
//       setPhaserGame(null);
//     };
//   }, []); // Only re-run if phaserGame changes (e.g., on cleanup)

//   // Handle 'T' key press to toggle terminal
//   useEffect(() => {
//     const handleKeyDown = (event) => {
//         const activeElement = document.activeElement;
//         if (event.key.toUpperCase() === 'T' && activeElement.tagName !== 'INPUT') {
//             setIsTerminalOpen(prev => !prev);
//         }
//     };
//     window.addEventListener('keydown', handleKeyDown);
//     return () => window.removeEventListener('keydown', handleKeyDown);
//   }, []);

//   // Function to process commands from the Terminal
//   const handleCommandSubmit = (command) => {
//     if (!phaserGame) return;

//     console.log("Command entered:", command);
//     // Send command to the active Phaser scene
//     // Using Phaser's event emitter is a good way
//     phaserGame.events.emit('commandInput', command);

//     // Optionally, close terminal after command, or keep it open
//     // setIsTerminalOpen(false);
//   };

//   return (
//     <div className="App">
//       {/* Container where Phaser canvas will be injected */}
//       <div ref={phaserContainerRef} id="phaser-container"></div>

//       {isTerminalOpen && (
//         <Terminal onSubmit={handleCommandSubmit} />
//       )}
//     </div>
//   );
// }

// export default App;

// src/App.tsx (or App.jsx)

// ... other imports
// import Phaser from 'phaser';

// function App() { // : React.ReactElement removed if using JS
//   const [isTerminalOpen, setIsTerminalOpen] = useState<boolean>(false); // <boolean> removed if JS
//   // Use a ref to track the game instance *as well* as state.
//   // Sometimes state updates aren't synchronous enough for rapid mount/unmount.
//   const gameInstanceRef = useRef<Phaser.Game | null>(null);
//   const phaserContainerRef = useRef<HTMLDivElement>(null); // <HTMLDivElement> removed if JS

//   // Initialize Phaser game on component mount
//   useEffect(() => {
//     console.log("Phaser init effect running...");

//     // --- Crucial Check ---
//     // Only initialize if the container exists AND no game instance is already tracked by the ref.
//     if (phaserContainerRef.current && !gameInstanceRef.current) {
//       console.log("Container found and no existing game instance ref. Initializing Phaser...");
//       const gameConfig = { ...phaserConfig, parent: phaserContainerRef.current }; // Ensure config is defined elsewhere
//       const game = new Phaser.Game(gameConfig);
//       gameInstanceRef.current = game; // Store instance in ref IMMEDIATELY
//       console.log("Phaser initialized and ref set.");
//     } else {
//       if (!phaserContainerRef.current) {
//         console.log("Phaser init skipped: Container ref not ready.");
//       }
//       if (gameInstanceRef.current) {
//         console.log("Phaser init skipped: Game instance ref already exists.");
//       }
//     }

//     // Cleanup function
//     return () => {
//       console.log("Phaser cleanup effect running...");
//       if (gameInstanceRef.current) {
//         console.log("Destroying Phaser instance:", gameInstanceRef.current);
//         // Destroy the game instance stored in the ref
//         gameInstanceRef.current.destroy(true); // Use true to remove canvas from DOM
//         gameInstanceRef.current = null; // Clear the ref
//         console.log("Phaser instance destroyed and ref cleared.");
//       } else {
//         console.log("Phaser cleanup skipped: No game instance ref found.");
//       }
//     };
//   }, []); // Empty dependency array: run on mount, clean up on unmount

//   // ... rest of your App component (key handling, command submit) ...
//   // Note: handleCommandSubmit should now use gameInstanceRef.current.events.emit(...)
//    const handleCommandSubmit = (command: string): void => { // Type command and return (adjust for JS)
//     if (!gameInstanceRef.current) { // Check the ref
//         console.warn("Cannot submit command, Phaser game instance not available.");
//         return;
//     };

//     console.log("Command entered:", command);
//     // Send command to the active Phaser scene using the instance from the ref
//     gameInstanceRef.current.events.emit('commandInput', command);

//     // Optionally, close terminal after command, or keep it open
//     // setIsTerminalOpen(false);
//   };


//   return (
//     <div className="App">
//       <div ref={phaserContainerRef} id="phaser-container"></div>
//       {isTerminalOpen && (
//         <Terminal onSubmit={handleCommandSubmit} />
//       )}
//     </div>
//   );
// }

// export default App;

// src/App.jsx
import React, { useState, useEffect, useRef } from 'react';
import Terminal from './components/Terminal'; // Make sure path is correct
import { initGame } from './game/game';     // Make sure path is correct & it returns the Phaser game instance
// If you define config in game.js, you might not need a separate config import here
// import { config as phaserConfig } from './game/config'; // Or get config differently
import Phaser from 'phaser';                // Import Phaser
// import './index.css';

function App() {
  const [isTerminalOpen, setIsTerminalOpen] = useState(false);
  const [username, setUsername] = useState('');
  const [phaserGame, setPhaserGame] = useState(null);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [timerActive, setTimerActive] = useState(false);
  const [levelsCompleted, setLevelsCompleted] = useState([]);
  
  const phaserContainerRef = useRef(null); // Ref to mount Phaser game

  // Use a ref to track the game instance reliably during StrictMode cycles
  const gameInstanceRef = useRef(null);

  // Initialize Phaser game on component mount
  useEffect(() => {
    console.log("Phaser init effect running...");
    setTimerActive(true); // ✅ Start the timer on game load

    // --- Crucial Check ---
    // Only initialize if the container exists AND no game instance is already tracked by the ref.
    if (phaserContainerRef.current && !gameInstanceRef.current) {
      console.log("Container found and no existing game instance ref. Initializing Phaser...");

      // Initialize the game using your initGame function
      // Make sure initGame takes the container element and returns the Phaser.Game instance
      const game = initGame(phaserContainerRef.current);

      // --- Important: Check if initGame successfully returned a game instance ---
      if (game && game instanceof Phaser.Game) {
          gameInstanceRef.current = game; // Store instance in ref IMMEDIATELY
          console.log("Phaser initialized and ref set.", gameInstanceRef.current);
      } else {
          console.error("initGame did not return a valid Phaser.Game instance!");
      }

    } else {
      if (!phaserContainerRef.current) {
        console.log("Phaser init skipped: Container ref not ready.");
      }
      if (gameInstanceRef.current) {
        console.log("Phaser init skipped: Game instance ref already exists.");
      }
    }

    // Cleanup function
    return () => {
      console.log("Phaser cleanup effect running...");
      if (gameInstanceRef.current) {
        console.log("Destroying Phaser instance:", gameInstanceRef.current);
        // Destroy the game instance stored in the ref
        gameInstanceRef.current.destroy(true); // Use true to remove canvas from DOM
        gameInstanceRef.current = null; // Clear the ref
        console.log("Phaser instance destroyed and ref cleared.");
      } else {
        console.log("Phaser cleanup skipped: No game instance ref found.");
      }
    };
  }, []); // Empty dependency array: run on mount, clean up on unmount

  // Handle 'T' key press to toggle terminal
  useEffect(() => {
    const handleKeyDown = (event) => {
      // Check if focus is inside an input/textarea to avoid conflicts
      const activeElement = document.activeElement;
      const isInputFocused = activeElement && (activeElement.tagName === 'INPUT' || activeElement.tagName === 'TEXTAREA');

      if (event.key.toUpperCase() === 'T' && !event.repeat && !isInputFocused) {
        setIsTerminalOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []); // Re-run if isTerminalOpen changes isn't necessary here

  // Function to process commands from the Terminal
  const handleCommandSubmit = (command) => {
    // Use the ref to access the game instance
    if (!gameInstanceRef.current) {
        console.warn("Cannot submit command, Phaser game instance not available.");
        return;
    };

    console.log("Command entered:", command);
    // Send command to the active Phaser scene using the instance from the ref
    gameInstanceRef.current.events.emit('commandInput', command);

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
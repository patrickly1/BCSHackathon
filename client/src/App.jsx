// // src/App.jsx
// import React, { useState, useEffect, useRef } from 'react';
// import Terminal from './components/Terminal'; // Make sure path is correct
// import { initGame } from './game/game';     // Make sure path is correct & it returns the Phaser game instance
// import GameManager from './game/GameManager';
// // imports GameManager
// // import { config as phaserConfig } from './game/config'; // Or get config differently
// import Phaser from 'phaser';                // Import Phaser
// // import './index.css';
// import './styles/App.css'

// function App() {
//   const [isTerminalOpen, setIsTerminalOpen] = useState(false);
//   const [username, setUsername] = useState('');
//   const [phaserGame, setPhaserGame] = useState(null);
//   const [timeElapsed, setTimeElapsed] = useState(0);
//   const [timerActive, setTimerActive] = useState(false);
//   const [currentLocation, setCurrentLocation] = useState('Level1');
  
//   const phaserContainerRef = useRef(null); // Ref to mount Phaser game

//   // Use a ref to track the game instance reliably during StrictMode cycles
//   const gameInstanceRef = useRef(null);

//   // Initialize Phaser game on component mount
//   useEffect(() => {
//     console.log("Phaser init effect running...");
//     setTimerActive(true); // ✅ Start the timer on game load

//     // --- Crucial Check ---
//     // Only initialize if the container exists AND no game instance is already tracked by the ref.
//     if (phaserContainerRef.current && !gameInstanceRef.current) {
//       console.log("Container found and no existing game instance ref. Initializing Phaser...");

//       // Initialize the game using your initGame function
//       // Make sure initGame takes the container element and returns the Phaser.Game instance
//       const game = initGame(phaserContainerRef.current, {
//         setCurrentLocation
//       });

//       // --- Important: Check if initGame successfully returned a game instance ---
//       if (game && game instanceof Phaser.Game) {
//           gameInstanceRef.current = game; // Store instance in ref IMMEDIATELY
//           console.log("Phaser initialized and ref set.", gameInstanceRef.current);
//       } else {
//           console.error("initGame did not return a valid Phaser.Game instance!");
//       }

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

//   // Handle 'T' key press to toggle terminal
//   useEffect(() => {
//     const handleKeyDown = (event) => {
//       // Check if focus is inside an input/textarea to avoid conflicts
//       const activeElement = document.activeElement;
//       const isInputFocused = activeElement && (activeElement.tagName === 'INPUT' || activeElement.tagName === 'TEXTAREA');

//       if (event.key.toUpperCase() === 'T' && !event.repeat && !isInputFocused) {
//         event.preventDefault();
//         setIsTerminalOpen(prev => !prev);
//       }
//     };
//     window.addEventListener('keydown', handleKeyDown);
//     return () => window.removeEventListener('keydown', handleKeyDown);
//   }, []); // Re-run if isTerminalOpen changes isn't necessary here

//   // Function to process commands from the Terminal
//   const handleCommandSubmit = (command) => {
//     // Use the ref to access the game instance
//     if (!gameInstanceRef.current) {
//         console.warn("Cannot submit command, Phaser game instance not available.");
//         return;
//     };

//     console.log("Command entered:", command);
//     // Send command to the active Phaser scene using the instance from the ref
//     gameInstanceRef.current.events.emit('commandInput', command);

//     // Optionally, close terminal after command, or keep it open
//     // setIsTerminalOpen(false);
//   };
  
//   // Inside App.jsx
//   useEffect(() => {
//     if (gameInstanceRef.current) {
//       gameInstanceRef.current.events.emit("terminalToggled", isTerminalOpen);
//     }
//   }, [isTerminalOpen]); // Re-run when terminal state changes
  
//   const handleSave = async () => {
//     let saveName = username;
//     // this is blan by default - check top of the page

  
//     if (!saveName) {
//       const entered = prompt('Enter a name to save your progress:');

//       // if save name is blank it brings this up.

//       if (!entered) return;
//       // if entered is null, break out of handleSave
  
//       saveName = entered;       // use immediately
//       setUsername(entered);     // store for future saves
//       // setusername is an external method
//     }
  
//     try {
//       const res = await fetch('http://localhost:5001/api/save', {
//         // fetch is a built in browser function
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({
//             username: saveName,
//             timeElapsed,
//             currentLocation: GameManager.getPlayer().getLocation(),
//             inventory: GameManager.getPlayer().inventory
//           }),
//       });
  
//       const data = await res.json();
//       // res.json() tells server to send back a 200 OK message
//       console.log('✅ Save response:', data);
  
//       setTimeElapsed(data.timeElapsed);
//       setCurrentLocation(data.currentLocation);
//       // just for syncing purposes.
//       // data. means the parsed response from the backend, Mongoose

//     } catch (err) {
//       console.error('❌ Save failed:', err);
//     }
//   };

//   useEffect(() => {
//     console.log("Current location updated to:", currentLocation);
//   }, [currentLocation]);

//   const handleLoad = async () => {
//     try {
//       // 1. Fetch all usernames from the backend
//       const listRes = await fetch('http://localhost:5001/api/save');
//       // fetch from localhost
//       const usernames = await listRes.json();
//       // await from server an array of usernames
  
//       if (!Array.isArray(usernames) || usernames.length === 0) {
//         alert('No save files found.');
//         return;
//       }
  
//       // 2. Ask user to choose one (basic prompt)
//       const selected = prompt(
//         `Which file do you want to load?\n\n${usernames.join('\n')}`
//       );
  
//       if (!selected) {
//         alert('Invalid or cancelled selection.');
//         return;
//       }
      
//       // Try to find a case-insensitive match
//       const matchedUsername = usernames.find(
//         (name) => name.toLowerCase() === selected.toLowerCase()
//       );
      
//       if (!matchedUsername) {
//         alert('No matching save file found.');
//         return;
//       }
  
//       // 3. Load that specific file
//       const res = await fetch(`http://localhost:5001/api/save/${selected}`);
//       const data = await res.json();
//       // awaits 200 ok message
  
//       console.log('📦 Loaded save:', data);
//       setUsername(selected);
//       setTimeElapsed(data.timeElapsed);
//       setCurrentLocation(data.currentLocation);
//       setTimerActive(true);
//       // 4. Destroy existing Phaser game if it exists
//     if (gameInstanceRef.current) {
//         console.log("Destroying previous game before loading saved state...");
//         gameInstanceRef.current.destroy(true);
//         gameInstanceRef.current = null;
//     }

    
//     // 5. Start a new game with the loaded player data
//     const game = initGame(phaserContainerRef.current, {
//         setCurrentLocation,
//         initialPlayerData: {
//         location: data.currentLocation,
//         inventory: data.inventory || {}
//         }
//     });

    
//     gameInstanceRef.current = game;
//     } catch (err) {
//       console.error('❌ Load failed:', err);
//     }
//   };

//   useEffect(() => {
//     let interval;
  
//     if (timerActive) {
//       interval = setInterval(() => {
//         setTimeElapsed(prev => prev + 1);
//       }, 1000); // increment every second
//     }
  
//     return () => clearInterval(interval);
//   }, [timerActive]);

//   return (
//     <div className="App">
//             <div style={{
//         position: 'fixed',
//         top: 10,
//         left: 10,
//         zIndex: 9999,
//         fontSize: '10px',
//         opacity: 0.7,
//         pointerEvents: 'auto'
//         }}>
//         <button
//             onClick={handleSave} // this button is the save button, handleSave
//             style={{
//             marginRight: '5px',
//             padding: '2px 4px',
//             fontSize: '10px'
//             }}
//         >
//             💾 Save
//         </button>
//         <button
//             onClick={handleLoad} // load button
//             style={{
//             padding: '2px 4px',
//             fontSize: '10px'
//             }}
//         >
//             📂 Load
//         </button>
//         </div>
//         <div style={{
//         position: 'fixed',
//         top: 10,
//         right: 10,
//         zIndex: 9999,
//         fontSize: '10px',
//         opacity: 0.9,
//         textAlign: 'left',
//         backgroundColor: 'rgba(255, 255, 255, 0.1)',
//         padding: '6px 8px',
//         borderRadius: '4px',
//         width: '120px', // fixed width
//         wordWrap: 'break-word',
//         overflowWrap: 'break-word'
//         }}>
//         <div><strong>User:</strong> {username || '—'}</div>
//         <div><strong>Time:</strong> {timeElapsed}s</div>
//         <div><strong>Location:</strong> {currentLocation || '—'}</div>
//         <div><strong>Inventory:</strong></div>
//         {Object.entries(GameManager.getPlayer().inventory).map(([location, items]) => (
//             <div key={location}>
//             <strong>{location}:</strong>{' '}
//             <span style={{ display: 'inline-block', wordBreak: 'break-word' }}>
//                 {items.join(', ') || '—'}
//             </span>
//             </div>
//         ))}
//         </div>
//       {/* Container where Phaser canvas will be injected */}
//       <div className="App">
//         {/* Phaser game container */}
//         <div ref={phaserContainerRef} id="phaser-container"></div>
//         {/* Terminal panel on the right */}
//         {isTerminalOpen && <Terminal onSubmit={handleCommandSubmit} />}
//       </div>
//     </div>
//   );
// }

// export default App;

// src/App.jsx
import React, { useState, useEffect, useRef } from 'react';
import Terminal from './components/Terminal'; // Make sure path is correct
import { initGame } from './game/game'; // Make sure path is correct & it returns the Phaser game instance
import GameManager from './game/GameManager';
import Phaser from 'phaser';
import './styles/App.css';

function App() {
  const [isTerminalOpen, setIsTerminalOpen] = useState(false);
  const [username, setUsername] = useState('');
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [timerActive, setTimerActive] = useState(false);
  const [currentLocation, setCurrentLocation] = useState('Level1');

  const phaserContainerRef = useRef(null); // Ref to mount Phaser game
  const gameInstanceRef = useRef(null);

  // Initialize Phaser game on component mount
  useEffect(() => {
    console.log("Phaser init effect running...");
    setTimerActive(true); // Start the timer on game load

    if (phaserContainerRef.current && !gameInstanceRef.current) {
      console.log("Container found and no existing game instance ref. Initializing Phaser...");
      const game = initGame(phaserContainerRef.current, { setCurrentLocation });
      if (game && game instanceof Phaser.Game) {
        gameInstanceRef.current = game; // Store instance in ref immediately
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

    return () => {
      console.log("Phaser cleanup effect running...");
      if (gameInstanceRef.current) {
        console.log("Destroying Phaser instance:", gameInstanceRef.current);
        gameInstanceRef.current.destroy(true);
        gameInstanceRef.current = null;
        console.log("Phaser instance destroyed and ref cleared.");
      } else {
        console.log("Phaser cleanup skipped: No game instance ref found.");
      }
    };
  }, []);

  // Handle 'T' key press to toggle terminal
  useEffect(() => {
    const handleKeyDown = (event) => {
      const activeElement = document.activeElement;
      // Check if focus is inside an input/textarea or inside the terminal overlay
      const isInputFocused = activeElement && 
        (activeElement.tagName === 'INPUT' || activeElement.tagName === 'TEXTAREA');
      
      // If the focused element is inside the terminal overlay, don't toggle
      if (activeElement && activeElement.closest && activeElement.closest('.terminal-overlay')) {
        return;
      }

      if (event.key.toUpperCase() === 'T' && !event.repeat && !isInputFocused) {
        event.preventDefault();
        setIsTerminalOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleCommandSubmit = (command) => {
    if (!gameInstanceRef.current) {
      console.warn("Cannot submit command, Phaser game instance not available.");
      return;
    }
    console.log("Command entered:", command);
    gameInstanceRef.current.events.emit('commandInput', command);
  };

  useEffect(() => {
    if (gameInstanceRef.current) {
      gameInstanceRef.current.events.emit("terminalToggled", isTerminalOpen);
    }
  }, [isTerminalOpen]);

  const handleSave = async () => {
    let saveName = username;
    if (!saveName) {
      const entered = prompt('Enter a name to save your progress:');
      if (!entered) return;
      saveName = entered;
      setUsername(entered);
    }
  
    try {
      const res = await fetch('http://localhost:5001/api/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: saveName,
          timeElapsed,
          currentLocation: GameManager.getPlayer().getLocation(),
          inventory: GameManager.getPlayer().inventory
        }),
      });
      const data = await res.json();
      console.log('✅ Save response:', data);
      setTimeElapsed(data.timeElapsed);
      setCurrentLocation(data.currentLocation);
    } catch (err) {
      console.error('❌ Save failed:', err);
    }
  };

  useEffect(() => {
    console.log("Current location updated to:", currentLocation);
  }, [currentLocation]);

  const handleLoad = async () => {
    try {
      const listRes = await fetch('http://localhost:5001/api/save');
      const usernames = await listRes.json();
      if (!Array.isArray(usernames) || usernames.length === 0) {
        alert('No save files found.');
        return;
      }
      const selected = prompt(`Which file do you want to load?\n\n${usernames.join('\n')}`);
      if (!selected) {
        alert('Invalid or cancelled selection.');
        return;
      }
      const matchedUsername = usernames.find(
        (name) => name.toLowerCase() === selected.toLowerCase()
      );
      if (!matchedUsername) {
        alert('No matching save file found.');
        return;
      }
      const res = await fetch(`http://localhost:5001/api/save/${selected}`);
      const data = await res.json();
      console.log('📦 Loaded save:', data);
      setUsername(selected);
      setTimeElapsed(data.timeElapsed);
      setCurrentLocation(data.currentLocation);
      setTimerActive(true);
  
      if (gameInstanceRef.current) {
        console.log("Destroying previous game before loading saved state...");
        gameInstanceRef.current.destroy(true);
        gameInstanceRef.current = null;
      }
  
      const game = initGame(phaserContainerRef.current, {
        setCurrentLocation,
        initialPlayerData: {
          location: data.currentLocation,
          inventory: data.inventory || {}
        }
      });
      gameInstanceRef.current = game;
    } catch (err) {
      console.error('❌ Load failed:', err);
    }
  };

  useEffect(() => {
    let interval;
    if (timerActive) {
      interval = setInterval(() => {
        setTimeElapsed(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timerActive]);

  return (
    <div>
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
          onClick={handleSave}
          style={{ marginRight: '5px', padding: '2px 4px', fontSize: '10px' }}
        >
          💾 Save
        </button>
        <button
          onClick={handleLoad}
          style={{ padding: '2px 4px', fontSize: '10px' }}
        >
          📂 Load
        </button>
      </div>
      <div style={{
        position: 'fixed',
        top: 10,
        right: 10,
        zIndex: 9999,
        fontSize: '10px',
        opacity: 0.9,
        textAlign: 'left',
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        padding: '6px 8px',
        borderRadius: '4px',
        width: '120px',
        wordWrap: 'break-word',
        overflowWrap: 'break-word'
      }}>
        <div><strong>User:</strong> {username || '—'}</div>
        <div><strong>Time:</strong> {timeElapsed}s</div>
        <div><strong>Location:</strong> {currentLocation || '—'}</div>
        <div><strong>Inventory:</strong></div>
        {Object.entries(GameManager.getPlayer().inventory).map(([location, items]) => (
          <div key={location}>
            <strong>{location}:</strong>{' '}
            <span style={{ display: 'inline-block', wordBreak: 'break-word' }}>
              {items.join(', ') || '—'}
            </span>
          </div>
        ))}
      </div>
      {/* Main container: flex layout for game and terminal */}
      <div className="App">
        <div ref={phaserContainerRef} id="phaser-container"></div>
        {isTerminalOpen && <Terminal onSubmit={handleCommandSubmit} onClick={() => setIsTerminalOpen(false)}/>}
      </div>
    </div>
  );
}

export default App;
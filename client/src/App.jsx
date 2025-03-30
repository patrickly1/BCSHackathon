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
  // Use a ref to track the game instance reliably during StrictMode cycles
  const gameInstanceRef = useRef(null);
  const phaserContainerRef = useRef(null); // Ref for the mounting div

  // Initialize Phaser game on component mount
  useEffect(() => {
    console.log("Phaser init effect running...");

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
        event.preventDefault();
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

  // Inside App.jsx
  useEffect(() => {
    if (gameInstanceRef.current) {
      gameInstanceRef.current.events.emit("terminalToggled", isTerminalOpen);
    }
  }, [isTerminalOpen]); // Re-run when terminal state changes

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
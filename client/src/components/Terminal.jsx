// import React, { useState, useRef, useEffect } from 'react';
// // import '../styles/Terminal.css'; // Add styles for the terminal overlay

// function Terminal({ onSubmit }) {
//   const [inputValue, setInputValue] = useState('');
//   const [history, setHistory] = useState([]); // Optional: Command history
//   const inputRef = useRef(null);

//   useEffect(() => {
//     // Auto-focus the input when the terminal opens
//     inputRef.current?.focus();
//   }, []);

//   const handleSubmit = (e) => {
//     e.preventDefault();
//     if (inputValue.trim()) {
//       onSubmit(inputValue.trim());
//       setHistory(prev => [...prev, `> ${inputValue}`]); // Add to history display
//       setInputValue(''); // Clear input
//     }
//   };

//   return (
//     <div className="terminal-overlay">
//       <div className="terminal-output">
//         {/* Display command history or feedback here */}
//         {history.map((line, index) => <div key={index}>{line}</div>)}
//         <div>Welcome to the Gitopia! Type your commands...</div>
//       </div>
//       <form onSubmit={handleSubmit}>
//         <span className="terminal-prompt"></span>
//         <input
//           ref={inputRef}
//           type="text"
//           value={inputValue}
//           onChange={(e) => setInputValue(e.target.value)}
//           onKeyDown={(e) => e.stopPropagation()} // Prevent Phaser from also handling these keys
//           className="terminal-input"
//           spellCheck="false"
//           autoComplete="off"
//         />
//       </form>
//     </div>
//   );
// }

// export default Terminal;

// src/components/Terminal.jsx
import React, { useState, useRef, useEffect } from 'react';

function Terminal({ onSubmit }) {
  const [command, setCommand] = useState('');
  const [history, setHistory] = useState([]);
  const terminalRef = useRef(null);

  // Auto-focus the terminal container on mount
  useEffect(() => {
    terminalRef.current?.focus();
  }, []);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (command.trim()) {
        // Send command to parent
        onSubmit(command.trim());
        // Append to history (prefixing with '> ')
        setHistory(prev => [...prev, `> ${command}`]);
        setCommand('');
      }
    } else if (e.key === 'Backspace') {
      setCommand(prev => prev.slice(0, -1));
    } else if (e.key.length === 1) {
      setCommand(prev => prev + e.key);
    }
  };

  return (
    <div 
      className="terminal-overlay" 
      tabIndex={0} 
      ref={terminalRef} 
      onKeyDown={handleKeyDown}
    >
      <div className="terminal-output">
        {history.map((line, index) => (
          <div key={index}>{line}</div>
        ))}
        <div>
          <span>{'> ' + command}</span>
          <span className="terminal-cursor" />
        </div>
      </div>
    </div>
  );
}

export default Terminal;
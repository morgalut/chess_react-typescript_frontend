import React from 'react';
import ChessBoardComponent from './components/ChessBoardComponent'; // Ensure the path is correct based on your project structure

const App: React.FC = () => {
  return (
    <div className="App">
      <header className="App-header">
        <h1>Chess Game</h1>
      </header>
      <main>
        <ChessBoardComponent />
      </main>
    </div>
  );
};

export default App;

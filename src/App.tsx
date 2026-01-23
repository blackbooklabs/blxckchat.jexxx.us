import React from 'react';
import './App.css';
import ChatInterface from './components/ChatInterface';
import { TEST_IDS } from './test/constants';

function App() {
  return (
    <div className="App" data-testid={TEST_IDS.APP.CONTAINER}>
      <header className="App-header" data-testid={TEST_IDS.APP.HEADER}>
        <h1>BLXCK.chat</h1>
        <p>Your AI Chat Interface</p>
      </header>
      <ChatInterface />
    </div>
  );
}

export default App;
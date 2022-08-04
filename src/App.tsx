import React from 'react';
import logo from './logo.svg';
import './App.css';
import Diagram from './diagram/Diagram';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <small>You are running this application in <b>{process.env.NODE_ENV}</b> mode.</small>
        <p>
          Edit <code>src/App.tsx</code> and save to reload.
        </p>
        <div style={{height: '500px', width:'80%'}}>
        <Diagram/>
        </div>
      </header>
    </div>
  );
}

export default App;

import './App.css';
import Diagram from './diagram/Diagram';
import UrlForm from './forms/UrlForm';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <small>Concerto Model Editor — v0.0.1</small>
        <UrlForm/>
        <div className='Diagram'>
        <Diagram/>
        </div>
      </header>
    </div>
  );
}

export default App;

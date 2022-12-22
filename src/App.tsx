import '@fortawesome/fontawesome-free/css/all.min.css';
import './App.css';
import 'bulma/css/bulma.min.css';
import Notification from './Notification';

import useStore from './store';
import { useEffect, useState } from 'react';
import DiagramHost from './diagram/DiagramHost';
import CodeHost from './code/CodeHost';
import FormHost from './form/FormHost';
import LoadFromUrlForm from './form/LoadFromUrlForm';

function App() {
  const viewChanged = useStore((state) => state.viewChanged);
  const view = useStore((state) => state.view);
  const init = useStore((state) => state.init);
  const loadSampleRequested = useStore((state) => state.loadSampleRequested);
  const saveRequested = useStore((state) => state.saveRequested);
  const downloadRequested = useStore((state) => state.downloadRequested);

  const [displayModal, setDisplayModal] = useState<boolean>(false);

  useEffect(() => {
    init()
  }, [init])

  function onSave() {
    saveRequested();
  }

  function onDownload() {
    downloadRequested();
  }

  return (
    <section className="hero">
      <div className="hero-body">
        <p className="title">
          Concerto Playground
        </p>
        <p className="subtitle">
          v1.0.0
        </p>      
        <div className="buttons">
          <button className="button mt-2" onClick={() => loadSampleRequested()}>Load Sample</button>
          <button className="button mt-2" onClick={() => setDisplayModal(true)}>Load from URL</button>
          <button className="button mt-2" onClick={onSave}>Save to Browser</button>
          <button className="button mt-2" onClick={onDownload}>Download</button>
          <div className=" ml-5 tabs is-centered is-toggle is-toggle-rounded">
                <ul>
                  <li className={view === 'Code' ? 'is-active' : undefined}><a onClick={() => viewChanged('Code')}>Code</a></li>
                  <li className={view === 'Form' ? 'is-active' : undefined}><a onClick={() => viewChanged('Form')}>Form</a></li>
                  <li className={view === 'Diagram' ? 'is-active' : undefined}><a onClick={() => viewChanged('Diagram')}>Diagram</a></li>
                </ul>
          </div>  
        </div>
        <Notification />
        <LoadFromUrlForm active={displayModal} onClose={setDisplayModal}/>
        <div className="container is-fluid">
          <div className="columns">
            <div className="column">
              {view === 'Code' ? <CodeHost /> : view === 'Diagram' ? <DiagramHost /> : <FormHost/>}
            </div>
          </div>
        </div>
      </div>
    </section>)
}

export default App;

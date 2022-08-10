import '@fortawesome/fontawesome-free/css/all.min.css';
import './App.css';
import 'bulma/css/bulma.min.css';
import CodeHost from './code/CodeHost';
import Notification from './Notification';

import useStore from './store';
import { useEffect, useState } from 'react';
import UrlForm from './forms/UrlForm';
import DiagramHost from './diagram/DiagramHost';

const SAMPLE_MODEL = `namespace org.acme

abstract concept Person identified by email {
  o String email
}

enum Department {
  o HR
  o SALES
  o ENGINEERING
}

concept Project identified {
  o String name
  o DateTime dueDate
}

concept Employee extends Person {
  o String[] firstName optional
  o Department department
  --> Project[] projects
}`;

function App() {
  const viewChanged = useStore((state) => state.viewChanged);
  const view = useStore((state) => state.view);
  const ctoTextLoaded = useStore((state) => state.ctoTextLoaded);
  const [displayModal, setDisplayModal] = useState<boolean>(false);

  useEffect(() => {
    ctoTextLoaded([SAMPLE_MODEL])
  }, [ctoTextLoaded])

  return (
    <section className="hero">
      <div className="hero-body">
        <p className="title">
          Concerto Model Editor
        </p>
        <p className="subtitle">
          v1.0.0
        </p>
        <div className="buttons">
          <button className="button" onClick={() => ctoTextLoaded([SAMPLE_MODEL])}>Load Sample</button>
          <button className="button" onClick={() => setDisplayModal(true)}>Load from URL</button>
        </div>
        <Notification />
        <UrlForm active={displayModal} onClose={setDisplayModal}/>
        <div className="container is-fluid">
          <div className="columns">
            <div className="column">
              <div className="tabs is-centered is-toggle is-toggle-rounded">
                <ul>
                  <li className={view === 'Code' ? 'is-active' : undefined}><a onClick={() => viewChanged('Code')}>Code</a></li>
                  <li className={view === 'Diagram' ? 'is-active' : undefined}><a onClick={() => viewChanged('Diagram')}>Diagram</a></li>
                </ul>
              </div>
              {view === 'Code' ? <CodeHost /> : <DiagramHost />}
            </div>
          </div>
        </div>
      </div>
    </section>)
}

export default App;

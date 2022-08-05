import '@fortawesome/fontawesome-free/css/all.min.css';
import './App.css';
import 'bulma/css/bulma.min.css';
import Diagram from './diagram/Diagram';
import Workspace from './Workspace';
import ConcertoText from './ConcertoText';
import Notification from './Notification';

import useStore from './store';
import { useEffect } from 'react';

function App() {
  const viewChanged = useStore((state) => state.viewChanged);
  const view = useStore((state) => state.view);
  const ctoTextLoaded = useStore((state) => state.ctoTextLoaded);

  useEffect(() => {
    ctoTextLoaded(`namespace org.acme

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
}`)
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
        <Notification />
        <div className="container is-fluid">
          <div className="columns">
            <div className="column is-one-quarter">
              <Workspace />
            </div>
            <div className="column">
              <div className="tabs is-centered is-toggle is-toggle-rounded">
                <ul>
                  <li className={view === 'Code' ? 'is-active' : undefined}><a onClick={() => viewChanged('Code')}>Code</a></li>
                  <li className={view === 'Diagram' ? 'is-active' : undefined}><a onClick={() => viewChanged('Diagram')}>Diagram</a></li>
                </ul>
              </div>
              {view === 'Code' ? <ConcertoText /> : <Diagram />}
            </div>
          </div>
        </div>
      </div>
    </section>)
}

export default App;

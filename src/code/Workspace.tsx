import { IModel } from '../metamodel/concerto.metamodel';
import useStore from '../store';

import Dropzone from './Dropzone';

function Workspace() {
  const models = useStore(state => state.models);
  const ctoModified = useStore(state => state.ctoModified);
  const editorNamespace = useStore(state => state.editorNamespace);
  const namespaceRemoved = useStore(state => state.namespaceRemoved);
  const editorNamespaceChanged = useStore(state => state.editorNamespaceChanged);

  function onChangeNamespace(model: IModel) {
    editorNamespaceChanged(model)
  }

  function onDeleteNamespace(ns: string) {
    namespaceRemoved(ns)
  }

  const namespaces = Object.keys(models).map(key => {
    // eslint-disable-next-line jsx-a11y/anchor-is-valid
    return <a key={key} className={editorNamespace?.namespace === key ? 'panel-block is-active' : 'panel-block'}>
      <div onClick={() => onChangeNamespace(models[key].model)}>
      <span className="panel-icon">
        <i className="fas fa-book" aria-hidden="true"></i>
      </span>
      {key}
      </div>
      <span className="panel-icon" style={{marginLeft: 100}} onClick={() => onDeleteNamespace(key)}>
        <i className="fas fa-trash-can" aria-hidden="true"></i>
      </span>
      </a>
  });

  function addModel() {
    const ns = `model${Object.keys(models).length}@1.0.0`;
    ctoModified(`namespace ${ns}`);
  }

  return <div className='workspace'>
    <nav className="panel">
      <p className="panel-heading">
        Models
      </p>
      {namespaces}
    </nav>
    <button className="button is-rounded" onClick={() => addModel()}>
      New
    </button>
    <Dropzone/>
  </div>
}

export default Workspace;

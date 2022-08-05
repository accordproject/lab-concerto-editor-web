import useStore from '../store';

function Workspace() {
  const modelText = useStore(state => state.modelText);
  const editorNamespace = useStore(state => state.editorNamespace);
  const editorNamespaceChanged = useStore(state => state.editorNamespaceChanged);

  function onChangeNamespace(ns: string) {
    editorNamespaceChanged(ns)
  }

  const namespaces = Object.keys(modelText).map(key => {
    // eslint-disable-next-line jsx-a11y/anchor-is-valid
    return <a key={key} onClick={() => onChangeNamespace(key)} className={editorNamespace === key ? 'panel-block is-active' : 'panel-block'}>
      <span className="panel-icon">
        <i className="fas fa-book" aria-hidden="true"></i>
      </span>
      {key}
    </a>
  });

  return <div className='workspace'>
    <nav className="panel">
      <p className="panel-heading">
        Models
      </p>
      {namespaces}
    </nav>
  </div>
}

export default Workspace;

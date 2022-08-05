import UrlForm from './forms/UrlForm';
import useStore from './store';

function Workspace() {
  const modelText = useStore(state => state.modelText);
  const layoutChanged = useStore(state => state.layoutChanged);
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
      <div className="panel-block">
        <UrlForm />
      </div>
      <div className="panel-block">
        <div className="buttons are-small">
          <button className="button is-rounded" onClick={() => layoutChanged('TB')}>
            Vertical Layout
          </button>
          <button className="button is-rounded" onClick={() => layoutChanged('LR')}>
            Horizontal Layout
          </button>
        </div>
      </div>
      {namespaces}
    </nav>
  </div>
}

export default Workspace;

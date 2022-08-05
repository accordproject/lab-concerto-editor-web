import useStore from '../store';

function DiagramTools() {
    const layoutChanged = useStore((state) => state.layoutChanged);
    return (
        <div className="buttons are-small">
            <button className="button is-rounded" onClick={() => layoutChanged('TB')}>
                Vertical Layout
            </button>
            <button className="button is-rounded" onClick={() => layoutChanged('LR')}>
                Horizontal Layout
            </button>
        </div>
    );
}

export default DiagramTools;

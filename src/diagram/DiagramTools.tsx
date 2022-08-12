import useStore, { Orientation } from '../store';

function DiagramTools() {
    const layoutChanged = useStore((state) => state.layoutChanged);
    const models = useStore(state => state.models);
    const namespaceVisibilityToggled = useStore(state => state.namespaceVisibilityToggled);
    function onSelect(key:string) {
        namespaceVisibilityToggled(key);
    }

    const namespaces = Object.keys(models).map(key => {
        return <li key={key}>
            <input checked={models[key].visible} type="checkbox" onClick={() => onSelect(key)}/>
            {key}
        </li>
    });

    return (
        <div>
            <div className="buttons are-small">
                <button className="button is-rounded" onClick={() => layoutChanged(Orientation.TOP_TO_BOTTOM)}>
                    Layout Top to Bottom
                </button>
                <button className="button is-rounded" onClick={() => layoutChanged(Orientation.BOTTOM_TO_TOP)}>
                    Layout Bottom to Top
                </button>
                <button className="button is-rounded" onClick={() => layoutChanged(Orientation.LEFT_TO_RIGHT)}>
                    Layout Left to Right
                </button>
                <button className="button is-rounded" onClick={() => layoutChanged(Orientation.RIGHT_TO_LEFT)}>
                    Layout Right to Left
                </button>
            </div>
            <div>
            <ul>
                {namespaces}
            </ul>
            </div>
        </div>
    );
}

export default DiagramTools;

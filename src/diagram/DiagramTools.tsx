import NamespaceVisibility from '../NamespaceVisibility';
import useStore, { Orientation } from '../store';

function DiagramTools() {
    const layoutChanged = useStore((state) => state.layoutChanged);

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
            <NamespaceVisibility/>
            </div>
        </div>
    );
}

export default DiagramTools;

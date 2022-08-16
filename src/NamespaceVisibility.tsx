import useStore from './store';

function NamespaceVisibility() {
    const models = useStore(state => state.models);
    const namespaceVisibilityToggled = useStore(state => state.namespaceVisibilityToggled);
    function onSelect(key: string) {
        namespaceVisibilityToggled(key);
    }

    const namespaces = Object.keys(models).map(key => {
        return <li key={key}>
            <input checked={models[key].visible} type="checkbox" onClick={() => onSelect(key)} />
            {key}
        </li>
    });

    return (
        <div>
            <ul>
                {namespaces}
            </ul>
        </div>
    );
}

export default NamespaceVisibility;

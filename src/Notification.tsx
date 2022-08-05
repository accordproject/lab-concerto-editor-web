import useStore from './store';

export default function Notification() {
    const error = useStore((state) => state.error);
    return (
        error ?
            <div className="notification is-danger is-light">
                {error}
            </div> : <></>)
}
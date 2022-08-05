import Workspace from './Workspace';
import ConcertoText from './ConcertoText';

function CodeHost() {
  return (
    <div className="columns">
      <div className="column is-one-quarter">
        <Workspace />
      </div>
      <div className="column">
        <ConcertoText />
      </div>
    </div>
  );
}

export default CodeHost;

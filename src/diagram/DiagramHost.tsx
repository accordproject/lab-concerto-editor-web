import Diagram from './Diagram';
import DiagramTools from './DiagramTools';

function DiagramHost() {
  return (
    <div className="columns">
    <div className="column is-one-quarter">
      <DiagramTools />
    </div>
    <div className="column">
      <Diagram />
    </div>
  </div>
  );
}

export default DiagramHost;

import { useMemo } from 'react';
import ReactFlow, {
  Controls,
  MiniMap,
} from 'react-flow-renderer';

import './Diagram.css';

import useStore from '../store';
import ConceptNode from './ConceptNode';
import EnumNode from './EnumNode';

function Diagram() {
  const nodeTypes = useMemo(() => ({ concept: ConceptNode, enum: EnumNode }), []);
  const nodes = useStore((state) => state.nodes);
  const edges = useStore((state) => state.edges);
  const onNodesChange = useStore((state) => state.onNodesChange);
  const onEdgesChange = useStore((state) => state.onEdgesChange);
  const onConnect = useStore((state) => state.onConnect);
  return (
    <div className='diagram'>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
      >
        <MiniMap />
        <Controls />
      </ReactFlow>
    </div>
  );
}

export default Diagram;

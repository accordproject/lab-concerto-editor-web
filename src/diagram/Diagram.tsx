import { useEffect, useMemo } from 'react';
import ReactFlow, {
  Controls,
  MiniMap,
} from 'react-flow-renderer';

import useStore from '../store';
import ConceptNode from './ConceptNode';
import EnumNode from './EnumNode';

function Diagram() {
  const nodeTypes = useMemo(() => ({ concept: ConceptNode, enum: EnumNode }), []);
  const nodes = useStore((state) => state.nodes);
  const edges = useStore((state) => state.edges);
  const ctoLoaded = useStore((state) => state.ctoLoaded);
  const onNodesChange = useStore((state) => state.onNodesChange);
  const onEdgesChange = useStore((state) => state.onEdgesChange);
  const onConnect = useStore((state) => state.onConnect);

  useEffect( () => {
    ctoLoaded( [`namespace person

abstract concept Person identified by email {
  o String email
}
`,
`namespace employee
import person.Person

enum Department {
  o HR
  o SALES
  o ENGINEERING
}

concept Project identified {
  o String name
  o DateTime dueDate
}

concept Employee extends Person {
  o String[] firstName optional
  o Department department
  --> Project[] projects
}

`])
  }, [ctoLoaded])

  return (
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
  );
}

export default Diagram;

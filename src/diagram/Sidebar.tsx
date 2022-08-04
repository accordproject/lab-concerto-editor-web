import { DragEvent, MouseEventHandler } from 'react';

const onDragStart = (event: DragEvent, nodeType: string) => {
  event.dataTransfer.setData('application/reactflow', nodeType);
  event.dataTransfer.effectAllowed = 'move';
};

const Sidebar = ({ onSave }: { onSave: MouseEventHandler }) => {
  return (
    <aside>
      <div className='Actions'>
      </div>
      <div className='description'>Drag these nodes onto the canvas to the left.</div>
      <div
        className='react-flow__node-input'
        onDragStart={(event: DragEvent) => onDragStart(event, 'concerto.metamodel.ConceptDeclaration')}
        draggable
      >
        Concept
      </div>
      <div
        className='react-flow__node-default'
        onDragStart={(event: DragEvent) => onDragStart(event, 'concerto.metamodel.EnumDeclaration')}
        draggable
      >
        Enumeration
      </div>
    </aside>
  );
};

export default Sidebar;

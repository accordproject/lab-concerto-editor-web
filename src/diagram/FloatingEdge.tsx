import { useCallback } from 'react';
import { useStore, getBezierPath, EdgeProps, getEdgeCenter, EdgeText } from 'react-flow-renderer';
import { getEdgeParams } from '../diagramUtil';

function FloatingEdge({ id, source, target, markerEnd, style, label, data }:EdgeProps) {
  const sourceNode = useStore(useCallback((store) => store.nodeInternals.get(source), [source]));
  const targetNode = useStore(useCallback((store) => store.nodeInternals.get(target), [target]));

  if (!sourceNode || !targetNode) {
    return null;
  }

  const { sx, sy, tx, ty, sourcePos, targetPos } = getEdgeParams(sourceNode, targetNode);

  const [centerX, centerY] = getEdgeCenter({
    sourceX: sx,
    sourceY: sy,
    targetX: tx,
    targetY: ty,
    sourcePosition: sourcePos,
    targetPosition: targetPos,
  });

  const d = getBezierPath({
    sourceX: sx,
    sourceY: sy,
    sourcePosition: sourcePos,
    targetPosition: targetPos,
    targetX: tx,
    targetY: ty,
  });

  const fill = data.type === 'property' ? 'purple' : 'green';

  return (
    <g className="react-flow__connection">
      <path id={id} className="react-flow__edge-path" d={d} markerEnd={markerEnd} style={style} />
      <EdgeText
        x={centerX}
        y={centerY}
        label={label}
        labelStyle={{ fill: 'white', fontSize: 'large' }}
        labelShowBg
        labelBgStyle={{ fill }}
        labelBgPadding={[2, 4]}
        labelBgBorderRadius={2}
      />
    </g>
  );
}

export default FloatingEdge;
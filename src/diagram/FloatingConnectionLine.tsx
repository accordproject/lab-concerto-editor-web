import React from 'react';
import { ConnectionLineComponentProps, getBezierPath } from 'react-flow-renderer';
import { getEdgeParams } from '../diagramUtil';

function FloatingConnectionLine({ targetX, targetY, sourcePosition, targetPosition, sourceNode } : ConnectionLineComponentProps) {
  if (!sourceNode) {
    return null;
  }

  const targetNode = {
    id: 'connection-target',
    width: 1, height: 1, position: { x: targetX, y: targetY },
    data: null
  };

  const { sx, sy } = getEdgeParams(sourceNode, targetNode);
  const d = getBezierPath({
    sourceX: sx,
    sourceY: sy,
    sourcePosition,
    targetPosition,
    targetX,
    targetY,
  });

  return (
    <g>
      <path fill="none" stroke="#222" strokeWidth={1.5} className="animated" d={d} />
      <circle cx={targetX} cy={targetY} fill="#fff" r={3} stroke="#222" strokeWidth={1.5} />
    </g>
  );
}

export default FloatingConnectionLine;
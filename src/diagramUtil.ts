import { Node, Edge, Position, MarkerType } from 'react-flow-renderer';

import dagre from 'dagre';
import { IConceptDeclaration, IDecoratorNumber, IEnumDeclaration, IModel, IModels, IObjectProperty, IRelationshipProperty } from './metamodel/concerto.metamodel';
import { EnumOrConcept, EdgeData, ConceptNodeData, EnumNodeData, Point } from './types';
import { getLabel, isEnum, isObjectOrRelationshipProperty } from './modelUtil';
import { ModelEntry, Orientation } from './store';

export const MAX_PROPERTIES = 10;

export function getLayoutedElements(nodes: Node[], edges: Edge[], direction:Orientation) {
  const dagreGraph = new dagre.graphlib.Graph();
  dagreGraph.setDefaultEdgeLabel(() => ({}));
  const nodeWidth = 350;
  const nodeHeight = 120;
  const isHorizontal = direction === Orientation.LEFT_TO_RIGHT || Orientation.RIGHT_TO_LEFT;
  dagreGraph.setGraph({ rankdir: direction });

  nodes.forEach((node: Node) => {
    dagreGraph.setNode(node.id, { width: nodeWidth, height: nodeHeight });
  });

  edges.forEach((edge: Edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  dagre.layout(dagreGraph);

  const newNodes:Node[] = nodes.map((node) => {
    const nodeWithPosition = dagreGraph.node(node.id);
    // We are shifting the dagre node position (anchor=center center) to the top left
    // so it matches the React Flow node anchor point (top left).
    return {
      ...node,
      targetPosition: isHorizontal ? Position.Left : Position.Top,
      sourcePosition: isHorizontal ? Position.Right : Position.Bottom,
      position: {
        x: nodeWithPosition.x - nodeWidth / 2,
        y: nodeWithPosition.y - nodeHeight / 2
      }
    }
  });

  return { nodes: newNodes, edges };
};

/**
 * Converts the metamodel to a react-flow graph
 * @param model the IModel
 * @returns an object with edges and nodes
 */
export function metamodelToReactFlow(models: IModels, records:Record<string,ModelEntry>) {
  let nodes: Node[] = [];
  let edges: Edge[] = [];
  models.models.forEach((model) => {
    if(records[model.namespace].visible) {
      const modelDiagram = modelToReactFlow(model);
      nodes = nodes.concat(modelDiagram.nodes);
      edges = edges.concat(modelDiagram.edges);  
    }
  });
  return { nodes, edges };
}

export function modelToReactFlow(model: IModel) {
  const TILES = 4;
  const nodes: Node[] = [];
  const edges: Edge[] = [];

  model.declarations?.forEach((decl, index) => {
    const data = isEnum(decl) ?
      {
        id: `${model.namespace}.${decl.name}`,
        label: decl.name,
        declaration: decl as IEnumDeclaration,
        type: {
          $class: 'concerto.metamodel@1.0.0.TypeIdentifier',
          name: decl.name,
          namespace: model.namespace,
        }
      } as EnumNodeData
      : {
        id: `${model.namespace}.${decl.name}`,
        label: decl.name,
        declaration: decl as IConceptDeclaration,
        type: {
          $class: 'concerto.metamodel@1.0.0.TypeIdentifier',
          name: decl.name,
          namespace: model.namespace,
        },
      } as ConceptNodeData;

    let x = (index % TILES) * 200;
    let y = Math.floor(index / TILES) * 400;

    const diagramDecorator = decl.decorators ? decl.decorators.find(d => d.name === 'diagram') : null;
    if (diagramDecorator && diagramDecorator.arguments && diagramDecorator.arguments.length === 2) {
      const xArg = diagramDecorator.arguments[0] as IDecoratorNumber;
      const yArg = diagramDecorator.arguments[1] as IDecoratorNumber;
      x = xArg.value;
      y = yArg.value;
    }

    nodes.push({
      id: `${model.namespace}.${decl.name}`,
      type: isEnum(decl) ? 'enum' : 'concept',
      data,
      position: { x, y },
    });
  })

  model.declarations?.forEach(decl => {
    const enumOrConcept = decl as EnumOrConcept;

    // create edges for properties
    enumOrConcept.properties
      .filter(property => isObjectOrRelationshipProperty(property))
      .forEach(property => {
        const notEnumProperty = property as IObjectProperty | IRelationshipProperty;
        edges.push({
          id: `${model.namespace}.${enumOrConcept.name}#${notEnumProperty.name}`,
          type: 'floating',
          markerStart: { type: MarkerType.Arrow, color: '#f00' },
          source: `${model.namespace}.${enumOrConcept.name}`,
          target: `${notEnumProperty.type.namespace}.${notEnumProperty.type.name}`,
          label: getLabel(notEnumProperty),
          data: {
            owner: {
              name: enumOrConcept.name,
              namespace: model.namespace,
            },
            propertyName: property.name,
            type: 'property'
          } as EdgeData,
        });
      });

    // create edges for super-types
    const concept = decl as IConceptDeclaration;
    if (concept.superType) {
      edges.push({
        id: `${model.namespace}.${concept.name}`,
        type: 'floating',
        markerStart: { type: MarkerType.Arrow, color: '#f00' },
        source: `${model.namespace}.${concept.name}`,
        label: `is a ${concept.superType.name}`,
        labelBgPadding: [8, 4],
        labelBgBorderRadius: 4,
        labelBgStyle: { fill: '#FFCC00', color: '#fff', fillOpacity: 0.7, fontSize: 'large' },
        target: `${concept.superType.namespace}.${concept.superType.name}`,
        data: {
          owner: {
            name: concept.name,
            namespace: model.namespace,
          },
          super: concept.superType,
          type: 'superType'
        } as EdgeData,
      });
    }
  });
  return {
    nodes,
    edges
  };
}

// this helper function returns the intersection point
// of the line between the center of the intersectionNode and the target node
function getNodeIntersection(intersectionNode:Node, targetNode:Node) {
  // https://math.stackexchange.com/questions/1724792/an-algorithm-for-finding-the-intersection-point-between-a-center-of-vision-and-a
  const {
    width: intersectionNodeWidth,
    height: intersectionNodeHeight,
    position: intersectionNodePosition,
  } = intersectionNode;
  const targetPosition = targetNode.position;

  const w = intersectionNodeWidth ? intersectionNodeWidth/ 2 : 0;
  const h = intersectionNodeHeight ? intersectionNodeHeight / 2 : 0;

  const x2 = intersectionNodePosition.x + w;
  const y2 = intersectionNodePosition.y + h;
  const x1 = targetPosition.x + w;
  const y1 = targetPosition.y + h;

  const xx1 = (x1 - x2) / (2 * w) - (y1 - y2) / (2 * h);
  const yy1 = (x1 - x2) / (2 * w) + (y1 - y2) / (2 * h);
  const a = 1 / (Math.abs(xx1) + Math.abs(yy1));
  const xx3 = a * xx1;
  const yy3 = a * yy1;
  const x = w * (xx3 + yy3) + x2;
  const y = h * (-xx3 + yy3) + y2;

  return { x, y };
}

// returns the position (top,right,bottom or right) passed node compared to the intersection point
function getEdgePosition(node:Node, intersectionPoint:Point) {
  const n = { ...node.position, ...node };
  const nx = Math.round(n.x);
  const ny = Math.round(n.y);
  const px = Math.round(intersectionPoint.x);
  const py = Math.round(intersectionPoint.y);

  if (px <= nx + 1) {
    return Position.Left;
  }
  if (px >= nx + (n.width ? (n.width - 1) : 0)) {
    return Position.Right;
  }
  if (py <= ny + 1) {
    return Position.Top;
  }
  if (py >= n.y + (n.height ? n.height - 1 : 0)) {
    return Position.Bottom;
  }

  return Position.Top;
}

// returns the parameters (sx, sy, tx, ty, sourcePos, targetPos) you need to create an edge
export function getEdgeParams(source:Node, target:Node) {
  const sourceIntersectionPoint = getNodeIntersection(source, target);
  const targetIntersectionPoint = getNodeIntersection(target, source);

  const sourcePos = getEdgePosition(source, sourceIntersectionPoint);
  const targetPos = getEdgePosition(target, targetIntersectionPoint);

  return {
    sx: sourceIntersectionPoint.x,
    sy: sourceIntersectionPoint.y,
    tx: targetIntersectionPoint.x,
    ty: targetIntersectionPoint.y,
    sourcePos,
    targetPos,
  };
}

export function createNodesAndEdges() {
  const nodes = [];
  const edges = [];
  const center = { x: window.innerWidth / 2, y: window.innerHeight / 2 };

  nodes.push({ id: 'target', data: { label: 'Target' }, position: center });

  for (let i = 0; i < 8; i++) {
    const degrees = i * (360 / 8);
    const radians = degrees * (Math.PI / 180);
    const x = 250 * Math.cos(radians) + center.x;
    const y = 250 * Math.sin(radians) + center.y;

    nodes.push({ id: `${i}`, data: { label: 'Source' }, position: { x, y } });

    edges.push({
      id: `edge-${i}`,
      target: 'target',
      source: `${i}`,
      type: 'floating',
      markerEnd: {
        type: MarkerType.Arrow,
      },
    });
  }

  return { nodes, edges };
}
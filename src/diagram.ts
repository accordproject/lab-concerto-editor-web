import { Node, Edge, MarkerType } from 'react-flow-renderer';
import { IConceptDeclaration, IDecoratorNumber, IEnumDeclaration, IModel, IModels, IObjectProperty, IRelationshipProperty } from './metamodel/concerto.metamodel';
import { EnumOrConcept, EdgeData, ConceptNodeData, EnumNodeData } from './types';
import { getLabel, isEnum, isObjectOrRelationshipProperty } from './modelUtil';

/**
 * Converts the metamodel to a react-flow graph
 * @param model the IModel
 * @returns an object with edges and nodes
 */
export function metamodelToReactFlow(models: IModels) {
  let nodes: Node[] = [];
  let edges: Edge[] = [];
  models.models.forEach((model) => {
    // const data: NodeData = {
    //   label: model.namespace,
    //   type: {
    //     $class: 'concerto.metamodel.IModel',
    //     name: model.namespace,
    //     namespace: model.namespace,
    //   },
    // } as NodeData;
    // nodes.push({
    //   id: model.namespace,
    //   type: 'group',
    //   data,
    //   style: {
    //     width: 170,
    //     height: 140,
    //   },
    //   position: { x: 0, y: 0 },
    // });
    const modelDiagram = modelToReactFlow(model);
    nodes = nodes.concat(modelDiagram.nodes);
    edges = edges.concat(modelDiagram.edges);
  });
  console.log(nodes);
  console.log(edges);
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
    if (diagramDecorator && diagramDecorator.arguments && diagramDecorator.arguments.length === 4) {
      const xArg = diagramDecorator.arguments[1] as IDecoratorNumber;
      const yArg = diagramDecorator.arguments[3] as IDecoratorNumber;
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
        console.log('property', notEnumProperty);
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
          } as EdgeData,
        });
      });

    // create edges for super-types
    const concept = decl as IConceptDeclaration;
    if (concept.superType) {
      console.log('concept', concept);
      edges.push({
        id: `${model.namespace}.${concept.name}`,
        type: 'floating',
        markerStart: { type: MarkerType.Arrow, color: '#f00' },
        source: `${model.namespace}.${concept.name}`,
        label: 'is a',
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
        } as EdgeData,
      });
    }
  });
  return {
    nodes,
    edges
  };
}

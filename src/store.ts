import create from 'zustand'
import produce from 'immer';
import { ModelFile, ModelManager, ModelUtil } from '@accordproject/concerto-core';
import { Printer, Parser } from '@accordproject/concerto-cto';
import { IModels } from './metamodel/concerto.metamodel';

import {
    Node,
    Edge,
    OnNodesChange,
    OnEdgesChange,
    OnConnect,
    NodeChange,
    EdgeChange,
    Connection,
    applyNodeChanges,
    applyEdgeChanges,
    addEdge,
    XYPosition,
} from 'react-flow-renderer';

import {
    IConceptDeclaration,
    IEnumDeclaration,
    IEnumProperty,
    IModel,
    IProperty,
    ITypeIdentifier,
} from './metamodel/concerto.metamodel';
import { getLayoutedElements, metamodelToReactFlow } from './diagramUtil';
import { getErrorMessage } from './util';

export type UpdateConcept = {
    declaration: IConceptDeclaration;
    id: string;
    super?: ITypeIdentifier;
};

export type PropertyReference = {
    declaration: IConceptDeclaration;
    property: IProperty;
};
export type UpdatePropertyReference = {
    declaration: IConceptDeclaration;
    property: IProperty;
    id: string;
};
export type DeletePropertyReference = {
    declaration: IConceptDeclaration;
    id: string;
};

export type EnumPropertyReference = {
    declaration: IEnumDeclaration;
    property: IEnumProperty;
};
export type UpdateEnumPropertyReference = {
    declaration: IEnumDeclaration;
    property: IEnumProperty;
    id: string;
};
export type DeleteEnumPropertyReference = {
    declaration: IEnumDeclaration;
    id: string;
};

export enum Orientation {
    LEFT_TO_RIGHT = 'LR',
    RIGHT_TO_LEFT = 'RL',
    TOP_TO_BOTTOM = 'TB',
    BOTTOM_TO_TOP = 'BT'
}

export type ViewType = 'Code' | 'Diagram';

export type ModelEntry = {
    text: string
    model: IModel
}

interface EditorState {
    nodes: Node[]
    edges: Edge[]
    models: Record<string, ModelEntry>
    layout: Orientation
    editorNamespace: string | undefined
    view: ViewType
    error: string | undefined
    onNodesChange: OnNodesChange
    onEdgesChange: OnEdgesChange
    onConnect: OnConnect
    namespaceChanged: (model: IModel, namespace: string) => void
    namespaceRemoved: (namespace: string) => void
    ctoTextLoaded: (ctoTexts: string[]) => void
    modelsLoaded: (models: IModels) => void
    ctoModified: (ctoText: string) => void
    setNodes: (nodes: Node[]) => void
    setEdges: (edges: Edge[]) => void
    clearModels: () => void
    layoutChanged: (name: Orientation) => void
    editorNamespaceChanged: (namespace: string) => void
    viewChanged: (view: ViewType) => void
    errorChanged: (error: string | undefined) => void
    modelsModified: () => void
    positionChanged: (fullyQualifiedName: string, position: XYPosition) => void
}

// export const setVersion = createAction<string>('setVersion');
// export const addImport = createAction<IImport>('addImport');
// export const removeImport = createAction<IImport>('removeImport');

// // concepts
// export const createConcept = createAction<IConceptDeclaration>('createConcept');
// export const updateConcept = createAction<UpdateConcept>('updateConcept');
// export const deleteConcept = createAction<ITypeIdentifier>('deleteConcept');

// // concept properties
// export const addProperty = createAction<PropertyReference>('addProperty');
// export const updateProperty = createAction<UpdatePropertyReference>('updateProperty');
// export const deleteProperty = createAction<DeletePropertyReference>('deleteProperty');

// // enumerations
// export type UpdateEnumeration = {
//   declaration: IEnumDeclaration;
//   id: string;
// };
// export const createEnumeration = createAction<IEnumDeclaration>('createEnumeration');
// export const updateEnumeration = createAction<UpdateEnumeration>('updateEnumeration');
// export const deleteEnumeration = createAction<ITypeIdentifier>('deleteEnumeration');

// // enum properties
// export const addEnumProperty = createAction<EnumPropertyReference>('addEnumProperty');
// export const updateEnumProperty = createAction<UpdateEnumPropertyReference>('updateEnumProperty');
// export const deleteEnumProperty = createAction<DeleteEnumPropertyReference>('deleteEnumProperty');


const useEditorStore = create<EditorState>()((set, get) => ({
    nodes: [],
    edges: [],
    models: {},
    layout: Orientation.LEFT_TO_RIGHT,
    editorNamespace: undefined,
    view: 'Code',
    error: undefined,
    onNodesChange: (changes: NodeChange[]) => {
        set({
            nodes: applyNodeChanges(changes, get().nodes),
        });

        changes.filter(c => c.type === 'position' && c.dragging === false).forEach(change => {
            const nodes = get().nodes.filter(n => n.id === (change as any).id)
            if (nodes.length > 0) {
                get().positionChanged(nodes[0].id, nodes[0].position)
            }
        })
    },
    onEdgesChange: (changes: EdgeChange[]) => {
        set({
            edges: applyEdgeChanges(changes, get().edges),
        });
    },
    onConnect: (connection: Connection) => {
        set({
            edges: addEdge(connection, get().edges),
        });
    },
    namespaceChanged: (model, namespace) => {
        set(produce((state: EditorState) => {
            state.models[model.namespace].model.namespace = namespace
        }))
    },
    namespaceRemoved: (namespace) => {
        set(produce((state: EditorState) => {
            const newModels: Record<string, ModelEntry> = {};
            Object.keys(state.models).forEach(key => {
                if (key !== namespace) {
                    newModels[key] = state.models[key]
                }
            })
            state.models = newModels;
        }))
        get().modelsModified();
    },
    ctoTextLoaded: async (ctoTexts: string[]) => {
        get().clearModels();
        const mm = new ModelManager();
        try {
            ctoTexts.forEach( ctoText => {
                // we do this convoluted thing so that we can use skipLocationNodes
                const modelAst = Parser.parse(ctoText, undefined, { skipLocationNodes: true }) as IModel;
                const model = new ModelFile(mm, modelAst);
                mm.addModelFile(model, undefined, undefined, true);
            })
            await mm.updateExternalModels();
            const ast: IModels = mm.getAst(true);
            get().modelsLoaded(ast);
            get().editorNamespaceChanged(ast.models[0].namespace);
            get().errorChanged(undefined);
        }
        catch (err) {
            get().errorChanged(getErrorMessage(err));
        }
    },
    ctoModified: (ctoText: string) => {
        const model = Parser.parse(ctoText, undefined, { skipLocationNodes: true }) as IModel;
        set(produce((state: EditorState) => {
            state.models[model.namespace] = {
                text: ctoText,
                model: model
            }
        }))
        get().modelsModified();
    },
    modelsModified: () => {
        try {
            set(produce((state: EditorState) => {
                state.error = undefined;
                const unresolvedAst = {
                    $class: 'concerto.metamodel@1.0.0.IModels',
                    models: Object.values(state.models).map(modelEntry => modelEntry.model)
                } as IModels;
                const mm = new ModelManager();
                mm.fromAst(unresolvedAst);
                const resolvedAst = mm.getAst(true);
                const { nodes, edges } = metamodelToReactFlow(resolvedAst);
                state.nodes = nodes;
                state.edges = edges;
            }))
        }
        catch (err) {
            set(produce((state: EditorState) => {
                state.error = getErrorMessage(err)
            }))
        }
    },
    clearModels: () => {
        set(produce((state: EditorState) => {
            state.models = {};
            state.nodes = [];
            state.edges = [];
        }))
    },
    modelsLoaded: (models: IModels) => {
        get().clearModels();
        models.models.forEach(m => {
            set(produce((state: EditorState) => {
                const ctoText = Printer.toCTO(m);
                state.models[m.namespace] = {
                    text: ctoText,
                    model: m
                }
            }))
        })
        get().modelsModified();
    },
    setNodes: (nodes: Node[]) => {
        set(produce((state: EditorState) => {
            state.nodes = nodes;
        }))
    },
    setEdges: (edges: Edge[]) => {
        set(produce((state: EditorState) => {
            state.edges = edges;
        }))
    },
    layoutChanged: (layout: Orientation) => {
        set(produce((state: EditorState) => {
            const { nodes, edges } = getLayoutedElements(state.nodes, state.edges, state.layout);
            state.layout = layout;
            state.nodes = nodes;
            state.edges = edges;
        }))
    },
    editorNamespaceChanged: (namespace: string) => {
        set(produce((state: EditorState) => {
            state.editorNamespace = namespace;
        }))
    },
    viewChanged: (view: ViewType) => {
        set(produce((state: EditorState) => {
            state.view = view;
        }))
    },
    errorChanged: (error: string | undefined) => {
        set(produce((state: EditorState) => {
            state.error = error;
        }))
    },
    positionChanged: (fullyQualifiedName: string, position: XYPosition) => {
        set(produce((state: EditorState) => {
            const ns = ModelUtil.getNamespace(fullyQualifiedName);
            const name = ModelUtil.getShortName(fullyQualifiedName);
            const model = state.models[ns];
            if (model) {
                const decl = model.model.declarations?.find(d => d.name === name);
                if (decl) {
                    let diagramDecorator = decl.decorators?.find(d => d.name === 'diagram');
                    let exists = true;
                    if (!diagramDecorator) {
                        exists = false;
                        diagramDecorator = {
                            $class: 'concerto.metamodel.Decorator',
                            name: 'diagram',
                            arguments: [],
                        }
                    }
                    const positionDecoratorArguments = [
                        {
                            $class: 'concerto.metamodel.DecoratorString',
                            value: 'x',
                        },
                        {
                            $class: 'concerto.metamodel.DecoratorNumber',
                            value: Math.trunc(position.x),
                        },
                        {
                            $class: 'concerto.metamodel.DecoratorString',
                            value: 'y',
                        },
                        {
                            $class: 'concerto.metamodel.DecoratorNumber',
                            value: Math.trunc(position.y),
                        },
                    ];
                    diagramDecorator.arguments = positionDecoratorArguments;

                    if (!exists) {
                        decl.decorators ? decl.decorators.push(diagramDecorator) : decl.decorators = [diagramDecorator];
                    }
                    const ctoText = Printer.toCTO(model.model);
                    state.models[model.model.namespace].text = ctoText;
                    state.models[model.model.namespace].model = model.model;
                }
            }    
        }))
    }
}))

export default useEditorStore;
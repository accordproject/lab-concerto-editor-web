import create from 'zustand'
import produce from 'immer';
import { ModelManager } from '@accordproject/concerto-core';
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
} from 'react-flow-renderer';

import {
    IConceptDeclaration,
    IEnumDeclaration,
    IEnumProperty,
    IModel,
    IProperty,
    ITypeIdentifier,
} from './metamodel/concerto.metamodel';
import { getLayoutedElements, metamodelToReactFlow } from './diagram';
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

export type LayoutType = 'LR' | 'TB';
export type ViewType = 'Code' | 'Diagram';

interface EditorState {
    nodes: Node[]
    edges: Edge[]
    modelText: Record<string, string>
    models: Record<string, IModel>
    layout: LayoutType
    editorNamespace: string|undefined
    view: ViewType
    error: string|undefined
    onNodesChange: OnNodesChange
    onEdgesChange: OnEdgesChange
    onConnect: OnConnect
    namespaceChanged: (model: IModel, namespace: string) => void
    ctoTextLoaded: (ctoText: string) => void
    modelsLoaded: (models: IModels) => void
    ctoModified: (ctoText:string) => void
    setNodes: (nodes:Node[]) => void
    setEdges: (edges:Edge[]) => void
    clearModels: () => void
    layoutChanged: (name:LayoutType) => void
    editorNamespaceChanged: (namespace:string) => void
    viewChanged: (view:ViewType) => void
    errorChanged: (error:string|undefined) => void
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
    modelText: {},
    layout: 'LR',
    editorNamespace: undefined,
    view: 'Code',
    error: undefined,
    onNodesChange: (changes: NodeChange[]) => {
        set({
            nodes: applyNodeChanges(changes, get().nodes),
        });
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
            state.models[model.namespace].namespace = namespace
        }))
    },
    ctoTextLoaded: async (ctoText:string) => {
        get().clearModels();
        const mm = new ModelManager();
        try {
            const model = mm.addCTOModel(ctoText, undefined, true );
            await mm.updateExternalModels();    
            const ast:IModels = mm.getAst(true);
            get().modelsLoaded(ast);
            get().editorNamespaceChanged(model.namespace);
            get().errorChanged(undefined);
        }
        catch(err) {
            get().errorChanged(getErrorMessage(err));
        }
    },
    ctoModified: (ctoText:string) => {
        try {
            const model = Parser.parse(ctoText, undefined, {skipLocationNodes: true}) as IModel;
            set(produce((state: EditorState) => {
                state.modelText[model.namespace] = ctoText;
                state.models[model.namespace] = model;
                state.error = undefined;
                const unresolvedAst = {
                    $class: 'concerto.metamodel@1.0.0.IModels',
                    models: Object.values(state.models)
                } as IModels;
                const mm = new ModelManager();
                mm.fromAst(unresolvedAst);
                const resolvedAst = mm.getAst(true);
                const {nodes, edges} = metamodelToReactFlow(resolvedAst);
                state.nodes = nodes;
                state.edges = edges;    
            }))
        }
        catch(err) {
            set(produce((state: EditorState) => {
                state.error = getErrorMessage(err)
            }))
        }
    },
    clearModels: () => {
        set(produce((state: EditorState) => {
            state.modelText = {};
            state.models = {};
            state.nodes = [];
            state.edges = [];
        }))
    },
    modelsLoaded: (models:IModels) => {
        get().clearModels();
        const newModels:Record<string, IModel> = {};
        models.models.forEach( m => {
            newModels[m.namespace] = m;
            set(produce((state: EditorState) => {
                const ctoText = Printer.toCTO(m);
                state.modelText[m.namespace] = ctoText;
                const {nodes, edges} = metamodelToReactFlow(models);
                state.nodes = nodes;
                state.edges = edges;
            }))    
        })
    },
    setNodes: (nodes:Node[]) => {
        set(produce((state: EditorState) => {
            state.nodes = nodes;
        })) 
    },
    setEdges: (edges:Edge[]) => {
        set(produce((state: EditorState) => {
            state.edges = edges;
        })) 
    },
    layoutChanged: (layout:LayoutType) => {
        set(produce((state: EditorState) => {
            const {nodes, edges } = getLayoutedElements(state.nodes, state.edges);
            state.layout = layout;
            state.nodes = nodes;
            state.edges = edges;
        }))
    },
    editorNamespaceChanged: (namespace:string) => {
        set(produce((state: EditorState) => {
            state.editorNamespace = namespace;
        })) 
    },
    viewChanged: (view:ViewType) => {
        set(produce((state: EditorState) => {
            state.view = view;
        })) 
    },
    errorChanged: (error:string|undefined) => {
        set(produce((state: EditorState) => {
            state.error = error;
        })) 
    }
}))

export default useEditorStore;
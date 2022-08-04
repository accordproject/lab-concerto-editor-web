import create from 'zustand'
import produce from 'immer';
import { ModelManager } from '@accordproject/concerto-core';
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
import { metamodelToReactFlow } from './diagram';

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

interface EditorState {
    nodes: Node[]
    edges: Edge[]
    onNodesChange: OnNodesChange;
    onEdgesChange: OnEdgesChange;
    onConnect: OnConnect;
    models: Record<string, IModel>
    namespaceChanged: (model: IModel, namespace: string) => void
    ctoLoaded: (ctoTexts: string[]) => void
    modelsLoaded: (models: IModels) => void
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
    ctoLoaded: (ctoTexts:string[]) => {
        const mm = new ModelManager();
        ctoTexts.forEach( cto => {
            mm.addCTOModel(cto);
        })
        const ast:IModels = mm.getAst(true);
        get().modelsLoaded(ast);
    },
    modelsLoaded: (models:IModels) => {
        const newModels:Record<string, IModel> = {};
        models.models.forEach( m => {
            newModels[m.namespace] = m;
        })
        const {nodes, edges} = metamodelToReactFlow(models);
        set(produce((state: EditorState) => {
            state.models = newModels;
            state.nodes = nodes;
            state.edges = edges;
        }))
    }
}))

export default useEditorStore;
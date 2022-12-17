import create from 'zustand'
import produce from 'immer';
import { saveAs } from 'file-saver';
import { ClassDeclaration, ModelFile, ModelManager, ModelUtil, Property } from '@accordproject/concerto-core';
import { Printer, Parser } from '@accordproject/concerto-cto';
import { IDeclaration, IImport, IModels } from './metamodel/concerto.metamodel';
import assert from 'assert';
import { getClass } from './modelUtil';

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
} from './metamodel/concerto.metamodel';
import { getLayoutedElements, metamodelToReactFlow } from './diagramUtil';
import { getClassFromType, getErrorMessage } from './util';
import JSZip from 'jszip';
import { isEnum } from './modelUtil';
import { stat } from 'fs';
import { IConcept } from './metamodel/concerto';

const SAMPLE_MODEL_1 = `namespace org.acme@1.0.0

import {Project} from org.acme.project@2.0.0

@diagram(180,29)
abstract concept Person identified by email {
  o String email
  o String firstName
  o String lastName
  o Integer age
}

@diagram(152,249)
enum Department {
  o HR
  o SALES
  o ENGINEERING
}

@diagram(661,139)
concept Employee extends Person {
  o Department department
  --> Project[] projects
}`;

const SAMPLE_MODEL_2 = `
namespace org.acme.project@2.0.0

@diagram(725,429)
enum Priority {
  o HIGH
  o MEDIUM
  o LOW
}

@diagram(1255,47)
concept Project identified {
  o String name
  o DateTime dueDate
  o Priority priority optional
}`

const STORAGE_KEY = "concerto-playground-models";

export enum Orientation {
    LEFT_TO_RIGHT = 'LR',
    RIGHT_TO_LEFT = 'RL',
    TOP_TO_BOTTOM = 'TB',
    BOTTOM_TO_TOP = 'BT'
}

export type ViewType = 'Code' | 'Diagram' | 'Form';

export type ModelEntry = {
    text: string
    model: IModel
    visible: boolean
}

interface EditorState {
    nodes: Node[]
    edges: Edge[]
    models: Record<string, ModelEntry>
    layout: Orientation
    editorNamespace: IModel | undefined
    editorConcept: IConceptDeclaration | IEnumDeclaration | undefined
    editorProperty: IEnumProperty | IProperty | undefined
    view: ViewType
    error: string | undefined
    onNodesChange: OnNodesChange
    onEdgesChange: OnEdgesChange
    onConnect: OnConnect
    namespaceVisibilityToggled: (namespace: string) => void
    ctoTextLoaded: (ctoTexts: string[]) => void
    modelsLoaded: (models: IModels) => void
    ctoModified: (ctoText: string) => void
    setNodes: (nodes: Node[]) => void
    setEdges: (edges: Edge[]) => void
    clearModels: () => void
    layoutChanged: (name: Orientation) => void
    editorNamespaceChanged: (model: IModel) => void
    editorItemSelected: (fqn: string) => void
    viewChanged: (view: ViewType) => void
    errorChanged: (error: string | undefined) => void
    modelsModified: () => void
    positionChanged: (fullyQualifiedName: string, position: XYPosition) => void
    saveRequested: () => void
    downloadRequested: () => void
    init: () => void
    loadSampleRequested: () => void

    // namespaces actions
    namespaceRemoved: (namespace: string) => void
    namespaceNameUpdated: (model: IModel, namespace: string) => void

    // generic concept / enum actions
    declarationUpdated: (namespace: string, id: string, decl: IConceptDeclaration | IEnumDeclaration) => void
    addDeclarationFromData: (data: any) => void

    // concept actions
    conceptPropertyAdded: (namespace: string, conceptName: string) => void
    conceptPropertyUpdated: (namespace: string, conceptName: string, propertyName: string, property: IProperty) => void

    // enum actions
    enumPropertyUpdated: (namespace: string, enumName: string, propertyName: string, property: IEnumProperty) => void

    // selectors
    selectClassDeclaration: (conceptFqn: string) => ClassDeclaration
    selectDeclarationFullyQualfiedNames: (filterFunc?: (value: IDeclaration) => boolean) => (string | undefined)[]
    selectPropertyNames: (conceptFqn: string, filterFunc?: (value: Property) => boolean) => string[]
    selectModelManager: () => ModelManager;
}

const useEditorStore = create<EditorState>()((set, get) => ({
    nodes: [],
    edges: [],
    models: {},
    layout: Orientation.LEFT_TO_RIGHT,
    editorNamespace: undefined,
    editorConcept: undefined,
    editorProperty: undefined,
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
    namespaceNameUpdated: (oldModel, newNamespace) => {
        set(produce((state: EditorState) => {
            if(oldModel.namespace===newNamespace){
                return;
            }
            
            if( newNamespace in state.models && oldModel.namespace!==newNamespace ){
                throw new Error(`Namespace with name ${newNamespace} already exists`);
            }

            state.models[newNamespace] = {
                ...state.models[oldModel.namespace]
            } as ModelEntry;

            state.models[newNamespace].model.namespace = newNamespace
            state.models[newNamespace].text = Printer.toCTO(state.models[newNamespace].model);

            delete state.models[oldModel.namespace]
            
            Object.keys(state.models).filter((key) => key!==newNamespace).forEach((key) => {
                let dirty = false
                state.models[key].model?.imports?.forEach((imp : IImport)=>{
                    if(imp.namespace===oldModel.namespace){
                        imp.namespace=newNamespace
                        dirty = true
                    }
                })
                if(dirty)
                    state.models[key].text = Printer.toCTO(state.models[key].model);
                dirty = false;
            })

        }))
        
        get().modelsModified();

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
            ctoTexts.forEach(ctoText => {
                // we do this convoluted thing so that we can use skipLocationNodes
                const modelAst = Parser.parse(ctoText, undefined, { skipLocationNodes: true }) as IModel;
                const model = new ModelFile(mm, modelAst);
                mm.addModelFile(model, undefined, undefined, true);
            })
            await mm.updateExternalModels();
            const ast: IModels = mm.getAst(true);
            get().modelsLoaded(ast);
            get().editorNamespaceChanged(ast.models[0]);
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
                model: model,
                visible: true
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
                const { nodes, edges } = metamodelToReactFlow(resolvedAst, state.models);
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
                    model: m,
                    visible: true
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
    editorNamespaceChanged: (model: IModel) => {
        set(produce((state: EditorState) => {
            state.editorNamespace = model;
        }))
    },
    editorItemSelected: (fqn: string) => {
        set(produce((state: EditorState) => {
            if (fqn) {
                const parts = fqn.split('#');
                if (parts.length >= 0) {
                    state.editorNamespace = state.models[parts[0]].model;
                }
                if (parts.length === 2) {
                    const subParts = parts[1].split('.');
                    state.editorConcept = state.editorNamespace?.declarations?.find(decl => decl.name === subParts[0]) as IConceptDeclaration | IEnumDeclaration | undefined;
                    if (subParts.length === 2) {
                        state.editorProperty = state.editorConcept?.properties?.find(prop => prop.name === subParts[1]);
                    }
                    else {
                        state.editorProperty = undefined;
                    }
                }
                else {
                    state.editorConcept = undefined;
                    state.editorProperty = undefined;
                }
            }
        }))
    },
    viewChanged: (view: ViewType) => {
        set(produce((state: EditorState) => {
            state.view = view;
            state.editorConcept = undefined;
            state.editorNamespace = undefined;
            state.editorProperty = undefined;
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
            assert.ok(model, `Failed to find model with name ${ns}`);
            const decl = model.model.declarations?.find(d => d.name === name);
            assert.ok(decl, `Failed to find declaration with name ${name}`);
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
                    $class: 'concerto.metamodel.DecoratorNumber',
                    value: Math.trunc(position.x),
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
        }))
    },
    init: () => {
        const value = localStorage.getItem(STORAGE_KEY);
        if (value) {
            set(produce((state: EditorState) => {
                try {
                    state.models = JSON.parse(value);
                }
                catch (err) {
                    console.log(err);
                }
            }))
            get().modelsModified();
        }
        else {
            get().loadSampleRequested()
        }
    },
    loadSampleRequested: () => {
        get().ctoTextLoaded([SAMPLE_MODEL_1, SAMPLE_MODEL_2])
    },
    saveRequested: () => {
        const value = JSON.stringify(get().models);
        localStorage.setItem(STORAGE_KEY, value);
    },
    downloadRequested: () => {
        const zip = new JSZip();
        const models = get().models;
        Object.keys(models).forEach(key => {
            zip.file(`${key}.cto`, models[key].text);
        })
        zip.generateAsync({ type: "blob" })
            .then(function (blob) {
                saveAs(blob, "models.zip");
            });
    },
    namespaceVisibilityToggled: (namespace: string) => {
        set(produce((state: EditorState) => {
            state.models[namespace].visible = !state.models[namespace].visible;
        }))
        get().modelsModified();
    },
    conceptPropertyAdded: (namespace: string, conceptName: string) => {
        set(produce((state: EditorState) => {
            const modelEntry = state.models[namespace];
            assert.ok(modelEntry, `Failed to find model with name ${namespace}`);
            const decl = modelEntry.model.declarations?.find(decl => decl.name === conceptName);
            assert.ok(decl, `Failed to find declaration with name ${conceptName}`);
            const conceptDecl = (decl as IConceptDeclaration);
            conceptDecl.properties = [...conceptDecl.properties, {
                name: `myString${conceptDecl.properties.length}`,
                isArray: false,
                isOptional: false,
                $class: 'concerto.metamodel@1.0.0.StringProperty'
            }];
            const ctoText = Printer.toCTO(modelEntry.model);
            state.models[modelEntry.model.namespace].text = ctoText;
        }))
        get().modelsModified();
    },
    declarationUpdated: (namespace: string, id: string, decl: IConceptDeclaration | IEnumDeclaration) => {
        set(produce((state: EditorState) => {
            const modelEntry = state.models[namespace];
            assert.ok(modelEntry, `Failed to find model with name ${namespace}`);
            const declIndex = modelEntry.model.declarations?.findIndex(decl => decl.name === id);
            assert.ok(declIndex !== undefined && declIndex >= 0, `Failed to find declaration with name ${id}`);
            modelEntry.model.declarations ? modelEntry.model.declarations[declIndex] = decl : modelEntry.model.declarations = [decl];
            const ctoText = Printer.toCTO(modelEntry.model);
            state.models[modelEntry.model.namespace].text = ctoText;
            state.editorConcept = decl;
        }))
        get().modelsModified();
    },
    conceptPropertyUpdated: (namespace: string, conceptName: string, propertyName: string, property: IProperty) => {
        set(produce((state: EditorState) => {
            const modelEntry = state.models[namespace];
            assert.ok(modelEntry, `Failed to find model with name ${namespace}`);
            const decl = modelEntry.model.declarations?.find(decl => decl.name === conceptName);
            assert.ok(decl, `Failed to find declaration with name ${conceptName}`);
            const conceptDecl = (decl as IConceptDeclaration);
            const propertyIndex = conceptDecl.properties.findIndex(prop => prop.name === propertyName);
            assert.ok(propertyIndex !== undefined && propertyIndex >= 0, `Failed to find enum property with name ${propertyName}`);
            conceptDecl.properties[propertyIndex] = property;
            const ctoText = Printer.toCTO(modelEntry.model);
            state.models[modelEntry.model.namespace].text = ctoText;
        }))
        get().modelsModified();
    },
    enumPropertyUpdated: (namespace: string, enumName: string, propertyName: string, property: IEnumProperty) => {
        set(produce((state: EditorState) => {
            const modelEntry = state.models[namespace];
            assert.ok(modelEntry, `Failed to find model with name ${namespace}`);
            const decl = modelEntry.model.declarations?.find(decl => decl.name === enumName);
            assert.ok(decl, `Failed to find declaration with name ${enumName}`);
            const enumDecl = (decl as IEnumDeclaration);
            const propertyIndex = enumDecl.properties.findIndex(prop => prop.name === propertyName);
            assert.ok(propertyIndex !== undefined && propertyIndex >= 0, `Failed to find enum property with name ${propertyName}`);
            enumDecl.properties[propertyIndex] = property;
            const ctoText = Printer.toCTO(modelEntry.model);
            state.models[modelEntry.model.namespace].text = ctoText;
        }))
        get().modelsModified();
    },
    selectDeclarationFullyQualfiedNames: (filterFunc?: (value: IDeclaration) => boolean) => {
        return Object.values(get().models).flatMap(
            modelEntry => modelEntry.model.declarations?.filter(
                d => filterFunc ? filterFunc(d) : () => true).map(
                    concept => `${modelEntry.model.namespace}.${concept.name}`));
    },
    selectClassDeclaration: (conceptFqn: string) => {
        return get().selectModelManager().getType(conceptFqn);
    },
    selectPropertyNames: (conceptFqn: string, filterFunc?: (value: Property) => boolean) => {
        const classDecl:ClassDeclaration = get().selectClassDeclaration(conceptFqn);
        return classDecl.getProperties().filter( p => filterFunc ? filterFunc(p) : () => true ).map( prop => prop.name);
    },
    selectModelManager: () => {
        const unresolvedAst = {
            $class: 'concerto.metamodel@1.0.0.IModels',
            models: Object.values(get().models).map(modelEntry => modelEntry.model)
        } as IModels;
        const mm = new ModelManager();
        mm.fromAst(unresolvedAst);
        return mm;
    },
    addDeclarationFromData(data: any){
        set(produce((state: EditorState) => {
            if(data.type==='Enum'){
                const newDeclaration = {
                    $class: getClassFromType(data.type),
                    name: data.name,
                    properties: [] as IEnumProperty[]
                } as IEnumDeclaration;
                state.editorNamespace?.declarations?.push(newDeclaration);
                state.editorConcept = newDeclaration;
                console.log(getClass(state.editorConcept));
            }
            else{
                const newDeclaration = {
                    $class: getClassFromType(data.type),
                    name: data.name,
                    properties: [] as IProperty[],
                    isAbstract: false
                } as IConceptDeclaration;
                state.editorNamespace?.declarations?.push(newDeclaration);
                state.editorConcept = newDeclaration;
                console.log(getClass(state.editorConcept));
                console.log(newDeclaration)
            }
            if(state.editorNamespace?.namespace)
                state.models[state.editorNamespace?.namespace] = {
                    model: state.editorNamespace,
                    text: Printer.toCTO(state.editorNamespace),
                    visible: true
                }
        }))
        
        get().modelsModified();
    }
}))

export default useEditorStore;
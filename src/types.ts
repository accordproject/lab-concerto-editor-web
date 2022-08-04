import {
  IEnumDeclaration,
  IConceptDeclaration,
  IProperty,
  IRelationshipProperty,
  IObjectProperty,
  IDoubleProperty,
  IBooleanProperty,
  IDateTimeProperty,
  IStringProperty,
  ILongProperty,
  ITypeIdentifier,
  IModel,
  IDeclaration,
} from './metamodel/concerto.metamodel';

export type Point = {
  x: number;
  y: number;
};

export type NodeData = {
  label: string;
  type: ITypeIdentifier;
};

export type ConceptNodeData = NodeData & {
  declaration: IConceptDeclaration
}

export type EnumNodeData = NodeData & {
  declaration: IEnumDeclaration
}

export type EdgeData = {
  label: string;
  owner: ITypeIdentifier;
  super?: ITypeIdentifier;
  propertyName?: string;
};

export type EnumOrConcept = IEnumDeclaration | IConceptDeclaration;

export interface Identified {
  id: string;
}

export interface Named {
  name: string;
}

export type PropertyType =
  | IProperty
  | IRelationshipProperty
  | IObjectProperty
  | IDoubleProperty
  | IBooleanProperty
  | IDateTimeProperty
  | IStringProperty
  | ILongProperty;

export type Notification = {
  id: number;
  subsystem: 'text' | 'model' | 'value';
  kind: number;
  message: string;
  visible?: boolean;
};

export type VersionedModel = {
  metamodel: IModel;
  version: string;
};

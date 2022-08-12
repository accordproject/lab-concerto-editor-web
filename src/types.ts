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
  ITypeIdentifier
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
  type: string;
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

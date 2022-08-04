import { IEnumDeclaration, IConceptDeclaration } from '../metamodel/concerto.metamodel';

type EnumOrConcept = IEnumDeclaration | IConceptDeclaration;

export type DiagramNodeData = {
  declaration: EnumOrConcept;
  namespace: string;
  superTypes?: string[];
};

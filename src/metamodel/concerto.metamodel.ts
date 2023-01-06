/* eslint-disable @typescript-eslint/no-empty-interface */
// Generated code for namespace: concerto.metamodel

// imports
import { IConcept } from './concerto';

// interfaces
export interface IPosition extends IConcept {
  line: number;
  column: number;
  offset: number;
}

export interface IRange extends IConcept {
  start: IPosition;
  end: IPosition;
  source?: string;
}

export interface ITypeIdentifier extends IConcept {
  name: string;
  namespace?: string;
}

export interface IDecoratorLiteral extends IConcept {
  location?: IRange;
}

export interface IDecoratorString extends IDecoratorLiteral {
  value: string;
}

export interface IDecoratorNumber extends IDecoratorLiteral {
  value: number;
}

export interface IDecoratorBoolean extends IDecoratorLiteral {
  value: boolean;
}

export interface IDecoratorTypeReference extends IDecoratorLiteral {
  type: ITypeIdentifier;
  isArray: boolean;
}

export interface IDecorator extends IConcept {
  name: string;
  arguments?: IDecoratorLiteral[];
  location?: IRange;
}

export interface IIdentified extends IConcept {}

export interface IIdentifiedBy extends IIdentified {
  name: string;
}

export interface IDeclaration extends IConcept {
  name: string;
  decorators?: IDecorator[];
  location?: IRange;
}

export interface IEnumDeclaration extends IDeclaration {
  properties: IEnumProperty[];
}

export interface IEnumProperty extends IConcept {
  name: string;
  decorators?: IDecorator[];
  location?: IRange;
}

export interface IConceptDeclaration extends IDeclaration {
  isAbstract: boolean;
  identified?: IIdentified;
  superType?: ITypeIdentifier;
  properties: IProperty[];
}

export interface IAssetDeclaration extends IConceptDeclaration {}

export interface IParticipantDeclaration extends IConceptDeclaration {}

export interface ITransactionDeclaration extends IConceptDeclaration {}

export interface IEventDeclaration extends IConceptDeclaration {}

export interface IProperty extends IConcept {
  name: string;
  isArray: boolean;
  isOptional: boolean;
  decorators?: IDecorator[];
  location?: IRange;
  defaultValue?: boolean | string | number;
  validator?: IIntegerDomainValidator | IDoubleDomainValidator | ILongDomainValidator;
}

export interface IRelationshipProperty extends IProperty {
  type: ITypeIdentifier;
}

export interface IObjectProperty extends IProperty {
  defaultValue?: string;
  type: ITypeIdentifier;
}

export interface IBooleanProperty extends IProperty {
  defaultValue?: boolean;
}

export interface IDateTimeProperty extends IProperty {}

export interface IStringProperty extends IProperty {
  defaultValue?: string;
  validator?: IStringRegexValidator;
}

export interface IStringRegexValidator extends IConcept {
  pattern: string;
  flags: string;
}

export interface IDoubleProperty extends IProperty {
  defaultValue?: number;
  validator?: IDoubleDomainValidator;
}

export interface IDoubleDomainValidator extends IConcept {
  lower?: number;
  upper?: number;
}

export interface IIntegerProperty extends IProperty {
  defaultValue?: number;
  validator?: IIntegerDomainValidator;
}

export interface IIntegerDomainValidator extends IConcept {
  lower?: number;
  upper?: number;
}

export interface ILongProperty extends IProperty {
  defaultValue?: number;
  validator?: ILongDomainValidator;
}

export interface ILongDomainValidator extends IConcept {
  lower?: number;
  upper?: number;
}

export interface IImport extends IConcept {
  namespace: string;
  uri?: string;
}

export interface IImportAll extends IImport {}

export interface IImportType extends IImport {
  name: string;
}

export interface IModel extends IConcept {
  namespace: string;
  concertoVersion?: string;
  imports?: IImport[];
  declarations?: IDeclaration[];
}

export interface IModels extends IConcept {
  models: IModel[];
}
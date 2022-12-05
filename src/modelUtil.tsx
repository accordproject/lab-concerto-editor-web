import a from 'indefinite';
import { IConcept } from './metamodel/concerto';
import {
  IProperty,
  IObjectProperty,
  IEnumProperty,
  IConceptDeclaration,
  IModel,
  ITypeIdentifier,
} from './metamodel/concerto.metamodel';

type PropertyOrEnum = IEnumProperty | IProperty;

export function getType(property: PropertyOrEnum) {
  if (
    getClass(property).endsWith('ObjectProperty') ||
    getClass(property).endsWith('RelationshipProperty')
  ) {
    return (property as IObjectProperty).type;
  } else if (getClass(property).endsWith('EnumProperty')) {
    return {
      namespace: '',
      name: '',
    };
  } else {
    return {
      namespace: '',
      name: getClass(property),
    };
  }
}

export function isStringProperty(property: PropertyOrEnum){
  return property.$class.endsWith('StringProperty');
}

export function isObjectOrRelationshipProperty(property: PropertyOrEnum) {
  return (
    getClass(property).endsWith('ObjectProperty') ||
    getClass(property).endsWith('RelationshipProperty')
  );
}

export function isIdentified(model: IModel, property: PropertyOrEnum) {
  if (isObjectOrRelationshipProperty(property)) {
    const type = model.declarations
      ? model.declarations.find(d => d.name === (property as IObjectProperty).type.name)
      : null;
    const conceptDecl = type as IConceptDeclaration;
    return conceptDecl?.identified;
  }
  return false;
}

export function getFullyQualified(type: ITypeIdentifier): string {
  return type.namespace ? `${type.namespace}.${type.name}` : type.name;
}

export function getNameOfType(property: PropertyOrEnum): string {
  const type = getType(property);
  const dot = type.name.lastIndexOf('.');
  return type.name.substring(dot+1);
}

export function concatString(input: string, add: string): string {
  return input && input.length > 0 ? `${input} ${add}` : add;
}

export function getClass(obj: IConcept): string {
  return obj.$class;
}

export function isEnum(obj: IConcept) {
  return getClass(obj).endsWith('EnumDeclaration');
}

export function isString(property: IProperty) {
  return getClass(property) === 'concerto.metamodel@1.0.0.StringProperty' &&
    !property.isArray
}

export function getModifiers(property: PropertyOrEnum) {
  const optional = (property as IProperty).isOptional ? 'optional' : '';
  const array = (property as IProperty).isArray ? 'array' : '';
  const isRelationship = getClass(property).endsWith('RelationshipProperty');
  const rel = isRelationship ? 'reference' : '';
  let result = optional;
  result = concatString(result, array);
  return concatString(result, rel);
}

export function getClassDescription(obj: IConcept) {
  const lastDot = getClass(obj).lastIndexOf('.');
  return getClass(obj).substring(lastDot+1, getClass(obj).length-'Declaration'.length);
}

export function getShortName(fqn: string): string {
  const lastDot = fqn.lastIndexOf('.');
  if (lastDot >= 0) {
    return fqn.substring(lastDot + 1);
  } else {
    return fqn;
  }
}

export function isRelationship(property:IProperty) {
  return getClass(property) === 'concerto.metamodel@1.0.0.RelationshipProperty';
}

export function getLabel(property:IProperty) {
  let label = isRelationship(property) ? 'references ' : 'has ';
  
  if ((property as IProperty).isArray) {
    label += `many ${property.name}`;
  } else {
    label += a(property.name);
  }

  return label;
}

export function typeIdentifierEquals(left?: ITypeIdentifier, right?: ITypeIdentifier) {
  const leftText = left ? getFullyQualified(left) : '';
  const rightText = right ? getFullyQualified(right) : '';
  return leftText === rightText;
}
import { IConcept } from './metamodel/concerto';
import {
  IProperty,
  IObjectProperty,
  IEnumProperty,
  IConceptDeclaration,
  IModel,
  ITypeIdentifier,
} from './metamodel/concerto.metamodel';

type HttpError = {
  message?: string;
  data?: unknown;
};

type Error = {
  component: string;
  status: string;
  code: string;
  title: string;
  detail: string;
};

type CompositeError = {
  errors?: Error[];
};

function isString(value: unknown) {
  return typeof value === 'string' || value instanceof String;
}

export function errorToMessage(error: unknown): string {
  const message = (error as HttpError).message;
  const data = (error as HttpError).data;
  if (data) {
    try {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const jsonData: CompositeError = isString(data) ? JSON.parse(data as string) : data;
      if (jsonData.errors) {
        return jsonData.errors
          .map(err => {
            return `${err.detail}`;
          })
          .join();
      } else {
        return JSON.stringify(data, null, 4);
      }
    } catch (err) {
      return data as string;
    }
  } else if (message) {
    return message;
  } else {
    return `unable to handle error`;
  }
}

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

export function isComplexType(property: PropertyOrEnum) {
  return (
    getClass(property).endsWith('ObjectProperty') ||
    getClass(property).endsWith('RelationshipProperty')
  );
}

export function isIdentified(model: IModel, property: PropertyOrEnum) {
  if (isComplexType(property)) {
    const type = model.declarations
      ? model.declarations.find(d => d.name === (property as IObjectProperty).type.name)
      : null;
    const conceptDecl = type as IConceptDeclaration;
    return conceptDecl?.identified;
  }
  return false;
}

export function isStringType(property: PropertyOrEnum) {
  return getClass(property).endsWith('StringProperty');
}

export function getFullyQualifiedNameOfType(property: PropertyOrEnum): string {
  const type = getType(property);
  let result = type.namespace ? `${type.namespace}.` : '';
  if (type.name) {
    result = `${result}${type.name}`;
  }
  return result;
}

export function getFullyQualified(type: ITypeIdentifier): string {
  return type.namespace ? `${type.namespace}.${type.name}` : type.name;
}

export function getNameOfType(property: PropertyOrEnum): string {
  const type = getType(property);
  return type.name;
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

export function getNamespace(fqn: string): string {
  const lastDot = fqn.lastIndexOf('.');
  if (lastDot >= 0) {
    return fqn.substring(0, lastDot);
  } else {
    return fqn;
  }
}

export function typeIdentifierEquals(left?: ITypeIdentifier, right?: ITypeIdentifier) {
  const leftText = left ? getFullyQualified(left) : '';
  const rightText = right ? getFullyQualified(right) : '';
  return leftText === rightText;
}

export function clamp(val: number, min: number, max: number) {
  return val > max ? max : val < min ? min : val;
}

export function copyObject<T>(obj: T) {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  return JSON.parse(JSON.stringify(obj)) as T;
}

import { bool } from "yup";
import { IConcept } from "./metamodel/concerto";
import { IProperty } from "./metamodel/concerto.metamodel";

const typeToClass = {
  "Enum" : "concerto.metamodel@1.0.0.EnumDeclaration",
  "Concept" : "concerto.metamodel@1.0.0.ConceptDeclaration",
  "EnumProperty" : "concerto.metamodel@1.0.0.EnumProperty",
  "Long": "concerto.metamodel@1.0.0.LongProperty",
  "Integer": "concerto.metamodel@1.0.0.IntegerProperty",
  "String": "concerto.metamodel@1.0.0.StringProperty",
  "Double": "concerto.metamodel@1.0.0.DoubleProperty",
  "Boolean": "concerto.metamodel@1.0.0.BooleanProperty",
  "DateTime": "concerto.metamodel@1.0.0.DateTimeProperty"
} as Record<string, string>

export const PrimaryPropertyTypes = [ "Long", "String", "Integer", "Double", "DateTime", "Boolean" ]

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

export function getErrorMessage(error: unknown) {
  if (error instanceof Error) return error.message
  return String(error+"jhvcvxbc")
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

export function clamp(val: number, min: number, max: number) {
  return val > max ? max : val < min ? min : val;
}

export function copyObject<T>(obj: T) {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  return JSON.parse(JSON.stringify(obj)) as T;
}

export function getClassFromType(type: string) : string {
  return typeToClass[type];
}
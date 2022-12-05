import { bool } from "yup";
import { IProperty } from "./metamodel/concerto.metamodel";

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
  return String(error)
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

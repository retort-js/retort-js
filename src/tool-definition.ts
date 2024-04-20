import type { JSONSchema } from "json-schema-to-ts";

import { FromSchema } from "json-schema-to-ts";

// Define a type mapping TypeScript constructor functions to their respective JSON types
type JsonType<T> =
    T extends typeof String ? "string" :
    T extends typeof Number ? "number" :
    T extends typeof Boolean ? "boolean" :
    T extends typeof Object ? "object" :
    T extends typeof Array ? "array" :
    never;

// Helper type to handle the transformation from shorthand to longhand
export type ConvertToJsonSchema<T> = {
    type: "object";
    properties: {
        [K in keyof T]: T[K] extends [infer U, null]
            ? { type: JsonType<U>; nullable: true }
            : T[K] extends [infer U, undefined]
                ? { type: JsonType<U> }
                : T[K] extends typeof String | typeof Number | typeof Boolean
                    ? { type: JsonType<T[K]> }
                    : never;
    };
    required: {
        [K in keyof T]: T[K] extends [any, undefined] ? never : K
    }[keyof T][];
    additionalProperties: false;
};


type ContainsNull<T extends any[]> = T extends [infer First, ...infer Rest]
  ? (First extends null ? true : ContainsNull<Rest>)
  : false;

  // Example of usage:
type Tuple1 = [string, number, null];
type Tuple2 = [string, number, boolean];

// These will evaluate the condition based on the presence of null
type Test1 = ContainsNull<Tuple1>; // This will be true
type Test2 = ContainsNull<Tuple2>; // This will be false
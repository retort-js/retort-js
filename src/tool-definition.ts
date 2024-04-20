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

// Example of usage
type ExampleSchema = {
  foo: typeof String; // Required
  bar: [typeof Number, undefined]; // Optional, not required
  baz: [typeof Boolean, null]; // Nullable, not required
  qux: typeof Boolean; // Required
};

type ConvertedSchema = ConvertToJsonSchema<ExampleSchema>;
type ConvertedSchemaResult = FromSchema<ConvertedSchema>;
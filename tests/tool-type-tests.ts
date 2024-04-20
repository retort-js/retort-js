import { Test } from 'vitest';
import type { ConvertToJsonSchema } from '../src/tool-definition';

type AssertEqual<T, Expected> = T extends Expected ? (Expected extends T ? true : never) : never;

declare type EmptySchema = {};

function assert<TSchema>(t: ConvertToJsonSchema<TSchema>) {
  return t;
}

assert<{ foo: typeof String }>({
  type: "object",
  properties: {
    foo: { type: "string" }
  },
  required: ["foo"],
  additionalProperties: false
});

assert<{ foo: [typeof String, undefined] }>({
  type: "object",
  properties: {
    foo: { type: "string" }
  },
  required: [],
  additionalProperties: false
});

assert<{ foo: [typeof String, null] }>({
  type: "object",
  properties: {
    foo: { type: "string", nullable: true }
  },
  required: [],
  additionalProperties: false
});

assert<{ foo: typeof String, bar: typeof Number }>({
  type: "object",
  properties: {
    foo: { type: "string" },
    bar: { type: "number" }
  },
  required: ["foo", "bar"],
  additionalProperties: false
});

assert<{ foo: [typeof String, null, undefined] }>({
  type: "object",
  properties: {
    foo: { type: "string", nullable: true }
  },
  required: [],
  additionalProperties: false
});

type Y = { str: typeof String, num: typeof Number }
type X = ConvertToJsonSchema<Y>;
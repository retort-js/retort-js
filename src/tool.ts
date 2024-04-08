import { RetortExtendableFunction } from "./extendable-function";

// @ts-expect-error from name
export default class RetortTool<TParamSchema extends RetortShorthandSchema, TResult = void> extends RetortExtendableFunction {
  override name: string;
  description?: string;
  params: RetortSchema;
  function?: (params: SchemaToParams<TParamSchema>) => TResult;

  constructor({ name, description, params }: { name: string, description?: string, params?: TParamSchema, function?: (params: TParamSchema) => TResult }) {
    super();
    this.name = name;
    this.description = description;
    if (params) {
      this.params = convertJsonSchemaFromShorthand(params);
    }
    else {
      this.params = {};
    }
  }



}

type RetortShorthandSchema = Record<string, ShorthandJsonSchemaProperty>;
type RetortSchema = Record<string, JsonSchemaProperty>;


function convertJsonSchemaFromShorthand(schema: Record<string, ShorthandJsonSchemaProperty>): Record<string, JsonSchemaProperty> {
  schema = JSON.parse(JSON.stringify(schema));

  for (let key in schema) {
    let property = schema[key];

    if (typeof property === 'string') {
      if (property.endsWith('?')) {
        schema[key] = {
          type: property.slice(0, -1) as JsonSchemaTypeString,
          optional: true
        };
      }
      else {
        schema[key] = {
          type: property as JsonSchemaTypeString,
          optional: false,
        };
      }
    }

    property = schema[key];
    if (typeof property === 'object') {
      schema[key] = property;
      if ("properties" in property && property.properties) {
        property.properties = convertJsonSchemaFromShorthand(property.properties || {});
      }
      if ("items" in property && property.items) {
        property.items = convertJsonSchemaFromShorthand({ items: property.items })["items"];
      }
      property.optional = !!property.optional;
    }
  }

  return schema as Record<string, JsonSchemaProperty>;
}

type ShortHandStringProperty = "string" | "string?" | RequiredStringProperty | OptionalStringProperty;
type ShortHandNumberProperty = "number" | "integer" | "number?" | "integer?" | RequiredNumberProperty | OptionalNumberProperty;
type ShortHandBooleanProperty = "boolean" | "boolean?" | RequiredBooleanProperty | OptionalBooleanProperty;
type ShorthandArrayProperty = "array" | "array?" | RequiredShorthandArrayProperty | OptionalShorthandArrayProperty;
type ShorthandObjectProperty = "object" | "object?" | RequiredShorthandObjectProperty | OptionalShorthandObjectProperty;

interface RequiredShorthandArrayProperty {
  description?: string;
  type: 'array';
  items?: ShorthandJsonSchemaProperty; // This should be defined based on what you expect in the items.
  optional?: false;
}

interface OptionalShorthandArrayProperty {
  description?: string;
  type: 'array';
  items?: ShorthandJsonSchemaProperty; // This should be defined based on what you expect in the items.
  optional: true;
}

/**
 * Represents an object property in a JSON schema.
 */
interface RequiredShorthandObjectProperty {
  description?: string;
  type: 'object';
  properties?: Record<string, ShorthandJsonSchemaProperty>;
  optional?: false;
}

interface OptionalShorthandObjectProperty {
  description?: string;
  type: 'object';
  properties?: Record<string, ShorthandJsonSchemaProperty>;
  optional: true;
}

type ShorthandJsonSchemaProperty = ShortHandStringProperty | ShortHandNumberProperty | ShortHandBooleanProperty | ShorthandArrayProperty | ShorthandObjectProperty;


/**
 * Represents a string property in a JSON schema.
 */
interface RequiredStringProperty {
  description?: string;
  type: 'string';
  format?: 'date-time' | 'email' | 'uri';
  minLength?: number;
  maxLength?: number;
  optional?: false;
}

interface OptionalStringProperty {
  description?: string;
  type: 'string';
  format?: 'date-time' | 'email' | 'uri';
  minLength?: number;
  maxLength?: number;
  optional: true;
}

/**
 * Represents a number property in a JSON schema (includes integers).
 */
interface RequiredNumberProperty {
  description?: string;
  type: 'number' | 'integer';
  minimum?: number;
  maximum?: number;
  optional?: false;
}

interface OptionalNumberProperty {
  description?: string;
  type: 'number' | 'integer';
  minimum?: number;
  maximum?: number;
  optional: true;
}

/**
 * Represents a boolean property in a JSON schema.
 */
interface RequiredBooleanProperty {
  description?: string;
  type: 'boolean';
  optional?: false;
}

interface OptionalBooleanProperty {
  description?: string;
  type: 'boolean';
  optional: true;
}

/**
 * Represents an array property in a JSON schema.
 */
interface RequiredArrayProperty {
  description?: string;
  type: 'array';
  items?: JsonSchemaProperty; // This should be defined based on what you expect in the items.
  optional?: false;
}

interface OptionalArrayProperty {
  description?: string;
  type: 'array';
  items?: JsonSchemaProperty; // This should be defined based on what you expect in the items.
  optional: true;
}

/**
 * Represents an object property in a JSON schema.
 */
interface RequiredObjectProperty {
  description?: string;
  type: 'object';
  properties?: Record<string, JsonSchemaProperty>;
  optional?: false;
}

interface OptionalObjectProperty {
  description?: string;
  type: 'object';
  properties?: Record<string, JsonSchemaProperty>;
  optional: true;
}
type JsonSchemaTypeString = "string" | "number" | "integer" | "boolean" | "array" | "object";
type RetortTypeString = "string" | "number" | "integer" | "boolean" | "array" | "object" | "string?" | "number?" | "integer?" | "boolean?" | "array?" | "object?";

type TypeStringToSchema<T extends RetortTypeString> =
  T extends "string" ? RequiredStringProperty :
  T extends "number" ? RequiredNumberProperty :
  T extends "integer" ? RequiredNumberProperty :
  T extends "boolean" ? RequiredBooleanProperty :
  T extends "array" ? RequiredArrayProperty :
  T extends "object" ? RequiredObjectProperty :
  T extends "string?" ? OptionalStringProperty :
  T extends "number?" ? OptionalNumberProperty :
  T extends "integer?" ? OptionalNumberProperty :
  T extends "boolean?" ? OptionalBooleanProperty :
  T extends "array?" ? OptionalArrayProperty :
  T extends "object?" ? OptionalObjectProperty :
  never;

/**
 * Union type for any JSON schema property.
 */
type JsonSchemaProperty = RequiredStringProperty | RequiredNumberProperty | RequiredBooleanProperty | RequiredArrayProperty | RequiredObjectProperty | OptionalStringProperty | OptionalNumberProperty | OptionalBooleanProperty | OptionalArrayProperty | OptionalObjectProperty;

type SchemaToParams<T> =
  T extends RequiredStringProperty ? string :
  T extends OptionalStringProperty ? string | undefined :
  T extends "string" ? string :
  T extends RequiredNumberProperty ? number :
  T extends OptionalNumberProperty ? number | undefined :
  T extends "number" ? number :
  T extends RequiredBooleanProperty ? boolean :
  T extends OptionalBooleanProperty ? boolean | undefined :
  T extends "boolean" ? boolean :
  T extends RequiredArrayProperty ? SchemaToParams<T["items"]>[] :
  T extends OptionalArrayProperty ? SchemaToParams<T["items"]>[] | undefined :
  T extends "array" ? any[] :
  T extends RequiredObjectProperty ? { [K in keyof T["properties"]]: SchemaToParams<T["properties"][K]> } :
  T extends OptionalObjectProperty ? { [K in keyof T["properties"]]: SchemaToParams<T["properties"][K]> } | undefined :
  T extends "object" ? Record<string, any> :
  never;
import { RetortExtendableFunction } from "./extendable-function";

// @ts-expect-error from name
export default class RetortTool<TParamSchema extends RetortShorthandSchema, TResult> extends RetortExtendableFunction {
  override name: string;
  description?: string;
  params?: RetortSchema;
  function?: (params: SchemaToParams<TParamSchema>) => TResult;

  constructor({ name, description, params }: { name: string, description?: string, params?: TParamSchema, function?: (params: TParamSchema) => TResult}) {
    super();
    this.name = name;
    this.description = description;
    if (params) {
      this.params = convertJsonSchemaFromShorthand(params);
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
      schema[key] = {
        type: property as JsonSchemaTypeString
      };
    }
    else if (typeof property === 'object') {
      schema[key] = property;
      if ("properties" in property && property.properties) {
        property.properties = convertJsonSchemaFromShorthand(property.properties || {});
      }
      if ("items" in property && property.items) {
        property.items = convertJsonSchemaFromShorthand({ items: property.items })["items"];
      }
    }
  }

  return schema as Record<string, JsonSchemaProperty>;
}

type ShortHandStringProperty = "string" | StringProperty;
type ShortHandNumberProperty = "number" | "integer"| NumberProperty;
type ShortHandBooleanProperty = "boolean" | BooleanProperty;
interface ShorthandArrayProperty {
  description?: string;
  type: 'array';
  items?: ShorthandJsonSchemaProperty; // This should be defined based on what you expect in the items.
}

/**
 * Represents an object property in a JSON schema.
 */
interface ShorthandObjectProperty {
  description?: string;
  type: 'object';
  properties?: Record<string, ShorthandJsonSchemaProperty>;
  required?: string[];
}

type ShorthandJsonSchemaProperty = ShortHandStringProperty | ShortHandNumberProperty | ShortHandBooleanProperty | ShorthandArrayProperty | ShorthandObjectProperty;


/**
 * Represents a string property in a JSON schema.
 */
interface StringProperty {
  description?: string;
  type: 'string';
  format?: 'date-time' | 'email' | 'uri';
  minLength?: number;
  maxLength?: number;
}

/**
 * Represents a number property in a JSON schema (includes integers).
 */
interface NumberProperty {
  description?: string;
  type: 'number' | 'integer';
  minimum?: number;
  maximum?: number;
}

/**
 * Represents a boolean property in a JSON schema.
 */
interface BooleanProperty {
  description?: string;
  type: 'boolean';
}

/**
 * Represents an array property in a JSON schema.
 */
interface ArrayProperty {
  description?: string;
  type: 'array';
  items?: JsonSchemaProperty; // This should be defined based on what you expect in the items.
}

/**
 * Represents an object property in a JSON schema.
 */
interface ObjectProperty {
  description?: string;
  type: 'object';
  properties?: Record<string, JsonSchemaProperty>;
  required?: string[];
}

type JsonSchemaTypeString = "string" | "number" | "integer" | "boolean" | "array" | "object";

/**
 * Union type for any JSON schema property.
 */
type JsonSchemaProperty = StringProperty | NumberProperty | BooleanProperty | ArrayProperty | ObjectProperty;

type SchemaToParams<T> = 
  T extends StringProperty ? string :
  T extends "string" ? string :
  T extends NumberProperty ? number :
  T extends "number" ? number :
  T extends BooleanProperty ? boolean :
  T extends "boolean" ? boolean :
  T extends ArrayProperty ? SchemaToParams<T["items"]>[] :
  T extends "array" ? any[] :
  T extends ObjectProperty ? { [K in keyof T["properties"]]: SchemaToParams<T["properties"][K]> } :
  T extends "object" ? Record<string, any> :
  never;
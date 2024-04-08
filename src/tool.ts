import { RetortExtendableFunction } from "./extendable-function";

// @ts-expect-error from name
export default class RetortTool<TParamSchema extends RetortShorthandSchema, TResult = void> extends RetortExtendableFunction {
  override name: string;
  description?: string;
  parameters?: ObjectProperty;
  function?: (params: SchemaToParams<TParamSchema>) => TResult;

  constructor({ name, description, parameters: params }: { name: string, description?: string, params?: TParamSchema, parameters?: TParamSchema, function?: (params: TParamSchema) => TResult }) {
    super();
    this.name = name;
    this.description = description;
    if (params) {
      this.parameters = convertJsonSchemaFromShorthand(params);
    }
    else {
      this.parameters = undefined;
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

type ShortHandStringProperty = typeof String | StringProperty;
type ShortHandNumberProperty = typeof Number | NumberProperty;
type ShortHandBooleanProperty = typeof Boolean | BooleanProperty;
type ShorthandArrayProperty = typeof Array | RequiredShorthandArrayProperty;
type ShorthandObjectProperty = typeof Object | RequiredShorthandObjectProperty;

interface RequiredShorthandArrayProperty {
  description?: string;
  type: 'array';
  items?: ShorthandJsonSchemaProperty; // This should be defined based on what you expect in the items.
  
}


/**
 * Represents an object property in a JSON schema.
 */
interface RequiredShorthandObjectProperty {
  description?: string;
  type: 'object';
  properties?: Record<string, ShorthandJsonSchemaProperty>;
  
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
  
}


type JsonSchemaTypeString = "string" | "number" | "integer" | "boolean" | "array" | "object";
type RetortTypeString = "string" | "number" | "integer" | "boolean" | "array" | "object" | "string?" | "number?" | "integer?" | "boolean?" | "array?" | "object?";

type TypeStringToSchema<T extends RetortTypeString> =
  T extends "string" ? StringProperty :
  T extends "number" ? NumberProperty :
  T extends "integer" ? NumberProperty :
  T extends "boolean" ? BooleanProperty :
  T extends "array" ? ArrayProperty :
  T extends "object" ? ObjectProperty:
  never;

/**
 * Union type for any JSON schema property.
 */
type JsonSchemaProperty = StringProperty | NumberProperty | BooleanProperty | ArrayProperty | ObjectProperty | OptionalStringProperty | OptionalNumberProperty | OptionalBooleanProperty | OptionalArrayProperty | OptionalObjectProperty;

type SchemaToParams<T> =
  T extends StringProperty ? string :
  T extends typeof String ? string :
  T extends NumberProperty ? number :
  T extends typeof Number ? number :
  T extends BooleanProperty ? boolean :
  T extends typeof Boolean ? boolean :
  T extends ArrayProperty ? SchemaToParams<T["items"]>[] :
  T extends typeof Array ? any[] :
  T extends ObjectProperty ? { [K in keyof T["properties"]]: SchemaToParams<T["properties"][K]> } :
  T extends typeof Object ? Record<string, any> :
  never;

export function toolToJsonSchema<T extends RetortSchema>(schema: { name: string, description?: string, params: T }): any {
  return {
    name: schema.name,
    description: schema.description,
    parameters: Object.keys(schema.params).length ? {
      type: "object",
      properties: Object.fromEntries(Object.entries(schema.params).map(([key, value]) => [key, retortToJsonSchema(value)]))
    }
      : undefined
  }
}

export interface JsonSchema {
  type: string | string[];
  properties?: { [key: string]: JsonSchema };
  items?: JsonSchema;
  required?: string[];
  enum?: string[];
  description?: string;
  minLength?: number;
  maxLength?: number;
  pattern?: string;
  format?: string;
  minimum?: number;
  maximum?: number;
  exclusiveMinimum?: number;
  exclusiveMaximum?: number;
  multipleOf?: number;
  const?: any;
}

export type RetortPrimitiveSchema =
  | StringConstructor
  | NumberConstructor
  | BooleanConstructor
  | ObjectConstructor
  | ArrayConstructor;

export type RetortSchema = RetortPrimitiveSchema | RetortObjectSchema | [RetortSchema];

export interface RetortObjectSchema {
  [key: string]: {
    type: RetortSchema;
    optional?: boolean;
    enum?: string[];
    description?: string;
    nullable?: boolean;
    minLength?: number;
    maxLength?: number;
    pattern?: string;
    format?: string;
    minimum?: number;
    maximum?: number;
    exclusiveMinimum?: number;
    exclusiveMaximum?: number;
    multipleOf?: number;
    const?: any;
    value?: any;
  } | RetortSchema;
}

export function retortSchemaToJsonSchemaTypeString(type: RetortSchema): string {
  switch (type) {
    case String:
      return 'string';
    case Number:
      return 'number';
    case Boolean:
      return 'boolean';
    case Object:
      return 'object';
    // case Date:
    //   return 'string'; // JSON Schema uses "string" for dates
    // case Buffer:
    //   return 'string'; // JSON Schema uses "string" for binary data
    case Array:
      return 'array';
    default:
      if (Array.isArray(type)) {
        return 'array';
      } else if (typeof type === 'object' && type !== null) {
        return 'object';
      } else {
        throw new Error(`Unsupported type: ${type}`);
      }
  }
}

export function retortSchemaToJsonSchema(retortSchema: RetortObjectSchema): JsonSchema {
  const jsonSchema: JsonSchema = {
    type: 'object',
    properties: {},
    required: [],
  };

  for (const [key, value] of Object.entries(retortSchema)) {
    const propertySchema: JsonSchema = {} as JsonSchema;

    if (typeof value === 'object' && !Array.isArray(value) && 'type' in value) {
      const schemaTypeOpts = value as {
        enum?: string[] | undefined;
        type: RetortSchema;
        optional?: boolean;
        description?: string;
        nullable?: boolean;
        minLength?: number;
        maxLength?: number;
        pattern?: string;
        format?: string;
        minimum?: number;
        maximum?: number;
        exclusiveMinimum?: number;
        exclusiveMaximum?: number;
        multipleOf?: number;
        const?: any;
        value?: any;
      };

      propertySchema.type = retortSchemaToJsonSchemaTypeString(schemaTypeOpts.type);

      // if (schemaTypeOpts.type === Date) {
      //   propertySchema.format = 'date-time';
      // } else 
      if (propertySchema.type === 'string' && schemaTypeOpts.format) {
        propertySchema.format = schemaTypeOpts.format;
      }

      if (schemaTypeOpts.nullable) {
        propertySchema.type = [propertySchema.type, 'null'];
      }

      if (propertySchema.type === 'array' && Array.isArray(schemaTypeOpts.type)) {
        const arrayType = schemaTypeOpts.type[0];
        if (typeof arrayType === 'object' && 'type' in arrayType) {
          propertySchema.items = retortSchemaToJsonSchema({ item: arrayType }).properties?.['item'];
        } else {
          propertySchema.items = { type: retortSchemaToJsonSchemaTypeString(arrayType) };
        }
      } else if (propertySchema.type === 'object') {
        const nestedSchema = retortSchemaToJsonSchema(schemaTypeOpts.type as RetortObjectSchema);
        propertySchema.properties = nestedSchema.properties;
        if (nestedSchema.required) {
          propertySchema.required = nestedSchema.required;
        }
      }

      if (schemaTypeOpts.enum) {
        propertySchema.enum = schemaTypeOpts.enum;
      }

      if (schemaTypeOpts.const && schemaTypeOpts.value) {
        throw new Error(`Both 'const' and 'value' are specified for ${key}`);
      }
      if (schemaTypeOpts.const) {
        propertySchema.const = schemaTypeOpts.const;
      }
      if (schemaTypeOpts.value) {
        propertySchema.const = schemaTypeOpts.value;
      }

      if (schemaTypeOpts.pattern) {
        propertySchema.pattern = schemaTypeOpts.pattern;
      }

      if (schemaTypeOpts.description) {
        propertySchema.description = schemaTypeOpts.description;
      }

      if (schemaTypeOpts.minLength !== undefined) {
        propertySchema.minLength = schemaTypeOpts.minLength;
      }

      if (schemaTypeOpts.maxLength !== undefined) {
        propertySchema.maxLength = schemaTypeOpts.maxLength;
      }

      if (schemaTypeOpts.minimum !== undefined) {
        propertySchema.minimum = schemaTypeOpts.minimum;
      }

      if (schemaTypeOpts.maximum !== undefined) {
        propertySchema.maximum = schemaTypeOpts.maximum;
      }

      if (schemaTypeOpts.exclusiveMinimum !== undefined) {
        propertySchema.exclusiveMinimum = schemaTypeOpts.exclusiveMinimum;
      }

      if (schemaTypeOpts.exclusiveMaximum !== undefined) {
        propertySchema.exclusiveMaximum = schemaTypeOpts.exclusiveMaximum;
      }

      if (schemaTypeOpts.multipleOf !== undefined) {
        propertySchema.multipleOf = schemaTypeOpts.multipleOf;
      }

      jsonSchema.properties![key] = propertySchema;

      if (!schemaTypeOpts.optional) {
        jsonSchema.required!.push(key);
      }
    } else {
      propertySchema.type = retortSchemaToJsonSchemaTypeString(value as RetortSchema);

      // if (value === Date) {
      //   propertySchema.format = 'date-time';
      // }

      if (propertySchema.type === 'array' && Array.isArray(value)) {
        const arrayType = value[0];
        if (typeof arrayType === 'object' && 'type' in arrayType) {
          propertySchema.items = retortSchemaToJsonSchema({ item: arrayType }).properties?.['item'];
        } else {
          propertySchema.items = { type: retortSchemaToJsonSchemaTypeString(arrayType) };
        }
      } else if (propertySchema.type === 'object') {
        propertySchema.properties = retortSchemaToJsonSchema(value as RetortObjectSchema).properties;
      }

      jsonSchema.properties![key] = propertySchema;
      jsonSchema.required!.push(key);
    }
  }

  if (jsonSchema.required?.length === 0) {
    delete jsonSchema.required;
  }

  return jsonSchema;
}

// Define the type mapping logic
type PrimitiveTypeMapping<T> =
  T extends StringConstructor ? string :
  T extends NumberConstructor ? number :
  T extends BooleanConstructor ? boolean :
  T extends ObjectConstructor ? object :
  T extends ArrayConstructor ? any[] :
  never;

// Handles the case where the schema object has a 'type' field
type ExtractType<T> = T extends { type: infer U }
  ? U extends RetortPrimitiveSchema
  ? PrimitiveTypeMapping<U>
  : U extends [infer V]
  ? RetortSchemaToType<V>[]
  : U extends RetortObjectSchema
  ? { [K in keyof U]: RetortSchemaToType<U[K]> }
  : never
  : never;

type IncludeNullability<T, U> = T extends { nullable: true } ? U | null : U;
type IncludeOptional<T, U> = T extends { optional: true } ? U | undefined : U;
type IncludeEnum<T, U> = T extends { type: StringConstructor, enum: infer V } ? V extends string[] ? V[number] : never : U;
type CombinedIncludes<T, U> = IncludeEnum<T, IncludeOptional<T, IncludeNullability<T, U>>>;

// Main type mapping logic combining all cases
export type RetortSchemaToType<T> = ExtractType<T> extends never
  ? T extends RetortPrimitiveSchema
  ? PrimitiveTypeMapping<T>
  : T extends [infer U]
  ? RetortSchemaToType<U>[]
  : T extends RetortObjectSchema
  ? { [K in keyof T]: RetortSchemaToType<T[K]> }
  : never
  : CombinedIncludes<T, ExtractType<T>>;

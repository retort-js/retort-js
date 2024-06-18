
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

export type MongooseSchemaPrimitiveType =
  | StringConstructor
  | NumberConstructor
  | BooleanConstructor
  | ObjectConstructor
  | ArrayConstructor;

export type MongooseSchemaType = MongooseSchemaPrimitiveType | MongooseSchemaDefinition | [MongooseSchemaType];

export interface MongooseSchemaDefinition {
  [key: string]: {
    type: MongooseSchemaType;
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
  } | MongooseSchemaType;
}

export function mongooseTypeToJsonSchemaType(type: MongooseSchemaPrimitiveType | MongooseSchemaDefinition | [MongooseSchemaType]): string {
  switch (type) {
    case String:
      return 'string';
    case Number:
      return 'number';
    case Boolean:
      return 'boolean';
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

export function convertMongooseToJsonSchema(mongooseSchema: MongooseSchemaDefinition): JsonSchema {
  const jsonSchema: JsonSchema = {
    type: 'object',
    properties: {},
    required: [],
  };

  for (const [key, value] of Object.entries(mongooseSchema)) {
    const propertySchema: JsonSchema = {} as JsonSchema;

    if (typeof value === 'object' && !Array.isArray(value) && 'type' in value) {
      const schemaTypeOpts = value as {
        enum?: string[] | undefined;
        type: MongooseSchemaType;
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

      propertySchema.type = mongooseTypeToJsonSchemaType(schemaTypeOpts.type);

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
          propertySchema.items = convertMongooseToJsonSchema({ item: arrayType }).properties?.['item'];
        } else {
          propertySchema.items = { type: mongooseTypeToJsonSchemaType(arrayType) };
        }
      } else if (propertySchema.type === 'object') {
        const nestedSchema = convertMongooseToJsonSchema(schemaTypeOpts.type as MongooseSchemaDefinition);
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
      propertySchema.type = mongooseTypeToJsonSchemaType(value as MongooseSchemaType);

      // if (value === Date) {
      //   propertySchema.format = 'date-time';
      // }

      if (propertySchema.type === 'array' && Array.isArray(value)) {
        const arrayType = value[0];
        if (typeof arrayType === 'object' && 'type' in arrayType) {
          propertySchema.items = convertMongooseToJsonSchema({ item: arrayType }).properties?.['item'];
        } else {
          propertySchema.items = { type: mongooseTypeToJsonSchemaType(arrayType) };
        }
      } else if (propertySchema.type === 'object') {
        propertySchema.properties = convertMongooseToJsonSchema(value as MongooseSchemaDefinition).properties;
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
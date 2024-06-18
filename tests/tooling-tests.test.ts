import { describe, it, expect } from 'vitest';

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
  | DateConstructor
  | BufferConstructor
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
    case Date:
      return 'string'; // JSON Schema uses "string" for dates
    case Buffer:
      return 'string'; // JSON Schema uses "string" for binary data
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

function convertMongooseToJsonSchema(mongooseSchema: MongooseSchemaDefinition): JsonSchema {
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

      if (schemaTypeOpts.type === Date) {
        propertySchema.format = 'date-time';
      } else if (propertySchema.type === 'string' && schemaTypeOpts.format) {
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

      if (value === Date) {
        propertySchema.format = 'date-time';
      }

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

describe('convertMongooseToJsonSchema', () => {
  it('should convert a simple Mongoose schema to JSON schema', () => {
    const mongooseSchema: MongooseSchemaDefinition = {
      name: { type: String, optional: false },
      age: { type: Number, optional: true },
      createdAt: { type: Date, optional: false },
    };

    const expectedJsonSchema: JsonSchema = {
      type: 'object',
      properties: {
        name: { type: 'string' },
        age: { type: 'number' },
        createdAt: { type: 'string', format: 'date-time' },
      },
      required: ['name', 'createdAt'],
    };

    const jsonSchema = convertMongooseToJsonSchema(mongooseSchema);
    expect(jsonSchema).toEqual(expectedJsonSchema);
  });

  it('should handle nested objects in Mongoose schema', () => {
    const mongooseSchema: MongooseSchemaDefinition = {
      user: {
        type: {
          name: { type: String, optional: false },
          age: { type: Number, optional: true },
        },
        optional: false,
      },
    };

    const expectedJsonSchema: JsonSchema = {
      type: 'object',
      properties: {
        user: {
          type: 'object',
          properties: {
            name: { type: 'string' },
            age: { type: 'number' },
          },
          required: ['name'],
        },
      },
      required: ['user'],
    };

    const jsonSchema = convertMongooseToJsonSchema(mongooseSchema);
    expect(jsonSchema).toEqual(expectedJsonSchema);
  });

  it('should handle arrays in Mongoose schema', () => {
    const mongooseSchema: MongooseSchemaDefinition = {
      tags: { type: [String], optional: true },
    };

    const expectedJsonSchema: JsonSchema = {
      type: 'object',
      properties: {
        tags: {
          type: 'array',
          items: { type: 'string' },
        },
      },
    };

    const jsonSchema = convertMongooseToJsonSchema(mongooseSchema);
    expect(jsonSchema).toEqual(expectedJsonSchema);
  });

  it('should handle complex nested structures', () => {
    const mongooseSchema: MongooseSchemaDefinition = {
      user: {
        type: {
          name: { type: String, optional: false },
          details: {
            type: {
              age: { type: Number, optional: true },
              address: { type: String, optional: false },
            },
            optional: true,
          },
        },
        optional: false,
      },
    };

    const expectedJsonSchema: JsonSchema = {
      type: 'object',
      properties: {
        user: {
          type: 'object',
          properties: {
            name: { type: 'string' },
            details: {
              type: 'object',
              properties: {
                age: { type: 'number' },
                address: { type: 'string' },
              },
              required: ['address'],
            },
          },
          required: ['name'],
        },
      },
      required: ['user'],
    };

    const jsonSchema = convertMongooseToJsonSchema(mongooseSchema);
    expect(jsonSchema).toEqual(expectedJsonSchema);
  });

  it('should handle shorthand declarations in Mongoose schema', () => {
    const mongooseSchema: MongooseSchemaDefinition = {
      name: String,
      age: Number,
      createdAt: Date,
    };

    const expectedJsonSchema: JsonSchema = {
      type: 'object',
      properties: {
        name: { type: 'string' },
        age: { type: 'number' },
        createdAt: { type: 'string', format: 'date-time' },
      },
      required: ['name', 'age', 'createdAt'],
    };

    const jsonSchema = convertMongooseToJsonSchema(mongooseSchema);
    expect(jsonSchema).toEqual(expectedJsonSchema);
  });

  it('should handle mixed shorthand and verbose declarations in Mongoose schema', () => {
    const mongooseSchema: MongooseSchemaDefinition = {
      name: String,
      age: { type: Number, optional: true },
      createdAt: { type: Date, optional: false },
    };

    const expectedJsonSchema: JsonSchema = {
      type: 'object',
      properties: {
        name: { type: 'string' },
        age: { type: 'number' },
        createdAt: { type: 'string', format: 'date-time' },
      },
      required: ['name', 'createdAt'],
    };

    const jsonSchema = convertMongooseToJsonSchema(mongooseSchema);
    expect(jsonSchema).toEqual(expectedJsonSchema);
  });

  it('should handle longhand declarations inside arrays in Mongoose schema', () => {
    const mongooseSchema: MongooseSchemaDefinition = {
      tags: { type: [{ type: String }], optional: true },
    };

    const expectedJsonSchema: JsonSchema = {
      type: 'object',
      properties: {
        tags: {
          type: 'array',
          items: { type: 'string' },
        },
      },
    };

    const jsonSchema = convertMongooseToJsonSchema(mongooseSchema);
    expect(jsonSchema).toEqual(expectedJsonSchema);
  });

  it('should handle "enum" property', () => {
    const mongooseSchema: MongooseSchemaDefinition = {
      status: { type: String, enum: ['active', 'inactive'], optional: false },
    };

    const expectedJsonSchema: JsonSchema = {
      type: 'object',
      properties: {
        status: {
          type: 'string',
          enum: ['active', 'inactive'],
        },
      },
      required: ['status'],
    };

    const jsonSchema = convertMongooseToJsonSchema(mongooseSchema);
    expect(jsonSchema).toEqual(expectedJsonSchema);
  });

  it('should handle "description" property', () => {
    const mongooseSchema: MongooseSchemaDefinition = {
      status: { type: String, description: 'The status of the entity', optional: false },
    };

    const expectedJsonSchema: JsonSchema = {
      type: 'object',
      properties: {
        status: {
          type: 'string',
          description: 'The status of the entity',
        },
      },
      required: ['status'],
    };

    const jsonSchema = convertMongooseToJsonSchema(mongooseSchema);
    expect(jsonSchema).toEqual(expectedJsonSchema);
  });

  it('should handle "nullable" property', () => {
    const mongooseSchema: MongooseSchemaDefinition = {
      name: { type: String, nullable: true, optional: false },
    };

    const expectedJsonSchema: JsonSchema = {
      type: 'object',
      properties: {
        name: {
          type: ['string', 'null'],
        },
      },
      required: ['name'],
    };

    const jsonSchema = convertMongooseToJsonSchema(mongooseSchema);
    expect(jsonSchema).toEqual(expectedJsonSchema);
  });

  it('should handle "minLength" property', () => {
    const mongooseSchema: MongooseSchemaDefinition = {
      username: { type: String, minLength: 3, optional: false },
    };

    const expectedJsonSchema: JsonSchema = {
      type: 'object',
      properties: {
        username: {
          type: 'string',
          minLength: 3,
        },
      },
      required: ['username'],
    };

    const jsonSchema = convertMongooseToJsonSchema(mongooseSchema);
    expect(jsonSchema).toEqual(expectedJsonSchema);
  });

  it('should handle "maxLength" property', () => {
    const mongooseSchema: MongooseSchemaDefinition = {
      username: { type: String, maxLength: 20, optional: false },
    };

    const expectedJsonSchema: JsonSchema = {
      type: 'object',
      properties: {
        username: {
          type: 'string',
          maxLength: 20,
        },
      },
      required: ['username'],
    };

    const jsonSchema = convertMongooseToJsonSchema(mongooseSchema);
    expect(jsonSchema).toEqual(expectedJsonSchema);
  });

  it('should handle "pattern" property', () => {
    const mongooseSchema: MongooseSchemaDefinition = {
      username: { type: String, pattern: '^[a-zA-Z0-9_]+$', optional: false },
    };

    const expectedJsonSchema: JsonSchema = {
      type: 'object',
      properties: {
        username: {
          type: 'string',
          pattern: '^[a-zA-Z0-9_]+$',
        },
      },
      required: ['username'],
    };

    const jsonSchema = convertMongooseToJsonSchema(mongooseSchema);
    expect(jsonSchema).toEqual(expectedJsonSchema);
  });

  it('should handle "format" property', () => {
    const mongooseSchema: MongooseSchemaDefinition = {
      email: { type: String, format: 'email', optional: false },
    };

    const expectedJsonSchema: JsonSchema = {
      type: 'object',
      properties: {
        email: {
          type: 'string',
          format: 'email',
        },
      },
      required: ['email'],
    };

    const jsonSchema = convertMongooseToJsonSchema(mongooseSchema);
    expect(jsonSchema).toEqual(expectedJsonSchema);
  });

  it('should handle "minimum" property', () => {
    const mongooseSchema: MongooseSchemaDefinition = {
      age: { type: Number, minimum: 18, optional: false },
    };

    const expectedJsonSchema: JsonSchema = {
      type: 'object',
      properties: {
        age: {
          type: 'number',
          minimum: 18,
        },
      },
      required: ['age'],
    };

    const jsonSchema = convertMongooseToJsonSchema(mongooseSchema);
    expect(jsonSchema).toEqual(expectedJsonSchema);
  });

  it('should handle "maximum" property', () => {
    const mongooseSchema: MongooseSchemaDefinition = {
      age: { type: Number, maximum: 65, optional: false },
    };

    const expectedJsonSchema: JsonSchema = {
      type: 'object',
      properties: {
        age: {
          type: 'number',
          maximum: 65,
        },
      },
      required: ['age'],
    };

    const jsonSchema = convertMongooseToJsonSchema(mongooseSchema);
    expect(jsonSchema).toEqual(expectedJsonSchema);
  });

  it('should handle "exclusiveMinimum" property', () => {
    const mongooseSchema: MongooseSchemaDefinition = {
      age: { type: Number, exclusiveMinimum: 18, optional: false },
    };

    const expectedJsonSchema: JsonSchema = {
      type: 'object',
      properties: {
        age: {
          type: 'number',
          exclusiveMinimum: 18,
        },
      },
      required: ['age'],
    };

    const jsonSchema = convertMongooseToJsonSchema(mongooseSchema);
    expect(jsonSchema).toEqual(expectedJsonSchema);
  });

  it('should handle "exclusiveMaximum" property', () => {
    const mongooseSchema: MongooseSchemaDefinition = {
      age: { type: Number, exclusiveMaximum: 65, optional: false },
    };

    const expectedJsonSchema: JsonSchema = {
      type: 'object',
      properties: {
        age: {
          type: 'number',
          exclusiveMaximum: 65,
        },
      },
      required: ['age'],
    };

    const jsonSchema = convertMongooseToJsonSchema(mongooseSchema);
    expect(jsonSchema).toEqual(expectedJsonSchema);
  });

  it('should handle "multipleOf" property', () => {
    const mongooseSchema: MongooseSchemaDefinition = {
      age: { type: Number, multipleOf: 5, optional: false },
    };

    const expectedJsonSchema: JsonSchema = {
      type: 'object',
      properties: {
        age: {
          type: 'number',
          multipleOf: 5,
        },
      },
      required: ['age'],
    };

    const jsonSchema = convertMongooseToJsonSchema(mongooseSchema);
    expect(jsonSchema).toEqual(expectedJsonSchema);
  });

  it('should handle "const" property', () => {
    const mongooseSchema: MongooseSchemaDefinition = {
      status: { type: String, const: 'active', optional: false },
    };

    const expectedJsonSchema: JsonSchema = {
      type: 'object',
      properties: {
        status: {
          type: 'string',
          const: 'active',
        },
      },
      required: ['status'],
    };

    const jsonSchema = convertMongooseToJsonSchema(mongooseSchema);
    expect(jsonSchema).toEqual(expectedJsonSchema);
  });

  it('should handle "value" property', () => {
    const mongooseSchema: MongooseSchemaDefinition = {
      status: { type: String, value: 'active', optional: false },
    };

    const expectedJsonSchema: JsonSchema = {
      type: 'object',
      properties: {
        status: {
          type: 'string',
          const: 'active',
        },
      },
      required: ['status'],
    };

    const jsonSchema = convertMongooseToJsonSchema(mongooseSchema);
    expect(jsonSchema).toEqual(expectedJsonSchema);
  });

  it('should throw error if both "const" and "value" are specified', () => {
    const mongooseSchema: MongooseSchemaDefinition = {
      status: { type: String, const: 'active', value: 'inactive', optional: false },
    };

    expect(() => convertMongooseToJsonSchema(mongooseSchema)).toThrow(Error);
  });
});

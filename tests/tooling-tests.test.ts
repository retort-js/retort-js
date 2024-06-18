import { describe, it, expect } from 'vitest';
import { retortSchemaToJsonSchema, JsonSchema, RetortObjectSchema } from '../src/tooling';
describe('convertMongooseToJsonSchema', () => {
  it('should convert a simple Mongoose schema to JSON schema', () => {
    const mongooseSchema: RetortObjectSchema = {
      name: { type: String, optional: false },
      age: { type: Number, optional: true },
      createdAt: { type: String, optional: false },
    };

    const expectedJsonSchema: JsonSchema = {
      type: 'object',
      properties: {
        name: { type: 'string' },
        age: { type: 'number' },
        createdAt: { type: 'string' },
      },
      required: ['name', 'createdAt'],
    };

    const jsonSchema = retortSchemaToJsonSchema(mongooseSchema);
    expect(jsonSchema).toEqual(expectedJsonSchema);
  });

  it('should handle nested objects in Mongoose schema', () => {
    const mongooseSchema: RetortObjectSchema = {
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

    const jsonSchema = retortSchemaToJsonSchema(mongooseSchema);
    expect(jsonSchema).toEqual(expectedJsonSchema);
  });

  it('should handle arrays in Mongoose schema', () => {
    const mongooseSchema: RetortObjectSchema = {
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

    const jsonSchema = retortSchemaToJsonSchema(mongooseSchema);
    expect(jsonSchema).toEqual(expectedJsonSchema);
  });

  it('should handle complex nested structures', () => {
    const mongooseSchema: RetortObjectSchema = {
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

    const jsonSchema = retortSchemaToJsonSchema(mongooseSchema);
    expect(jsonSchema).toEqual(expectedJsonSchema);
  });

  it('should handle shorthand declarations in Mongoose schema', () => {
    const mongooseSchema: RetortObjectSchema = {
      name: String,
      age: Number,
      createdAt: String,
    };

    const expectedJsonSchema: JsonSchema = {
      type: 'object',
      properties: {
        name: { type: 'string' },
        age: { type: 'number' },
        createdAt: { type: 'string' },
      },
      required: ['name', 'age', 'createdAt'],
    };

    const jsonSchema = retortSchemaToJsonSchema(mongooseSchema);
    expect(jsonSchema).toEqual(expectedJsonSchema);
  });

  it('should handle mixed shorthand and verbose declarations in Mongoose schema', () => {
    const mongooseSchema: RetortObjectSchema = {
      name: String,
      age: { type: Number, optional: true },
      createdAt: { type: String, optional: false },
    };

    const expectedJsonSchema: JsonSchema = {
      type: 'object',
      properties: {
        name: { type: 'string' },
        age: { type: 'number' },
        createdAt: { type: 'string' },
      },
      required: ['name', 'createdAt'],
    };

    const jsonSchema = retortSchemaToJsonSchema(mongooseSchema);
    expect(jsonSchema).toEqual(expectedJsonSchema);
  });

  it('should handle longhand declarations inside arrays in Mongoose schema', () => {
    const mongooseSchema: RetortObjectSchema = {
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

    const jsonSchema = retortSchemaToJsonSchema(mongooseSchema);
    expect(jsonSchema).toEqual(expectedJsonSchema);
  });

  it('should handle "enum" property', () => {
    const mongooseSchema: RetortObjectSchema = {
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

    const jsonSchema = retortSchemaToJsonSchema(mongooseSchema);
    expect(jsonSchema).toEqual(expectedJsonSchema);
  });

  it('should handle "description" property', () => {
    const mongooseSchema: RetortObjectSchema = {
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

    const jsonSchema = retortSchemaToJsonSchema(mongooseSchema);
    expect(jsonSchema).toEqual(expectedJsonSchema);
  });

  it('should handle "nullable" property', () => {
    const mongooseSchema: RetortObjectSchema = {
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

    const jsonSchema = retortSchemaToJsonSchema(mongooseSchema);
    expect(jsonSchema).toEqual(expectedJsonSchema);
  });

  it('should handle "minLength" property', () => {
    const mongooseSchema: RetortObjectSchema = {
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

    const jsonSchema = retortSchemaToJsonSchema(mongooseSchema);
    expect(jsonSchema).toEqual(expectedJsonSchema);
  });

  it('should handle "maxLength" property', () => {
    const mongooseSchema: RetortObjectSchema = {
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

    const jsonSchema = retortSchemaToJsonSchema(mongooseSchema);
    expect(jsonSchema).toEqual(expectedJsonSchema);
  });

  it('should handle "pattern" property', () => {
    const mongooseSchema: RetortObjectSchema = {
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

    const jsonSchema = retortSchemaToJsonSchema(mongooseSchema);
    expect(jsonSchema).toEqual(expectedJsonSchema);
  });

  it('should handle "format" property', () => {
    const mongooseSchema: RetortObjectSchema = {
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

    const jsonSchema = retortSchemaToJsonSchema(mongooseSchema);
    expect(jsonSchema).toEqual(expectedJsonSchema);
  });

  it('should handle "minimum" property', () => {
    const mongooseSchema: RetortObjectSchema = {
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

    const jsonSchema = retortSchemaToJsonSchema(mongooseSchema);
    expect(jsonSchema).toEqual(expectedJsonSchema);
  });

  it('should handle "maximum" property', () => {
    const mongooseSchema: RetortObjectSchema = {
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

    const jsonSchema = retortSchemaToJsonSchema(mongooseSchema);
    expect(jsonSchema).toEqual(expectedJsonSchema);
  });

  it('should handle "exclusiveMinimum" property', () => {
    const mongooseSchema: RetortObjectSchema = {
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

    const jsonSchema = retortSchemaToJsonSchema(mongooseSchema);
    expect(jsonSchema).toEqual(expectedJsonSchema);
  });

  it('should handle "exclusiveMaximum" property', () => {
    const mongooseSchema: RetortObjectSchema = {
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

    const jsonSchema = retortSchemaToJsonSchema(mongooseSchema);
    expect(jsonSchema).toEqual(expectedJsonSchema);
  });

  it('should handle "multipleOf" property', () => {
    const mongooseSchema: RetortObjectSchema = {
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

    const jsonSchema = retortSchemaToJsonSchema(mongooseSchema);
    expect(jsonSchema).toEqual(expectedJsonSchema);
  });

  it('should handle "const" property', () => {
    const mongooseSchema: RetortObjectSchema = {
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

    const jsonSchema = retortSchemaToJsonSchema(mongooseSchema);
    expect(jsonSchema).toEqual(expectedJsonSchema);
  });

  it('should handle "value" property', () => {
    const mongooseSchema: RetortObjectSchema = {
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

    const jsonSchema = retortSchemaToJsonSchema(mongooseSchema);
    expect(jsonSchema).toEqual(expectedJsonSchema);
  });

  it('should throw error if both "const" and "value" are specified', () => {
    const mongooseSchema: RetortObjectSchema = {
      status: { type: String, const: 'active', value: 'inactive', optional: false },
    };

    expect(() => retortSchemaToJsonSchema(mongooseSchema)).toThrow(Error);
  });
});

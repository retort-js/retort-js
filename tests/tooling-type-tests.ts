import { MongooseSchemaPrimitiveType, MongooseSchemaDefinition } from "./tooling-tests.test";

// Define the type mapping logic
type PrimitiveTypeMapping<T> = 
  T extends StringConstructor ? string :
  T extends NumberConstructor ? number :
  T extends BooleanConstructor ? boolean :
  T extends ObjectConstructor ? object :
  T extends ArrayConstructor ? any[] :
  never;

type MongooseSchemaToType<T> = T extends { type: infer U }
  ? U extends MongooseSchemaPrimitiveType
    ? PrimitiveTypeMapping<U>
    : U extends [infer V]
    ? MongooseSchemaToType<V>[]
    : U extends MongooseSchemaDefinition
    ? { [K in keyof U]: MongooseSchemaToType<U[K]> }
    : never
  : T extends MongooseSchemaPrimitiveType
  ? PrimitiveTypeMapping<T>
  : T extends [infer U]
  ? MongooseSchemaToType<U>[]
  : T extends MongooseSchemaDefinition
  ? { [K in keyof T]: MongooseSchemaToType<T[K]> }
  : never;

type StringTest1 = MongooseSchemaToType<{ type: StringConstructor }>;
type StringTest2 = MongooseSchemaToType<StringConstructor>;
type NumberTest1 = MongooseSchemaToType<{ type: NumberConstructor }>;
type NumberTest2 = MongooseSchemaToType<NumberConstructor>;
type ObjectTest = MongooseSchemaToType<{ type: ObjectConstructor }>;
type ArrayTest = MongooseSchemaToType<{ type: ArrayConstructor }>;
type BooleanTest = MongooseSchemaToType<{ type: BooleanConstructor }>;

type NestedTypeTest = MongooseSchemaToType<{ type: { type: StringConstructor } }>;
type AddressTest = MongooseSchemaToType<{ street: { type: StringConstructor } } >;
type StringArraytest = MongooseSchemaToType<{ type: [StringConstructor] }>;

type ComplexTest = MongooseSchemaToType<{
  name: { type: StringConstructor },
  age: { type: NumberConstructor },
  address: { street: { type: StringConstructor } },
  children: { type: [{ name: { type: StringConstructor } }] }
}>;
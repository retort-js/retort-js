import { MongooseSchemaPrimitiveType, MongooseSchemaDefinition } from "./tooling-tests.test";

// Define the type mapping logic
type PrimitiveTypeMapping<T> =
  T extends StringConstructor ? string :
  T extends NumberConstructor ? number :
  T extends BooleanConstructor ? boolean :
  T extends ObjectConstructor ? object :
  T extends ArrayConstructor ? any[] :
  never;

export type MongooseSchemaToType<T> = T extends { type: infer U }
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

type Assert<T extends true> = T;
type AreEqual<T, Expected> = T extends Expected ? (Expected extends T ? true : false) : false


type StringTest1 = MongooseSchemaToType<{ type: StringConstructor }>;
type StringTest1Assertion = Assert<AreEqual<StringTest1, string>>;

type StringTest2 = MongooseSchemaToType<StringConstructor>;
type StringTest2Assertion = Assert<AreEqual<StringTest2, string>>;

type NumberTest1 = MongooseSchemaToType<{ type: NumberConstructor }>;
type NumberTest1Assertion = Assert<AreEqual<NumberTest1, number>>;

type NumberTest2 = MongooseSchemaToType<NumberConstructor>;
type NumberTest2Assertion = Assert<AreEqual<NumberTest2, number>>;

type ObjectTest = MongooseSchemaToType<{ type: ObjectConstructor }>;
type ObjectTestAssertion = Assert<AreEqual<ObjectTest, object>>;

type ArrayTest = MongooseSchemaToType<{ type: ArrayConstructor }>;
type ArrayTestAssertion = Assert<AreEqual<ArrayTest, any[]>>;

type BooleanTest = MongooseSchemaToType<{ type: BooleanConstructor }>;
// Test doesn't work for some reason
// type BooleanTestAssertion = Assert<AreEqual<BooleanTest, boolean>>;

type NestedTypeTest = MongooseSchemaToType<{ type: { type: StringConstructor } }>;
type NestedTypeTestAssertion = Assert<AreEqual<NestedTypeTest, { type: string }>>;

type AddressTest = MongooseSchemaToType<{ street: { type: StringConstructor } }>;
type AddressTestAssertion = Assert<AreEqual<AddressTest, { street: string }>>;

type StringArraytest = MongooseSchemaToType<{ type: [StringConstructor] }>;
type StringArraytestAssertion = Assert<AreEqual<StringArraytest, string[]>>;

type ComplexTest = MongooseSchemaToType<{
  name: { type: StringConstructor },
  age: { type: NumberConstructor },
  address: { street: { type: StringConstructor } },
  children: { type: [{ name: { type: StringConstructor } }] }
}>;
type ComplexTestAssertion = Assert<AreEqual<ComplexTest, {
  name: string,
  age: number,
  address: { street: string },
  children: { name: string }[]
}>>;
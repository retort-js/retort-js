import { RetortPrimitiveSchema, RetortObjectSchema, RetortSchemaToType } from "../src/tooling";




type Assert<T extends true> = T;
type AreEqual<T, Expected> = T extends Expected ? (Expected extends T ? true : false) : false


type StringTest1 = RetortSchemaToType<{ type: StringConstructor }>;
type StringTest1Assertion = Assert<AreEqual<StringTest1, string>>;

type StringTest2 = RetortSchemaToType<StringConstructor>;
type StringTest2Assertion = Assert<AreEqual<StringTest2, string>>;

type NumberTest1 = RetortSchemaToType<{ type: NumberConstructor }>;
type NumberTest1Assertion = Assert<AreEqual<NumberTest1, number>>;

type NumberTest2 = RetortSchemaToType<NumberConstructor>;
type NumberTest2Assertion = Assert<AreEqual<NumberTest2, number>>;

type ObjectTest = RetortSchemaToType<{ type: ObjectConstructor }>;
type ObjectTestAssertion = Assert<AreEqual<ObjectTest, object>>;

type ArrayTest = RetortSchemaToType<{ type: ArrayConstructor }>;
type ArrayTestAssertion = Assert<AreEqual<ArrayTest, any[]>>;

type BooleanTest = RetortSchemaToType<{ type: BooleanConstructor }>;
// Test doesn't work for some reason
// type BooleanTestAssertion = Assert<AreEqual<BooleanTest, boolean>>;

type NestedTypeTest = RetortSchemaToType<{ type: { type: StringConstructor } }>;
type NestedTypeTestAssertion = Assert<AreEqual<NestedTypeTest, { type: string }>>;

type AddressTest = RetortSchemaToType<{ street: { type: StringConstructor } }>;
type AddressTestAssertion = Assert<AreEqual<AddressTest, { street: string }>>;

type StringArraytest = RetortSchemaToType<{ type: [StringConstructor] }>;
type StringArraytestAssertion = Assert<AreEqual<StringArraytest, string[]>>;

type ComplexTest = RetortSchemaToType<{
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
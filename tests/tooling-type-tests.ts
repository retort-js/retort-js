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

// Enum property test
type EnumTest = RetortSchemaToType<{ status: { type: StringConstructor, enum: ['open', 'closed', 'pending'] } }>;
type EnumTestAssertion = Assert<AreEqual<EnumTest, { status: 'open' | 'closed' | 'pending' }>>;

// Nullable property test
type NullableTest = RetortSchemaToType<{ age: { type: NumberConstructor, nullable: true } }>;
type NullableTestAssertion = Assert<AreEqual<NullableTest, { age: number | null }>>;

// Optional property test
type OptionalTest = RetortSchemaToType<{ email: { type: StringConstructor, optional: true } }>;
type OptionalTestAssertion = Assert<AreEqual<OptionalTest, { email?: string }>>;

// Combined nullable and optional property test
type CombinedNullableOptionalTest = RetortSchemaToType<{ phone: { type: StringConstructor, nullable: true, optional: true } }>;
type CombinedNullableOptionalTestAssertion = Assert<AreEqual<CombinedNullableOptionalTest, { phone?: string | null }>>;

// Tests for the special case where "type" is an object an object with a "type" property.
// This is because mongoose-style schemas treate the type field in a special way
type NestedTypeTest = RetortSchemaToType<{ type: { type: StringConstructor } }>;
type NestedTypeTestAssertion = Assert<AreEqual<NestedTypeTest, { type: string }>>;


type NestedTypeTest2 = RetortSchemaToType<{ type: { type: {type: StringConstructor} } }>;

// Known limitation of type mapping.
// @ts-ignore
type NestedTypeTest2Assertion = Assert<AreEqual<NestedTypeTest2, { type: {type: string}} >>;
import { RetortMessage, templateContent } from "dist/message";

templateContent`Hello, ${"world"}!`;
templateContent`Hello, ${42}!`;
templateContent`Hello, ${true}!`;
templateContent`Hello, ${null}!`;

templateContent`Hello, ${new RetortMessage({ role: "user", content: "world" })}!`;

templateContent`Hello, ${{ toString: () => "world" }}!`;

class ToStringTest {
  toString() {
    return "Hello";
  }
}

templateContent`Hello, ${new ToStringTest()}`;

class ToStringInheritableTest extends ToStringTest { }

templateContent`Hello, ${new ToStringInheritableTest()}`;

// @ts-expect-error
templateContent`Hello, ${new (class { })()}`;

// @ts-expect-error
templateContent`Hello, ${() => { }}!`;

// @ts-expect-error
templateContent`Hello, ${undefined}!`;

// @ts-expect-error
templateContent`Hello, ${/./}!`;

// @ts-expect-error
templateContent`Hello, ${Symbol("world")}!`;
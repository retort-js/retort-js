import { RetortAgent } from "dist/agent";
import { RetortConversation } from "dist/conversation";
import { RetortMessage } from "dist/message";

declare var template:RetortAgent;

template`Hello, ${"world"}!`;
template`Hello, ${42}!`;
template`Hello, ${true}!`;
template`Hello, ${null}!`;
template`Hello, ${[]}!`;

template`Hello, ${new RetortMessage({ role: "user", content: "world" })}!`;

template`Hello, ${{ toString: () => "world" }}!`;

class ToStringTest {
  toString() {
    return "Hello";
  }
}

template`Hello, ${new ToStringTest()}`;

class ToStringInheritableTest extends ToStringTest { }

template`Hello, ${new ToStringInheritableTest()}`;

// @ts-expect-error
template`Hello, ${new (class { })()}`;

// @ts-expect-error
template`Hello, ${() => { }}!`;

// @ts-expect-error
template`Hello, ${undefined}!`;

// @ts-expect-error
template`Hello, ${/./}!`;

// @ts-expect-error
template`Hello, ${Symbol("world")}!`;
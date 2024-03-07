import { describe, it, expect } from "vitest";
import { templateContent as $ } from "../dist/message";
import { RetortMessage } from "../dist/message";
import { RetortValue } from "../dist/message";

describe("templateContent function", () => {
  it("Empty string should work", () => {
    expect($``).toBe("");
  });

  it("Explicit new lines should be preserved", () => {
    expect($`\n`).toBe("\n");
  });

  it("Explicit tabs should be preserved", () => {
    expect($`\t`).toBe("\t");
  });

  it("Single space should be stripped", () => {
    expect($` `).toBe("");
  });

  it("Explicit new lines should be eliminated", () => {
    let m0 = $`
    `;
    expect(m0).toBe("");
  });

  it("Simple template strings should work", () => {
    expect($`TEST`).toBe("TEST");
  });

  it("Single-line template strings should be trimmed", () => {
    expect($`  TEST  `).toBe("TEST");
  });

  it("Multiline template strings should be trimmed", () => {
    let m1 = $`  
        TEST  
    `;
    expect(m1).toBe("TEST");
  });

  it("Multiline template strings should preseve newlines, but not other whitespace", () => {
    let m2 = $`  
        TEST1  
                           
        TEST2
    `;
    expect(m2).toBe("TEST1\n\nTEST2");
  });

  it("Conventional escape strings should work", () => {
    expect($`\\\\\n\t\\`).toBe("\\\\\n\t\\");
  });

  it("Space escape strings should work", () => {
    expect($`\s`).toBe(" ");
  });

  it("Line continuations should work", () => {
    let m3 = $`
      TE\
      ST
    `;
    expect(m3).toBe("TEST");
  });

  it("Line continuations should preserve spaces", () => {
    let m4 = $`
      TEST1 \
      TEST2
    `;
    expect(m4).toBe("TEST1 TEST2");
  });

  it("Line continuations should handle 2 backslashes properly", () => {
    let m4b = $`
      TEST1 \\
      TEST2
    `;
    expect(m4b).toBe("TEST1 \\\nTEST2");
  });

  it("Line continuations should handle 3 backslashes properly", () => {
    let m4c = $`
      TEST1 \\\
      TEST2
    `;
    expect(m4c).toBe("TEST1 \\TEST2");
  });

  it("Line continuations should handle 4 backslashes properly", () => {
    let m4d = $`
      TEST1 \\\\
      TEST2
    `;
    expect(m4d).toBe("TEST1 \\\\\nTEST2");
  });

  it("Line continuations should handle 5 backslashes properly", () => {
    let m4e = $`
      TEST1 \\\\\
      TEST2
    `;
    expect(m4e).toBe("TEST1 \\\\TEST2");
  });
  it("String insertions work", () => {
    expect($`${"TEST"}`).toBe("TEST");
  });

  it("Number insertions work", () => {
    expect($`${1}`).toBe("1");
  });

  it("Boolean insertions work", () => {
    expect($`${true}`).toBe("true");
  });

  it("Null insertions are empty", () => {
    expect($`${null}`).toBe("");
  });

  it("String insertions work", () => {
    expect($`${"TEST"}`).toBe("TEST");
  });

  it("String insertions trimming works.", () => {
    expect($` ${"TEST1"} TEST2 ${"TEST3"} `).toBe("TEST1 TEST2 TEST3");
  });

  it("Object insertions throw", () => {
    expect(() => $`${new Object() as RetortValue}`).toThrow();
  });

  it("Undefined insertions throw", () => {
    expect(() => $`${undefined}`).toThrow();
  });

  it("Function insertions throw", () => {
    expect(() => $`${new Function() as unknown as RetortValue}`).toThrow();
  });

  it("Retort messages are inserted", () => {
    expect($`${new RetortMessage({ role: "user", content: "TEST" })}`).toBe(
      "TEST"
    );
  });
});

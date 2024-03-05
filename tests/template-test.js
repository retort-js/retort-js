
let $ = require("../dist/message").templateContent;
let RetortMessage = require("../dist/message").RetortMessage;

let assert = (a, b, message = "") => console.assert(a === b, `${JSON.stringify(a)} !== ${JSON.stringify(b)}; ${message}`);

let throws = (func) => {
    let threw = false;
    try {
        func()
    }
    catch {
        threw = true;
    }
    return threw;
}

assert($`` , "", "Empty string should work");
assert($`\n` , "\n", "Explicit newlines should be preserved");
assert($`\t` , "\t", "Explicit tabs should be preserved");
assert($` ` , "", "Single space should be stripped");



let m0 = $`
`;

assert(m0, "", "Explicit newlines should be eliminated");


assert($`TEST` , "TEST", "Simple template strings should work");
assert($`  TEST  ` , "TEST", "Single-line template strings should be trimmed");

let m1 = $`  
    TEST  
`;
assert(m1 , "TEST", "Multiline template strings should be trimmed");

let m2 = $`  
    TEST1  
                       
    TEST2
`;
assert(m2 , "TEST1\n\nTEST2", "Multiline template strings should preseve newlines, but not other whitespace");


assert($`\\\\\n\t\\` , "\\\\\n\t\\", "Conventional escape strings should work");

assert($`\s` , " ", "Space escape strings should work");

let m3 = $`
    TE\
    ST
`
assert(m3 , "TEST", "Line continuations should work")


let m4 = $`
    TEST1 \
    TEST2
`
assert(m4 , "TEST1 TEST2", "Line continuations should preserve spaces")

let m4b = $`
    TEST1 \\
    TEST2
`
assert(m4b, "TEST1 \\\nTEST2", "Line continuations should handle 2 backslashes properly ")

let m4c = $`
    TEST1 \\\
    TEST2
`
assert(m4c , "TEST1 \\TEST2", "Line continuations should handle 3 backslashes properly ")

let m4d = $`
    TEST1 \\\\
    TEST2
`
assert(m4d , "TEST1 \\\\\nTEST2", "Line continuations should handle 4 backslashes properly ")

let m4e = $`
    TEST1 \\\\\
    TEST2
`
assert(m4e , "TEST1 \\\\TEST2", "Line continuations should handle 5 backslashes properly ")



assert($`${"TEST"}` , "TEST", "String insertions work")

assert($`${1}` , "1", "Number insertions work")

assert($`${true}` , "true", "Boolean insertions work")

assert($`${null}` , "", "Null insertions are empty")

assert($`${"TEST"}` , "TEST", "String insertions work")

assert($` ${"TEST1"} TEST2 ${"TEST3"} ` , "TEST1 TEST2 TEST3", "String insertions trimming works.")

//@ts-ignore
assert(throws(() => $`${new Object()}`), true, "Object insertions throw")

//@ts-ignore
assert(throws(() => $`${undefined}`), true, "Undefined insertions throw")

//@ts-ignore
assert(throws(() => $`${new Function()}`), true, "Function insertions throw")

assert($`${new RetortMessage({role: "user", content: "TEST"})}` , "TEST", "Retort messages are inserted");
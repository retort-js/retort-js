
let $ = require("../dist/message").templateContent;
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

assert($`${"TEST"}` , "TEST", "String insertions work")

assert($`${1}` , "1", "Number insertions work")

assert($`${true}` , "true", "Boolean insertions work")

assert($`${null}` , "", "Null insertions are empty")

assert($`${"TEST"}` , "TEST", "String insertions work")

assert($` ${"TEST1"} TEST2 ${"TEST3"} ` , "TEST1 TEST2 TEST3", "String insertions trimming works.")

//@ts-ignore
assert(throws(() => $`${new Object()}`), "Object insertions throw")

//@ts-ignore
assert(throws(() => $`${undefined}`), "Undefined insertions throw")

//@ts-ignore
assert(throws(() => $`${new Function()}`), "Function insertions throw")
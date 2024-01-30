import { runScript } from "./run-script";


if (!process.argv[2]) {
    console.error("Usage: npm run retort -- <path-to-script>");
    process.exit(1);
}
else {
    runScript(process.argv[2]).catch((error) => {
        console.error(error);
        process.exit(1);
    });
}
// Run the script from the first argument


import { RetortSettings, RetortRole } from "./agent";
import { id } from "./id";

export class RetortMessage {
    readonly id: string = id("msg");
    role: RetortRole;
    content = "";

    constructor({ role, content }: { role: RetortRole, content: string }) {
        this.role = role;
        this.content = content;
    }

}

export type RetortValue = string | number | boolean | undefined | null | RetortMessage;




export function templateContent(templateStrings: TemplateStringsArray, ...values: RetortValue[]): string {

    // Get the strings in raw form.
    let strings = templateStrings.raw.map(x => x);

    // Remove carriage returns from strings.
    strings = strings.map(str => str.replace(/\r/g, ""));

    // Remove any whitespace at the start of a line in each of the strings - except that which is explicitly specified.
    strings = strings.map(str => str.replace(/\n[^\S\r\n]+/g, "\n"));

    // Allow line continuations.
    strings = strings.map(str => str.replace(/(?<!\\)\\[^\S\n]\n/g, ""));

    // Remove any whitespace at the start of a line in each of the strings - except that which is explicitly specified.
    strings = strings.map(str => str.replace(/\n[^\S\r\n]+/g, "\n"));

    // Remove leading whitespace from the first string, if any.
    strings[0] = (strings[0] || "").trimStart();

    // Remove trailing whitespace from the last string, if any.
    strings[strings.length - 1] = (strings[strings.length - 1] || "").trimEnd();

    // TODO: Allow \ to begin and end a line, to allow for indentation.

    // Now, finally, encode the strings.
    strings = strings.map(str => unescape(str));




    let content = strings[0] || "";

    for (let i = 1, l = templateStrings.length; i < l; i++) {
        let val = (values[i - 1] || "");

        content += val || "";
        content += templateStrings[i] || "";

    }

    return content;
}

export function isTemplateStringsArray(templateStrings: TemplateStringsArray | unknown): templateStrings is TemplateStringsArray {
    return Array.isArray(templateStrings) && Array.isArray((templateStrings as any).raw);
}

export function unescape(str: string) {
    let segments = str.split(/(\\\x[a-fA-F0-9]{2}|\\\u[a-fA-F0-9]{4}|\\\u\{[a-fA-F0-9]{1,6}\}|\\.)/g).filter(x => x);

    return segments.map(unescapeSegment).join("");
}

export function unescapeSegment(str: string) {
    if (str.startsWith("\\")) {
        if (str[1] === "x") {

            // Use a regex to check that this is a valid escape sequence
            if (!/\\x[a-fA-F0-9][a-fA-F0-9]/.test(str)) {
                throw new Error(`Malformed Latin-1 escape sequence; should be like "\\x00"`);
            }

            return String.fromCharCode(parseInt(str.slice(2), 16));
        } else if (str[1] === "u") {
            if (str[2] === "{") {

                // Use a regex to check that this is a valid escape sequence
                if (!/\\u\{[a-fA-F0-9]{1,6}\}/.test(str)) {
                    throw new Error(`Malformed unicode escape sequence; should be like "\\u{000000} or "\\u0000`);
                }

                return String.fromCharCode(parseInt(str.slice(3, -1), 16));
            } else {

                // Use a regex to check that this is a valid escape sequence
                if (!/\\u[a-fA-F0-9]{4}/.test(str)) {
                    throw new Error(`Malformed unicode escape sequence; should be like "\\u{000000} or "\\u0000`);
                }

                return String.fromCharCode(parseInt(str.slice(2, 6), 16));
            }
        } else if (str[1] === "n") {
            return "\n";
        } else if (str[1] === "r") {
            return "\r";
        } else if (str[1] === "t") {
            return "\t";
        } else if (str[1] === "\\") {
            return "\\";
        }
        else if (str[1] === "s") {
            // Special space escaping behaviour.
            return " ";
        } else {
            throw new Error(`Unsupported escape sequence: "${str}"`)
        }
    } else {
        return str;
    }
}
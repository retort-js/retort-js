import { Configuration } from "./agent";

export class Message {
    role: "user" | "assistant" | "system" | string = "user";
    content = "";

    constructor({ role, content }: { role: string, content: string }) {
        this.role = role;
        this.content = content;
    }

}

export type Value = string | number | boolean | undefined | null | Message;



export function createTemplateTag(settings: Configuration) {


    return async function templateTag(templateStrings: TemplateStringsArray, ...values: Value[]): Promise<Message> {

        // Get the strings in raw form.
        let strings = templateStrings.raw.map(x => x);

        // Remove carriage returns from strings.
        strings = strings.map(str => str.replace(/\r/g, ""));

        // Remove any whitespace at the start of a line in each of the strings - except that which is explicitly specified.
        strings = strings.map(str => str.replace(/\n[^\S\r\n]+/g, "\n"));

        // Remove any whitespace or tabs at the end of a line in each of the strings  - except that which is explicitly specified.
        strings = strings.map(str => str.replace(/[^\S\r\n]+\n/g, "\n"));

        // Remove leading whitespace from the first string, if any.
        strings[0] = (strings[0] || "").trimStart();

        // Remove trailing whitespace from the last string, if any.
        strings[strings.length - 1] = (strings[strings.length - 1] || "").trimEnd();

        // Now, finally, encode the strings.
        strings = strings.map(str => String(str));




        let content = strings[0] || "";

        for (let i = 1, l = templateStrings.length; i < l; i++) {
            let val = await (values[i - 1] || "");

            content += val || "";
            content += templateStrings[i] || "";

        }

        return new Message({ ...settings, content });
    }
}

export function isTemplateStringsArray(templateStrings: TemplateStringsArray | unknown): templateStrings is TemplateStringsArray {
    return Array.isArray(templateStrings) && Array.isArray((templateStrings as any).raw);
}

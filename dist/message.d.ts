import { RetortRole } from "./agent";
export declare class RetortMessage {
    readonly id: string;
    role: RetortRole;
    content: string;
    constructor({ role, content }: {
        role: RetortRole;
        content: string;
    });
}
export type RetortValue = string | number | boolean | undefined | null | RetortMessage;
export declare function templateContent(templateStrings: TemplateStringsArray, ...values: RetortValue[]): string;
export declare function isTemplateStringsArray(templateStrings: TemplateStringsArray | unknown): templateStrings is TemplateStringsArray;
export declare function unescape(str: string): string;
export declare function unescapeSegment(str: string): string;

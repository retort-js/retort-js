"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.definePrompt = void 0;
const log_message_1 = require("./log-message");
const message_1 = require("./message");
function definePrompt(conversation, role, push) {
    return function prompt(value0, ...values) {
        let message;
        if (typeof value0 === "string") {
            message = new message_1.RetortMessage({ role: role, content: value0 });
        }
        else if ((0, message_1.isTemplateStringsArray)(value0) && value0 instanceof Array) {
            message = new message_1.RetortMessage({ role, content: (0, message_1.templateContent)(value0, ...values) });
        }
        else {
            throw new Error("Invalid parameter passed to prompt.");
        }
        if (push) {
            conversation.messagePromises.push(message);
            (0, log_message_1.logMessage)(message);
        }
        return message;
    };
}
exports.definePrompt = definePrompt;

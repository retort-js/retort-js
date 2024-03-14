"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.defineGeneration = void 0;
const log_message_1 = require("./log-message");
const message_1 = require("./message");
const openai_chat_completion_1 = require("./openai-chat-completion");
const tee_async_1 = __importDefault(require("./tee-async"));
function defineGeneration(conversation, role, push) {
    return function generation(generationSettings) {
        let streams = conversation.messagePromises.slice(0);
        let streamGenerator = (0, tee_async_1.default)((0, openai_chat_completion_1.openAiChatCompletion)(conversation.settings, streams));
        let internalStream = streamGenerator[0];
        let exposedStream = streamGenerator[1];
        async function messagePromise() {
            let content = "";
            for await (const chunk of internalStream) {
                content += chunk;
            }
            let message = new message_1.RetortMessage({ role, content });
            return message;
        }
        let promise = messagePromise();
        promise.stream = exposedStream;
        if (push) {
            conversation.messagePromises.push(promise);
        }
        promise.then((message) => {
            (0, log_message_1.logMessage)(message);
        });
        return promise;
    };
}
exports.defineGeneration = defineGeneration;

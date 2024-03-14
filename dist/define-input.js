"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.defineInput = void 0;
const log_message_1 = require("./log-message");
const message_1 = require("./message");
const readline_1 = __importDefault(require("readline"));
function defineInput(conversation, role, push) {
    return function input(inputSettings) {
        let m = askQuestion("input: ").then(content => {
            return new message_1.RetortMessage({ role, content });
        });
        if (push) {
            conversation.messagePromises.push(m);
            m.then(m => (0, log_message_1.logMessage)(m));
        }
        return m;
    };
}
exports.defineInput = defineInput;
function askQuestion(query) {
    const rl = readline_1.default.createInterface({
        input: process.stdin,
        output: process.stdout,
    });
    return new Promise(resolve => {
        return rl.question("\n" + query, ans => {
            readline_1.default.moveCursor(process.stdout, 0, -2);
            readline_1.default.clearScreenDown(process.stdout);
            rl.close();
            resolve(ans);
        });
    });
}

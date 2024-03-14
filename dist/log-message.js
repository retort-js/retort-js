"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.logMessage = void 0;
function logMessage(message) {
    let color = "";
    switch (message.role) {
        case "user":
            color = "\x1b[34m"; // Blue
            break;
        case "assistant":
            color = "\x1b[32m"; // Green
            break;
        case "system":
            color = "\x1b[33m"; // Yellow
            break;
        default:
            color = "\x1b[0m"; // Reset
    }
    const resetColor = "\x1b[0m";
    const contentColor = "\x1b[37m"; // White
    console.log(`\n${color}${message.role}${resetColor} ${contentColor}\`${message.content}\`${resetColor}`);
}
exports.logMessage = logMessage;

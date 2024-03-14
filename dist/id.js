"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.id = void 0;
const crypto_1 = __importDefault(require("crypto"));
function id(prefix) {
    const length = 28;
    const buffer = crypto_1.default.randomBytes(length);
    let str = "";
    for (let i = 0; i < buffer.length; i++) {
        let base36Representation = (buffer[i] || 0).toString(36);
        let leastSignificantDigit = base36Representation[base36Representation.length - 1];
        str += leastSignificantDigit;
    }
    return prefix + "-" + str;
}
exports.id = id;

"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.logScript = exports.tryGetFromLog = exports.createHash = void 0;
const crypto_1 = __importDefault(require("crypto"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const conversation_1 = require("./conversation");
const isSerializableRetortConversation = (obj) => {
    const isMessageValid = (message) => {
        return (typeof message === "object" &&
            typeof message.content === "string" &&
            typeof message.id === "string" &&
            (message.role === "assistant" ||
                message.role === "user" ||
                message.role === "system"));
    };
    const isSettingsValid = (settings) => {
        return (typeof settings === "object" &&
            typeof settings.model === "string" &&
            typeof settings.temperature === "number" &&
            typeof settings.topP === "number");
    };
    return (obj != null &&
        typeof obj.id === "string" &&
        typeof obj.settings === "object" &&
        isSettingsValid(obj.settings) &&
        Array.isArray(obj.messages) &&
        obj.messages.every(isMessageValid));
};
const createHash = (string) => {
    const hash = crypto_1.default.createHash("sha256");
    hash.update(string);
    return hash.digest("hex");
};
exports.createHash = createHash;
const getFilePathToLog = () => {
    return path_1.default.join(process.cwd(), ".retort-data/log");
};
const tryGetFromLog = (hash) => {
    const retortFolder = getFilePathToLog();
    if (!fs_1.default.existsSync(retortFolder)) {
        fs_1.default.mkdirSync(retortFolder, { recursive: true });
    }
    const filePath = path_1.default.join(retortFolder, hash);
    if (fs_1.default.existsSync(filePath)) {
        const deserialized = JSON.parse(fs_1.default.readFileSync(filePath, "utf8"));
        if (isSerializableRetortConversation(deserialized)) {
            return conversation_1.RetortConversation.fromObject(deserialized);
        }
        return deserialized;
    }
    return undefined;
};
exports.tryGetFromLog = tryGetFromLog;
const logScript = (hash, obj) => {
    const retortDataDir = getFilePathToLog();
    if (!fs_1.default.existsSync(retortDataDir)) {
        fs_1.default.mkdirSync(retortDataDir, { recursive: true });
    }
    const filePath = path_1.default.join(retortDataDir, hash);
    let serializedMessages = "";
    if (obj instanceof conversation_1.RetortConversation) {
        serializedMessages = JSON.stringify(obj.toObject(), null, 2);
    }
    else {
        try {
            serializedMessages = JSON.stringify(obj, null, 2);
        }
        catch (e) {
            console.error("Error serializing script", e);
            throw new Error("Error serializing script");
        }
    }
    fs_1.default.writeFile(filePath, serializedMessages, (err) => {
        if (err) {
            throw new Error(err.message);
        }
        console.log("The file has been saved!");
    });
    return serializedMessages;
};
exports.logScript = logScript;

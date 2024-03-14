"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.retort = void 0;
const logger_1 = require("./logger");
const conversation_1 = require("./conversation");
const id_1 = require("./id");
const run_1 = require("./run");
function retort(chatFunction) {
    let retortId = (0, id_1.id)("retort");
    let _run = (...values) => {
        const conversation = new conversation_1.RetortConversation();
        async function runInner() {
            return chatFunction(conversation, ...values);
        }
        let executing = runInner();
        let scriptInProgress = {
            retortId: retortId,
            $: conversation,
            completionPromise: executing,
        };
        return scriptInProgress;
    };
    let returnedModule = {
        retortId: retortId,
        retortHash: (0, logger_1.createHash)(chatFunction.toString()),
        _run: _run,
        retortType: "retort",
    };
    const silent = process.argv.includes("--silent");
    // Only run the chat function if this module is the main module.
    setTimeout(() => {
        if (returnedModule.retortId === require.main?.exports?.retortId) {
            (0, run_1.run)(returnedModule, null, { shouldSaveToLog: !silent });
        }
    }, 0);
    return returnedModule;
}
exports.retort = retort;

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.run = void 0;
const conversation_1 = require("./conversation");
const logger_1 = require("./logger");
const defaultRunOptions = {
    shouldSaveToLog: true,
    shouldUseCache: false,
};
async function run(promiseOrRetort, params = null, options = defaultRunOptions) {
    let retort;
    if (promiseOrRetort instanceof Promise) {
        const script = await promiseOrRetort;
        retort = script.default;
    }
    else {
        retort =
            promiseOrRetort?.default ?? promiseOrRetort;
    }
    options = { ...defaultRunOptions, ...options };
    const retortInProgress = retort._run();
    const awaitedCompletionPromise = await retortInProgress.completionPromise;
    if (!options.shouldSaveToLog) {
        return awaitedCompletionPromise;
    }
    if (!awaitedCompletionPromise) {
        const resolvedRetort = await retortInProgress;
        const messages = await Promise.all(resolvedRetort.$.messagePromises);
        const { id, settings } = resolvedRetort.$;
        (0, logger_1.logScript)(retort.retortHash, { id, settings, messages });
        return awaitedCompletionPromise;
    }
    if (awaitedCompletionPromise instanceof conversation_1.RetortConversation) {
        await Promise.all(awaitedCompletionPromise.messagePromises);
    }
    (0, logger_1.logScript)(retort.retortHash, awaitedCompletionPromise);
    return awaitedCompletionPromise;
}
exports.run = run;

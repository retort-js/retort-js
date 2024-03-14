"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.agent = exports.RetortAgent = void 0;
const define_generation_1 = require("./define-generation");
const define_input_1 = require("./define-input");
const define_prompt_1 = require("./define-prompt");
const extendable_function_1 = require("./extendable-function");
class RetortAgent extends extendable_function_1.RetortExtendableFunction {
    __wrappedFunction(value0, ...values) {
        return this.prompt(value0, ...values);
    }
    constructor(conversation, role) {
        super();
        this.conversation = conversation;
        this.role = role;
    }
    get input() {
        return (0, define_input_1.defineInput)(this.conversation, this.role, true);
    }
    ;
    get generation() {
        return (0, define_generation_1.defineGeneration)(this.conversation, this.role, true);
    }
    get prompt() {
        return (0, define_prompt_1.definePrompt)(this.conversation, this.role, true);
    }
}
exports.RetortAgent = RetortAgent;
function agent(conversation, role) {
    return new RetortAgent(conversation, role);
}
exports.agent = agent;

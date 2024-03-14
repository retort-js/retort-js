"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RetortConversation = void 0;
const agent_1 = require("./agent");
const message_1 = require("./message");
const id_1 = require("./id");
const extendable_function_1 = require("./extendable-function");
const define_input_1 = require("./define-input");
const define_generation_1 = require("./define-generation");
const define_prompt_1 = require("./define-prompt");
const run_1 = require("./run");
class RetortConversation extends extendable_function_1.RetortExtendableFunction {
    constructor() {
        super(...arguments);
        this.id = (0, id_1.id)("cnv");
        this.chat = this;
        this.messagePromises = [];
        this.settings = {
            model: "gpt-3.5-turbo",
            temperature: 1,
            topP: 1,
        };
        this.run = run_1.run;
        this.user = (0, agent_1.agent)(this, "user");
        this.assistant = (0, agent_1.agent)(this, "assistant");
        this.system = (0, agent_1.agent)(this, "system");
    }
    get __wrappedFunction() {
        return this.prompt;
    }
    get model() {
        return this.settings.model;
    }
    set model(value) {
        this.settings.model = value;
    }
    get temperature() {
        return this.settings.temperature;
    }
    set temperature(value) {
        this.settings.temperature = value;
    }
    get topP() {
        return this.settings.topP;
    }
    set topP(value) {
        this.settings.topP = value;
    }
    get messages() {
        for (let m of this.messagePromises) {
            console.log("messagePromises", m, this.messagePromises);
            if (!(m instanceof message_1.RetortMessage)) {
                throw new Error("Cannot access messages until all promises have resolved.");
            }
        }
        return this.messagePromises;
    }
    get input() {
        return (0, define_input_1.defineInput)(this, "user", false);
    }
    ;
    get generation() {
        return (0, define_generation_1.defineGeneration)(this, "assistant", false);
    }
    get prompt() {
        return (0, define_prompt_1.definePrompt)(this, "user", false);
    }
    toObject(messages = this.messages) {
        return {
            id: this.id,
            settings: this.settings,
            messages,
        };
    }
    // TODO: not sure this is right as we're losing the original id
    static fromObject(obj) {
        const conversation = new RetortConversation();
        conversation.settings = obj.settings;
        conversation.messagePromises.push(...obj.messages);
        return conversation;
    }
}
exports.RetortConversation = RetortConversation;

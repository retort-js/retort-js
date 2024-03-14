"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.openAiChatCompletion = void 0;
const openai_1 = __importDefault(require("openai"));
async function* openAiChatCompletion(settings, messagePromises) {
    const openai = new openai_1.default({
        apiKey: process.env["OPENAI_API_KEY"],
    });
    let messages = [];
    for await (let m of messagePromises) {
        messages.push({
            content: m.content,
            role: m.role,
        });
    }
    const chatCompletion = await openai.chat.completions.create({
        messages: messages,
        model: settings.model,
        frequency_penalty: undefined,
        function_call: undefined,
        functions: undefined,
        logit_bias: undefined,
        logprobs: undefined,
        max_tokens: undefined,
        n: undefined,
        presence_penalty: undefined,
        response_format: undefined,
        seed: undefined,
        stop: undefined,
        stream: true,
        temperature: settings.temperature,
        tool_choice: undefined,
        tools: undefined,
        top_logprobs: undefined,
        top_p: settings.topP,
        user: undefined,
    });
    let content = "";
    // if (!isSteaming) {
    //     if (!chatCompletion.choices[0]) {
    //         throw new Error('OpenAI returned no choices');
    //     }
    //     let content = chatCompletion.choices[0].message.content;
    //     if (content === null || content === undefined) {
    //         throw new Error('OpenAI returned null or undefined content');
    //     }
    //     return content
    // }
    for await (const chunk of chatCompletion) {
        const content = chunk.choices[0]?.delta?.content || "";
        yield content;
    }
}
exports.openAiChatCompletion = openAiChatCompletion;

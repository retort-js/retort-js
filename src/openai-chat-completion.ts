import OpenAI from 'openai';
import { RetortConfiguration } from './agent';
import { RetortMessage as RetortMessage } from './message';
import { ChatCompletionMessageParam } from 'openai/resources/chat/index';

export async function openAiChatCompletion(config: RetortConfiguration, messagePromises: (RetortMessage | Promise<RetortMessage>)[]) {
    const openai = new OpenAI({
        apiKey: process.env["OPENAI_API_KEY"],
    });

    let messages = [] as ChatCompletionMessageParam[];

    for await (let m of messagePromises) {
        messages.push({
            content: m.content,
            role: m.role,
        });
    }

    const chatCompletion = await openai.chat.completions.create({
        messages: messages,

        model: config.model,
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
        stream: undefined,
        temperature: undefined,

        tool_choice: undefined,
        tools: undefined,
        top_logprobs: undefined,
        top_p: undefined,
        user: undefined,
    });

    if (!chatCompletion.choices[0]) {
        throw new Error('OpenAI returned no choices');
    }

    let role = config.role || chatCompletion.choices[0].message.role;
    let content = chatCompletion.choices[0].message.content;

    if (content === null || content === undefined) {
        throw new Error('OpenAI returned null or undefined content');
    }

    return new RetortMessage({ role, content })
}
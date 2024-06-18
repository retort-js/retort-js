import OpenAI from "openai";
import { RetortSettings } from "./agent";
import { RetortMessage as RetortMessage } from "./message";
import { ChatCompletionMessageParam } from "openai/resources/chat/index";
import { RetortGenerationOptions } from "./define-generation";
import { retortSchemaToJsonSchema } from "./tooling";

export async function* openAiChatCompletion(
  settings: RetortSettings & Partial<RetortGenerationOptions<any>>,
  messagePromises: Promise<RetortMessage>[]
) {
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


  let body: OpenAI.Chat.Completions.ChatCompletionCreateParamsStreaming = {

    messages: messages,

    model: settings.model.toString(),
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
  };

  if (settings.parameters) {
    var parameters = retortSchemaToJsonSchema(settings.parameters);
    var tool = {
      type: "function",
      function: {
        name: settings.name ?? "answer",
        description: settings.description,
        parameters: parameters as any,
      }

    } as OpenAI.Chat.Completions.ChatCompletionTool;
    
    body.tools = [tool];
    body.tool_choice = { type: "function", function: { name: tool.function.name } };
  }

  const chatCompletion = await openai.chat.completions.create(body);

  let content = "";

  //     if (!chatCompletion.choices[0]) {
  //         throw new Error('OpenAI returned no choices');
  //     }

  //     let content = chatCompletion.choices[0].message.content;

  //     if (content === null || content === undefined) {
  //         throw new Error('OpenAI returned null or undefined content');
  //     }

  //     return content
  for await (const chunk of chatCompletion) {
    const contentDelta = chunk.choices[0]?.delta?.content
      ??
      ((chunk.choices[0]?.delta?.tool_calls ?? [])[0]?.function?.arguments)
      ?? "";
    content += contentDelta
    yield { content, contentDelta };
  }
}

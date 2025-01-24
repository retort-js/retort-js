import OpenAI from "openai";
import { RetortSettings } from "./agent";
import { RetortMessage as RetortMessage } from "./message";
import { ChatCompletionMessageParam } from "openai/resources/chat/index";
import { RetortParamaterization } from "./define-generation";
import { retortSchemaToJsonSchema } from "./tooling";

export async function* openAiChatCompletion(
  settings: RetortSettings & Partial<RetortParamaterization<any>>,
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

  const commonOptions = {
    model: settings.model.toString(),
    messages,
    temperature: settings.temperature,
    max_tokens: settings.maxTokens,
    top_p: settings.topP,
  };

  // Default to streaming if not specified
  if (settings.stream !== false) {
    const stream = await openai.chat.completions.create({
      ...commonOptions,
      stream: true,
    });

    let content = "";
    for await (const part of stream) {
      const contentDelta = part.choices[0]?.delta?.content || "";
      content += contentDelta;
      yield {
        content,
        contentDelta,
        promptTokens: part.usage?.prompt_tokens,
        completionTokens: part.usage?.completion_tokens,
        totalTokens: part.usage?.total_tokens,
      };
    }
  } else {
    const response = await openai.chat.completions.create({
      ...commonOptions,
      stream: false,
    });
    
    const content = response.choices[0]?.message?.content || "";
    yield {
      content,
      contentDelta: content,
      promptTokens: response.usage?.prompt_tokens,
      completionTokens: response.usage?.completion_tokens,
      totalTokens: response.usage?.total_tokens,
    };
  }
}

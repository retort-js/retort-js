import Anthropic from '@anthropic-ai/sdk';
import { RetortSettings } from "./agent";
import { RetortMessage as RetortMessage } from "./message";

export async function* claudeChatCompletion(
  settings: RetortSettings,
  messagePromises: Promise<RetortMessage>[]
) {
  const anthropic = new Anthropic({
    apiKey: process.env['ANTHROPIC_API_KEY'],
  });

  let system = undefined as string | undefined;
  let messages = [] as { content: string, role: "user" | "assistant" }[];
  
  for await (let m of messagePromises) {
    messages.push({
      content: m.content,
      role: m.role === "assistant" ? "assistant" : "user",
    });
  }
  
  if (messages[0]?.role === "user" && messages[0].content.startsWith("system:")) {
    system = messages[0].content.substring(7);
    messages = messages.slice(1);
  }

  const commonOptions = {
    messages,
    max_tokens: settings.maxTokens ?? 4096,
    temperature: settings.temperature,
    top_p: settings.topP,
    model: settings.model.toString(),
    system,
  };

  // Only stream if explicitly set to true
  if (settings.stream === true) {
    const stream = anthropic.messages.stream(commonOptions);
    let content = "";
    for await (const chunk of stream) {
      if (chunk.type === "content_block_delta") {
        const contentDelta = chunk.delta.text || "";
        content += contentDelta;
        yield { content, contentDelta };
      }
    }
  } else {
    const response = await anthropic.messages.create(commonOptions);
    if (response.content[0]) {
      const content = response.content[0].text;
      yield { content, contentDelta: content };
    }
    else {
      throw new Error("Response content is empty.");
    }

  }
}
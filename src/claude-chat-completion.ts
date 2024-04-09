import Anthropic from '@anthropic-ai/sdk';



import { RetortSettings } from "./agent";
import { RetortMessage as RetortMessage } from "./message";

export async function* claudeChatCompletion(
  settings: RetortSettings,
  messagePromises: Promise<RetortMessage>[]
) {
  const anthropic = new Anthropic({
    apiKey: process.env['ANTHROPIC_API_KEY'], // This is the default and can be omitted
  });;


  let system = undefined as string | undefined;
  let messages = [] as { content: string, role: string }[];
  
  for await (let m of messagePromises) {
    messages.push({
      content: m.content,
      role: m.role,
    });
  }
  
  if (messages[0]?.role === "system") {
    system = messages[0].content;
    messages = messages.slice(1);
  }


  const stream = anthropic.messages.stream({
    messages: messages.map(m => ({content: m.content, role: m.role === "assistant" ? "assistant" : "user"})),
    max_tokens: settings.maxTokens ?? 4096,
    temperature: settings.temperature,
    top_p: settings.topP,
    model: settings.model,
    system,

    
  });

  let content = "";
  for await (const chunk of stream) {
    if (chunk.type === "content_block_delta") {
      const contentDelta = chunk.delta.text || "";
      yield { content, contentDelta };
      content += contentDelta;
    }
  }
}
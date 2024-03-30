import { RetortSettings, RetortRole } from "./agent";
import { RetortConversation } from "./conversation";
import { logMessage } from "./log-message";
import { RetortMessage } from "./message";
import { openAiChatCompletion } from "./openai-chat-completion";
import teeAsync from "./tee-async";

export class RetortMessagePromise extends Promise<RetortMessage> implements RetortMessage {
  stream: AsyncGenerator<string, void, unknown>;
  protected _message: RetortMessage | null = null;
  id: string;
  role: RetortRole;

  get content(): string {
    if (!this._message) {
      throw new Error("Message not yet resolved.");
    }
    return this._message.content;
  }

  constructor({ role, id, promise, stream }: { id: string, role: RetortRole, promise: Promise<RetortMessage>, stream: AsyncGenerator<string, void, unknown> }) {
    super((resolve, reject) => {
      promise.then((message) => {
        this._message = message;
        resolve(message);
      }, (error) => {
        reject(error);
      });
    });

    this.id = id;
    this.role = role;
    this.stream = stream;

  }
}

export function defineGeneration(
  conversation: RetortConversation,
  role: RetortRole,
  push: boolean
) {
  return function generation(generationSettings?: Partial<RetortSettings>) {
    let streams = conversation.messagePromises.slice(0);

    let streamGenerator = teeAsync(
      openAiChatCompletion(conversation.settings, streams)
    );

    let internalStream = streamGenerator[0];
    let exposedStream = streamGenerator[1];

    let id = RetortMessage.createId();

    async function messagePromise() {
      let content = "";
      for await (const chunk of internalStream) {
        content += chunk;
      }

      let message = new RetortMessage({ id, role, content });
      return message;
    }

    let retortMessagePromise = new RetortMessagePromise({ promise: messagePromise(), id, role, stream: exposedStream })


    retortMessagePromise.stream = exposedStream;

    if (push) {
      conversation.messagePromises.push(retortMessagePromise);
    }

    retortMessagePromise.then((message) => {
      logMessage(message);
    });

    return retortMessagePromise;
  };
}

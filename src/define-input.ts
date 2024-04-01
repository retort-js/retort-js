import { resolve } from "path";
import { RetortInputSettings, RetortRole } from "./agent";
import { RetortConversation } from "./conversation";
import { id } from "./id";
import { logMessage } from "./log-message";
import { RetortMessage } from "./message";
import readline from "readline";

export const inputStore = new Map<string, (value: string) => void>();

class RetortInputMessage extends RetortMessage {
  inputId: string;
  retortType: "inputMessage";
  inputQuery?: string;

  constructor(options: { inputId: string, inputQuery?:string, role: RetortRole, promise: Promise<string> }) {
    super(options);
    this.inputId = options.inputId;
    this.retortType = "inputMessage";
    this.inputQuery = options.inputQuery;
    (this.promise as any).inputId = options.inputId;
    (this.promise as any).retortType = "inputPromise";
    (this.promise as any).inputQuery = options.inputQuery;

  }
}

export function defineInput(
  conversation: RetortConversation,
  role: RetortRole,
  push: boolean
) {
  return function input(inputSettings?: Partial<RetortInputSettings>) {
    const inputId = id("input");
    const inputQuery = inputSettings?.query;

    let fromExternal = new Promise<string>((resolve) => {
      inputStore.set(inputId, (content: string) => {
        resolve(content);
      });
    });

    let fromConsole = askQuestion((inputQuery ??  "input:").trim() + " ", fromExternal);

    let contentPromise = Promise.race([fromConsole, fromExternal]);

    if (push) {
      let message = new RetortInputMessage({ inputId, inputQuery, role, promise: contentPromise });
      conversation.messages.push(message);
      message.promise.then((m) => logMessage(m));
    }

    return contentPromise;
  };
}

function askQuestion(
  query: string,
  answeredElsewhere: Promise<string>
): Promise<string> {
  let hasBeenCleanedUp = false;

  function cleanupConsole(linesToCleanUp = 1) {
    if (!hasBeenCleanedUp) {
      hasBeenCleanedUp = true;
      readline.moveCursor(process.stdout, 0, -linesToCleanUp);
      readline.clearScreenDown(process.stdout);
      rl.close();
    }
  }

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  var resolved = false;

  return new Promise((resolve) => {
    answeredElsewhere.then((ans) => {
      if (!resolved) {
        resolved = true;
        cleanupConsole(1);

        resolve(ans);
      }
    });

    rl.question("\n" + query, (ans) => {
      if (!resolved) {
        resolved = true;
        cleanupConsole(2);

        resolve(ans);
      }
    });
  });
}

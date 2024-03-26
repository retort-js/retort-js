import { resolve } from "path";
import { RetortInputSettings, RetortRole } from "./agent";
import { RetortConversation } from "./conversation";
import { id } from "./id";
import { logMessage } from "./log-message";
import { RetortMessage } from "./message";
import readline from "readline";

export const inputStore = new Map<string, (value: string) => void>();

export interface RetortInputPromise extends Promise<RetortMessage> {
  inputId: string;
  retortType: "inputPromise";
  inputQuery?: string;
}


export function defineInput(
  conversation: RetortConversation,
  role: RetortRole,
  push: boolean
) {
  return function input(inputSettings?: Partial<RetortInputSettings>) {
    const inputId = id("input");
    const inputQuery = inputSettings?.query;

    let fromExternal = new Promise<RetortMessage>((resolve) => {
      inputStore.set(inputId, (value: string) => {
        resolve(new RetortMessage({ role, content: value }));
      });
    });

    let fromConsole = askQuestion((inputQuery ??  "input:").trim() + " ", fromExternal).then((content) => {
      return new RetortMessage({ role, content });
    });

    let m = Promise.race([fromConsole, fromExternal]) as RetortInputPromise;
    m.inputId = inputId;
    m.retortType = "inputPromise"
    m.inputQuery = inputQuery;

    if (push) {
      conversation.messagePromises.push(m);
      m.then((m) => logMessage(m));
    }

    return m;
  };
}

function askQuestion(
  query: string,
  answeredElsewhere: Promise<RetortMessage>
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
    answeredElsewhere.then((ans: RetortMessage) => {
      if (!resolved) {
        resolved = true;
        cleanupConsole(1);

        resolve(ans.content);
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

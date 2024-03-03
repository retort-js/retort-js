import { RetortSettings, RetortRole } from "./agent";
import { RetortConversation } from "./conversation";
import { logMessage } from "./log-message";
import { RetortMessage } from "./message";
import readline from "readline";


export function defineInput(conversation: RetortConversation, role: RetortRole, push: boolean) {


  return function input(inputSettings?: Partial<RetortSettings>) {
    let m = askQuestion("input: ").then(content => {
      return new RetortMessage({ role, content });
    });

    if (push) {
      conversation.messagePromises.push(m);
      m.then(m => logMessage(m));
    }

    return m;
  }
}


function askQuestion(query: string): Promise<string> {

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise(resolve => {


    return rl.question("\n" + query, ans => {
      readline.moveCursor(process.stdout, 0, -2);
      readline.clearScreenDown(process.stdout);

      rl.close();

      resolve(ans);
    })
  });
}
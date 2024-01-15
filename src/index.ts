import { OpenAiCompletionAgent } from "./open-ai-completion-agent";

let user = new OpenAiCompletionAgent({ role: "user" });

user.message`Hello, I'm a user.${{}}`
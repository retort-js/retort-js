import { Agent } from "./open-ai-completion-agent";

let user = new Agent({ role: "user" });

user.message`Hello, I'm a user.${{}}`
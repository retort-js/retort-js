import { Conversation } from "../dist/index.js";

let { chat, user, assistant, system } = new Conversation();

assistant`Hello, what programming language or framework can I help you with?`;

let language = await user.input({query: "Choose a language: "});

system`You are 'Retorter', an AI that is an expert in ${language.content}. You respond in code unless asked to explain. If the user wishes to end the conversation, say "DONE" in all caps.`;

let reply;

do {
  await user.input();

  reply = await assistant.generation();
} while (!reply.content.includes("DONE"));

process.exit(0);

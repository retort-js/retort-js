import { Agent } from "./agent";

let user = new Agent({ role: "user" });

user.message`Hello, I'm a user.${{}}`
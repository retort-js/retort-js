import { RetortMessage } from "./message";

export function logMessage(message: RetortMessage) {
  let color = "";
  switch (message.role) {
    case "user":
      color = "\x1b[34m"; // Blue
      break;
    case "assistant":
      color = "\x1b[32m"; // Green
      break;
    case "system":
      color = "\x1b[33m"; // Yellow
      break;
    default:
      color = "\x1b[0m"; // Reset
  }
  const resetColor = "\x1b[0m";
  const contentColor = "\x1b[37m"; // White
  const commentColor = "\x1b[90m"; // Gray
  let tokenComment = "";
  if (message.promptTokens && message.completionTokens && message.totalTokens) {
    tokenComment = ` ${commentColor}// ${message.promptTokens} prompt tokens, ${message.completionTokens} completion tokens, ${message.totalTokens} total tokens`;
  }
  console.log(
    `\n$.${color}${message.role}${resetColor} ${contentColor}\`${message.content}\`${tokenComment}${resetColor}`
  );
}

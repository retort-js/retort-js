import crypto from "crypto";
import fs from "fs";
import path from "path";
import {
  RetortConversation,
  type SerializableRetortConversation,
} from "./conversation";
import { RetortMessage } from "./message";

const isSerializableRetortConversation = (
  obj: any
): obj is SerializableRetortConversation => {
  const isMessageValid = (message: any) => {
    return (
      typeof message === "object" &&
      typeof message.content === "string" &&
      typeof message.id === "string" &&
      (message.role === "assistant" ||
        message.role === "user" ||
        message.role === "system")
    );
  };

  const isSettingsValid = (settings: any) => {
    return (
      typeof settings === "object" &&
      typeof settings.model === "string" &&
      typeof settings.temperature === "number" &&
      typeof settings.topP === "number"
    );
  };

  return (
    obj != null &&
    typeof obj.id === "string" &&
    typeof obj.settings === "object" &&
    isSettingsValid(obj.settings) &&
    Array.isArray(obj.messages) &&
    obj.messages.every(isMessageValid)
  );
};

const createHash = (string: string) => {
  const hash = crypto.createHash("sha256");
  hash.update(string);
  return hash.digest("hex");
};

const getFilePathToLog = () => {
  return path.join(process.cwd(), ".retort-data/log");
};

const tryGetFromLog = (hash: string) => {
  const retortFolder = getFilePathToLog();

  if (!fs.existsSync(retortFolder)) {
    fs.mkdirSync(retortFolder, { recursive: true });
  }

  const filePath = path.join(retortFolder, hash);

  if (fs.existsSync(filePath)) {
    const deserialized = JSON.parse(fs.readFileSync(filePath, "utf8"));

    if (isSerializableRetortConversation(deserialized)) {
      return RetortConversation.fromObject(deserialized);
    }

    return deserialized;
  }

  return undefined;
};

const logScript = async (hash: string, obj: any) => {
  const retortDataDir = getFilePathToLog();

  if (!fs.existsSync(retortDataDir)) {
    fs.mkdirSync(retortDataDir, { recursive: true });
  }

  const filePath = path.join(retortDataDir, hash);


  if (obj instanceof RetortConversation) {
    await Promise.all(obj.messages.map((m) => m.promise));
  } else if (obj instanceof RetortMessage) {
    await obj.promise;
  }

  try {
    var serializedMessages = JSON.stringify(obj, null, 2);
  }
  catch (err) {
    serializedMessages = JSON.stringify({ $error: "Retort Serialization Error: " + ((err as any)?.message ?? err) }, null, 2);
  }
  

  fs.writeFile(filePath, serializedMessages, (err) => {
    if (err) {
      throw new Error(err.message);
    }
    console.log("Successfully saved to the log!");
  });

  return serializedMessages;
};

export { createHash, tryGetFromLog, logScript };

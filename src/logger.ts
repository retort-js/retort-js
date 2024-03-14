import crypto from "crypto";
import fs from "fs";
import path from "path";
import {
  RetortConversation,
  type SerializableRetortConversation,
} from "./conversation";

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

const logScript = (hash: string, obj: any) => {
  const retortDataDir = getFilePathToLog();

  if (!fs.existsSync(retortDataDir)) {
    fs.mkdirSync(retortDataDir, { recursive: true });
  }

  const filePath = path.join(retortDataDir, hash);

  let serializedMessages = "";

  if (obj instanceof RetortConversation) {
    serializedMessages = JSON.stringify(obj.toObject(), null, 2);
  } else {
    try {
      serializedMessages = JSON.stringify(obj, null, 2);
    } catch (e) {
      console.error("Error serializing script", e);
      throw new Error("Error serializing script");
    }
  }

  fs.writeFile(filePath, serializedMessages, (err) => {
    if (err) {
      throw new Error(err.message);
    }
    console.log("The file has been saved!");
  });

  return serializedMessages;
};

export { createHash, tryGetFromLog, logScript };

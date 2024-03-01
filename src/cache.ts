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
  return (
    obj != null &&
    typeof obj.id === "string" &&
    typeof obj.settings === "object" &&
    Array.isArray(obj.messages)
  );
};

const createHash = (string: string) => {
  const hash = crypto.createHash("sha256");
  hash.update(string);
  return hash.digest("hex");
};

const getFilePathToCache = () => {
  return path.join(process.cwd(), ".retort-data/cache");
};

const tryGetFromCache = (hash: string) => {
  const retortFolder = getFilePathToCache();

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

const saveToCache = (hash: string, obj: any) => {
  const retortFolder = getFilePathToCache();

  if (!fs.existsSync(retortFolder)) {
    fs.mkdirSync(retortFolder);
  }

  const filePath = path.join(retortFolder, hash);

  let serializedMessages = "";

  if (obj instanceof RetortConversation) {
    serializedMessages = JSON.stringify(obj.toObject(), null, 2);
  } else {
    serializedMessages = JSON.stringify(obj, null, 2);
  }

  // Write the serialized array a file in the .retort folder
  fs.writeFile(filePath, serializedMessages, (err) => {
    if (err) {
      throw new Error(err.message);
    }
    console.log("The file has been saved!");
  });

  return serializedMessages;
};

export { createHash, tryGetFromCache, saveToCache };

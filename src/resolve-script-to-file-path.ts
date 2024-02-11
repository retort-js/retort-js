import fs from "fs";
import path from "path";
import { getRetortDir } from "./get-retort-dir";

export async function resolveScriptToFilePath(scriptName: string) {

  if (!scriptName) {
    throw new Error("No script name provided");
  }

  let retortExtensions = [".rt.js", ".rtm.js", ".rtm.mjs", ".rtm.cjs",];

  let scriptNameSpecifiesKnownRetortExtension = retortExtensions.some((ext) => scriptName.endsWith(ext));

  let placesToCheck = [scriptName, ...retortExtensions.map((ext) => scriptName + ext)]

  if (scriptNameSpecifiesKnownRetortExtension) {
    placesToCheck = [scriptName];
  }

  let pathsToCheck = placesToCheck.map((place) => path.join(getRetortDir(), place));

  
  // Check if each one exists asynchonously.
  let extantScriptPaths = (await Promise.all(pathsToCheck.map(async (fullPath) => {
    let exists = await fs.promises
      .access(fullPath, fs.constants.F_OK)
      .then(() => true)
      .catch(() => false);
    return exists ? fullPath : null;
  }
  ))).filter((x) => x !== null);

  if (!extantScriptPaths.length) {
    throw new Error(`No script found at any of these paths: ${pathsToCheck.join(", ")}`);
  }

  if (extantScriptPaths.length > 1) {
    throw new Error(`Multiple scripts found at these paths: ${extantScriptPaths.join(", ")}`);
  }

  return extantScriptPaths[0];


}


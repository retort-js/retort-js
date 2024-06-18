import { RetortSettings, RetortRole } from "./agent";
import createStreamCloner from "./create-stream-cloner";
import { id } from "./id";

export interface RetortMessageData {
  content: string;
}

export interface RetortMessagePromise extends Promise<RetortMessage> {
  id: string;
  role: RetortRole;
  message: RetortMessage;
  getStream(): AsyncGenerator<{ contentDelta: string, content: string }>;

  /*
  * @deprecated
  * @see getStream
  */
  stream: AsyncGenerator<string>;
}


export class RetortMessage {
  readonly id: string;
  readonly role: RetortRole;
  readonly promise: RetortMessagePromise;
  private _data: null | { content: string } = null;

  get content() {
    if (this._data === null) {
      throw new Error("Message not yet resolved; To fix this, you can await message.promise");
    }
    return this._data.content;
  }

  static createId() {
    return id("msg");
  }

  private static async* createStreamFromPromise(promise: Promise<RetortMessage>) {
    yield { content: (await promise).content, contentDelta: (await promise).content };
  }

  constructor(options: { id?: string, role: RetortRole } & ({ content: string } | { stream: AsyncGenerator<{ content: string, contentDelta: string }> } | { promise: Promise<string> })) {
    this.id = options.id || RetortMessage.createId();
    this.role = options.role;
    if ("content" in options) {
      this._data = { content: options.content };
      this.promise = Promise.resolve(this) as any as RetortMessagePromise;
      this.promise.getStream = async function* () {
        yield { content: options.content, contentDelta: options.content };
        return;
      };
    }
    else if ("stream" in options) {
      let content = "";

      let getStream = createStreamCloner(options.stream);

      this.promise = (async () => {
        for await (const chunk of getStream()) {
          content += chunk.contentDelta;
        }
        this._data = { content };
        return this;
      })() as any as RetortMessagePromise;

      this.promise.getStream = getStream;

    }
    else if ("promise" in options) {
      this.promise = options.promise.then((content) => {
        this._data = { content };
        return this;
      }) as any as RetortMessagePromise;
      let promise = this.promise;
      this.promise.getStream = async function* () {
        yield { content: (await promise).content, contentDelta: (await promise).content };
        return;
      };

    }
    else {
      throw new Error("Invalid options passed to RetortMessage constructor; must include either 'content' or 'stream'");
    }

    this.promise.id = this.id;
    this.promise.role = this.role;
    this.promise.message = this;
    let stream = this.promise.getStream();
    this.promise.stream = (async function* () {
      for await (let chunk of stream) {
        yield chunk.content;
      }

    })();
  }

  toString() {
    return this.content;
  }
  
  toJSON() {
    return {
      id: this.id,
      role: this.role,
      content: this.content,
    };
  }

}

export type RetortValue =
  | string
  | number
  | boolean
  | null

type ToStringable<T> = Exclude<("toString" extends keyof T ? (T["toString"] extends () => string ? T : never) : never), Symbol>;

export type RetortValueArray<T extends any[]> = { [K in keyof T]: RetortValue | ToStringable<T[K]> };

export function templateContent<T extends any[]>(
  templateStrings: TemplateStringsArray,
  ...values: RetortValueArray<T>
): string {
  // Get the strings in raw form.
  let strings = templateStrings.raw.map((x) => x);

  // Remove carriage returns from strings.
  strings = strings.map((str) => str.replace(/\r/g, ""));

  // Remove any whitespace at the start of a line in each of the strings - except that which is explicitly specified.
  strings = strings.map((str) => str.replace(/\n[^\S\r\n]+/g, "\n"));

  // Remove any whitespace at the end of a line in each of the strings - except that which is explicitly specified.
  strings = strings.map((str) => str.replace(/[^\S\r\n]+\n/g, "\n"));

  // Allow line continuations. TODO: Allow line continuations with an even number of preceding backslashes.
  strings = strings.map((str) => str.replace(/(?<!\\)((?:\\\\)*)\\\n/g, "$1"));

  // Remove leading whitespace from the first string, if any.
  strings[0] = (strings[0] || "").trimStart();

  // Remove trailing whitespace from the last string, if any.
  strings[strings.length - 1] = (strings[strings.length - 1] || "").trimEnd();

  // Now, finally, encode the strings.
  strings = strings.map((str) => unescape(str));

  let content = strings[0] || "";

  for (let i = 1, l = strings.length; i < l; i++) {
    let currentValue = values[i - 1];

    let insertion = retortValueToString(currentValue);

    content += insertion;

    content += strings[i] || "";
  }

  return content;
}

function retortValueToString(currentValue: RetortValue | any) {
  let insertion = "";

  if (currentValue === null) {
    insertion = "";
  } else if (typeof currentValue === "number") {
    insertion = currentValue.toString();
  } else if (typeof currentValue === "string") {
    insertion = currentValue;
  } else if (typeof currentValue === "boolean") {
    insertion = currentValue.toString();
  } else if (typeof currentValue === "object") {

    if (currentValue.toString === {}.toString) {
      // Check if the object is thenable
      if (currentValue.then && typeof currentValue.then === "function") {
        throw new Error("Promise passed to retort template. Use 'await' on the promise.");
      }
      else
      {
        throw new Error("Plain object passed to retort template. If you want to see the object, you should use JSON.stringify.");
      }
      
    }

    insertion = currentValue.toString();

  } else if (currentValue === undefined) {
    throw new Error("Undefined passed to retort template");
  } else if (typeof currentValue === "function") {
    throw new Error("Function passed to retort template");
  } else if (typeof currentValue === "symbol") {
    throw new Error("Symbol passed to retort template");
  } else if (typeof currentValue === "bigint") {
    throw new Error("BigInt not yet supported");
  } else {
    throw new Error("Unsupported value inserted into template");
  }
  return insertion;
}

export function isTemplateStringsArray(
  templateStrings: TemplateStringsArray | unknown
): templateStrings is TemplateStringsArray {
  return (
    Array.isArray(templateStrings) &&
    Array.isArray((templateStrings as any).raw)
  );
}

export function unescape(str: string) {
  let segments = str
    .split(
      /(\\\x[a-fA-F0-9]{2}|\\\u[a-fA-F0-9]{4}|\\\u\{[a-fA-F0-9]{1,6}\}|\\.)/g
    )
    .filter((x) => x);
  return segments.map(unescapeSegment).join("");
}

export function unescapeSegment(str: string) {
  if (str.startsWith("\\")) {
    if (str[1] === "x") {
      // Use a regex to check that this is a valid escape sequence
      if (!/\\x[a-fA-F0-9][a-fA-F0-9]/.test(str)) {
        throw new Error(
          `Malformed Latin-1 escape sequence; should be like "\\x00"`
        );
      }

      return String.fromCharCode(parseInt(str.slice(2), 16));
    } else if (str[1] === "u") {
      if (str[2] === "{") {
        // Use a regex to check that this is a valid escape sequence
        if (!/\\u\{[a-fA-F0-9]{1,6}\}/.test(str)) {
          throw new Error(
            `Malformed unicode escape sequence; should be like "\\u{000000} or "\\u0000`
          );
        }

        return String.fromCodePoint(parseInt(str.slice(3, -1), 16));
      } else {
        // Use a regex to check that this is a valid escape sequence
        if (!/\\u[a-fA-F0-9]{4}/.test(str)) {
          throw new Error(
            `Malformed unicode escape sequence; should be like "\\u{000000} or "\\u0000`
          );
        }

        return String.fromCharCode(parseInt(str.slice(2, 6), 16));
      }
    } else if (str[1] === "n") {
      return "\n";
    } else if (str[1] === "r") {
      return "\r";
    } else if (str[1] === "t") {
      return "\t";
    } else if (str[1] === "\\") {
      return "\\";
    } else if (str[1] === "s") {
      // Special space escaping behaviour.
      return " ";
    } else {
      throw new Error(`Unsupported escape sequence: "${str}"`);
    }
  } else {
    return str;
  }
}

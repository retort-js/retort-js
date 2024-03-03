
// FunctionLiar removes "any" typing from inherited calls.
let FunctionLiar = Function as any as null;

export class RetortExtendableFunction extends FunctionLiar {

  // @ts-expect-error
  private apply(this: Function, thisArg: any, argArray?: any): any;

  // @ts-expect-error
  private readonly name: string

  // @ts-expect-error
  private call(this: Function, thisArg: any, ...argArray: any[]): any;

  // @ts-expect-error
  private bind(this: Function, thisArg: any, ...argArray: any[]): any;

  // @ts-expect-error
  private readonly length: number;

  private prototype: any;

  // Non-standard extensions
  private arguments: any;
  private caller: any;

  // @ts-expect-error
  private get constructor();

  // @ts-expect-error
  private toString();

  constructor() {
    function _retortFunctionWrapper(): any {
      const self = _retortFunctionWrapper as any;
      if (!self.__wrappedFunction) {
        throw new Error("RetortExtendableFunction: __wrappedFunction not defined")
      }
      return self.__wrappedFunction.apply(_retortFunctionWrapper, arguments);
    }

    const self = _retortFunctionWrapper as any;

    return Object.setPrototypeOf(self, new.target.prototype);
  }
}

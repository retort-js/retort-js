
// FunctionLiar removes "any" typing from inherited calls.
let FunctionLiar = Function as any as null;

export class RetortExtendableFunction extends FunctionLiar {

  // Hide all of the members of function so that they don't appear in intellisense.
  private apply: any;
  private name: any
  private call: any;
  private bind: any;
  private length: any;
  private prototype: any;
  private arguments: any;
  private caller: any;
  private toString: any;

  // @ts-ignore
  private get constructor(): any;


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

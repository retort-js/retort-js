
// FunctionLiar removes "any" typing from inherited calls.
let FunctionLiar = Function as any as typeof Object;

abstract class RetortExtendableFunction extends FunctionLiar {

  // @ts-expect-error
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

export { RetortExtendableFunction }
abstract class RetortExtendableFunction extends Function {

  // @ts-expect-error
  constructor() {
    function _retortFunctionWrapper(): any {
      const self = _retortFunctionWrapper as any;
      if (typeof self.__wrappedFunction !== "function") {
        throw new Error("RetortExtendableFunction: __wrappedFunction not a function");
      }
      return self.__wrappedFunction.apply(_retortFunctionWrapper, arguments);
    }

    const self = _retortFunctionWrapper as any;

    self.__wrappedFunction = 
    (() => { throw new Error("RetortExtendableFunction: __wrappedFunction not set") }) as any;


    return Object.setPrototypeOf(self, new.target.prototype);
  }
}


export { RetortExtendableFunction }
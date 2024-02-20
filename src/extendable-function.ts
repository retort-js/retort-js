export class RetortExtendableFunction extends Function {

  // @ts-expect-error
  protected _wrappedFunction: Function;

  // @ts-expect-error
  constructor(wrappedFunction?: Function) {
    function _retortFunctionWrapper(): any {
      const self = _retortFunctionWrapper as unknown as RetortExtendableFunction;
      if (typeof self._wrappedFunction !== "function") {
        throw new Error("RetortExtendableFunction: __wrappedFunction not a function");
      }
      return self._wrappedFunction.apply(_retortFunctionWrapper, arguments);
    }

    const self = _retortFunctionWrapper as unknown as RetortExtendableFunction;

    self._wrappedFunction = wrappedFunction ?? (() => { throw new Error("RetortExtendableFunction: __wrappedFunction not set") });


    return Object.setPrototypeOf(self, new.target.prototype);
  }
}
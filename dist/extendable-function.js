"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RetortExtendableFunction = void 0;
// TODO - remove "any" typing from inherited calls.
class RetortExtendableFunction extends Function {
    // @ts-expect-error
    constructor() {
        function _retortFunctionWrapper() {
            const self = _retortFunctionWrapper;
            if (!self.__wrappedFunction) {
                throw new Error("RetortExtendableFunction: __wrappedFunction not defined");
            }
            return self.__wrappedFunction.apply(_retortFunctionWrapper, arguments);
        }
        const self = _retortFunctionWrapper;
        return Object.setPrototypeOf(self, new.target.prototype);
    }
}
exports.RetortExtendableFunction = RetortExtendableFunction;

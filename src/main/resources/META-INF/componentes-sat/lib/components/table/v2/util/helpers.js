import isObject from "lodash/isObject";
import isFunction from "lodash/isFunction";

export function isPromise(obj) {
    return isObject(obj) && obj.then && isFunction(obj.then);
}

export function nothing() {
}
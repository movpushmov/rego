import {ComponentPrototype, InitializedComponentPrototype} from "./types";
import {dispatcher} from "../render/dispatcher";

export function getPrototype(): InitializedComponentPrototype {
    const component = dispatcher.lastComponentCalled

    if (!component) {
        throw new Error('Hook rules was broken.');
    }

    const prototype = component.prototype as ComponentPrototype

    if (!prototype.hooks) {
        prototype.lastHookId = 0;

        prototype.unmountHandlers = {};
        prototype.hooks = [];
    }

    return prototype as InitializedComponentPrototype;
}
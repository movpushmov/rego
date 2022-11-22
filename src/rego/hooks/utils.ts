import {ComponentPrototype, InitializedComponentPrototype} from "./types";
import {dispatcher} from "../render/dispatcher";

export function getPrototype(elementComponent?: Function): InitializedComponentPrototype {
    const component = elementComponent ? elementComponent : dispatcher.lastComponentCalled

    if (!component) {
        throw new Error('Hook rules was broken.');
    }

    const prototype = component.prototype as ComponentPrototype

    if (!prototype.regoMeta || !Object.values(prototype.regoMeta).length) {
        prototype.lastMetaId = 0;
        prototype.regoMeta = {
            0: {
                lastHookId: 0,

                unmountHandlers: {},
                hooks: [],
            }
        }
    }

    return prototype as InitializedComponentPrototype;
}

export function getMeta(elementComponent?: Function) {
    const prototype = getPrototype(elementComponent);
    const meta = prototype.regoMeta[prototype.lastMetaId];

    if (!meta) {
        prototype.regoMeta[prototype.lastMetaId] = {
            lastHookId: 0,

            unmountHandlers: {},
            hooks: [],
        }
    }

    return prototype.regoMeta[prototype.lastMetaId];
}
import {getPrototype} from "./utils";
import {DepsArray, EffectCallback, EffectCallbackResult, EffectType} from "./types";

export function useEffect(callback: EffectCallback, deps?: DepsArray) {
    const prototype = getPrototype();
    const hookId = prototype.lastHookId;

    prototype.lastHookId++;

    const oldDeps = prototype.hooks[hookId] as EffectType | undefined

    if (!deps && oldDeps || deps && oldDeps && deps.length !== oldDeps.length) {
        throw new Error('Rules of useEffect was broken.');
    }

    if (!oldDeps) {
        prototype.hooks[hookId] = deps;
        resolveCallback(callback, prototype.unmountHandlers, hookId);

        return;
    }

    if (!deps) {
        resolveCallback(callback, prototype.unmountHandlers, hookId);
        return;
    }

    if (!deps.length) {
        return;
    }

    for (let i = 0; i < deps.length; i++) {
        if (deps[i] !== oldDeps[i]) {
            resolveCallback(callback, prototype.unmountHandlers, hookId);
            break;
        }
    }
}

function resolveCallback(
    callback: EffectCallback,
    unmountHandlers: Record<number, Function>,
    lastHookId: number
) {
    new Promise<EffectCallbackResult>(resolve => {
        resolve(callback());
    }).then((res) => {
        if (res) {
            unmountHandlers[lastHookId] = res;
        } else {
            delete unmountHandlers[lastHookId];
        }
    })
}
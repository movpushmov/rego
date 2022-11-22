import {getMeta} from "./utils";
import {DepsArray, EffectCallback, EffectCallbackResult, EffectType} from "./types";

export function useEffect(callback: EffectCallback, deps: DepsArray | undefined) {
    const meta = getMeta();
    const hookId = meta.lastHookId;

    meta.lastHookId++;

    const oldDeps = meta.hooks[hookId] as EffectType | undefined

    if (!deps && oldDeps || (deps && oldDeps && typeof oldDeps !== 'boolean' && deps.length !== oldDeps.length)) {
        throw new Error('Rules of useEffect was broken.');
    }

    if (typeof oldDeps === 'boolean' || !deps) {
        resolveCallback(callback, meta.unmountHandlers, hookId);
        return;
    }

    if (!oldDeps) {
        meta.hooks[hookId] = deps ?? true;
        resolveCallback(callback, meta.unmountHandlers, hookId);

        return;
    }

    if (!deps.length) {
        return;
    }

    for (let i = 0; i < deps.length; i++) {
        if (deps[i] !== oldDeps[i]) {
            resolveCallback(callback, meta.unmountHandlers, hookId);
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
    });
}
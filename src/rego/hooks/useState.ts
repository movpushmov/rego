import {ComponentPrototype, DispatcherProps} from "./types";
import {update} from "../render/dom";
import {getPrototype} from "./utils";

type HookResult<T> = [T, (props: DispatcherProps<T>) => void]

export function useState<T>(value?: T): HookResult<T> {
    const prototype = getPrototype();
    const pair = prototype.hooks[prototype.lastHookId]

    if (pair) {
        prototype.lastHookId++;
        return pair as HookResult<T>
    } else {
        prototype.hooks[prototype.lastHookId] = [value, makeDispatcher<T>(prototype.lastHookId, prototype)]
    }

    prototype.lastHookId++;
    return prototype.hooks[prototype.lastHookId - 1] as HookResult<T>;
}

function makeDispatcher<T>(hookId: number, prototype: ComponentPrototype) {
    return (props: DispatcherProps<T>) => {
        const prevPair = prototype.hooks![hookId] as HookResult<T>;

        let res: T | null;
        res = 'call' in props ? props(prevPair[0]) : props;

        if (res !== prevPair[0]) {
            prevPair[0] = res;
            update();
        }
    }
}
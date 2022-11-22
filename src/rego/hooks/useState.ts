import {DispatcherProps} from "./types";
import {update} from "../render/dom";
import {getMeta} from "./utils";
import {ElementMeta} from "./types";

type HookResult<T> = [T, (props: DispatcherProps<T>) => void]

export function useState<T>(value?: T): HookResult<T> {
    const meta = getMeta();
    const pair = meta.hooks[meta.lastHookId];

    if (pair) {
        meta.lastHookId++;
        return pair as HookResult<T>
    } else {
        meta.hooks[meta.lastHookId] = [value, makeDispatcher<T>(meta.lastHookId, meta)]
    }

    meta.lastHookId++;
    return meta.hooks[meta.lastHookId - 1] as HookResult<T>;
}

function makeDispatcher<T>(hookId: number, meta: ElementMeta) {
    return (props: DispatcherProps<T>) => {
        const prevPair = meta.hooks![hookId] as HookResult<T>;

        let res: T | null;
        res = 'call' in props ? props(prevPair[0]) : props;

        if (res !== prevPair[0]) {
            prevPair[0] = res;
            update();
        }
    }
}
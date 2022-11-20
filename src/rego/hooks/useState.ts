import {dispatcher} from "../render/dispatcher";
import {ComponentPrototype, DispatcherProps} from "./types";
import {update} from "../render/dom";

type HookResult<T> = [T, (props: DispatcherProps<T>) => void]

export function useState<T>(value: T): HookResult<T> {
    const component = dispatcher.lastComponentCalled

    if (!component) {
        throw new Error('Hook rules was break.');
    }

    const prototype = component.prototype as ComponentPrototype

    if (!prototype.states || prototype.lastHookId === void 0) {
        prototype.lastHookId = 0;
        prototype.states = [];
    }

    const pair = prototype.states[prototype.lastHookId]

    if (pair) {
        prototype.lastHookId++;
        return pair as HookResult<T>
    } else {
        prototype.states[prototype.lastHookId] = [value, makeDispatcher<T>(prototype.lastHookId, prototype)]
    }

    prototype.lastHookId++;
    return prototype.states[prototype.lastHookId - 1] as HookResult<T>;
}

function makeDispatcher<T>(hookId: number, prototype: ComponentPrototype) {
    return (props: DispatcherProps<T>) => {
        const prevPair = prototype.states![hookId] as HookResult<T>;

        let res: T | null;
        res = 'call' in props ? props(prevPair[0]) : props;

        if (res !== prevPair[0]) {
            prevPair[0] = res;
            update();
        }
    }
}
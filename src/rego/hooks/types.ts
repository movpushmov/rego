export type EffectCallbackResult = (() => void) | void
export type EffectCallback = () => EffectCallbackResult
export type DepsArray = any[]

export type StateType = [unknown, DispatcherProps]
export type EffectType = DepsArray | boolean
export type CallbackType = [Function, DepsArray]

type HookType = StateType | EffectType | CallbackType

export type ElementMeta = {
    lastHookId: number
    hooks: HookType[]
    unmountHandlers: Record<number, Function>
}

export type ComponentPrototype = {
    lastMetaId?: number;
    regoMeta?: Record<number, ElementMeta>;
}

export type InitializedComponentPrototype = {
    lastMetaId: number;
    regoMeta: Record<number, ElementMeta>;
}

export type DispatcherProps<T = unknown> = T | ((prevValue: T) => T)
export type EffectCallbackResult = (() => void) | void
export type EffectCallback = () => EffectCallbackResult
export type DepsArray = any[]

export type StateType = [unknown, DispatcherProps]
export type EffectType = DepsArray | undefined
export type CallbackType = [Function, DepsArray]

type HookType = StateType | EffectType | CallbackType

export type ComponentPrototype = {
    lastHookId?: number
    hooks?: HookType[]
    unmountHandlers?: Record<number, Function>
}

export type InitializedComponentPrototype = {
    lastHookId: number
    hooks: HookType[]
    unmountHandlers: Record<number, Function>
}

export type DispatcherProps<T = unknown> = T | ((prevValue: T) => T)
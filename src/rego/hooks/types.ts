export type ComponentPrototype = {
    lastHookId?: number
    states?: ([unknown, DispatcherProps])[]
}

export type DispatcherProps<T = unknown> = T | ((prevValue: T) => T)
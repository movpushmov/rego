type Dispatcher = {
    lastComponentCalled: Function | null
}

export const dispatcher: Dispatcher = {
    lastComponentCalled: null
}
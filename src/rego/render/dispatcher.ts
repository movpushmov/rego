import {ComponentPrototype} from "../hooks/types";

type Dispatcher = {
    lastComponentCalled: Function | null
    prototypesUsed: ComponentPrototype[]
}

export const dispatcher: Dispatcher = {
    lastComponentCalled: null,
    prototypesUsed: []
}
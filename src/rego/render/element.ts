import {ElementChildren, HTMLProps, RegoElement} from "./dom";
import {dispatcher} from "./dispatcher";
import {ComponentPrototype} from "../hooks/types";

type ElementProps<T> = { children?: ElementChildren<RegoElement> } & T | { children?: ElementChildren<RegoElement> } | null | undefined
type ElementType<T> = (props?: ElementProps<T>) => RegoElement
type DomElementType = string | 'fragment'

export function createElement<T>(element: DomElementType, props: ElementProps<HTMLProps>, children: ElementChildren<RegoElement>): RegoElement;
export function createElement<T>(element: ElementType<T>, props: ElementProps<HTMLProps>, children: ElementChildren<RegoElement>): RegoElement;
export function createElement<T>(element: ElementType<T> | DomElementType, props: ElementProps<HTMLProps>, children: ElementChildren<RegoElement>): RegoElement {
    if (typeof element === 'string') {
        return {
            type: element,
            props: {
                children,
                ...props
            }
        }
    }

    dispatcher.lastComponentCalled = element;
    (element.prototype as ComponentPrototype).lastHookId = 0;

    return props ?
        children ? element({ ...props, children }) : element({ ...props }) :
        children ? element({ children }) : element();
}
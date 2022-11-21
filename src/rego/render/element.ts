import {ElementChildren, HTMLProps, isPlainType, RegoElement} from "./dom";
import {dispatcher} from "./dispatcher";
import {ComponentPrototype} from "../hooks/types";
import {ReactHTML} from "react";

type ElementProps<T> = { children?: ElementChildren<RegoElement> } & T | { children?: ElementChildren<RegoElement> } | null | undefined
type ElementType<T> = (props?: ElementProps<T>) => RegoElement
type DomElementType = string | 'fragment'

function validElementType(element: string): element is keyof ReactHTML {
    return element !== 'plain' && element !== 'fragment'
}

export function createElement<T>(element: DomElementType, props: ElementProps<HTMLProps>, children: ElementChildren<RegoElement>): RegoElement;
export function createElement<T>(element: ElementType<T>, props: ElementProps<HTMLProps>, children: ElementChildren<RegoElement>): RegoElement;
export function createElement<T>(element: ElementType<T> | DomElementType, props: ElementProps<HTMLProps>, children: ElementChildren<RegoElement>): RegoElement | null {
    if (typeof element === 'string') {
        if (validElementType(element)) {
            return {
                type: element,
                props: {
                    children,
                    ...props
                },
            }
        }

        throw new Error("Bad element type")
    }

    dispatcher.lastComponentCalled = element;
    (element.prototype as ComponentPrototype).lastHookId = 0;

    const preResult = checkElement(
        props ?
            children ? element({ ...props, children }) : element({ ...props }) :
            children ? element({ children }) : element()
    );

    if (!preResult) {
        return null
    }

    if (preResult.type !== 'plain' && Array.isArray(preResult.props.children)) {
        preResult.props.children = preResult.props.children.map(c => checkElement(c))
    }

    return {
        ...preResult,
        component: element
    }
}

function checkElement(element: ElementChildren<RegoElement>): RegoElement | null | undefined {
    if (isPlainType(element)) {
        return {
            type: 'plain',
            props: { children: element },
        }
    }

    return <RegoElement | null | undefined>element
}
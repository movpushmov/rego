import {isPlainType} from "./dom";
import {dispatcher} from "./dispatcher";
import {ComponentPrototype} from "../hooks/types";
import {ReactHTML} from "react";
import {ElementChildren, HTMLProps, PlainRegoElement, RegoElement, RenderRegoElement} from "./types";

type ElementProps<T> = { children?: ElementChildren<RenderRegoElement> } & T | { children?: ElementChildren<RenderRegoElement> } | null | undefined
type ElementType<T> = (props?: ElementProps<T>) => RenderRegoElement
type DomElementType = string | 'fragment'

function validElementType(element: string): element is keyof ReactHTML {
    return element !== 'plain'
}

export function createElement<T>(element: DomElementType, props: ElementProps<HTMLProps>, children: ElementChildren<RenderRegoElement>): RenderRegoElement;
export function createElement<T>(element: ElementType<T>, props: ElementProps<HTMLProps>, children: ElementChildren<RenderRegoElement>): RenderRegoElement;
export function createElement<T>(element: ElementType<T> | DomElementType, props: ElementProps<HTMLProps>, children: ElementChildren<RenderRegoElement>): RenderRegoElement | null {
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

function checkElement(element: ElementChildren<RenderRegoElement>): RegoElement | null | undefined {
    if (isPlainType(element)) {
        return {
            type: 'plain',
            props: { children: element },
        } as PlainRegoElement
    }

    return <RegoElement>element
}
import {isPlainType} from "./dom";
import {dispatcher} from "./dispatcher";
import {ComponentPrototype} from "../hooks/types";
import {ReactHTML} from "react";
import {
    ElementChildren,
    FragmentRegoElement,
    HTMLProps, NodeRegoElement,
    PlainRegoElement,
    RegoElement,
    RenderRegoElement
} from "./types";
import {getPrototype} from "../hooks/utils";

export type ElementProps<T = {}> =
    { children?: ElementChildren<RenderRegoElement> } & T |
    null | undefined

type ElementType = (props: any) => RenderRegoElement
type DomElementType = string | 'fragment'

function validElementType(element: string): element is keyof ReactHTML {
    return element !== 'plain'
}

export function createElement<T>(element: DomElementType, props: ElementProps<HTMLProps>, children: ElementChildren<RenderRegoElement>): RenderRegoElement;
export function createElement<T>(element: ElementType, props: ElementProps<T>, children: ElementChildren<RenderRegoElement>): RenderRegoElement;
export function createElement<T>(element: ElementType | DomElementType, props: ElementProps<T>, children: ElementChildren<RenderRegoElement>): RenderRegoElement | null {
    if (typeof element === 'string') {
        if (validElementType(element)) {
            let formattedChildren = children

            if (Array.isArray(formattedChildren)) {
                formattedChildren = formattedChildren.map(c => checkElement(c));
            } else if (isPlainType(formattedChildren)) {
                formattedChildren = checkElement(formattedChildren);
            }

            return {
                type: element,
                props: {
                    children: formattedChildren,
                    ...props
                },
            } as FragmentRegoElement | NodeRegoElement
        }

        throw new Error("Bad element type")
    }

    dispatcher.lastComponentCalled = element;

    const prototype = getPrototype(element);
    Object.values(prototype.regoMeta).forEach(meta => meta.lastHookId = 0);

    const preResult = checkElement(
        props ?
            children ? element({ ...props, children }) : element({ ...props }) :
            children ? element({ children }) : element({})
    );

    prototype.lastMetaId = prototype.lastMetaId !== void 0 ? prototype.lastMetaId + 1 : 0;

    if (!preResult) {
        return null
    }

    if (preResult.type !== 'plain' && Array.isArray(preResult.props.children)) {
        preResult.props.children = preResult.props.children.map(c => checkElement(c))
    }

    return {
        ...preResult,
        component: element,
        metaId: prototype.lastMetaId - 1
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
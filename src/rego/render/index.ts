import {regoInfo} from "./dom";
import {dispatcher} from "./dispatcher";
import {CSSProperties} from "react";
import {NodeRegoElement, RegoElement} from "./types";

export type RootType = () => RegoElement;

export function render<T>(element: RootType, container: HTMLElement) {
    dispatcher.lastComponentCalled = element;
    const tree = element();

    regoInfo.root = element;
    regoInfo.virtualDOM = tree;
    regoInfo.container = container;

    renderNode(tree, container);
}

export function renderNode(element: RegoElement | RegoElement[] | null | undefined, container: HTMLElement, after?: HTMLElement | Text) {
    if (!element) {
        return
    }

    if (Array.isArray(element)) {
        element.forEach(e => renderNode(e, container));
        return;
    }

    switch (element.type) {
        case "fragment": {
            element.element = container;

            if (Array.isArray(element.props.children)) {
                for (const child of element.props.children) {
                    renderNode(child as RegoElement, container);
                }
            } else if (element.props.children) {
                renderNode(element.props.children as RegoElement, container);
            }

            break;
        }
        case 'plain': {
            const node = document.createTextNode(String(element));
            after ? after.after(node) : container.appendChild(node);

            element.element = node;

            break;
        }
        default: {
            const domElement = document.createElement(element.type);
            after ? after.after(domElement) : container.appendChild(domElement);

            element.element = domElement;

            const { children, style, ...otherProps } = (element as NodeRegoElement).props
            applyStyles(domElement, style);

            for (const entry of Object.entries(otherProps)) {
                // @ts-ignore
                domElement[entry[0].toLowerCase()] = entry[1];
            }

            if (Array.isArray(children)) {
                for (const child of children) {
                    renderNode(child as RegoElement, domElement);
                }
            } else if (children) {
                renderNode(children as RegoElement, domElement);
            }

            break;
        }
    }
}

export function applyStyles(domElement: HTMLElement, style?: CSSProperties) {
    if (style) {
        for (const entry of Object.entries(style) as ([keyof Omit<CSSStyleDeclaration, 'length' | 'parentRule'>, any])[]) {
            domElement.style[entry[0]] = typeof entry[1] === 'number' ? `${entry[1]}px` : entry[1];
        }
    } else {
        for (const key of Object.keys(domElement.style)) {
            domElement.style.removeProperty(key);
        }
    }
}
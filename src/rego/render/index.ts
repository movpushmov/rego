import {ElementChildren, RegoElement, regoInfo} from "./dom";
import {dispatcher} from "./dispatcher";
import {CSSProperties} from "react";

export type RootType = () => RegoElement;

export function render<T>(element: RootType, container: HTMLElement) {
    dispatcher.lastComponentCalled = element;
    const tree = element();

    regoInfo.root = element;
    regoInfo.virtualDOM = tree;

    renderNode(tree, container);
}

export function renderNode(element: ElementChildren<RegoElement>, container: HTMLElement) {
    if (!element) {
        return
    }

    if (typeof element !== 'object') {
        container.textContent = String(element);
        return;
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
                    renderNode(child, container);
                }
            } else if (element.props.children) {
                renderNode(element.props.children, container);
            }

            break;
        }
        default: {
            const domElement = document.createElement(element.type)
            container.appendChild(domElement)

            element.element = domElement;

            const { children, style, ...otherProps } = element.props
            applyStyles(domElement, style);

            for (const entry of Object.entries(otherProps)) {
                // @ts-ignore
                domElement[entry[0].toLowerCase()] = entry[1];
            }

            if (Array.isArray(children)) {
                for (const child of children) {
                    renderNode(child, domElement);
                }
            } else if (children) {
                renderNode(children, domElement);
            }

            break;
        }
    }
}

export function applyStyles(domElement: HTMLElement, style?: CSSProperties) {
    if (style) {
        for (const entry of Object.entries(style) as ([keyof Omit<CSSStyleDeclaration, 'length' | 'parentRule'>, any])[]) {
            domElement.style[entry[0]] = entry[1];
        }
    } else {
        for (const key of Object.keys(domElement.style)) {
            domElement.style.removeProperty(key);
        }
    }
}
import {applyStyles, render, renderNode, RootType} from "./index";
import React, {HTMLAttributes} from "react";
import {dispatcher} from "./dispatcher";
import {ComponentPrototype} from "../hooks/types";

export type HTMLProps = Omit<React.DetailedHTMLProps<HTMLAttributes<HTMLElement>, HTMLElement>, 'children'>
export type ElementChildren<T> = T | T[] | string | null | undefined | number | boolean

export type RegoElement = {
    type: string | 'fragment'
    props: {
        children: ElementChildren<RegoElement>
    } & HTMLProps

    element?: HTMLElement
    unmountHandler?: () => void;
}

export const regoInfo = {
    virtualDOM: null as RegoElement | null,

    root: null as RootType | null
}

export function update() {
    const { virtualDOM, root } = regoInfo;

    if (!virtualDOM || !root) {
        return;
    }

    (root.prototype as ComponentPrototype).lastHookId = 0;
    dispatcher.lastComponentCalled = root;

    const newDOM = root();

    reconcile(virtualDOM, newDOM);
    regoInfo.virtualDOM = newDOM;
}

function isPlainType(child: ElementChildren<RegoElement>) {
    return typeof child === 'number' || typeof child == 'boolean' || typeof child === 'string'
}

function reconcile(oldNode: RegoElement, newNode: RegoElement) {
    if (oldNode.type !== newNode.type && oldNode.element) {
        oldNode.unmountHandler?.();

        if (oldNode.type === 'fragment') {
            oldNode.element.innerHTML = '';
            renderNode(newNode, oldNode.element);
        } else {
            oldNode.element.remove();
            renderNode(newNode, oldNode.element.parentElement!);
        }

        return;
    }

    if (oldNode.type === 'fragment') {
        reconcileChildren(oldNode.props.children, newNode.props.children, oldNode.element!);
    }

    if (!oldNode.element) {
        return;
    }

    const { children, style, ...otherProps } = newNode.props

    for (const prop of Object.entries(otherProps) as [string, unknown][]) {
        // @ts-ignore
        if (prop[0] in oldNode.props && oldNode.props[prop[0]] !== prop[1]) {
            // @ts-ignore
            oldNode.element[prop[0].toLowerCase()] = prop[1];
        }
    }

    applyStyles(oldNode.element, style);

    newNode.element = oldNode.element;
    newNode.unmountHandler = oldNode.unmountHandler;

    reconcileChildren(oldNode.props.children, newNode.props.children, newNode.element);
}

function reconcileChildren(
    oldC: ElementChildren<RegoElement>,
    newC: ElementChildren<RegoElement>,
    container: HTMLElement
) {
    /*
        differences:

        new node     old node

        array        not array             -> full reload
        object       array                 -> full reload
        empty        not empty             -> full reload
        not empty    empty                 -> full reload

        -- different plain types --        -> full reload
        -- different array length --       -> reconcile
        -- same types but != --            -> reconcile
     */

    if (
        Array.isArray(newC) && !Array.isArray(oldC) ||
        !Array.isArray(newC) && Array.isArray(oldC) ||
        !newC  && oldC ||
        newC && !oldC ||
        typeof newC !== typeof oldC ||
        isPlainType(newC) && isPlainType(oldC) && newC !== oldC
    ) {
        container.textContent = '';
        renderNode(newC, container);
        return;
    }

    if (Array.isArray(newC) && Array.isArray(oldC)) {
        if (newC.length !== oldC.length) {
            container.textContent = '';
            renderNode(newC, container);
        } else {
            for (let i = 0; i < newC.length; i++) {
                reconcileChildren(oldC[i], newC[i], container);
            }
        }
        return;
    }

    return reconcile(oldC as RegoElement, newC as RegoElement);
}

function notifyUnmount(treeNode: RegoElement) {
    treeNode.unmountHandler?.()
    const { children } = treeNode.props

    if (treeNode.type === 'fragment' && children && typeof children === 'object' && 'type' in children) {
        notifyUnmount(children)
    }
}
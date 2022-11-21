import {applyStyles, render, renderNode, RootType} from "./index";
import React, {HTMLAttributes} from "react";
import {dispatcher} from "./dispatcher";
import {ComponentPrototype} from "../hooks/types";
import {getPrototype} from "../hooks/utils";

type PlainElement = string | number | boolean
type PlainElementOrT<T> = T | PlainElement | null | undefined
export type HTMLProps = Omit<React.DetailedHTMLProps<HTMLAttributes<HTMLElement>, HTMLElement>, 'children'>
export type ElementChildren<T> = PlainElementOrT<T> | PlainElementOrT<T>[]

export type PlainRegoElement = {
    type: 'plain'
    props: { children: PlainElement }

    element?: Text
    component?: Function
}

export type FragmentRegoElement = {
    type: 'fragment'
    props: { children: ElementChildren<RegoElement> }

    element?: HTMLElement
    component?: Function
}

export type NodeRegoElement = {
    type: keyof React.ReactHTML
    props: { children: ElementChildren<RegoElement> } & HTMLProps

    element?: HTMLElement
    component?: Function
}

export type RegoElement = FragmentRegoElement | NodeRegoElement | PlainRegoElement

export const regoInfo = {
    virtualDOM: null as RegoElement | null,
    container: null as HTMLElement | null,

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

    reconcile(0, virtualDOM, newDOM, null);
    regoInfo.virtualDOM = newDOM;
}

export function isPlainType(child: ElementChildren<RegoElement>): child is PlainElement {
    return typeof child === 'number' || typeof child == 'boolean' || typeof child === 'string'
}

/*
    differences:

    new node     old node

    object       array
    array        not array
    -- different array length --
    -- same types but != --
    empty        not empty
    not empty    empty
    -- plain but != --
 */

function reconcile(childId: number, oldNode: RegoElement | null, newNode: RegoElement | null, parentNode: FragmentRegoElement | NodeRegoElement | null) {
    if (!newNode) {
        notifyUnmount(oldNode);
        return oldNode?.element?.remove();
    }

    if (!oldNode) {
        if (!parentNode)
            return renderNode(newNode, regoInfo.container!);

        return renderNodeOnPosition(childId, newNode, parentNode);
    }

    if (oldNode.type !== newNode.type) {
        oldNode.element?.remove();
        notifyUnmount(oldNode);
        return renderNode(newNode, parentNode ? <HTMLElement>parentNode.element : regoInfo.container!);
    }

    if (oldNode.type === 'plain' && oldNode.element) {
        (<PlainRegoElement>oldNode).element!.textContent = String((<PlainRegoElement>newNode).props.children);
        newNode.element = oldNode.element

        return;
    }
}

function renderNodeOnPosition(childId: number, newNode: RegoElement, parentNode: FragmentRegoElement | NodeRegoElement) {
    if (Array.isArray(parentNode.props.children)) {
        const children = parentNode.props.children as RegoElement[];
        renderNode(newNode, parentNode.element!, childId === 0 ? void 0 : children[childId].element);
    } else {
        renderNode(newNode, parentNode.element!);
    }
}

function notifyUnmount(treeNode: RegoElement | null) {
    if (!treeNode)
        return

    if (treeNode.component) {
        const prototype = getPrototype();

        for (const key in prototype.unmountHandlers) {
            prototype.unmountHandlers[key]();
        }

        prototype.unmountHandlers = {};
        prototype.lastHookId = 0;
        prototype.hooks = [];
    }

    const { children } = treeNode.props

    if (treeNode.type === 'fragment' && children && typeof children === 'object' && 'type' in children) {
        notifyUnmount(children)
    }
}
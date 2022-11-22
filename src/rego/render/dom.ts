import {renderNode, RootType} from "./index";
import {dispatcher} from "./dispatcher";
import {ComponentPrototype} from "../hooks/types";
import {getPrototype} from "../hooks/utils";
import {
    ElementChildren,
    FragmentRegoElement,
    NodeRegoElement, NullableElement,
    PlainElement, PlainRegoElement,
    RegoElement,
    RenderRegoElement
} from "./types";

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

    const prototype = getPrototype(root);

    Object.values(prototype.regoMeta).map(meta => meta.lastHookId = 0);
    prototype.lastMetaId = 0;

    dispatcher.lastComponentCalled = root;
    dispatcher.prototypesUsed = [];

    const newDOM = <RegoElement>root();

    reconcile(0, virtualDOM, newDOM, null);
    regoInfo.virtualDOM = newDOM;
}


export function isPlainType(child: ElementChildren<RenderRegoElement>): child is PlainElement {
    return typeof child === 'number' || typeof child == 'boolean' || typeof child === 'string'
}

/*
    differences:

    new node     old node

    object       array
    array        not array
    -- different array length --
    -- same types but != --
    +  empty        not empty
    +  not empty    empty
    +  -- plain but != --
 */

function reconcile(
    childId: number,
    oldNode: NullableElement<RegoElement>,
    newNode: NullableElement<RegoElement>,
    parentNode: FragmentRegoElement | NodeRegoElement | null
): void {
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

    if (!Array.isArray(newNode.props.children) && Array.isArray(oldNode.props.children)) {
        let reconciled = false
        const newChild = newNode.props.children

        for (const child of oldNode.props.children) {
            if (!newChild) {
                notifyUnmount(child);
                child?.element?.remove();
                reconciled = true;
                continue;
            }

            if (matchNode(newChild, child!) && !isPlainType(newChild)) {
                newChild.element = child!.element
                reconcile(0, child, newChild, <FragmentRegoElement | NodeRegoElement>oldNode);
                reconciled = true;
            } else {
                notifyUnmount(child);
                child?.element?.remove();
            }
        }

        if (!reconciled && newChild && !isPlainType(newChild)) {
            return renderNode(newChild, (<FragmentRegoElement | NodeRegoElement>oldNode).element!);
        }
    }

    if (Array.isArray(newNode.props.children) && !Array.isArray(oldNode.props.children)) {
        let after

        if (!oldNode.props.children) {
            renderNode(newNode, parentNode!.element!);
            return;
        }

        for (let i = 0; i < newNode.props.children.length; i++) {
            const child = newNode.props.children[i];

            if (!child)
                continue

            if (matchNode(child, oldNode.props.children) && !isPlainType(oldNode.props.children)) {
                child.element = oldNode.props.children.element;

                reconcile(i, oldNode.props.children, child, <FragmentRegoElement | NodeRegoElement>oldNode);
                after = oldNode.props.children.element
            } else {
                renderNode(child, (<FragmentRegoElement | NodeRegoElement>oldNode).element!, after)
            }
        }
    }

    if (!Array.isArray(newNode.props.children) && !Array.isArray(oldNode.props.children)) {
        newNode.element = oldNode.element;
        return reconcile(
            0,
            <RegoElement>oldNode.props.children,
            <RegoElement>newNode.props.children,
            newNode as FragmentRegoElement | NodeRegoElement
        );
    }

    if (Array.isArray(newNode.props.children) && Array.isArray(oldNode.props.children)) {
        if (newNode.props.children.length !== oldNode.props.children.length) {
            const node = (<NodeRegoElement | FragmentRegoElement>oldNode)

            if (node.element) {
                notifyUnmount(oldNode);
                node.element.innerHTML = '';

                renderNode(newNode.props.children, node.element);
            }
        } else {
            for (let i = 0; i < newNode.props.children.length; i++) {
                if (newNode.props.children[i] && oldNode.props.children[i]) {
                    newNode.props.children[i]!.element = oldNode.props.children[i]!.element;
                }

                reconcile(i, oldNode.props.children[i], newNode.props.children[i], <FragmentRegoElement | NodeRegoElement>oldNode);
            }
        }
    }
}

function renderNodeOnPosition(childId: number, newNode: RegoElement, parentNode?: FragmentRegoElement | NodeRegoElement) {
    if (!parentNode) {
        renderNode(newNode, regoInfo.container!);

        return;
    }

    if (Array.isArray(parentNode.props.children)) {
        const children = parentNode.props.children as RegoElement[];
        renderNode(newNode, parentNode.element!, childId === 0 ? void 0 : children[childId - 1].element);
    } else {
        renderNode(newNode, parentNode.element!);
    }
}

type Node = RegoElement | PlainElement

function matchNode(newNode: Node, oldNode: Node): boolean {
    if (isPlainType(newNode) || isPlainType(oldNode)) {
        return newNode === oldNode
    }

    if (newNode.type !== oldNode.type) {
        return false;
    }

    if (!newNode.props.children && !oldNode.props.children) {
        return true;
    }

    const oldC = oldNode.props.children
    const newC = newNode.props.children

    if (!newC && !oldC) {
        return true;
    }

    if (
        !newNode.props.children || !oldNode.props.children ||
        !Array.isArray(oldC) && Array.isArray(newC) ||
        !Array.isArray(newC) && Array.isArray(oldC) ||
        !newC && oldC || !oldC && newC ||
        Array.isArray(newC) && Array.isArray(oldC) && newC.length !== oldC.length
    ) {
        return false
    }

    if (Array.isArray(newC) && Array.isArray(oldC)) {
        for (let i = 0; i < newC.length; i++) {
            matchNode(<Node>newC[i], <Node>oldC[i]);
        }
    } else {
        matchNode(<Node>newC, <Node>oldC);
    }

    return true;
}

function notifyUnmount(treeNode: NullableElement<RegoElement>) {
    if (!treeNode)
        return

    if (treeNode.component) {
        const prototype = getPrototype(treeNode.component);

        Object
            .values(prototype.regoMeta[treeNode.metaId ?? 0].unmountHandlers)
            .forEach(handler => handler());

        delete prototype.regoMeta[treeNode.metaId ?? 0];
        prototype.lastMetaId = 0;
    }

    const { children } = treeNode.props

    if (treeNode.type === 'fragment' && children && typeof children === 'object' && 'type' in children) {
        notifyUnmount(children)
    }
}
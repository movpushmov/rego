import {useLayoutEffect} from "./hooks/useLayoutEffect";
import {useEffect} from "./hooks/useEffect";
import {useState} from "./hooks/useState";
import {render} from "./render";
import {createElement} from "./render/element";
import {ElementChildren, RenderRegoElement} from "./render/types";

export function Fragment({ children } : { children: ElementChildren<RenderRegoElement>[] }) {
    return createElement('fragment', null, ...children);
}

export default {
    useEffect,
    useLayoutEffect,
    useState,
    render,
    createElement,
    Fragment
}

export * from './hooks/useEffect';
export * from './hooks/useLayoutEffect';
export * from './hooks/useState';
export { render } from './render/index';
export { createElement } from './render/element';
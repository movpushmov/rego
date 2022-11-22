import React, {HTMLAttributes} from "react";

export type PlainElement = string | number | boolean
export type NullableElement<T> = T | null | undefined
type PlainElementOrT<T> = T | PlainElement | NullableElement<T>
export type HTMLProps = Omit<React.DetailedHTMLProps<HTMLAttributes<HTMLElement>, HTMLElement>, 'children'>
export type ElementChildren<T> = PlainElementOrT<T> | PlainElementOrT<T>[]

export type PlainRegoElement = {
    type: 'plain'
    props: { children: PlainElement }

    element?: Text
    component?: Function
    metaId?: number
}

export type FragmentRegoElement = {
    type: 'fragment'
    props: { children: ElementChildren<RenderRegoElement> }

    element?: HTMLElement
    component?: Function
    metaId?: number
}

export type NodeRegoElement = {
    type: keyof React.ReactHTML
    props: { children: ElementChildren<RenderRegoElement> } & HTMLProps

    element?: HTMLElement
    component?: Function
    metaId?: number
}

type CustomProps<T = {}> = {
    props: { children: NullableElement<RegoElement> | NullableElement<RegoElement>[] | null | undefined } & T
}

export type RenderRegoElement = FragmentRegoElement | NodeRegoElement | PlainRegoElement

export type RegoElement = (
    Omit<FragmentRegoElement, 'props'> & CustomProps |
    PlainRegoElement |
    Omit<NodeRegoElement, 'props'> & CustomProps<HTMLProps>
)
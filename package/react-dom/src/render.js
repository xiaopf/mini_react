import { diff } from "./Diff";

export function render(vnode, container, dom) {
    return diff(dom, vnode, container);
}
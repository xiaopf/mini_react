import Component from "../../react/src/Component";

export function diff(dom, vnode, container) {
    const ret = diffNode(dom, vnode);
    if (container && ret.parentNode !== container) {
        container.appendChild(ret);
    }
    return ret;
}

export function diffNode(dom, vnode) {
    var out = dom;

    if (vnode === undefined || vnode === null || typeof vnode === 'boolean') {
        vnode = '';
    }

    if (typeof vnode === 'number') {
        vnode = String(vnode);
    }

    if (typeof vnode === 'string') {
        if (dom && dom.nodeType === 3) {
            if (dom.textContent !== vnode) {
                dom.textContent = vnode;
            }
        } else {
            out = document.createTextNode(vnode);
            if (dom && dom.parentNode) {
                dom.parentNode.replaceChild(out, dom)
            }
        }
        return out;
    }

    if (typeof vnode.tag === 'function') {
        return diffComponent(dom, vnode)
    }

    if (!dom || !isSameNodeType(dom, vnode)){
        out = document.createElement(vnode.tag);
        if (dom) {
            [...dom.childNodes].map( child => {
                out.appendChild(child);
            });

            if (dom.parentNode) {
                dom.parentNode.replaceChild(out, dom);
            }
        }
    }

    if (vnode.children && vnode.children.length > 0 || (out.childNodes && out.childNodes.length > 0)) {
        diffChildren(out, vnode.children)
    }

    diffAttributes(out, vnode);
    return out; 
}

function diffAttributes(dom, vnode) {
    const oldAttrs = {};
    const newAttrs = vnode.attrs;
    
    let oldAttrLen = dom.attributes.length;
    for (let i = 0; i < oldAttrLen; i ++) {
        let attr = dom.attributes[i];
        oldAttrs[attr.name] = attr.value;
    }

    for (let name in oldAttrs) {
        if (!(name in newAttrs)) {
            setAttribute(dom, name, undefined)
        }
    }

    for (let name in newAttrs) {
        if (oldAttrs[name] !== newAttrs[name]) {
            setAttribute(dom, name, newAttrs[name])
        }
    }
}

function diffChildren(dom, vChildren) {

    let domChildren = dom.childNodes;
    let children = [];
    let keyed = {};

    if (domChildren.length > 0) {
        for (let i = 0; i < domChildren.length; i++) {
            let domChild = domChildren[i];
            let key = domChild.key;
            if (key) {
                keyed[key] = domChild;
            } else {
                children.push(domChild);
            }
        }
    }

    if (vChildren && vChildren.length > 0) {
        let min = 0;
        let childrenLen = children.length;
        for (let i = 0; i < vChildren.length; i++) {
            let vChild = vChildren[i];
            let key = vChild.key;
            let child;
            if (key) {
                if (keyed[key]) {
                    child = keyed[key];
                    keyed[key] = undefined;
                }
            } else if(min < childrenLen) {
                for (let j = 0; j < childrenLen; j++) {
                    let domChild = children[j];

                    if (domChild && isSameNodeType(domChild, vChild)) {
                        child = domChild;
                        children[j] = undefined;
                        if (j === childrenLen - 1) childrenLen--;
                        if (j === min) min++;
                        break;
                    }
                }
            }
            child = diffNode(child, vChild);

            const f = domChildren[i];

            if (child && child !== f && child !== dom) {
                if (!f) {
                    dom.appendChild(child);
                } else if (child === f.nextSibling) {
                    removeNode(f);
                } else {
                    dom.insertBefore(child, f)
                }
            }
        }
    }
}

function diffComponent(dom, vnode) {
    let componentInstance = dom && dom._component;
    let oldDom = dom;

    if(componentInstance && componentInstance.constructor === vnode.tag) {
        setComponentProps(componentInstance, vnode.attrs);
        dom = componentInstance.base;
    } else {
        if (componentInstance) {
            unmountComponent(componentInstance);
            oldDom = null;
        }

        componentInstance = createComponent(vnode.tag, vnode.attrs);
        setComponentProps(componentInstance, vnode.attrs);
        dom = componentInstance.base;

        if (oldDom && dom !== oldDom) {
            oldDom._component = null;
            removeNode(oldDom)
        }
    }
    return dom;
}

function unmountComponent(component) {
    if (component.componentWillUnmount) component.componentWillUnmount();
    removeNode(component.base);
}

function isSameNodeType(dom, vnode) {
    if (typeof vnode === 'string' || typeof vnode === 'number') {
        return dom.nodeType === 3;;
    }
    if (typeof vnode.tag === 'string') {
        return vnode.tag.toLowerCase() === dom.nodeName.toLowerCase();
    }
    return dom && dom._component && dom._component.constructor === vnode.tag;
}

function removeNode(dom) {
    if(dom && dom.parentNode) {
        dom.parentNode.removeChild(dom)
    }
}

export function renderComponent(component) {
    let base;
    const renderer = component.render();

    if (component.base && component.componentWillUpdate) {
        component.componentWillUpdate();
    }

    base = diffNode(component.base, renderer);


    if (component.base) {
        if (component.componentDidUpdate) component.componentDidUpdate();
    } else if (component.componentDidMount) {
        component.componentDidMount();
    }

    component.base = base;
    base._component = component;
}

function createComponent(component, props) {
    let componentInstance;
    if (component.prototype && component.prototype.render) {
        componentInstance = new component(props);
    } else {
        componentInstance = new Component(props);
        componentInstance.constructor = component;
        componentInstance.render = function () {
            return this.constructor(props);
        }
    }
    return componentInstance;
}

function setComponentProps(component, props) {
    if (!component.base) {
        if (component.componentWillMount) {
            component.componentWillMount();
        }
    } else if (component.componentWillReceiveProps) {
        component.componentWillReceiveProps();
    }
    component.props = props;
    renderComponent(component);
}


function setAttribute(dom, key, value) {
    if (key === 'className') {
        key = 'class';
    };
    if (/on\w+/.test(key)) {
        key = key.toLowerCase();
        dom[key] = value || '';
    } else if (key === 'style') {
        if (!value || typeof value === 'string') {
            dom.style.cssText = value;
        } else if (value && typeof value === 'object') {
            for (let k in value) {
                dom.style[k] = typeof value[k] === 'number' ? value[k] + 'px' : value[k];
            };
        };
    } else {
        if (key in dom) {
            dom[key] = value || '';
        }
        if (value) {
            dom.setAttribute(key, value);
        } else {
            dom.removeAttribute(key);
        }
    }
}
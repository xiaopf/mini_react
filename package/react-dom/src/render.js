import Component from "../../react/src/Component";

export function render(vnode, container) {
    return container.appendChild(_render(vnode));
}

export function renderComponent(component) {
    let base;
    const renderer = component.render();

    if (component.base && component.componentWillUpdate) {
        component.componentWillUpdate();
    }

    base = _render(renderer);
    
    if (component.base) {
        if (component.componentDidUpdate) component.componentDidUpdate();
    } else if (component.componentDidMount) {
        component.componentDidMount();
    }

    if (component.base && component.base.parentNode) {
        component.base.parentNode.replaceChild(base, component.base);
    }

    component.base = base;
    base._component = component;
}

function _render(vnode){
    if (vnode === undefined || vnode === null || typeof vnode === 'boolean') {
        vnode = '';
    }
    if (typeof vnode === 'number') {
        vnode = String(vnode);
    }
    if (typeof vnode === 'string') {
        let textNode = document.createTextNode(vnode);
        return textNode;
    }
    if (typeof vnode.tag === 'function') {
        const component = createComponent(vnode.tag, vnode.attrs);
        setComponentProps(component, vnode.attrs);
        return component.base;
    }

    let dom = document.createElement(vnode.tag);

    if (vnode.attrs) {
        Object.keys(vnode.attrs).map(key => {
            let value = vnode.attrs[key];
            setAttribute(dom, key, value);
        })
    };

    vnode.children.map(child => {
        render(child, dom)
    });
    
    return dom;
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

function setAttribute(dom, key, value){
    if (key === 'className') {
        key = 'class';
    };
    if (/on\w+/.test(key)) {
        key = key.toLowerCase();
        dom[key] = value || '';
    } else if (key === 'style'){
        if (!value || typeof value === 'string') {
            dom.style.cssText = value;
        } else if (value && typeof value === 'object'){
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
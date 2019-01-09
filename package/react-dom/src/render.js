export function render(vnode, container) {
    if (typeof vnode === 'string') {
        let textNode = document.createTextNode(vnode);
        return container.appendChild(textNode);
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
    
    return container.appendChild(dom);
}

function setAttribute(dom, key, value){
    if (key === 'className') {
        key = 'class';
    };
    if (/on\w+/.test(key)) {
        name = name.toLowerCase();
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
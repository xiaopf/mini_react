import { renderComponent } from '../../react-dom/src/Diff'
const setStateQueue = [];
const renderQueue = [];
export function enqueueSetState(stateChange, component) {
    
    if (setStateQueue.length === 0) {
        defer(flush);
    }

    setStateQueue.push(
        {
            stateChange, 
            component,
        }
    )

    if (!renderQueue.some(item => item === component)) {
        renderQueue.push(component)
    }
}

function flush() {
    let item = setStateQueue.shift();
    while (item) {
        let { stateChange, component } = item;
        item = null;
        item = setStateQueue.shift();

        if (!component.prevState) {
            component.prevState = Object.assign({}, component.prevState)
        }

        if (typeof stateChange === 'function') {
            Object.assign(component.state, setState(component.prevState, component.props))
        } else {
            Object.assign(component.state, stateChange)
        }
    }

    let component = renderQueue.shift();
    while (component) {
        renderComponent(component);
        component = null;
        component = renderQueue.shift();
    }

}

function defer(fn) {
    return Promise.resolve().then(fn);
}
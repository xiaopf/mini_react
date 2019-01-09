import { render } from './src/render';
 const ReactDom = {
    render : (vnode, container) => {
        container.innerHTML = '';
        return render(vnode, container);
    }
}
export default ReactDom;
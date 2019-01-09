import React from './package/react';
import ReactDOM from './package/react-dom';

class Counter extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            num: 0
        }
    }

    componentWillUpdate() {
        console.log('update');
    }

    componentWillMount() {
        console.log('mount');
    }

    onClick() {
        console.log('click')
        this.setState({ num: this.state.num + 1 });
    }

    render() {
        return (
            <div onClick={() => this.onClick()}>
                <h1>number: {this.state.num}</h1>
                <button>add</button>
            </div>
        );
    }
}

ReactDOM.render(
    <Counter />,
    document.getElementById('root')
);
import React from './package/react';
import ReactDOM from './package/react-dom';

class App extends React.Component {
    constructor() {
        super();
        this.state = {
            num: 0
        }
    }
    componentDidMount() {
        for (let i = 0; i < 10; i++) {
            this.setState({ num: this.state.num + 1 });
            console.log(this.state.num);
        }
    }
    render() {
        return (
            <div className="App">
                <h1>{this.state.num}</h1>
            </div>
        );
    }
}

ReactDOM.render(
    <App />,
    document.getElementById('root')
);
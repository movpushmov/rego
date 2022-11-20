import {render} from "./rego/render";
import {createElement} from "./rego/render/element";
import {useState} from "./rego/hooks/useState";

function App() {
    const [state, setState] = useState(0);

    if (state < 5) {
        return createElement(
            'fragment',
            null,
            [
                createElement('h1', null, 'Hello world!'),
                createElement('button', { onClick: () => setState(p => p + 1) }, `Button clicked ${state} times`)
            ]
        )
    } else {
        return createElement('h1', null, 'YOU CLICKED MANY TIMES!!!!!!');
    }
}

render(App, document.getElementById('root')!)
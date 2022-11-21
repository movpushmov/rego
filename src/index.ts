import {render} from "./rego/render";
import {createElement} from "./rego/render/element";
import {useState} from "./rego/hooks/useState";
import {useEffect} from "./rego/hooks/useEffect";

function InterestingComponent() {
    useEffect(() => {
        console.log('called on mount')

        return () => {
            console.log('called on unmount')
        }
    }, [])

    return createElement('span', null, 'Very interesting component');
}

function App() {
    const [state, setState] = useState(0);
    const [unmounted, setIsUnmounted] = useState(false);

    return createElement(
        'fragment',
        null,
        createElement('div', {
            style: { display: 'flex', flexDirection: 'column', rowGap: 20 }
        }, [
            createElement('h1', null, 'Hello world!'),
            'Text 1',
            createElement('button', { onClick: () => setState(p => p + 1) }, `Button clicked ${state} times`),
            createElement('button', { onClick: () => setIsUnmounted(m => !m) }, unmounted ? 'Mount' : 'Unmount'),
            !unmounted ? createElement(InterestingComponent, null, null) : null,
            'Text 2',
        ])
    )
}

render(App, document.getElementById('root')!)
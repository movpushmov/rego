# rego
Simple react implementation with typescript, functional components, hooks and JSX

![rego](https://user-images.githubusercontent.com/49155506/204274352-462c6c15-e0b1-45e9-b1b0-ceb1770fb5cd.gif)

Example rego app from gif (bundler -- parcel):

```tsx
import Rego, { render, useEffect, useState } from './rego';

/** @jsxRuntime classic @jsx Rego.createElement @jsxFrag Rego.Fragment */

function InterestingComponent(props: { id: number }) {
    useEffect(() => {
        console.log('called on mount', props.id)

        return () => {
            console.log('called on unmount', props.id)
        }
    }, []);

    return <span>Very interesting component</span>;
}

function App() {
    const [state, setState] = useState(0);
    const [unmounted, setIsUnmounted] = useState(false);

    return (
        <>
            <div style={{ display: 'flex', flexDirection: 'column', rowGap: 20 }}>
                <h1>Hello, world!</h1>
                Text 1
                <button onClick={() => setState(p => p + 1)}>Button clicked {state} times</button>
                <button onClick={() => setIsUnmounted(u => !u)}>{unmounted ? 'Mount' : 'Unmount'}</button>
                <InterestingComponent id={12}/>
                {!unmounted && <InterestingComponent id={32}/>}
                Text 2
            </div>
        </>
    )
}

render(App, document.getElementById('root')!)
```

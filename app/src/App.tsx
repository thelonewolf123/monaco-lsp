import { useState } from 'react'
import { MonacoEditor } from './Editor'

function App() {
    function getPortNumber() {
        return '9001'
    }

    const [port, setPort] = useState<string>(getPortNumber())

    return <MonacoEditor port={port}></MonacoEditor>
}

export default App

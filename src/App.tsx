import { useState } from 'react'
import { MonacoEditor } from './Editor'

function App() {
    function getPortNumber() {
        // const ports = [9001, 9002, 9003, 9004, 9005, 9006]
        // for (let port of ports) {
        //     const p = localStorage.getItem(port.toString())
        //     if (p) continue
        //     localStorage.setItem(port.toString(), port.toString())
        //     if (port === 9006) {
        //         localStorage.clear()
        //     }
        //     return port.toString()
        // }

        return '9001'
    }

    const [port, setPort] = useState<string>(getPortNumber())

    return <MonacoEditor port={port}></MonacoEditor>
}

export default App

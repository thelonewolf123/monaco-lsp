importScripts('https://cdn.jsdelivr.net/pyodide/v0.20.0/full/pyodide.js')

function patchedStdout(data) {
    if (!data.trim()) {
        return
    }

    // Uncomment to see messages sent from the language server
    console.log(JSON.parse(data))
    postMessage(JSON.parse(data))
}

async function initPyodide() {
    console.debug('Initializing pyodide')

    /* @ts-ignore */
    let pyodide = await loadPyodide({
        indexURL: 'https://cdn.jsdelivr.net/pyodide/v0.20.0/full/'
    })

    console.debug('Installing dependencies.')
    await pyodide.loadPackage(['micropip'])
    await pyodide.runPythonAsync(`
    import sys
    import micropip

    await micropip.install('jedi-language-server')
  `)

    console.debug('Loading lsp server.')

    pyodide.globals.get('sys').stdout.write = patchedStdout
    await pyodide.runPythonAsync(`
    from jedi_language_server import server as jedi_server

    server = jedi_server.SERVER
    server.start_pyodide()
    `)

    return pyodide
}

const pyodideReady = initPyodide()

onmessage = async (event) => {
    let pyodide = await pyodideReady

    // Uncomment to see messages from the client
    // console.log(event.data)

    console.log(event.data)

    self.client_message = JSON.stringify(event.data)
    await pyodide.runPythonAsync(`
    import json
    from js import client_message

    message = json.loads(client_message, object_hook=server.lsp._deserialize_message)
    server.lsp._procedure_handler(message)
  `)
}

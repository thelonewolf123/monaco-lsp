import {
    MonacoLanguageClient,
    CloseAction,
    ErrorAction,
    MonacoServices,
    MessageTransports
} from 'monaco-languageclient'
import {
    BrowserMessageReader,
    BrowserMessageWriter
} from 'vscode-languageserver-protocol/browser.js'

function registerLsp() {
    function createLanguageClient(
        transports: MessageTransports
    ): MonacoLanguageClient {
        return new MonacoLanguageClient({
            name: 'Python Language Client',
            clientOptions: {
                // use a language id as a document selector
                documentSelector: [{ language: 'python' }],
                // disable the default error handler
                errorHandler: {
                    error: () => ({ action: ErrorAction.Continue }),
                    closed: () => ({ action: CloseAction.DoNotRestart })
                }
            },
            // create a language client connection to the server running in the web worker
            connectionProvider: {
                get: () => {
                    return Promise.resolve(transports)
                }
            }
        })
    }

    const worker = new Worker('/worker.js')
    const reader = new BrowserMessageReader(worker)
    const writer = new BrowserMessageWriter(worker)
    const languageClient = createLanguageClient({ reader, writer })
    languageClient.start()

    reader.onClose(() => languageClient.stop())
}

export { registerLsp }

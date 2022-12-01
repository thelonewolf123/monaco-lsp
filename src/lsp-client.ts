import {
    CloseAction,
    ErrorAction,
    type MessageTransports,
    MonacoLanguageClient
} from 'monaco-languageclient'
import {
    WebSocketMessageReader,
    WebSocketMessageWriter,
    toSocket
} from 'vscode-ws-jsonrpc'

declare global {
    interface Window {
        setImmediate: any
    }
}
export class LanguageServerPlugin {
    monaco: any
    language: string
    languageScope: { language: string }[]
    lspURL: string
    websocket?: WebSocket

    languageClient: MonacoLanguageClient | null

    constructor(
        language: string,
        languageScope: { language: string }[],
        lspURL: string
    ) {
        this.language = language
        this.languageClient = null
        this.languageScope = languageScope
        // this.lspURL = lspURL || 'ws://localhost:8989'
        this.lspURL = lspURL
        // this.lspURL = 'ws://localhost:8989'

        console.log('LSP URL => ', this.lspURL)
        window.setImmediate = window.setTimeout
        this.connectToLangServer()
    }

    createLanguageClient(transports: MessageTransports): MonacoLanguageClient {
        return new MonacoLanguageClient({
            name: `${this.language} Language Client`,
            clientOptions: {
                // use a language id as a document selector
                documentSelector: this.languageScope,
                // disable the default error handler
                errorHandler: {
                    error: () => ({ action: ErrorAction.Continue }),
                    closed: () => ({ action: CloseAction.DoNotRestart })
                }
            },
            // create a language client connection from the JSON RPC connection on demand
            connectionProvider: {
                get: () => {
                    return Promise.resolve(transports)
                }
            }
        })
    }

    connectToLangServer() {
        const url = `${this.lspURL}/${this.language}-lsp`

        this.websocket = new WebSocket(url)

        this.websocket.onopen = () => {
            const socket = toSocket(this.websocket as any)
            const reader = new WebSocketMessageReader(socket)
            const writer = new WebSocketMessageWriter(socket)
            this.languageClient = this.createLanguageClient({
                reader,
                writer
            })

            this.languageClient.start()
            reader.onClose(
                () =>
                    this.languageClient?.isRunning() &&
                    this.languageClient?.stop()
            )
        }
    }
}

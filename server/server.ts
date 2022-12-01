// /home/harish/.vscode/extensions/georgewfraser.vscode-javac-0.2.42/dist
import {
	WebSocketMessageReader,
	WebSocketMessageWriter,
	isRequestMessage,
} from 'vscode-ws-jsonrpc'

import {
	createConnection,
	forward,
	createServerProcess,
} from 'vscode-ws-jsonrpc/lib/server'
import { InitializeRequest } from 'vscode-languageserver'
import WebSocket from 'ws'

// initialize the WebSocket server instance
function createWsServer() {
	const wss = new WebSocket.Server({ port: 9001 })

	function launch(socket: any) {
		const reader = new WebSocketMessageReader(socket)
		const writer = new WebSocketMessageWriter(socket)
		const socketConnection = createConnection(reader, writer, () =>
			socket.dispose(),
		)

		const serverConnection = createServerProcess(
			'JSON',
			'/home/harish/.vscode/extensions/georgewfraser.vscode-javac-0.2.42/dist/lang_server_linux.sh',
		)
		forward(socketConnection, serverConnection, (message: any) => {
			console.log(message)
			if (isRequestMessage(message)) {
				if (message.method === InitializeRequest.type.method) {
					const initializeParams = message.params
					initializeParams.processId = process.pid
				}
			}
			return message
		})
	}

	wss.on('connection', async (conn: any) => {
		const socket = {
			send: (content: string) => conn.send(content),
			onMessage: (cb: any) =>
				conn.on('message', (msg: Buffer) => {
					const data = JSON.parse(msg.toString())
					if (data.params) {
						data.params.rootUri =
							'file:///home/harish/Project/monaco-lsp/src'
						data.params.rootPath =
							'/home/harish/Project/monaco-lsp/src'
						data.params.workspaceFolders = [
							{
								uri: '/home/harish/Project/monaco-lsp/src',
								name: 'java',
							},
						]
						console.log('updated uri path')
					}

					cb(Buffer.from(JSON.stringify(data)))
				}),
			onError: (cb: any) => conn.on('error', cb),
			onClose: (cb: any) => conn.on('close', cb),
			dispose: (cb: any) => conn.close(),
		}
		launch(socket)
	})
}

createWsServer()

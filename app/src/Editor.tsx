import { useEffect, useRef, useState } from 'react'
import * as monaco from 'monaco-editor'
import { MonacoServices } from 'monaco-languageclient'
import { JAVA_STARTER } from './constants'
import { registerLsp } from './lsp-pyodide'
import { StandaloneServices } from 'vscode/services'
import getMessageServiceOverride from 'vscode/service-override/messages'

export const MonacoEditor: React.FC<{ port: string }> = () => {
    const editor = useRef<HTMLDivElement | null>(null)
    StandaloneServices.initialize({
        ...getMessageServiceOverride(document.body)
    })
    
    useEffect(() => {
        if (!editor) return

        const editorInstance = monaco.editor.create(editor.current as any, {
            language: 'python'
        })
        MonacoServices.install()
        registerLsp()

        const model = monaco.editor.createModel(
            JAVA_STARTER,
            'python',
            monaco.Uri.file('file:///main.py')
        )

        editorInstance.setModel(model)

        return () => {
            model.dispose()
            editorInstance.dispose()
        }
    }, [])

    return <div ref={editor} style={{ height: '100vh', width: '600px' }}></div>
}

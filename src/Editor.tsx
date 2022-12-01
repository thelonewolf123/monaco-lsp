import { useEffect, useRef, useState } from 'react'
import * as monaco from 'monaco-editor'
import { MonacoServices } from 'monaco-languageclient'
import { JAVA_STARTER } from './constants'
import { LanguageServerPlugin } from './lsp-client'

export const MonacoEditor: React.FC<{ port: string }> = ({ port }) => {
    const editor = useRef<HTMLDivElement | null>(null)
    useEffect(() => {
        if (!editor) return

        const editorInstance = monaco.editor.create(editor.current as any, {
            language: 'java'
        })
        MonacoServices.install()

        const model = monaco.editor.createModel(
			JAVA_STARTER,
			'java',
			monaco.Uri.file('/home/harish/Project/monaco-lsp/src/Main.java'),
		)

        editorInstance.setModel(model)

        const plugin = new LanguageServerPlugin(
            'java',
            [{ language: 'java' }],
            `ws://localhost:${port}`
        )

        return () => {
            model.dispose()
            editorInstance.dispose()
        }
    }, [])

    return <div ref={editor} style={{ height: '100vh', width: '600px' }}></div>
}

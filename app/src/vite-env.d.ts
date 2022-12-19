/// <reference types="vite/client" />

declare global {
    interface Window {
        inputValueBuffer: SharedArrayBuffer | null
    }
}

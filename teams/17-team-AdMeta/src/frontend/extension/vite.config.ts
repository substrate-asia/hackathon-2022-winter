import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import webExtension from "vite-plugin-web-extension";
import path from 'path';

function root(...paths: string[]): string {
    return path.resolve(__dirname, ...paths);
}

// https://vitejs.dev/config/
export default defineConfig({
    root: "src",
    build: {
        outDir: root("dist"),
        emptyOutDir: true,
    },
    plugins: [
        react(),
        webExtension({
            manifest: path.resolve(__dirname, "src/manifest.json"),
            assets: "assets",
        }),
    ]
})

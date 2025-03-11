import { defineConfig } from 'vite'
import vue2 from '@vitejs/plugin-vue2'

export default defineConfig({
    plugins: [vue2()],
    define: {
        'process.env': {},
    },
    build: {
        lib: {
            entry: 'main.js',
            name: 'Dynatable',
            fileName: () => 'dynatable.js',
            formats: [ 'iife' ],
        },
        rollupOptions: {
            external: [],
            output: {
                globals: {},
            }
        }
    }
})

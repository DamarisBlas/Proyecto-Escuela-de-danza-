/*import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'node:path'


export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
      '@app': path.resolve(__dirname, 'src/app'),
      '@lib': path.resolve(__dirname, 'src/lib'),
      '@components': path.resolve(__dirname, 'src/components'),
      '@features': path.resolve(__dirname, 'src/features'),
      '@routing': path.resolve(__dirname, 'src/routing'),
      '@styles': path.resolve(__dirname, 'src/styles'),
      '@types': path.resolve(__dirname, 'src/types'),
      '@config': path.resolve(__dirname, 'src/config'),
    }
  }
})*/
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

import tailwindcss from 'tailwindcss'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: { '@': path.resolve(__dirname, 'src') ,
      '@styles': path.resolve(__dirname, 'src/styles'),
      '@lib': path.resolve(__dirname, 'src/lib'),
      '@routing': path.resolve(__dirname, 'src/routing'),
      '@features': path.resolve(__dirname, 'src/features'),
      '@components': path.resolve(__dirname, 'src/components'),
      '@app': path.resolve(__dirname, 'src/app'),
      '@types': path.resolve(__dirname, 'src/types'),
      '@config': path.resolve(__dirname, 'src/config'),
      '@assets': path.resolve(__dirname, 'src/assets'),

    },
  },
})


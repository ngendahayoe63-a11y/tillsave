import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import path from 'path';
// https://vitejs.dev/config/
export default defineConfig({
    plugins: [
        react(),
        VitePWA({
            registerType: 'autoUpdate',
            includeAssets: ['favicon.ico', '**/*.{js,css,html,svg,png,jpg,jpeg,gif,woff,woff2,ttf,eot}'],
            workbox: {
                clientsClaim: true,
                skipWaiting: true,
                globPatterns: [
                    '**/*.{js,css,html,svg,png,jpg,jpeg,gif,woff,woff2,ttf,eot}'
                ],
                runtimeCaching: [
                    // API calls - network first, fall back to cache
                    {
                        urlPattern: /^https:\/\/(.*)?supabase\.co\/rest/,
                        handler: 'NetworkFirst',
                        options: {
                            cacheName: 'api-cache',
                            expiration: {
                                maxEntries: 200,
                                maxAgeSeconds: 24 * 60 * 60 // 24 hours
                            },
                            networkTimeoutSeconds: 5 // Wait 5 seconds for network, then use cache
                        }
                    },
                    // Images - cache first
                    {
                        urlPattern: /\.(?:png|jpg|jpeg|svg|gif)$/,
                        handler: 'CacheFirst',
                        options: {
                            cacheName: 'image-cache',
                            expiration: {
                                maxEntries: 100,
                                maxAgeSeconds: 7 * 24 * 60 * 60 // 7 days
                            }
                        }
                    },
                    // JS/CSS - cache first with network fallback
                    {
                        urlPattern: /\.(?:js|css)$/,
                        handler: 'CacheFirst',
                        options: {
                            cacheName: 'static-cache',
                            expiration: {
                                maxAgeSeconds: 7 * 24 * 60 * 60 // 7 days
                            }
                        }
                    }
                ]
            },
            manifest: {
                name: 'TillSave - Community Savings',
                short_name: 'TillSave',
                description: 'Digital ledger for savings groups in East Africa. Works offline with automatic sync when connected.',
                theme_color: '#ffffff',
                background_color: '#ffffff',
                display: 'standalone',
                orientation: 'portrait-primary',
                start_url: '/',
                scope: '/',
                icons: [
                    {
                        src: 'favicon.ico',
                        sizes: '64x64',
                        type: 'image/x-icon'
                    }
                ],
                screenshots: [
                    {
                        src: 'favicon.ico',
                        sizes: '192x192',
                        type: 'image/png',
                        form_factor: 'narrow'
                    }
                ],
                categories: ['finance', 'productivity'],
                shortcuts: [
                    {
                        name: 'Dashboard',
                        short_name: 'Dashboard',
                        description: 'View your savings dashboard',
                        url: '/member',
                        icons: []
                    }
                ]
            }
        })
    ],
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './src'),
        },
    },
});

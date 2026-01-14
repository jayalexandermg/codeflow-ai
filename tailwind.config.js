/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                // Dark theme colors from design
                'cf-dark': {
                    900: '#0a0a0f',
                    800: '#12121a',
                    700: '#1a1a24',
                    600: '#22222e',
                },
                // Orange/amber accent
                'cf-orange': {
                    500: '#f59e0b',
                    600: '#d97706',
                },
                // Teal accent
                'cf-teal': {
                    500: '#14b8a6',
                    600: '#0d9488',
                },
                // Status colors
                'cf-green': '#22c55e',
                'cf-yellow': '#eab308',
                'cf-red': '#ef4444',
            },
            backgroundImage: {
                'gradient-cta': 'linear-gradient(135deg, #f59e0b 0%, #14b8a6 100%)',
                'gradient-card': 'linear-gradient(180deg, rgba(20,184,166,0.1) 0%, rgba(245,158,11,0.1) 100%)',
            },
        },
    },
    plugins: [],
}

// Placeholder - User will provide actual component code
export function Header() {
    return (
        <header className="fixed top-0 left-0 right-0 z-50 px-6 py-4 flex items-center justify-between bg-cf-dark-900/80 backdrop-blur-sm">
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-cf-teal-500 to-cf-orange-500 rounded-xl flex items-center justify-center">
                    <span className="text-xl">🤖</span>
                </div>
                <div>
                    <h1 className="text-lg font-semibold text-white">CodeFlow AI</h1>
                    <p className="text-xs text-gray-400">Agent Ready • Intelligent Code Review</p>
                </div>
            </div>
            <nav className="flex items-center gap-4">
                <button className="p-2 rounded-full hover:bg-cf-dark-700">
                    <span className="text-gray-400">?</span>
                </button>
                <a href="/" className="flex items-center gap-2 px-4 py-2 rounded-lg bg-cf-dark-700 hover:bg-cf-dark-600 text-white">
                    🏠 Home
                </a>
            </nav>
        </header>
    )
}

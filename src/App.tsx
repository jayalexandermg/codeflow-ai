import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Header } from './components/Header'
import { LandingPage } from './pages/LandingPage'
import { CodeInputPage } from './pages/CodeInputPage'
import { ResultsPage } from './pages/ResultsPage'
import { LoadingPage } from './pages/LoadingPage'

function App() {
    return (
        <BrowserRouter>
            <div className="min-h-screen bg-cf-dark-900">
                <Header />
                <main>
                    <Routes>
                        <Route path="/" element={<LandingPage />} />
                        <Route path="/input" element={<CodeInputPage />} />
                        <Route path="/loading" element={<LoadingPage />} />
                        <Route path="/results" element={<ResultsPage />} />
                    </Routes>
                </main>
            </div>
        </BrowserRouter>
    )
}

export default App

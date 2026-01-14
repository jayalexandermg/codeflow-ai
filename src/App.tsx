import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { ReviewProvider } from '@/context/ReviewContext';
import { BackgroundMesh } from '@/components/BackgroundMesh';
import { Header } from '@/components/Header';
import { LandingPage } from '@/pages/LandingPage';
import { CodeInputPage } from '@/pages/CodeInputPage';
import { LoadingPage } from '@/pages/LoadingPage';
import { ResultsPage } from '@/pages/ResultsPage';

function App() {
    return (
        <ReviewProvider>
            <BrowserRouter>
                <div className="min-h-screen bg-[#0a0a0f] text-white">
                    <BackgroundMesh />
                    <Header />
                    <main className="pt-20">
                        <AnimatePresence mode="wait">
                            <Routes>
                                <Route path="/" element={<LandingPage />} />
                                <Route path="/input" element={<CodeInputPage />} />
                                <Route path="/loading" element={<LoadingPage />} />
                                <Route path="/results" element={<ResultsPage />} />
                            </Routes>
                        </AnimatePresence>
                    </main>
                </div>
            </BrowserRouter>
        </ReviewProvider>
    );
}

export default App;

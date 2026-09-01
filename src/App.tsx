import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { ErrorBoundary } from './components/ErrorBoundary';
import { VALID_ROUTES, isValidRoute, AppRoute } from './lib/routes';
import { Home } from './pages/Home';
import { Problem } from './pages/Problem';
import { Architecture } from './pages/Architecture';
import { Demo } from './pages/Demo';
import { Simulation } from './pages/Simulation';
import { Results } from './pages/Results';
import { Methodology } from './pages/Methodology';
import { About } from './pages/About';

export default function App() {
  const [currentRoute, setCurrentRoute] = useState<string>(() => {
    const path = window.location.pathname;
    return isValidRoute(path) ? path : '/';
  });

  const handleRouteChange = (route: string) => {
    if (route === currentRoute) return;
    setCurrentRoute(route);
    window.history.pushState({}, '', route);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname;
      setCurrentRoute(isValidRoute(path) ? path : '/');
      window.scrollTo({ top: 0, behavior: 'instant' });
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const renderPage = () => {
    switch (currentRoute) {
      case '/problem':
        return <Problem onRouteChange={handleRouteChange} />;
      case '/architecture':
        return <Architecture onRouteChange={handleRouteChange} />;
      case '/demo':
        return <Demo onRouteChange={handleRouteChange} />;
      case '/simulation':
        return <Simulation onRouteChange={handleRouteChange} />;
      case '/results':
        return <Results onRouteChange={handleRouteChange} />;
      case '/methodology':
        return <Methodology onRouteChange={handleRouteChange} />;
      case '/about':
        return <About onRouteChange={handleRouteChange} />;
      case '/':
      default:
        return <Home onRouteChange={handleRouteChange} />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#0A0E14] text-[#F2F4F7] selection:bg-[#F5A623] selection:text-[#0A0E14] font-sans antialiased overflow-x-hidden">
      {/* Sticky Header Navigation with Integrated Live Ticker */}
      <Navbar currentRoute={currentRoute} onRouteChange={handleRouteChange} />

      {/* Main Content with Shared Motion Transitions and Error Boundary */}
      <main className="flex-1 w-full flex flex-col relative">
        <ErrorBoundary>
          <AnimatePresence mode="wait">
            <motion.div
              key={currentRoute}
              layoutId="appMainContainer"
              initial={{ opacity: 0, y: 12, filter: 'blur(4px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              exit={{ opacity: 0, y: -12, filter: 'blur(4px)' }}
              transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
              className="w-full flex-1 flex flex-col"
            >
              {renderPage()}
            </motion.div>
          </AnimatePresence>
        </ErrorBoundary>
      </main>

      {/* Persistent Footer */}
      <Footer onRouteChange={handleRouteChange} />
    </div>
  );
}


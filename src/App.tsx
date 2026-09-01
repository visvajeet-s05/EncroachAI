import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { ErrorBoundary } from './components/ErrorBoundary';
import { NavigationProvider, useNavigation } from './context/NavigationContext';
import { Home } from './pages/Home';
import { Problem } from './pages/Problem';
import { Architecture } from './pages/Architecture';
import { Demo } from './pages/Demo';
import { Simulation } from './pages/Simulation';
import { Results } from './pages/Results';
import { Methodology } from './pages/Methodology';
import { About } from './pages/About';

function AppContent() {
  const { currentRoute, navigate } = useNavigation();

  const renderPage = () => {
    switch (currentRoute) {
      case '/problem':
        return <Problem onRouteChange={navigate} />;
      case '/architecture':
        return <Architecture onRouteChange={navigate} />;
      case '/demo':
        return <Demo onRouteChange={navigate} />;
      case '/simulation':
        return <Simulation onRouteChange={navigate} />;
      case '/results':
        return <Results onRouteChange={navigate} />;
      case '/methodology':
        return <Methodology onRouteChange={navigate} />;
      case '/about':
        return <About onRouteChange={navigate} />;
      case '/':
      default:
        return <Home onRouteChange={navigate} />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#0A0E14] text-[#F2F4F7] selection:bg-[#F5A623] selection:text-[#0A0E14] font-sans antialiased overflow-x-hidden">
      {/* Sticky Header Navigation with Integrated Live Ticker */}
      <Navbar currentRoute={currentRoute} onRouteChange={navigate} />

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
      <Footer onRouteChange={navigate} />
    </div>
  );
}

export default function App() {
  return (
    <NavigationProvider>
      <AppContent />
    </NavigationProvider>
  );
}


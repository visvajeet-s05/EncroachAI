import React, { Suspense, lazy } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { ErrorBoundary } from './components/ErrorBoundary';
import { LoadingFallback } from './components/LoadingFallback';
import { NavigationProvider, useNavigation } from './context/NavigationContext';

// Exactly 3 application pages with Suspense boundaries
const Home = lazy(() => import('./pages/Home').then(m => ({ default: m.Home })));
const Tool = lazy(() => import('./pages/Tool').then(m => ({ default: m.Tool })));
const About = lazy(() => import('./pages/About').then(m => ({ default: m.About })));

function AppContent() {
  const { currentRoute, navigate } = useNavigation();

  const renderPage = () => {
    switch (currentRoute) {
      case '/tool':
      case '/demo': // support backward compatibility
        return <Tool onRouteChange={navigate} />;
      case '/about':
        return <About onRouteChange={navigate} />;
      case '/':
      default:
        return <Home onRouteChange={navigate} />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#0A0E14] text-[#F2F4F7] selection:bg-[#F5A623] selection:text-[#0A0E14] font-sans antialiased overflow-x-hidden">
      {/* Sticky Header Navigation */}
      <Navbar currentRoute={currentRoute} onRouteChange={navigate} />

      {/* Main Content with Shared Motion Transitions and Error Boundary */}
      <main className="flex-1 w-full flex flex-col relative">
        <ErrorBoundary>
          <AnimatePresence mode="wait">
            <motion.div
              key={currentRoute}
              layoutId="appMainContainer"
              initial={{ opacity: 0, y: 10, filter: 'blur(3px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              exit={{ opacity: 0, y: -10, filter: 'blur(3px)' }}
              transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
              className="w-full flex-1 flex flex-col"
            >
              <Suspense fallback={<LoadingFallback />}>
                {renderPage()}
              </Suspense>
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

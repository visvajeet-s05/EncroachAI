import React, { Suspense, lazy } from 'react';
import { Navbar } from './components/Navbar';
import { ErrorBoundary } from './components/ErrorBoundary';
import { LoadingFallback } from './components/LoadingFallback';
import { NavigationProvider, useNavigation } from './context/NavigationContext';

const Home = lazy(() => import('./pages/Home').then(m => ({ default: m.Home })));

function AppContent() {
  const { navigate } = useNavigation();

  return (
    <div className="min-h-screen flex flex-col bg-[#070A0E] text-[#F2F4F7] selection:bg-[#F5A623] selection:text-[#0A0E14] font-mono antialiased overflow-x-hidden">
      {/* Sleek Minimal Header */}
      <Navbar />

      {/* Full-Screen High-Impact Container with Live Video Perception Feed */}
      <main className="flex-1 w-full flex flex-col relative">
        <ErrorBoundary>
          <Suspense fallback={<LoadingFallback />}>
            <Home onRouteChange={navigate} />
          </Suspense>
        </ErrorBoundary>
      </main>
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

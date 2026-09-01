import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { VALID_ROUTES, isValidRoute, AppRoute } from '../lib/routes';

interface NavigationContextType {
  currentRoute: string;
  navigate: (route: string) => void;
  validRoutes: readonly string[];
}

const NavigationContext = createContext<NavigationContextType | undefined>(undefined);

export const NavigationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentRoute, setCurrentRoute] = useState<string>(() => {
    const path = window.location.pathname;
    return isValidRoute(path) ? path : '/';
  });

  const navigate = (route: string) => {
    if (route === currentRoute) return;
    const target = isValidRoute(route) ? route : '/';
    setCurrentRoute(target);
    window.history.pushState({}, '', target);
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

  return (
    <NavigationContext.Provider value={{ currentRoute, navigate, validRoutes: VALID_ROUTES }}>
      {children}
    </NavigationContext.Provider>
  );
};

export const useNavigation = (): NavigationContextType => {
  const context = useContext(NavigationContext);
  if (!context) {
    throw new Error('useNavigation must be used within a NavigationProvider');
  }
  return context;
};

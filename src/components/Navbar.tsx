import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Menu, 
  X, 
  Radio,
  Sliders,
  User,
  Home as HomeIcon,
  ArrowRight
} from 'lucide-react';

interface NavbarProps {
  currentRoute: string;
  onRouteChange: (route: string) => void;
}

const navItems = [
  { id: 'home', label: 'Corridor Overview', path: '/', icon: HomeIcon },
  { id: 'tool', label: 'Actuation Console', path: '/tool', icon: Sliders },
  { id: 'about', label: 'System Architecture', path: '/about', icon: User },
];

export const Navbar: React.FC<NavbarProps> = ({ currentRoute, onRouteChange }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <>
      {/* Top Authority Telemetry Ribbon */}
      <div className="w-full bg-[#070A0E] border-b border-[#1E2632] px-4 sm:px-6 py-1.5 text-[11px] font-mono text-[#8B94A3] flex items-center justify-between select-none">
        <div className="flex items-center gap-2.5">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#2ECC71] opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-[#2ECC71]"></span>
          </span>
          <span className="text-[#F5A623] font-bold tracking-wider">
            ENCROACH.AI • CLOSED-LOOP ARTERIAL SIGNAL CONTROL
          </span>
          <span className="text-[#334155] hidden sm:inline">|</span>
          <span className="text-[#C8D1DC] hidden sm:inline flex items-center gap-1.5">
            <span className="text-[#8B94A3]">CORRIDOR:</span> Anna Salai (SH-1), Chennai (6.8 km)
          </span>
        </div>

        <div className="flex items-center gap-3 text-[10px] font-mono">
          <div className="hidden lg:flex items-center gap-1.5 text-[#38BDF8]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#38BDF8]"></span>
            <span>EDGE: NVIDIA JETSON XAVIER (FP16)</span>
          </div>
          <span className="text-[#334155] hidden lg:inline">•</span>
          <div className="hidden md:flex items-center gap-1 text-[#2ECC71]">
            <span>NEMA TS2: ACTIVE</span>
          </div>
          <span className="text-[#334155] hidden md:inline">•</span>
          <div className="text-[#8B94A3]">
            LATENCY: <span className="text-white font-bold">24.2ms</span>
          </div>
        </div>
      </div>

      <header 
        id="main-navbar"
        className="sticky top-0 left-0 w-full z-40 bg-[#0A0E14]/95 backdrop-blur-md border-b border-[#242C38] shadow-lg shadow-black/40"
      >
        <div className="max-w-[1280px] mx-auto px-6 md:px-12 py-3 flex items-center justify-between gap-4">
          {/* Brand Logo */}
          <button
            id="nav-logo-btn"
            onClick={() => {
              onRouteChange('/');
              setMobileMenuOpen(false);
            }}
            className="flex items-center gap-2.5 group text-left cursor-pointer focus:outline-none shrink-0"
          >
            <div className="relative w-8 h-8 rounded-lg bg-gradient-to-br from-[#F5A623] to-[#d4880f] flex items-center justify-center shadow-md shadow-[#F5A623]/25 border border-[#F5A623]/40">
              <Radio className="w-4 h-4 text-[#0A0E14]" />
            </div>
            <div>
              <span className="font-bold text-lg tracking-tight text-[#F2F4F7] group-hover:text-white transition-colors font-mono">
                Encroach<span className="text-[#F5A623]">AI</span>
              </span>
            </div>
          </button>

          {/* Desktop Navigation Links: exactly Home, Tool, About */}
          <nav className="hidden md:flex items-center gap-1 bg-[#131820] border border-[#242C38] p-1 rounded-xl">
            {navItems.map((item) => {
              const isActive = currentRoute === item.path || (item.path === '/' && currentRoute === '');
              return (
                <button
                  key={item.id}
                  id={`nav-link-${item.id}`}
                  onClick={() => onRouteChange(item.path)}
                  aria-current={isActive ? 'page' : undefined}
                  className={`relative px-4 py-1.5 text-xs font-mono font-medium transition-colors rounded-lg cursor-pointer ${
                    isActive 
                      ? 'text-white font-bold' 
                      : 'text-[#8B94A3] hover:text-[#F2F4F7] hover:bg-[#1B222D]/60'
                  }`}
                >
                  {item.label}
                  {isActive && (
                    <motion.div
                      layoutId="activeNavIndicator"
                      className="absolute inset-0 bg-[#F5A623]/20 border border-[#F5A623]/60 rounded-lg -z-10"
                      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                    />
                  )}
                </button>
              );
            })}
          </nav>

          {/* Right Action Button */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              id="nav-tool-cta-btn"
              onClick={() => {
                onRouteChange('/tool');
                setMobileMenuOpen(false);
              }}
              className="px-3.5 py-1.5 text-xs font-mono font-bold rounded-lg bg-[#F5A623] hover:bg-[#e09419] text-[#0A0E14] transition-all shadow-md shadow-[#F5A623]/20 flex items-center gap-1.5 cursor-pointer"
            >
              <span>Actuation Console</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>

            {/* Mobile Menu Toggle */}
            <button
              id="nav-mobile-toggle"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg bg-[#141B24] border border-[#242C38] text-[#F2F4F7] hover:text-[#F5A623] transition-colors focus:outline-none cursor-pointer"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              id="mobile-nav-drawer"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden border-t border-[#1E2632] bg-[#0E131A] px-4 py-4 space-y-2"
            >
              {navItems.map((item) => {
                const IconComponent = item.icon;
                const isActive = currentRoute === item.path || (item.path === '/' && currentRoute === '');
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      onRouteChange(item.path);
                      setMobileMenuOpen(false);
                    }}
                    className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-xs font-mono text-left transition-colors cursor-pointer ${
                      isActive 
                        ? 'bg-[#F5A623]/15 text-[#F5A623] font-bold border border-[#F5A623]/30' 
                        : 'text-[#94A3B8] hover:bg-[#141B24] hover:text-white'
                    }`}
                  >
                    <IconComponent className="w-4 h-4" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>
      </header>
    </>
  );
};

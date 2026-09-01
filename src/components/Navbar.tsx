import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Activity, 
  Layers, 
  Cpu, 
  BarChart3, 
  Sliders, 
  FileText, 
  User, 
  Menu, 
  X, 
  Radio,
  AlertTriangle,
  BookOpen,
  ChevronRight,
  ShieldCheck,
  Zap
} from 'lucide-react';

interface NavbarProps {
  currentRoute: string;
  onRouteChange: (route: string) => void;
}

const navItems = [
  { id: 'command', label: 'Command Center', sublabel: 'Corridor Overview', path: '/', icon: Radio },
  { id: 'vision', label: 'Edge Vision', sublabel: 'YOLOv10 Feeds', path: '/demo', icon: Activity },
  { id: 'simulation', label: 'Signal Actuation', sublabel: '3D Twin & SUMO', path: '/simulation', icon: Sliders },
  { id: 'results', label: 'Analytics', sublabel: '100 Seed Runs', path: '/results', icon: BarChart3 },
  { id: 'architecture', label: 'Neural ST-GNN', sublabel: '3-Layer Pipeline', path: '/architecture', icon: Cpu },
  { id: 'problem', label: 'Bottlenecks', sublabel: 'Field Surveys', path: '/problem', icon: AlertTriangle },
  { id: 'methodology', label: 'Calibration', sublabel: 'Sensor Matrices', path: '/methodology', icon: BookOpen },
  { id: 'about', label: 'About', sublabel: 'Platform Architecture', path: '/about', icon: User },
];

export const Navbar: React.FC<NavbarProps> = ({ currentRoute, onRouteChange }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <>
      <header 
        id="main-navbar"
        className="sticky top-0 left-0 w-full z-40 bg-[#0A0E14]/95 backdrop-blur-md border-b border-[#242C38] shadow-2xl shadow-black/50"
      >
        {/* Top Navigation Row */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-3 flex items-center justify-between gap-4">
          {/* Brand Wordmark */}
          <button
            id="nav-logo-btn"
            onClick={() => {
              onRouteChange('/');
              setMobileMenuOpen(false);
            }}
            className="flex items-center gap-3 group text-left cursor-pointer focus:outline-none shrink-0"
          >
            <div className="relative w-9 h-9 rounded-xl bg-gradient-to-br from-[#F5A623] to-[#d4880f] flex items-center justify-center shadow-lg shadow-[#F5A623]/25 border border-[#F5A623]/40">
              <Radio className="w-4 h-4 text-[#0A0E14] animate-pulse" />
              <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-[#2ECC71] ring-2 ring-[#0A0E14]"></span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-lg tracking-tight text-[#F2F4F7] group-hover:text-white transition-colors font-mono">
                  Encroach<span className="text-[#F5A623]">AI</span>
                </span>
                <span className="hidden sm:inline-block text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-[#2ECC71]/15 text-[#2ECC71] border border-[#2ECC71]/30 font-bold">
                  ITMS Prototype
                </span>
              </div>
              <p className="text-[10px] text-[#8B94A3] font-mono hidden md:block leading-none mt-0.5">
                Vision-Edge ST-GNN Signal Control
              </p>
            </div>
          </button>

          {/* Desktop Navigation Links (Visible on Large/XL screens) */}
          <nav className="hidden xl:flex items-center gap-1 bg-[#131820]/90 border border-[#242C38] p-1 rounded-xl shadow-inner">
            {navItems.map((item) => {
              const isActive = currentRoute === item.path || (item.path === '/' && currentRoute === '');
              return (
                <button
                  key={item.id}
                  id={`nav-link-${item.id}`}
                  onClick={() => onRouteChange(item.path)}
                  aria-current={isActive ? 'page' : undefined}
                  className={`relative px-3.5 py-1.5 text-xs font-mono font-medium transition-colors rounded-lg cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#F5A623] focus-visible:ring-offset-1 focus-visible:ring-offset-[#0A0E14] whitespace-nowrap ${
                    isActive 
                      ? 'text-white font-bold' 
                      : 'text-[#8B94A3] hover:text-[#F2F4F7] hover:bg-[#1B222D]/60'
                  }`}
                >
                  {item.label}
                  {isActive && (
                    <motion.div
                      layoutId="activeNavIndicator"
                      className="absolute inset-0 bg-[#F5A623]/20 border border-[#F5A623]/60 rounded-lg -z-10 shadow-[0_0_12px_rgba(245,166,35,0.3)]"
                      transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                    />
                  )}
                </button>
              );
            })}
          </nav>

          {/* Right Action Buttons */}
          <div className="flex items-center gap-2.5 shrink-0">
            {/* Quick Live Vision CTA */}
            <button
              id="nav-quick-demo-btn"
              onClick={() => {
                onRouteChange('/demo');
                setMobileMenuOpen(false);
              }}
              className="hidden sm:flex px-3.5 py-1.5 text-xs font-mono font-bold rounded-lg bg-[#F5A623] hover:bg-[#e09419] text-[#0A0E14] transition-all shadow-md shadow-[#F5A623]/20 items-center gap-1.5 cursor-pointer"
            >
              <Activity className="w-3.5 h-3.5" />
              <span>Vision Demo</span>
            </button>

            {/* Mobile & Tablet Drawer Menu Toggle */}
            <button
              id="nav-mobile-toggle"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="xl:hidden p-2 rounded-lg bg-[#141B24] border border-[#242C38] text-[#F2F4F7] hover:text-[#F5A623] transition-colors focus:outline-none cursor-pointer"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile & Tablet Full-Featured Navigation Drawer */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              id="mobile-nav-drawer"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.25 }}
              className="xl:hidden bg-[#0D1219] border-t border-[#242C38] px-4 sm:px-6 py-5 overflow-hidden shadow-2xl max-h-[80vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-[#242C38] text-xs font-mono text-[#8B94A3]">
                <span>Corridor Navigation Modules</span>
                <span className="text-[#8B94A3] flex items-center gap-1">
                  Offline Research Dashboard
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {navItems.map((item, idx) => {
                  const isActive = currentRoute === item.path || (item.path === '/' && currentRoute === '');
                  const Icon = item.icon;
                  return (
                    <motion.button
                      key={item.id}
                      id={`mobile-nav-${item.id}`}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.03 }}
                      onClick={() => {
                        onRouteChange(item.path);
                        setMobileMenuOpen(false);
                      }}
                      aria-current={isActive ? 'page' : undefined}
                      className={`flex items-center justify-between p-3 rounded-xl text-left transition-all cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#F5A623] ${
                        isActive 
                          ? 'bg-[#F5A623]/15 text-[#F5A623] border border-[#F5A623]/40 shadow-md shadow-[#F5A623]/10 font-semibold' 
                          : 'bg-[#141B24] border border-[#242C38] text-[#8B94A3] hover:text-white hover:border-[#8B94A3]/40'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${isActive ? 'bg-[#F5A623] text-[#0A0E14]' : 'bg-[#1B222D] text-[#8B94A3]'}`}>
                          <Icon className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="text-xs font-bold text-[#F2F4F7] font-mono">{item.label}</div>
                          <div className="text-[10px] text-[#8B94A3] font-mono">{item.sublabel}</div>
                        </div>
                      </div>
                      <ChevronRight className={`w-4 h-4 ${isActive ? 'text-[#F5A623]' : 'text-[#8B94A3]/50'}`} />
                    </motion.button>
                  );
                })}
              </div>
              
              {/* Mobile CTA Footer */}
              <div className="pt-4 mt-4 border-t border-[#242C38]">
                <button
                  id="mobile-launch-demo-btn"
                  onClick={() => {
                    onRouteChange('/demo');
                    setMobileMenuOpen(false);
                  }}
                  className="w-full py-2.5 px-4 text-center text-xs font-mono font-bold rounded-xl bg-[#F5A623] hover:bg-[#e09419] text-[#0A0E14] flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-[#F5A623]/20"
                >
                  <Activity className="w-4 h-4" />
                  <span>Open Edge Vision Stream</span>
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>
    </>
  );
};

import React from 'react';
import { LiveCameraDetector } from '../components/LiveCameraDetector';

interface HomeProps {
  onRouteChange?: (route: string) => void;
  isSdlcDrawerOpen?: boolean;
  setIsSdlcDrawerOpen?: (open: boolean) => void;
}

export const Home: React.FC<HomeProps> = () => {
  return (
    <div 
      id="home-page" 
      className="w-full flex-1 flex flex-col items-center justify-center p-3 sm:p-5 lg:p-6 font-mono"
    >
      {/* High-Impact Full-Width Live Video Perception Container */}
      <div className="w-full max-w-[1400px] flex-1 flex flex-col">
        <LiveCameraDetector />
      </div>
    </div>
  );
};

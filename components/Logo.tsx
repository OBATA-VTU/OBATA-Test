import React, { useState } from 'react';
import { Zap } from 'lucide-react';

interface LogoProps {
  className?: string;
  showRing?: boolean;
}

export const Logo: React.FC<LogoProps> = ({ className = "h-10 w-10", showRing = true }) => {
  const [imgError, setImgError] = useState(false);

  const LogoContent = () => {
    if (imgError) {
      return (
        <div className={`flex items-center justify-center bg-gradient-to-br from-blue-600 to-amber-500 rounded-full text-white shadow-lg ${className}`}>
          <Zap className="w-3/5 h-3/5 fill-current" />
        </div>
      );
    }
    return (
      <img 
        src="/logo.png" 
        alt="OBATA VTU" 
        className={`object-contain rounded-full bg-white p-0.5 ${className}`} 
        onError={() => setImgError(true)}
      />
    );
  };

  if (showRing) {
    return (
      <div className="relative group">
         <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-amber-500 rounded-full blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
         <div className="relative">
            <LogoContent />
         </div>
      </div>
    );
  }

  return <LogoContent />;
};

import React, { useState, useEffect } from 'react';
import { AvatarService } from '../services/AvatarService';
import { ClassType } from '../types';

interface AvatarDisplayProps {
  seed: string;
  role?: string | ClassType;
  className?: string;
  alt?: string;
  grayscale?: boolean;
}

const AvatarDisplay: React.FC<AvatarDisplayProps> = ({ seed, role, className, alt, grayscale }) => {
  const [src, setSrc] = useState<string>('');
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Reset state when seed changes
    setHasError(false);
    setIsLoading(true);

    // Generate primary URL
    const url = AvatarService.getAvatarUrl(seed, role);
    setSrc(url);
  }, [seed, role]);

  const handleError = () => {
    if (!hasError) {
      setHasError(true);
      setIsLoading(false);
      // Switch to local fallback
      const fallback = AvatarService.getFallbackContent(role);
      setSrc(fallback);
    }
  };

  const handleLoad = () => {
    setIsLoading(false);
  };

  return (
    <div className={`relative overflow-hidden ${className || ''}`}>

      {/* Loading Placeholder */}
      {isLoading && !hasError && (
        <div className="absolute inset-0 bg-slate-200 animate-pulse flex items-center justify-center">
          <div className="w-1/2 h-1/2 bg-slate-300 rounded-full opacity-50"></div>
        </div>
      )}

      {src && (
        <img
          src={src}
          alt={alt || "Character Avatar"}
          onError={handleError}
          onLoad={handleLoad}
          className={`w-full h-full object-cover transition-opacity duration-300 ${isLoading ? 'opacity-0' : 'opacity-100'} ${grayscale ? 'grayscale' : ''}`}
        />
      )}
    </div>
  );
};

export default AvatarDisplay;

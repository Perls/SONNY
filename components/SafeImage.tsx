
import React, { useState } from 'react';

interface SafeImageProps {
  src: string;
  alt: string;
  className?: string;
  fallbackColorClass?: string; // e.g. 'bg-slate-900'
}

const SafeImage: React.FC<SafeImageProps> = ({ src, alt, className, fallbackColorClass = 'bg-slate-900' }) => {
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const handleError = () => {
    setHasError(true);
    setIsLoading(false);
  };

  return (
    <div className={`relative overflow-hidden ${className || ''} ${hasError ? fallbackColorClass : ''}`}>
      
      {/* Fallback Pattern (Only visible if error) */}
      {hasError && (
        <div className="absolute inset-0 w-full h-full opacity-30" 
             style={{ 
                 backgroundImage: 'repeating-linear-gradient(45deg, #000 0, #000 10px, transparent 10px, transparent 20px)' 
             }}>
        </div>
      )}

      {/* Loading State */}
      {isLoading && !hasError && (
        <div className="absolute inset-0 bg-slate-800 animate-pulse"></div>
      )}

      {!hasError && (
        <img
          src={src}
          alt={alt}
          onError={handleError}
          onLoad={() => setIsLoading(false)}
          className={`w-full h-full object-cover transition-opacity duration-500 ${isLoading ? 'opacity-0' : 'opacity-100'}`}
        />
      )}
    </div>
  );
};

export default SafeImage;

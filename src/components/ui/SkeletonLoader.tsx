import React from 'react';

interface SkeletonLoaderProps {
  width?: string | number;
  height?: string | number;
  className?: string;
  rounded?: boolean;
  circle?: boolean;
  count?: number;
  animate?: boolean;
}

/**
 * Component for showing loading states
 */
const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({
  width,
  height,
  className = '',
  rounded = false,
  circle = false,
  count = 1,
  animate = true,
}) => {
  const getStyles = (): React.CSSProperties => {
    return {
      width: width || '100%',
      height: height || '1rem',
      borderRadius: circle ? '50%' : rounded ? '0.375rem' : '0.125rem',
    };
  };

  const renderSkeletons = () => {
    const skeletons = [];
    
    for (let i = 0; i < count; i++) {
      skeletons.push(
        <div
          key={i}
          className={`${animate ? 'animate-pulse' : ''} bg-gray-200 ${className}`}
          style={getStyles()}
          aria-hidden="true"
        />
      );
    }
    
    return skeletons;
  };

  return <>{renderSkeletons()}</>;
};

export default SkeletonLoader;
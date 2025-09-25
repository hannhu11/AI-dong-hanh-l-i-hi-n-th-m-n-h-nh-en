import React, { useEffect, useState } from 'react';
import './ThoughtBubble.css';

interface ThoughtBubbleProps {
  message: string;
  isVisible: boolean;
  onAnimationComplete?: () => void;
  duration?: number; // Duration in milliseconds
}

const ThoughtBubble: React.FC<ThoughtBubbleProps> = ({
  message,
  isVisible,
  onAnimationComplete,
  duration = 12000, // Default 12 seconds total (2s fade-in + 8s display + 2s fade-out)
}) => {
  const [animationPhase, setAnimationPhase] = useState<'hidden' | 'fade-in' | 'visible' | 'fade-out'>('hidden');

  useEffect(() => {
    if (isVisible) {
      // Start fade-in
      setAnimationPhase('fade-in');
      
      // After fade-in (1.5s), show message
      const fadeInTimer = setTimeout(() => {
        setAnimationPhase('visible');
        
        // After display duration (duration - 4s for fade transitions), start fade-out
        const displayTimer = setTimeout(() => {
          setAnimationPhase('fade-out');
          
          // After fade-out (1.5s), hide completely
          const fadeOutTimer = setTimeout(() => {
            setAnimationPhase('hidden');
            onAnimationComplete?.();
          }, 1500);
          
          return () => clearTimeout(fadeOutTimer);
        }, duration - 3000); // Display time (total - fade in - fade out)
        
        return () => clearTimeout(displayTimer);
      }, 1500);
      
      return () => clearTimeout(fadeInTimer);
    } else {
      setAnimationPhase('hidden');
    }
  }, [isVisible, duration, onAnimationComplete]);

  if (animationPhase === 'hidden') {
    return null;
  }

  return (
    <div 
      className={`thought-bubble thought-bubble--${animationPhase}`}
      style={{
        position: 'fixed',
        top: '20px',
        right: '20px',
        zIndex: 9999,
        maxWidth: '300px',
        pointerEvents: 'none',
      }}
    >
      <div className="thought-bubble__content">
        <div className="thought-bubble__text">
          {message}
        </div>
        <div className="thought-bubble__tail"></div>
      </div>
    </div>
  );
};

export default ThoughtBubble;

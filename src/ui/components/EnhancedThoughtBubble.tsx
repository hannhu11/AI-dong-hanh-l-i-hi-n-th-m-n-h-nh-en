import React, { useEffect, useState } from 'react';
import './EnhancedThoughtBubble.css';

interface EnhancedThoughtBubbleProps {
  message: string;
  isVisible: boolean;
  onAnimationComplete?: () => void;
  duration?: number;
  bubbleType?: 'gentle' | 'rest' | 'creative' | 'healing';
}

const EnhancedThoughtBubble: React.FC<EnhancedThoughtBubbleProps> = ({
  message,
  isVisible,
  onAnimationComplete,
  duration = 12000,
  bubbleType = 'gentle'
}) => {
  const [animationPhase, setAnimationPhase] = useState<'hidden' | 'fade-in' | 'visible' | 'fade-out'>('hidden');

  // Determine bubble style based on message content and type
  const getBubbleStyle = () => {
    if (message.includes('nghỉ') || message.includes('mỏi') || bubbleType === 'rest') {
      return 'rest';
    }
    if (message.includes('sáng tạo') || message.includes('thử') || bubbleType === 'creative') {
      return 'creative';
    }
    if (message.includes('hít thở') || message.includes('thư giãn') || bubbleType === 'healing') {
      return 'healing';
    }
    return 'gentle';
  };

  const styleType = getBubbleStyle();

  useEffect(() => {
    if (isVisible) {
      setAnimationPhase('fade-in');
      
      const fadeInTimer = setTimeout(() => {
        setAnimationPhase('visible');
        
        const displayTimer = setTimeout(() => {
          setAnimationPhase('fade-out');
          
          const fadeOutTimer = setTimeout(() => {
            setAnimationPhase('hidden');
            onAnimationComplete?.();
          }, 2000); // Longer fade out for gentle effect
          
          return () => clearTimeout(fadeOutTimer);
        }, duration - 4000);
        
        return () => clearTimeout(displayTimer);
      }, 2000); // Longer fade in
      
      return () => clearTimeout(fadeInTimer);
    } else {
      setAnimationPhase('hidden');
    }
  }, [isVisible, duration, onAnimationComplete]);

  if (animationPhase === 'hidden') {
    return null;
  }

  return (
    <div className={`enhanced-thought-bubble enhanced-thought-bubble--${animationPhase} enhanced-thought-bubble--${styleType}`}>
      <div className="enhanced-bubble-container">
        {/* Floating particles for gentle effect */}
        {styleType === 'gentle' && (
          <div className="floating-particles">
            <div className="particle particle-1"></div>
            <div className="particle particle-2"></div>
            <div className="particle particle-3"></div>
          </div>
        )}

        {/* Rest reminder has special glow */}
        {styleType === 'rest' && <div className="rest-glow"></div>}

        {/* Creative bubble has sparkles */}
        {styleType === 'creative' && (
          <div className="creative-sparkles">
            <div className="sparkle sparkle-1"></div>
            <div className="sparkle sparkle-2"></div>
            <div className="sparkle sparkle-3"></div>
            <div className="sparkle sparkle-4"></div>
          </div>
        )}

        {/* Healing bubble has soft waves */}
        {styleType === 'healing' && <div className="healing-waves"></div>}

        <div className="enhanced-bubble-content">
          <div className="enhanced-bubble-text">
            {message}
          </div>
          <div className={`enhanced-bubble-tail enhanced-bubble-tail--${styleType}`}></div>
        </div>
      </div>
    </div>
  );
};

export default EnhancedThoughtBubble;

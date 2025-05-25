import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

/**
 * Credit Score Gauge Component
 * 
 * Displays a visual gauge representing the user's credit score
 */
const CreditScoreGauge = ({ score = 0, previousScore = 0, maxScore = 850 }) => {
  const [animatedScore, setAnimatedScore] = useState(0);
  
  // Animate the score on mount and when it changes
  useEffect(() => {
    // Start from previous score if available, otherwise 0
    const startValue = previousScore || 0;
    setAnimatedScore(startValue);
    
    // Animate to the current score
    const duration = 1500; // ms
    const interval = 20; // ms
    const steps = duration / interval;
    const increment = (score - startValue) / steps;
    
    let currentStep = 0;
    const timer = setInterval(() => {
      currentStep++;
      setAnimatedScore(prevScore => {
        const nextScore = prevScore + increment;
        // Ensure we end exactly at the target score
        if (currentStep >= steps) {
          clearInterval(timer);
          return score;
        }
        return nextScore;
      });
      
      if (currentStep >= steps) {
        clearInterval(timer);
      }
    }, interval);
    
    return () => clearInterval(timer);
  }, [score, previousScore]);
  
  // Calculate the percentage for the gauge
  const percentage = (animatedScore / maxScore) * 100;
  
  // Determine the color based on the score
  const getScoreColor = (score) => {
    if (score < 580) return { color: '#e53e3e', label: 'Poor' }; // red
    if (score < 670) return { color: '#ed8936', label: 'Fair' }; // orange
    if (score < 740) return { color: '#ecc94b', label: 'Good' }; // yellow
    if (score < 800) return { color: '#48bb78', label: 'Very Good' }; // green
    return { color: '#38a169', label: 'Excellent' }; // dark green
  };
  
  const scoreInfo = getScoreColor(animatedScore);
  
  // Calculate the rotation for the gauge needle
  const needleRotation = (percentage / 100) * 180 - 90;
  
  // Calculate the score change
  const scoreChange = score - previousScore;
  const scoreChangeText = scoreChange > 0 
    ? `+${scoreChange} points` 
    : scoreChange < 0 
      ? `${scoreChange} points` 
      : 'No change';
  
  return (
    <Card className="shadow-md">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-medium">Credit Score</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center">
          {/* Gauge */}
          <div className="relative w-48 h-24 mt-2 mb-6">
            {/* Gauge background */}
            <div className="absolute w-full h-full overflow-hidden">
              <div className="w-full h-full bg-gray-200 rounded-t-full"></div>
            </div>
            
            {/* Gauge segments */}
            <div className="absolute w-full h-full overflow-hidden">
              <div className="absolute bottom-0 left-0 w-full h-full flex">
                <div className="w-1/5 h-full bg-red-500 rounded-tl-full"></div>
                <div className="w-1/5 h-full bg-orange-500"></div>
                <div className="w-1/5 h-full bg-yellow-500"></div>
                <div className="w-1/5 h-full bg-green-500"></div>
                <div className="w-1/5 h-full bg-green-700 rounded-tr-full"></div>
              </div>
            </div>
            
            {/* Gauge needle */}
            <div 
              className="absolute bottom-0 left-1/2 w-1 h-20 bg-gray-800 rounded-t-full origin-bottom transform -translate-x-1/2 transition-transform duration-1000"
              style={{ transform: `translateX(-50%) rotate(${needleRotation}deg)` }}
            >
              <div className="absolute -top-1 -left-1 w-3 h-3 bg-gray-800 rounded-full"></div>
            </div>
            
            {/* Gauge center point */}
            <div className="absolute bottom-0 left-1/2 w-4 h-4 bg-white border-2 border-gray-800 rounded-full transform -translate-x-1/2 translate-y-1/2"></div>
          </div>
          
          {/* Score display */}
          <div className="text-center">
            <div className="text-3xl font-bold" style={{ color: scoreInfo.color }}>
              {Math.round(animatedScore)}
            </div>
            <div className="text-sm font-medium" style={{ color: scoreInfo.color }}>
              {scoreInfo.label}
            </div>
            
            {/* Score change */}
            {previousScore > 0 && (
              <div className={`text-xs mt-1 ${
                scoreChange > 0 ? 'text-green-600' : 
                scoreChange < 0 ? 'text-red-600' : 'text-gray-500'
              }`}>
                {scoreChangeText}
              </div>
            )}
          </div>
          
          {/* Score range */}
          <div className="w-full flex justify-between mt-4 text-xs text-gray-500">
            <span>300</span>
            <span>Poor</span>
            <span>Fair</span>
            <span>Good</span>
            <span>Excellent</span>
            <span>850</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CreditScoreGauge;
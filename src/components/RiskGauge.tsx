import React from 'react';
import { RiskLevel } from '../types';

interface RiskGaugeProps {
  score: number; // 0 to 100
  level: RiskLevel;
  size?: number;
}

export const RiskGauge: React.FC<RiskGaugeProps> = ({ score, level, size = 180 }) => {
  const strokeWidth = 14;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  // Let's create an arc from 135 deg to 405 deg (270 degrees total) for an authentic gauge meter
  const arcDegrees = 270;
  const arcCircumference = (arcDegrees / 360) * circumference;
  const strokeDashoffset = arcCircumference - (score / 100) * arcCircumference;

  // Colors based on risk level
  const getColorScheme = () => {
    switch (level) {
      case 'High':
        return {
          stroke: '#F43F5E', // rose-500
          text: 'text-rose-400',
          bgGlow: 'rgba(244, 63, 94, 0.15)',
          badgeBg: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
        };
      case 'Medium':
        return {
          stroke: '#F59E0B', // amber-500
          text: 'text-amber-400',
          bgGlow: 'rgba(245, 158, 11, 0.15)',
          badgeBg: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
        };
      case 'Low':
      default:
        return {
          stroke: '#10B981', // emerald-500
          text: 'text-emerald-400',
          bgGlow: 'rgba(16, 185, 129, 0.15)',
          badgeBg: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
        };
    }
  };

  const scheme = getColorScheme();

  return (
    <div className="relative flex flex-col items-center justify-center p-2">
      <div className="relative" style={{ width: size, height: size }}>
        <svg
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          className="transform -rotate-[225deg]"
        >
          {/* Background Track Arc */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="#1E293B"
            strokeWidth={strokeWidth}
            strokeDasharray={`${arcCircumference} ${circumference}`}
            strokeLinecap="round"
          />

          {/* Value Progress Arc */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={scheme.stroke}
            strokeWidth={strokeWidth}
            strokeDasharray={`${arcCircumference} ${circumference}`}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="transition-all duration-1000 ease-out"
            style={{
              filter: `drop-shadow(0 0 8px ${scheme.bgGlow})`,
            }}
          />
        </svg>

        {/* Center Content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center pt-2">
          <div className="text-4xl sm:text-5xl font-extrabold tracking-tight text-white font-mono">
            {score}
            <span className="text-2xl sm:text-3xl text-slate-400 font-sans ml-0.5">%</span>
          </div>

          <div
            className={`mt-1.5 px-3 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider border ${scheme.badgeBg}`}
          >
            {level} Risk
          </div>
        </div>
      </div>

      <div className="text-xs text-slate-400 text-center mt-1">
        Fraud Probability Estimate
      </div>
    </div>
  );
};

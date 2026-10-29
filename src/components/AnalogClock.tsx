import React, { useEffect, useState } from 'react';

interface AnalogClockProps {
  size?: number;
  className?: string;
}

export const AnalogClock: React.FC<AnalogClockProps> = ({ size = 96, className = '' }) => {
  const [time, setTime] = useState<Date>(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const seconds = time.getSeconds();
  const minutes = time.getMinutes();
  const hours = time.getHours() % 12;

  const secondAngle = seconds * 6;
  const minuteAngle = minutes * 6 + seconds * 0.1;
  const hourAngle = hours * 30 + minutes * 0.5;

  const strokeWidth = Math.max(2, size * 0.025);
  const center = size / 2;
  const radius = size / 2 - strokeWidth * 2;

  return (
    <div
      className={`relative rounded-full flex items-center justify-center shrink-0 ${className}`}
      style={{
        width: size,
        height: size,
      }}
      title="ساعة النظام التناظرية المباشرة"
      aria-label="ساعة تناظرية"
    >
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="w-full h-full drop-shadow-md select-none"
      >
        <defs>
          <radialGradient id="clockDialGrad" cx="30%" cy="25%" r="75%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="60%" stopColor="#f0f6ff" />
            <stop offset="100%" stopColor="#dce8f8" />
          </radialGradient>
          <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="1" stdDeviation="1.5" floodColor="#000000" floodOpacity="0.25" />
          </filter>
        </defs>

        {/* Dial Background */}
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="url(#clockDialGrad)"
          stroke="#94bceb"
          strokeWidth={strokeWidth}
        />
        <circle
          cx={center}
          cy={center}
          r={radius - strokeWidth}
          fill="none"
          stroke="#ffffff"
          strokeWidth={strokeWidth * 1.5}
        />

        {/* Hour markers / numerals */}
        {[12, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map((num) => {
          const angle = (num * 30 - 90) * (Math.PI / 180);
          const rPos = radius * 0.74;
          const x = center + rPos * Math.cos(angle);
          const y = center + rPos * Math.sin(angle) + (size * 0.035);
          return (
            <text
              key={num}
              x={x}
              y={y}
              textAnchor="middle"
              fontSize={size * 0.095}
              fontWeight="900"
              fill="#1e3a5f"
              fontFamily="system-ui, sans-serif"
            >
              {num}
            </text>
          );
        })}

        {/* Hour Hand */}
        <line
          x1={center}
          y1={center}
          x2={center + radius * 0.48 * Math.sin((hourAngle * Math.PI) / 180)}
          y2={center - radius * 0.48 * Math.cos((hourAngle * Math.PI) / 180)}
          stroke="#172b46"
          strokeWidth={strokeWidth * 1.6}
          strokeLinecap="round"
          filter="url(#shadow)"
        />

        {/* Minute Hand */}
        <line
          x1={center}
          y1={center}
          x2={center + radius * 0.68 * Math.sin((minuteAngle * Math.PI) / 180)}
          y2={center - radius * 0.68 * Math.cos((minuteAngle * Math.PI) / 180)}
          stroke="#0d9488"
          strokeWidth={strokeWidth * 1.1}
          strokeLinecap="round"
          filter="url(#shadow)"
        />

        {/* Second Hand */}
        <line
          x1={center - radius * 0.15 * Math.sin((secondAngle * Math.PI) / 180)}
          y1={center + radius * 0.15 * Math.cos((secondAngle * Math.PI) / 180)}
          x2={center + radius * 0.76 * Math.sin((secondAngle * Math.PI) / 180)}
          y2={center - radius * 0.76 * Math.cos((secondAngle * Math.PI) / 180)}
          stroke="#ef4444"
          strokeWidth={strokeWidth * 0.6}
          strokeLinecap="round"
        />

        {/* Center Pivot Point */}
        <circle cx={center} cy={center} r={strokeWidth * 1.6} fill="#ef4444" stroke="#ffffff" strokeWidth={1} />
      </svg>
    </div>
  );
};

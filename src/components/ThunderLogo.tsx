import React from 'react';

interface ThunderLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  className?: string;
}

export const ThunderLogo: React.FC<ThunderLogoProps> = ({
  size = 'md',
  showText = true,
  className = ''
}) => {
  const iconSizes = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-10 h-10',
    xl: 'w-14 h-14'
  };

  const textSizes = {
    sm: 'text-base font-extrabold tracking-wider',
    md: 'text-xl font-extrabold tracking-wider',
    lg: 'text-2xl font-black tracking-widest',
    xl: 'text-3xl font-black tracking-widest'
  };

  return (
    <div className={`flex items-center gap-2.5 select-none ${className}`}>
      <div
        className={`relative ${iconSizes[size]} flex items-center justify-center rounded-xl bg-gradient-to-br from-[#00D1C1] to-[#008f84] p-0.5 shadow-lg shadow-[#00D1C1]/20`}
      >
        <div className="w-full h-full bg-[#0A0A0A] rounded-[10px] flex items-center justify-center">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            className="w-3/5 h-3/5 text-[#00D1C1] drop-shadow-[0_0_8px_rgba(0,209,193,0.8)]"
          >
            <path
              d="M13 2L3 14H12L11 22L21 10H12L13 2Z"
              fill="currentColor"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      </div>

      {showText && (
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5">
            <span className={`font-sans ${textSizes[size]} text-white tracking-widest`}>
              THUNDER
            </span>
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#00D1C1] shadow-[0_0_8px_#00D1C1]"></span>
          </div>
        </div>
      )}
    </div>
  );
};

import React from 'react';

export const Logo = ({
  size = 'small',
  showText = true,
  showTagline = true,
  iconOnly = false,
  className = '',
}) => {
  // Normalize size strings ('small' | 'medium' | 'large' and 'sm' | 'md' | 'lg')
  const normSize = (() => {
    if (size === 'large' || size === 'lg') return 'large';
    if (size === 'medium' || size === 'md') return 'medium';
    return 'small';
  })();

  const sizeConfigs = {
    small: {
      box: 'w-8 h-8 rounded-lg',
      svg: 'w-5 h-5',
      title: 'text-sm font-semibold',
      tagline: 'text-[11px]',
      gap: 'gap-2.5',
    },
    medium: {
      box: 'w-11 h-11 rounded-xl',
      svg: 'w-6.5 h-6.5',
      title: 'text-lg font-bold',
      tagline: 'text-xs',
      gap: 'gap-3',
    },
    large: {
      box: 'w-16 h-16 sm:w-18 sm:h-18 rounded-2xl',
      svg: 'w-10 h-10 sm:w-11 sm:h-11',
      title: 'text-2xl sm:text-3xl font-bold',
      tagline: 'text-sm sm:text-base',
      gap: 'gap-4',
    },
  };

  const config = sizeConfigs[normSize];

  return (
    <div className={`inline-flex items-center ${config.gap} select-none ${className}`}>
      {/* Brand Icon: Envelope + Protective Shield Contour + Central AI Spark */}
      <div
        className={`${config.box} bg-gradient-to-br from-indigo-600 to-indigo-700 dark:from-indigo-600 dark:to-indigo-800 text-white flex items-center justify-center shadow-sm flex-shrink-0 relative overflow-hidden transition-transform duration-200 border border-indigo-400/20`}
      >
        <svg
          viewBox="0 0 32 32"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className={`${config.svg} text-white`}
        >
          {/* Subtle Protective Shield Contour */}
          <path
            d="M16 2.5L27 6.5V15.5C27 22.5 22.2 27.8 16 29.5C9.8 27.8 5 22.5 5 15.5V6.5L16 2.5Z"
            stroke="currentColor"
            strokeWidth="1.75"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="opacity-40"
          />

          {/* Clean Integrated Envelope Body */}
          <rect
            x="8"
            y="11"
            width="16"
            height="11"
            rx="2"
            stroke="currentColor"
            strokeWidth="1.75"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Envelope Flap Fold */}
          <path
            d="M8.5 12L16 17.5L23.5 12"
            stroke="currentColor"
            strokeWidth="1.75"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Central AI Spark / Intelligence Star */}
          <path
            d="M16 7.5V10.5M14.5 9H17.5"
            stroke="#60A5FA"
            strokeWidth="2"
            strokeLinecap="round"
          />
          <circle cx="16" cy="9" r="1" fill="#93C5FD" />
        </svg>
      </div>

      {/* Brand Text (Title & Tagline) */}
      {showText && !iconOnly && (
        <div className="flex flex-col text-left">
          <span
            className={`tracking-tight text-slate-900 dark:text-slate-100 leading-tight ${config.title}`}
          >
            AI Email Copilot
          </span>
          {showTagline && (
            <span
              className={`text-slate-500 dark:text-slate-400 font-normal tracking-normal leading-tight mt-0.5 ${config.tagline}`}
            >
              Intelligent Inbox. Safer Decisions.
            </span>
          )}
        </div>
      )}
    </div>
  );
};

export default Logo;

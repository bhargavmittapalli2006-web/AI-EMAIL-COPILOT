import React from 'react';
import { ChevronRight } from 'lucide-react';

export const FeatureCard = ({
  icon: Icon,
  title,
  description,
  accentColor = 'indigo',
  onLearnMore,
}) => {
  const colorMap = {
    indigo: {
      iconBg: 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border-indigo-200/60 dark:border-indigo-800/60',
      hoverBorder: 'hover:border-indigo-400 dark:hover:border-indigo-600',
    },
    rose: {
      iconBg: 'bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 border-rose-200/60 dark:border-rose-800/60',
      hoverBorder: 'hover:border-rose-400 dark:hover:border-rose-600',
    },
    emerald: {
      iconBg: 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border-emerald-200/60 dark:border-emerald-800/60',
      hoverBorder: 'hover:border-emerald-400 dark:hover:border-emerald-600',
    },
    sky: {
      iconBg: 'bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400 border-sky-200/60 dark:border-sky-800/60',
      hoverBorder: 'hover:border-sky-400 dark:hover:border-sky-600',
    },
  };

  const style = colorMap[accentColor] || colorMap.indigo;

  return (
    <div
      className={`p-6 rounded-2xl bg-white dark:bg-[#0B1020] border border-slate-200 dark:border-slate-800/80 shadow-sm flex flex-col justify-between space-y-4 transition-all duration-200 hover:-translate-y-1 ${style.hoverBorder} group cursor-pointer`}
      onClick={onLearnMore}
    >
      <div className="space-y-3">
        <div
          className={`w-10 h-10 rounded-xl flex items-center justify-center border ${style.iconBg}`}
        >
          <Icon className="w-5 h-5" />
        </div>

        <h3 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
          {title}
        </h3>

        <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-sans">
          {description}
        </p>
      </div>

      <div className="pt-2 flex items-center gap-1 text-xs font-semibold text-indigo-600 dark:text-indigo-400 group-hover:underline">
        <span>Learn more</span>
        <ChevronRight className="w-3.5 h-3.5 transform group-hover:translate-x-0.5 transition-transform" />
      </div>
    </div>
  );
};

export default FeatureCard;
